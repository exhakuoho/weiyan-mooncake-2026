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
