# 微研 WEIYAN｜2026 中秋 3D 客製月餅工作坊 報名網站

「把名字印進中秋」活動的招生／報名單頁。報名資料透過 Google Apps Script Webhook
寫進 Google 試算表。

- 正式站：部署在 Cloudflare Workers（見下方「部署」）
- 活動：9/25–9/28（五～一）中秋連假四天，每日上下午各一梯，每人 NT$650，每場限 15 組
- 合作：微研 WEIYAN（企劃）× JIMMY39（餡料）× FAYMI（招生）× 高科大建工校區（場地）

## 技術架構

| 項目 | 用什麼 |
|---|---|
| 框架 | [vinext](https://github.com/cloudflare/vinext)（Next.js App Router 跑在 Cloudflare Workers 上） |
| 建置 | Vite + `@cloudflare/vite-plugin` |
| 執行環境 | Cloudflare Workers + Static Assets |
| 樣式 | Tailwind CSS v4（`app/globals.css`） |
| 報名儲存 | Google Apps Script Webhook → Google 試算表 |

```
app/
  page.tsx                  首頁（Hero／體驗內容／流程／場次／報名／FAQ）
  layout.tsx                <head> metadata、OG 分享圖
  globals.css               全站樣式
  components/
    RegistrationForm.tsx    報名表單（client component）
  api/register/route.ts     報名 API：驗證欄位 → 轉送 Google Sheets Webhook
worker/index.ts             Cloudflare Worker 進入點
tests/rendered-html.test.mjs  建置後的 SSR 輸出驗證
```

## 本機開發

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev      # 本機開發（含 Workers 模擬環境）
npm run build    # 建置
npm test         # 建置 + 驗證 SSR 輸出與報名 API
npm run lint
```

## 環境變數

報名 API 需要這兩個值，缺任一個時 `/api/register` 會回 503
「報名系統正在完成最後設定，請稍後再試。」——**上線前一定要設定**。

| 變數 | 用途 |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | Google Apps Script 部署後的 `/exec` 網址 |
| `SHEETS_WEBHOOK_TOKEN` | 與 Apps Script 端對招的共用密鑰，防止別人亂灌資料 |

本機：複製 `.env.example` 成 `.env` 後填入（`.env*` 已被 git 忽略）。

Cloudflare：用 secret 設定，不要寫進程式碼或 `wrangler.json`。

```bash
npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_URL
npx wrangler secret put SHEETS_WEBHOOK_TOKEN
```

## 部署（Cloudflare Workers）

這個站有 SSR 與 `/api/register`，所以是**部署成 Worker**，不是純靜態的 Pages。

### 方式一：接 GitHub 自動部署（建議）

Cloudflare Dashboard → Workers & Pages → Create → Workers → Connect to Git，
選這個 repo，然後填：

| 欄位 | 值 |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy -c dist/server/wrangler.json` |

之後 push 到 `main` 就會自動重新部署。記得到該 Worker 的
Settings → Variables and Secrets 補上上面兩個 secret。

### 方式二：本機手動部署

```bash
npm run deploy
```

（等同 `npm run build && wrangler deploy -c dist/server/wrangler.json`）

Worker 設定檔是建置時自動產生的 `dist/server/wrangler.json`——`dist/` 不進版控，
所以 repo 裡不會有 `wrangler.jsonc`，設定來源是 `vite.config.ts` 裡的
`localBindingConfig` 與 `package.json` 的 `name`。

## 圖片

`next/image` 設成 `unoptimized`（見 `next.config.ts`），圖片直接由 Cloudflare
Static Assets 提供，**不經過** Worker 的 `/_vinext/image` 最佳化端點——那個端點需要
帳號另外開通 Cloudflare Images 綁定，沒開通就會壞掉。

因此 `public/` 裡的圖片都是預先壓好的：

| 用途 | 檔案 | 大小 |
|---|---|---|
| Hero 主視覺 | `hero-mascots-cutout.webp` | 127 KB（原 PNG 2.5 MB） |
| OG 分享圖 | `og.jpg` 1200×630 | 151 KB（原 PNG 2.0 MB） |
| Logo／favicon | `weiyan-logo-256.jpg` | 11 KB（原 156 KB） |

換圖時請照這個規格壓過再放，不要直接丟原始檔。未壓縮的原圖
（`hero-mascots-cutout.png`、`og.png`、`hero-mascots.png`、`mooncake-photo.png`、
`weiyan-logo.jpg`）仍保留在 `public/` 當素材備份。

若之後想改用 Cloudflare Images 動態最佳化：帳號開通 Images 後，在
`next.config.ts` 拿掉 `unoptimized`，並在 Worker 設定加上 `IMAGES` 綁定。

## 這份程式碼的來歷

原本建在 ChatGPT Sites（OpenAI 託管）上，已改成可以自己建置、自己部署到
Cloudflare 的專案。移除的東西：`.openai/hosting.json`（OpenAI 專案 ID）、
`@openai/sites-vite-plugin`、`app/chatgpt-auth.ts`（ChatGPT 登入模組，本站沒用到）。
