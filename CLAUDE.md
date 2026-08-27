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
- **活動日期／價格／梯次寫死在程式碼裡**：`app/page.tsx` 的 `schedule`、`process` 陣列，
  以及 `app/api/register/route.ts` 的 `sessionLabels`。改場次要**兩邊一起改**，
  只改前端會讓報名 API 因為 `sessionCode` 對不上而回 400。金額 `quantity * 650` 也在該檔。

## 部署

Cloudflare Workers（不是 Pages，因為有 SSR 與 `/api/register`）。
GitHub：`exhakuoho/weiyan-mooncake-2026`，push `main` 觸發部署。
指令與設定見 README「部署」。
