# CLAUDE.md — 中秋月餅工作坊報名網站

給未來 session 的專案守則。一般說明看 [README.md](README.md)，這裡只放「看程式碼看不出來」的東西。

## 這個專案的底線

1. **圖片一定要先壓過再放進 `public/`。** `next/image` 是 `unoptimized`，放什麼就送什麼給使用者。
   規格與現有檔案大小見 README「圖片」。丟一張 2MB 的 PNG 進去 = 手機使用者要下載 2MB。
2. **不要重新引入 `/_vinext/image`。** 那個端點要 Cloudflare Images 綁定，帳號沒開通就會 500。
   `tests/rendered-html.test.mjs` 有一條 assertion 在守這件事，不要為了讓測試過就把它刪掉。
3. **密鑰只走 Cloudflare secret。** `GOOGLE_SHEETS_WEBHOOK_URL`／`SHEETS_WEBHOOK_TOKEN`
   不可以寫進任何進版控的檔案。這是 public repo。
4. **改完一定要跑 `npm test`。** 它會建置後對真的 SSR 輸出做驗證，比看程式碼可靠。

## 容易踩的坑

- **`dist/server/wrangler.json` 是建置產生的**，不進版控。想改 Worker 名稱或 compatibility
  設定，要去改 `package.json` 的 `name` 與 `vite.config.ts` 的 `localBindingConfig`，
  不是去改 `dist/` 裡的東西（會被下次建置蓋掉）。
- **npm scripts 不要加 `VAR=x cmd` 前綴。** 使用者是 Windows，npm 走 cmd.exe 會直接失敗。
  需要環境變數就在 `vite.config.ts` 裡用 `process.env.X ??=` 設預設值。
- **這個 repo 放在 Google Drive 裡**（`G:\我的雲端硬碟\05_科學教育\02_夏令營與營隊\115中秋夏令營\`）。
  不要在這個資料夾跑 `npm install`——node_modules 會拖垮 Drive 同步。
  要建置請先複製到本機 SSD 再做，改好的原始碼再抄回來。`desktop.ini` 已加進 `.gitignore`。
- **沒有「事先」客製**：月餅要壓的名字／圖案是活動當天現場決定，報名表單刻意不收，
  `app/api/register/route.ts` 的 `customType` 固定送 `現場選擇`。不要因為傳單寫
  「設計｜畫出自己的名字或圖案」就加客製欄位或上傳功能——那個步驟發生在現場。
  模具則是活動後可以帶回家（費用已包含）。
- **Google 端的欄位順序是寫死的**：Apps Script 用 `appendRow` 依序塞 18 欄，對應試算表第 3 列。
  要加／改報名欄位，`route.ts` 的 payload、Apps Script 的 `appendRow`、試算表欄位列
  三者必須同時改，只改一邊會整欄錯位。詳見 README「報名資料流（Google 端）」。
- **活動日期／價格／梯次寫死在程式碼裡**：`app/page.tsx` 的 `schedule`、`process` 陣列，
  以及 `app/api/register/route.ts` 的 `sessionLabels`。改場次要**兩邊一起改**，
  只改前端會讓報名 API 因為 `sessionCode` 對不上而回 400。金額 `quantity * 650` 也在該檔。
- **活動名稱有一份是「畫在圖上」的**：2026-09-01 活動預覽名稱從「把名字印進中秋」改成
  「月下玩創意」，文字部分在 `app/layout.tsx`（`title`／OG／Twitter／圖片 alt）、
  `app/page.tsx`（頁尾、報名區小標）、`tests/rendered-html.test.mjs`、README；
  **但 `public/og.jpg` 上那行大字是圖片本身**，改程式碼改不到，是把舊字塗掉後用
  Zen Maru Gothic Black（圓體，`@fontsource/zen-maru-gothic` 的 japanese 900 子集）
  重描上去的，`public/og.png`（1731×909 原始檔）也一起改，兩張要保持同步。
  **Hero 的 `<h1>把名字／印進中秋</h1>` 是刻意保留的**，使用者決定不動那個視覺設計。
  之後再改名：先 `grep -rn "舊名稱" app tests README.md` 把文字找齊，圖片要另外重做。
- **換 OG 圖後要動 `app/layout.tsx` 的 `?v=` 參數**（目前 `?v=20260901`）。
  LINE／Facebook 會把分享卡片快取住，網址沒變就有可能一直顯示舊圖。

## 部署

Cloudflare Workers（不是 Pages，因為有 SSR 與 `/api/register`）。
GitHub：`exhakuoho/weiyan-mooncake-2026`，push `main` 觸發部署。
指令與設定見 README「部署」。
