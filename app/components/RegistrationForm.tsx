"use client";

import { FormEvent, useMemo, useState } from "react";

const sessions = [
  ["0919-0900", "9/19（六）09:00–12:00"],
  ["0919-1300", "9/19（六）13:00–16:00"],
  ["0920-0900", "9/20（日）09:00–12:00"],
  ["0920-1300", "9/20（日）13:00–16:00"],
  ["0926-0900", "9/26（六）09:00–12:00"],
  ["0926-1300", "9/26（六）13:00–16:00"],
  ["0927-0900", "9/27（日）09:00–12:00"],
  ["0927-1300", "9/27（日）13:00–16:00"],
] as const;

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; code: string }
  | { kind: "error"; message: string };

export function RegistrationForm() {
  const [quantity, setQuantity] = useState(1);
  const [sessionCode, setSessionCode] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const amount = useMemo(() => quantity * 800, [quantity]);
  const selectedSession = sessions.find(([code]) => code === sessionCode)?.[1] ?? "尚未選擇";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ kind: "loading" });
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "送出失敗，請稍後再試。");
      setSubmitState({ kind: "success", code: result.registrationCode });
      form.reset();
      setQuantity(1);
      setSessionCode("");
    } catch (error) {
      setSubmitState({
        kind: "error",
        message: error instanceof Error ? error.message : "送出失敗，請稍後再試。",
      });
    }
  }

  if (submitState.kind === "success") {
    return (
      <div className="success-card" role="status">
        <span className="success-icon">✓</span>
        <p className="form-kicker">資料已送出</p>
        <h3>報名預約成功！</h3>
        <p>我們已收到資料，後續將由 FAYMI 公告付款與確認方式。</p>
        <div className="registration-code">
          <small>報名編號</small>
          <strong>{submitState.code}</strong>
        </div>
        <button className="button ghost" type="button" onClick={() => setSubmitState({ kind: "idle" })}>
          再填一筆報名
        </button>
      </div>
    );
  }

  return (
    <div className="form-layout">
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-heading">
          <span className="form-step">01</span>
          <div><p className="form-kicker">先留下資料</p><h3>選擇你的月餅場次</h3></div>
        </div>

        <div className="field-grid two-columns">
          <label><span>聯絡人姓名 *</span><input name="contactName" autoComplete="name" required placeholder="王小美" /></label>
          <label><span>手機 *</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="09[0-9]{8}" placeholder="0912345678" /></label>
        </div>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" placeholder="用於接收活動通知" /></label>
        <label><span>參加者姓名 *</span><textarea name="participantNames" required rows={2} placeholder="多人報名請用頓號分隔，例如：小美、小安" /></label>

        <div className="field-grid two-columns">
          <label>
            <span>參加人數 *</span>
            <select name="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required>
              {[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value} 人</option>)}
            </select>
          </label>
          <label>
            <span>選擇場次 *</span>
            <select name="sessionCode" value={sessionCode} onChange={(e) => setSessionCode(e.target.value)} required>
              <option value="">請選擇日期與時間</option>
              {sessions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
        </div>

        <label><span>過敏原／飲食需求</span><input name="allergies" placeholder="例如：蛋、奶、麩質、堅果；沒有請填無" /></label>
        <label><span>備註</span><textarea name="notes" rows={2} placeholder="其他想讓我們知道的事情" /></label>

        <input name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
        <input type="hidden" name="source" value="website" />
        <label className="consent-row">
          <input type="checkbox" name="consent" value="同意" required />
          <span>我已確認活動為招生預約，並同意主辦單位為報名聯繫與活動執行使用上述資料。*</span>
        </label>

        {submitState.kind === "error" && <p className="form-error" role="alert">{submitState.message}</p>}
        <button className="submit-button" type="submit" disabled={submitState.kind === "loading"}>
          {submitState.kind === "loading" ? "正在送出…" : "送出報名資料"}
          <span>→</span>
        </button>
      </form>

      <aside className="order-summary" aria-label="報名摘要">
        <div className="summary-mascot">🥮</div>
        <p className="form-kicker">你的報名摘要</p>
        <h3>{selectedSession}</h3>
        <dl>
          <div><dt>參加人數</dt><dd>{quantity} 人</dd></div>
          <div><dt>每人費用</dt><dd>NT$800</dd></div>
          <div className="summary-total"><dt>應付金額</dt><dd>NT${amount.toLocaleString("zh-TW")}</dd></div>
        </dl>
        <div className="summary-includes">
          <strong>費用包含</strong>
          <span>✓ 3D 列印模具體驗</span>
          <span>✓ 4 顆月餅材料</span>
          <span>✓ 包裝禮盒</span>
          <span>✓ 現場教學</span>
        </div>
        <p className="summary-note">付款與名額確認方式將於正式招生公告說明。</p>
      </aside>
    </div>
  );
}
