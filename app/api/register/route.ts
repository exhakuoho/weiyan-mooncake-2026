import { NextResponse } from "next/server";

const sessionLabels: Record<string, string> = {
  "0925-0900": "9/25（五）09:00–12:00",
  "0925-1300": "9/25（五）13:00–16:00",
  "0926-0900": "9/26（六）09:00–12:00",
  "0926-1300": "9/26（六）13:00–16:00",
  "0927-0900": "9/27（日）09:00–12:00",
  "0927-1300": "9/27（日）13:00–16:00",
  "0928-0900": "9/28（一）09:00–12:00",
  "0928-1300": "9/28（一）13:00–16:00",
};

function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// 身分證字號：投保用，所以寧可在這裡擋下打錯的，也不要讓保單填不出來。
// 本國證號（1 個英文字母 ＋ 9 碼）連檢查碼一起驗；
// 舊式居留證號（2 個英文字母 ＋ 8 碼）只驗格式，它的檢查碼規則不同。
const ID_LETTER_VALUES = "ABCDEFGHJKLMNPQRSTUVXYWZIO";

function isNationalId(id: string) {
  if (!/^[A-Z][1289]\d{8}$/.test(id)) return false;
  const letterValue = ID_LETTER_VALUES.indexOf(id[0]) + 10;
  const weights = [8, 7, 6, 5, 4, 3, 2, 1, 1];
  const sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9
    + weights.reduce((acc, weight, i) => acc + Number(id[i + 1]) * weight, 0);
  return sum % 10 === 0;
}

function isResidentId(id: string) {
  return /^[A-Z]{2}\d{8}$/.test(id);
}

/** 把「多人用頓號分隔」的輸入拆開、去掉空白並轉大寫，回傳正規化後的清單。 */
function splitIds(value: unknown) {
  return text(value, 200)
    .split(/[、,，\s;；/]+/)
    .map((id) => id.replace(/\s/g, "").toUpperCase())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (text(body.website)) return NextResponse.json({ ok: true, registrationCode: "THANK-YOU" });

    const quantity = Math.min(4, Math.max(1, Number(body.quantity) || 1));
    const sessionCode = text(body.sessionCode, 20);
    const contactName = text(body.contactName, 80);
    const phone = text(body.phone, 20);
    const participantNames = text(body.participantNames, 200);
    const participantIds = splitIds(body.participantIds);
    if (!contactName || !/^09\d{8}$/.test(phone) || !participantNames || !sessionLabels[sessionCode] || body.consent !== "同意") {
      return NextResponse.json({ message: "請確認必填欄位與手機格式。" }, { status: 400 });
    }
    if (!participantIds.length) {
      return NextResponse.json({ message: "請填寫參加者身分證字號，投保需要。" }, { status: 400 });
    }
    const badId = participantIds.find((id) => !isNationalId(id) && !isResidentId(id));
    if (badId) {
      return NextResponse.json({ message: `身分證字號「${badId}」看起來不對，請再確認一次。` }, { status: 400 });
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const webhookToken = process.env.SHEETS_WEBHOOK_TOKEN;
    if (!webhookUrl || !webhookToken) {
      return NextResponse.json({ message: "報名系統正在完成最後設定，請稍後再試。" }, { status: 503 });
    }

    const registrationCode = `MOON-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const payload = {
      token: webhookToken,
      registrationCode,
      submittedAt: new Date().toISOString(),
      status: "待確認",
      paymentStatus: "未付款",
      contactName,
      phone,
      email: text(body.email, 160),
      participantNames,
      quantity,
      amount: quantity * 650,
      sessionCode,
      sessionLabel: sessionLabels[sessionCode],
      customType: "現場選擇",
      customContent: "",
      allergies: text(body.allergies, 300),
      notes: text(body.notes, 500),
      consent: "同意",
      source: text(body.source, 40) || "website",
      // 新欄位一律加在最後：Apps Script 的 appendRow 是照順序塞的，
      // 插在中間會讓試算表既有資料整欄錯位。
      participantIds: participantIds.join("、"),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) throw new Error("Google Sheet webhook failed");

    // The row is already in the sheet at this point. A failed notification email
    // must not fail the request: the visitor would re-submit and register twice.
    if (result.emailSent === false) {
      console.error("Registration saved but notification email failed", registrationCode);
    }

    return NextResponse.json({ ok: true, registrationCode });
  } catch (error) {
    console.error("Registration error", error);
    return NextResponse.json({ message: "目前無法完成報名，請稍後再試。" }, { status: 500 });
  }
}
