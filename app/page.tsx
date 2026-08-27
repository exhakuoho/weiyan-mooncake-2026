import Image from "next/image";
import { RegistrationForm } from "./components/RegistrationForm";

const experienceCards = [
  { icon: "🖨️", title: "認識 3D 模具", text: "看看數位設計如何變成立體模具，感受科技與手作的結合。", tone: "blue" },
  { icon: "🥣", title: "親手包餡", text: "使用 JIMMY39 協力準備的餡料，掌握餅皮與餡料比例。", tone: "orange" },
  { icon: "🧩", title: "壓出專屬圖案", text: "用完成 QA 的客製模具，把想法清楚壓進月餅。", tone: "mint" },
  { icon: "🎁", title: "禮盒帶回家", text: "完成 4 顆迷你月餅、裝盒保存，留下專屬中秋回憶。", tone: "purple" },
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
  ["9/19", "週六", "第一週", ["09:00–12:00", "13:00–16:00"]],
  ["9/20", "週日", "第一週", ["09:00–12:00", "13:00–16:00"]],
  ["9/26", "週六", "第二週", ["09:00–12:00", "13:00–16:00"]],
  ["9/27", "週日", "第二週", ["09:00–12:00", "13:00–16:00"]],
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
          <span className="eyebrow">2026 中秋限定 · 招生預告</span>
          <h1>把名字<br /><em>印進中秋</em></h1>
          <p className="hero-lead">
            用 3D 列印模具，親手完成一份充滿巧思的造型月餅。從包餡、壓模到裝盒，三小時享受科技與手作交會的中秋時光。
          </p>
          <div className="hero-pills" aria-label="活動重點">
            <span>每人 NT$800</span>
            <span>帶回 4 顆月餅</span>
            <span>每日上、下午各 1 梯</span>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#register">選場次報名 <span>→</span></a>
            <a className="button ghost" href="#experience">先看體驗內容</a>
          </div>
          <p className="micro-note">日期與場地以正式招生公告為準</p>
        </div>

        <div className="hero-art" aria-label="可愛月餅角色與 3D 列印模具插畫">
          <div className="art-sticker sticker-one">姓名客製</div>
          <div className="art-sticker sticker-two">4 顆帶回</div>
          <Image src="/hero-mascots-cutout.webp" alt="兩個可愛月餅角色、禮盒與 3D 列印模具" width={1448} height={1086} priority />
        </div>
      </section>

      <section className="quick-facts" aria-label="活動資訊">
        <article><span className="fact-icon">📅</span><div><small>活動日期（暫定）</small><strong>9/19–20、9/26–27</strong></div></article>
        <article><span className="fact-icon">🕘</span><div><small>每日場次</small><strong>09:00–12:00／13:00–16:00</strong></div></article>
        <article><span className="fact-icon">📍</span><div><small>活動地點</small><strong>高科大建工校區</strong></div></article>
        <article><span className="fact-icon">🎁</span><div><small>完成成果</small><strong>4 顆月餅＋禮盒</strong></div></article>
      </section>

      <section className="section" id="experience">
        <div className="section-heading centered-heading">
          <span className="section-kicker">一場體驗，兩種驚喜</span>
          <h2>科技負責客製，雙手完成溫度</h2>
          <p>客製設計在活動前先完成，現場不必等待列印，把時間留給真正好玩的月餅製作。</p>
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
          <div><span className="section-kicker">兩個週末，共 8 梯</span><h2>挑一個最適合你的中秋手作時光</h2></div>
          <div className="limit-pill"><span>👥</span><div><small>小班操作</small><strong>每梯限額 14 席</strong></div></div>
        </div>
        <div className="schedule-grid">
          {schedule.map(([date, day, week, times]) => (
            <article key={date}>
              <div className="date-heading"><div><strong>{date}</strong><span>{day}</span></div><small>{week}</small></div>
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
          <details><summary><span>👨‍👩‍👧</span>親子可以一起參加嗎？</summary><p>可以。請依實際操作人數報名；每一位付費參加者都有一份材料與 4 顆月餅。</p></details>
          <details><summary><span>🖨️</span>現場會使用哪些模具？</summary><p>活動會準備多款 3D 列印模具，參加者於現場依教學安排使用，不需要在報名時預先選擇。</p></details>
          <details><summary><span>🥜</span>有食物過敏可以參加嗎？</summary><p>月餅常見蛋、奶、麩質、大豆、芝麻與堅果等過敏原。請在表單完整填寫，我們會先確認是否能安全安排。</p></details>
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

      <a className="mobile-register" href="#register"><span>每人 NT$800</span><strong>立即選場次 →</strong></a>
    </main>
  );
}
