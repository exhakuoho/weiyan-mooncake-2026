import Image from "next/image";
import { RegistrationForm } from "./components/RegistrationForm";

const experienceCards = [
  { icon: "✏️", title: "設計", text: "畫出自己的名字或圖案，成為月餅上的專屬圖樣。", tone: "blue" },
  { icon: "🖨️", title: "列印", text: "用食品級材料 3D 列印出屬於你的專屬月餅模。", tone: "orange" },
  { icon: "🥮", title: "手作", text: "使用 JIMMY39 協力準備的餡料，親手壓出 4 顆造型月餅。", tone: "mint" },
  { icon: "🎁", title: "帶回", text: "月餅禮盒與專屬模具一起帶回家，模具可重複使用。", tone: "purple" },
];

const process = [
  ["20 分", "報到與衛生", "洗手、認識材料與現場工具"],
  ["20 分", "3D 原理小教室", "看看數位設計如何變成立體模具"],
  ["70 分", "包餡與壓模", "完成四顆造型月餅"],
  ["30 分", "冷藏定型", "整理禮盒、拍照與互動"],
  ["25 分", "裝盒保存", "附成分、過敏原與保存說明"],
  ["15 分", "成果合照", "帶著作品與手作回憶回家"],
];

const schedule = [
  ["9/25", "週五", "第 1 天", ["09:00–12:00", "13:00–16:00"]],
  ["9/26", "週六", "第 2 天", ["09:00–12:00", "13:00–16:00"]],
  ["9/27", "週日", "第 3 天", ["09:00–12:00", "13:00–16:00"]],
  ["9/28", "週一", "第 4 天", ["09:00–12:00", "13:00–16:00"]],
] as const;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="回到首頁">
          <Image className="brand-logo" src="/weiyan-logo-256.jpg" alt="微研 WEIYAN Logo" width={84} height={84} priority />
          <span>微研客製工作坊</span>
        </a>
        <nav aria-label="主要導覽">
          <a href="#experience">體驗內容</a>
          <a href="#schedule">活動場次</a>
          <a href="#faq">常見問題</a>
        </nav>
        <a className="header-cta" href="#register">我要報名</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">2026 中秋限定 · 科技 × 手作</span>
          <h1>把名字<br /><em>印進中秋</em></h1>
          <p className="hero-lead">
            用 3D 列印模具，親手完成一份充滿巧思的造型月餅。從包餡、壓模到裝盒，三小時享受科技與手作交會的中秋時光。
          </p>
          <div className="hero-pills" aria-label="活動重點">
            <span>每人 NT$650</span>
            <span>國小二～六年級</span>
            <span>4 顆月餅＋專屬模具帶回</span>
            <span>每日上、下午各 1 梯</span>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#register">選場次報名 <span>→</span></a>
            <a className="button ghost" href="#experience">先看體驗內容</a>
          </div>
          <p className="micro-note">內含蛋、奶、巧克力，過敏請於報名時告知</p>
        </div>

        <div className="hero-art" aria-label="可愛月餅角色與 3D 列印模具插畫">
          <div className="art-sticker sticker-one">姓名客製</div>
          <div className="art-sticker sticker-two">4 顆帶回</div>
          <Image src="/hero-mascots-cutout.webp" alt="兩個可愛月餅角色、禮盒與 3D 列印模具" width={1448} height={1086} priority />
        </div>
      </section>

      <section className="quick-facts" aria-label="活動資訊">
        <article><span className="fact-icon">📅</span><div><small>活動日期</small><strong>9/25–9/28（五～一）</strong></div></article>
        <article><span className="fact-icon">🕘</span><div><small>每日場次</small><strong>09:00–12:00／13:00–16:00</strong></div></article>
        <article><span className="fact-icon">📍</span><div><small>活動地點</small><strong>高科大建工校區</strong></div></article>
        <article><span className="fact-icon">🎁</span><div><small>完成成果</small><strong>4 顆月餅＋禮盒＋模具</strong></div></article>
      </section>

      <section className="section" id="experience">
        <div className="section-heading centered-heading">
          <span className="section-kicker">四個步驟，一份專屬中秋</span>
          <h2>把名字印進月餅，模具還能帶回家</h2>
          <p>從畫下你的名字或圖案，到 3D 列印出專屬模具、親手壓出月餅——完成的月餅禮盒與模具，全部帶回家。</p>
        </div>
        <div className="experience-grid">
          {experienceCards.map((card, index) => (
            <article className={`experience-card ${card.tone}`} key={card.title}>
              <div className="card-topline"><span className="card-number">0{index + 1}</span><span className="experience-icon">{card.icon}</span></div>
              <h3>{card.title}</h3><p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section">
        <div className="section-heading">
          <span className="section-kicker">180 分鐘慢慢享受</span>
          <h2>從一團餅皮，到一盒中秋心意</h2>
        </div>
        <div className="process-track">
          {process.map(([time, title, text], index) => (
            <article key={title}>
              <div className="process-dot"><span>{index + 1}</span></div>
              <small>{time}</small><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section schedule-section" id="schedule">
        <div className="section-heading schedule-heading">
          <div><span className="section-kicker">連續四天，共 8 梯</span><h2>挑一個最適合你的中秋手作時光</h2></div>
          <div className="limit-pill"><span>👥</span><div><small>小班操作</small><strong>每場限 15 組</strong></div></div>
        </div>
        <div className="schedule-grid">
          {schedule.map(([date, day, dayTag, times]) => (
            <article key={date}>
              <div className="date-heading"><div><strong>{date}</strong><span>{day}</span></div><small>{dayTag}</small></div>
              <div className="time-chips">{times.map((time) => <span key={time}>🕘 {time}</span>)}</div>
              <a href="#register">選這一天 <span>→</span></a>
            </article>
          ))}
        </div>
        <p className="schedule-note">每梯 3 小時，上、下午場之間保留清潔與換場時間；實際開放名額以報名系統為準。</p>
      </section>

      <section className="register-section" id="register">
        <div className="section-heading centered-heading light-heading">
          <span className="section-kicker">準備好把名字印進中秋了嗎？</span>
          <h2>填寫資料，預約你的專屬場次</h2>
          <p>送出後會取得報名編號；付款與名額確認方式由 FAYMI 後續公告。</p>
        </div>
        <RegistrationForm />
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading centered-heading"><span className="section-kicker">報名前先看</span><h2>常見問題</h2></div>
        <div className="faq-list">
          <details><summary><span>👨‍👩‍👧</span>親子可以一起參加嗎？</summary><p>可以。活動對象是國小二至六年級，家長可陪同協助；每一位付費參加者都有一份材料、4 顆月餅與專屬模具。</p></details>
          <details><summary><span>🖨️</span>模具可以帶回家嗎？</summary><p>可以。你的專屬月餅模是用食品級材料 3D 列印的，活動結束後連同月餅禮盒一起帶回家，之後在家也能重複使用。</p></details>
          <details><summary><span>🥜</span>有食物過敏可以參加嗎？</summary><p>本次月餅內含蛋、奶、巧克力。請在報名表單完整填寫過敏原，我們會先確認是否能安全安排。</p></details>
          <details><summary><span>🌧️</span>若遇颱風或停課怎麼辦？</summary><p>依高雄市政府與校方公告辦理；若活動取消，將通知延期或退款方式。</p></details>
          <details><summary><span>💳</span>送出表單就算完成報名嗎？</summary><p>表單送出代表預約成功；完成付款並收到確認通知後，才算正式保留名額。</p></details>
        </div>
      </section>

      <section className="partner-strip">
        <div className="partner-brand">
          <Image className="partner-logo" src="/weiyan-logo-256.jpg" alt="微研 WEIYAN 科學教育・探索未來" width={90} height={90} />
          <div><p>活動企劃</p><strong>微研 WEIYAN</strong></div>
        </div>
        <span>×</span><div><p>餡料協力</p><strong>JIMMY39</strong></div><span>×</span><div><p>招生協力</p><strong>FAYMI</strong></div><span>×</span><div><p>活動場地</p><strong>高科大教育推廣場地</strong></div>
      </section>

      <footer>
        <div><Image className="footer-logo" src="/weiyan-logo-256.jpg" alt="微研 WEIYAN Logo" width={70} height={70} /><strong>微研｜把名字印進中秋</strong></div>
        <p>2026 3D 客製月餅工作坊｜活動日期、梯次、場地與內容以正式招生公告為準。</p>
        <a href="#top">回到頁首 ↑</a>
      </footer>

      <a className="mobile-register" href="#register"><span>每人 NT$650</span><strong>立即選場次 →</strong></a>
    </main>
  );
}
