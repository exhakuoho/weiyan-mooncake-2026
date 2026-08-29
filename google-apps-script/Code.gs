const SHEET_ID = "1FFPclCTVxNplhf0xf3utPAG6bIoH9v4rSn0rZhvcxEU";
const SHEET_NAME = "報名資料";

function doGet() {
  return json_({ ok: true, service: "mooncake-registration" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const expectedToken = PropertiesService.getScriptProperties().getProperty("WEBHOOK_TOKEN");
    if (!expectedToken || data.token !== expectedToken) return json_({ ok: false, error: "unauthorized" });

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Sheet not found");

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        data.registrationCode,
        new Date(data.submittedAt),
        data.status,
        data.paymentStatus,
        data.contactName,
        "'" + data.phone,
        data.email,
        data.participantNames,
        Number(data.quantity),
        Number(data.amount),
        data.sessionCode,
        data.sessionLabel,
        data.customType,
        data.customContent,
        data.allergies,
        data.notes,
        data.consent,
        data.source,
      ]);
    } finally {
      lock.releaseLock();
    }

    // 資料已經進試算表了。通知信只是附加動作，寄失敗也絕不能讓 API 回報失敗，
    // 否則使用者會以為沒報到而重送，造成重複報名。
    const emailSent = sendRegistrationNotification_(data);

    return json_({ ok: true, registrationCode: data.registrationCode, emailSent: emailSent });
  } catch (error) {
    console.error("報名寫入失敗：" + error);
    return json_({ ok: false, error: String(error) });
  }
}

/**
 * 寄出新報名通知信。永遠不會 throw：成功回 true，任何失敗回 false。
 */
function sendRegistrationNotification_(data) {
  try {
    const to = PropertiesService.getScriptProperties().getProperty("NOTIFICATION_EMAIL");
    if (!to) {
      console.error("未設定指令碼屬性 NOTIFICATION_EMAIL，略過通知信");
      return false;
    }

    const remaining = MailApp.getRemainingDailyQuota();
    if (remaining <= 0) {
      console.error("MailApp 今日寄信額度已用盡，略過通知信（報名編號 " + data.registrationCode + "）");
      return false;
    }

    const fields = [
      ["報名編號", data.registrationCode],
      ["送出時間", formatSubmittedAt_(data.submittedAt)],
      ["聯絡人姓名", data.contactName],
      ["手機", data.phone],
      ["Email", data.email],
      ["參加者姓名", data.participantNames],
      ["人數", data.quantity + " 人"],
      ["應付金額", "NT$" + formatAmount_(data.amount)],
      ["場次", data.sessionLabel],
      ["過敏原／飲食需求", data.allergies],
      ["備註", data.notes],
      ["來源", data.source],
    ];

    const sheetUrl = "https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/edit";
    const subject = "【新報名】" + blank_(data.contactName) + "／" + blank_(data.sessionLabel);

    const body = fields
      .map(function (field) { return field[0] + "：" + blank_(field[1]); })
      .join(NL_) + NL_ + NL_ + "報名管理表：" + sheetUrl;

    // 所有使用者輸入都經過 escapeHtml_，避免報名欄位夾帶 HTML 影響信件內容。
    const rows = fields
      .map(function (field) {
        return "<tr>" +
          "<th style=" + q_("text-align:left;padding:8px 14px 8px 0;color:#6b7280;font-weight:600;white-space:nowrap;vertical-align:top;") + ">" +
          escapeHtml_(field[0]) + "</th>" +
          "<td style=" + q_("padding:8px 0;color:#111827;") + ">" + escapeHtml_(blank_(field[1])) + "</td>" +
          "</tr>";
      })
      .join("");

    const htmlBody =
      "<div style=" + q_("font-family:system-ui,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.7;color:#111827;") + ">" +
      "<h2 style=" + q_("margin:0 0 4px;font-size:20px;") + ">新報名通知</h2>" +
      "<p style=" + q_("margin:0 0 18px;color:#6b7280;") + ">2026 3D 客製月餅工作坊</p>" +
      "<table style=" + q_("border-collapse:collapse;") + ">" + rows + "</table>" +
      "<p style=" + q_("margin:22px 0 0;") + "><a href=" + q_(escapeHtml_(sheetUrl)) + " style=" + q_("color:#e96c1f;") + ">開啟報名管理表</a></p>" +
      "</div>";

    const options = { name: "月餅工作坊報名通知", htmlBody: htmlBody };

    // 報名者有填 Email 才設 replyTo。格式不對就不設，不能因此讓整封信寄不出去。
    const replyTo = String(data.email == null ? "" : data.email).trim();
    if (replyTo) {
      if (looksLikeEmail_(replyTo)) {
        options.replyTo = replyTo;
      } else {
        console.error("報名者 Email 格式不正確，略過 replyTo（報名編號 " + data.registrationCode + "）");
      }
    }

    MailApp.sendEmail(to, subject, body, options);
    return true;
  } catch (error) {
    console.error("通知信寄送失敗（報名編號 " + (data && data.registrationCode) + "）：" + error);
    return false;
  }
}

/**
 * 手動執行用：寄一封範例通知信。第一次執行會跳出 Gmail 寄信權限的授權畫面，
 * 用來完成授權；之後也可以用它確認寄信功能還正常。正式報名流程不會呼叫這個函式。
 */
function sendTestNotification() {
  const ok = sendRegistrationNotification_({
    registrationCode: "MOON-TEST-" + new Date().getTime(),
    submittedAt: new Date().toISOString(),
    contactName: "測試聯絡人",
    phone: "0912345678",
    email: "",
    participantNames: "測試學員",
    quantity: 1,
    amount: 650,
    sessionLabel: "測試場次",
    allergies: "無",
    notes: "手動觸發的測試信，可直接刪除",
    source: "manual-test",
  });
  console.log("sendTestNotification 結果：" + ok + "，剩餘寄信額度 " + MailApp.getRemainingDailyQuota());
  return ok;
}

/** 換行字元。原始碼刻意不含反斜線跳脫，方便整段注入編輯器。 */
const NL_ = String.fromCharCode(10);

/** 產生帶雙引號的 HTML 屬性值。 */
function q_(value) {
  return String.fromCharCode(34) + value + String.fromCharCode(34);
}

function blank_(value) {
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text === "" ? "（未填寫）" : text;
}

function escapeHtml_(value) {
  return String(value === null || value === undefined ? "" : value)
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split(String.fromCharCode(34)).join("&quot;")
    .split(String.fromCharCode(39)).join("&#39;");
}

function looksLikeEmail_(value) {
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) return false;
  if (value.indexOf(" ") !== -1) return false;
  const domain = value.substring(at + 1);
  const dot = domain.indexOf(".");
  return dot > 0 && dot < domain.length - 1;
}

function formatAmount_(amount) {
  const number = Number(amount);
  if (!isFinite(number)) return String(amount == null ? "" : amount);
  const digits = String(Math.round(Math.abs(number)));
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits.charAt(i);
  }
  return (number < 0 ? "-" : "") + out;
}

function formatSubmittedAt_(iso) {
  try {
    return Utilities.formatDate(new Date(iso), "Asia/Taipei", "yyyy/MM/dd HH:mm:ss");
  } catch (error) {
    return String(iso == null ? "" : iso);
  }
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
