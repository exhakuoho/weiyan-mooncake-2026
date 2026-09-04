import assert from "node:assert/strict";
import test from "node:test";

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const context = { waitUntil() {}, passThroughOnException() {} };

test("server-renders the mooncake registration landing page", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("https://name-mooncake-2026.example/", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /月下玩創意/);
  assert.match(html, /送出報名資料/);
  // 價格與名額必須與傳單一致（傳單已印製發出）
  assert.match(html, /每人 NT\$650/);
  assert.match(html, /每場限 15 組/);
  // 傳單賣點：專屬模具帶回家、可重複使用
  assert.match(html, /專屬 3D 月餅模（可重複使用）/);
  // 客製是現場決定的，頁面必須講明報名時不用先提供
  assert.match(html, /報名時要先想好名字或圖案嗎？/);
  assert.doesNotMatch(html, /NT\$800|限額 14 席/);
  assert.match(html, /9\/25–9\/28/);
  assert.match(html, /09:00–12:00／13:00–16:00/);
  assert.match(html, /挑一個最適合你的中秋手作時光/);
  assert.match(html, /hero-mascots-cutout\.webp/);
  assert.match(html, /weiyan-logo-256\.jpg/);
  assert.match(html, /微研 WEIYAN/);
  // 投保用的身分證字號欄位（2026-09-03 新增）
  assert.match(html, /參加者身分證字號/);
  assert.match(html, /name="participantIds"/);
  assert.match(html, /og\.jpg/);
  assert.doesNotMatch(html, /客製類型|客製內容|你的名字，真的會出現在月餅上/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/i);
  // Images must be served straight from static assets: the /_vinext/image
  // optimizer needs a Cloudflare Images binding we deliberately do not use.
  assert.doesNotMatch(html, /_vinext\/image/);
});

test("registration API rejects incomplete submissions", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("https://name-mooncake-2026.example/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactName: "測試" }),
    }),
    env,
    context,
  );
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.message, /必填欄位/);
});

test("registration API validates the participant ID numbers", async () => {
  const worker = await getWorker();
  const base = {
    contactName: "王小美",
    phone: "0912345678",
    participantNames: "小美",
    sessionCode: "0925-0900",
    quantity: 1,
    consent: "同意",
  };
  const post = (body) =>
    worker.fetch(
      new Request("https://name-mooncake-2026.example/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      env,
      context,
    );

  // 沒填就擋下來，訊息要講清楚是哪個欄位
  let response = await post(base);
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /身分證字號/);

  // 檢查碼錯一位也要擋，並把那個號碼回報出來讓填表的人知道錯在哪
  response = await post({ ...base, participantIds: "A123456788" });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /A123456788/);

  // 合法的多人輸入：小寫、前後空白、頓號分隔都要能通過驗證。
  // 這裡回 503 是因為測試環境沒設 webhook 密鑰，代表已經走過驗證了。
  response = await post({
    ...base,
    participantNames: "小美、小安",
    quantity: 2,
    participantIds: " a123456789、F131104093 ",
  });
  assert.equal(response.status, 503);

  // 舊式居留證號（2 個英文字母 ＋ 8 碼）也要放行
  response = await post({ ...base, participantIds: "AB12345678" });
  assert.equal(response.status, 503);
});

test("registration API tolerates full-width and punctuated input", async () => {
  const worker = await getWorker();
  const post = (body) =>
    worker.fetch(
      new Request("https://name-mooncake-2026.example/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      env,
      context,
    );

  // 缺欄位時訊息要指名是哪一欄，不能只說「格式錯誤」
  let response = await post({ contactName: "王小美", consent: "同意" });
  assert.equal(response.status, 400);
  const message = (await response.json()).message;
  assert.match(message, /必填欄位/);
  assert.match(message, /手機/);
  assert.match(message, /場次/);
  assert.doesNotMatch(message, /聯絡人姓名/);

  // 用注音輸入法打出來的全形英數字，以及 0912-345-678 這種寫法，都要能通過。
  // 503 代表已經走完驗證、卡在測試環境沒有 webhook 密鑰。
  response = await post({
    contactName: "王小美",
    phone: "0912-345-678",
    participantNames: "小美",
    sessionCode: "0925-0900",
    quantity: 1,
    consent: "同意",
    participantIds: "Ａ１２３４５６７８９",
  });
  assert.equal(response.status, 503);
});
