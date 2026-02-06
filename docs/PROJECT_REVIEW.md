# 專案檢視：10 項優化建議與 10 個現有問題

本文件針對目前專案狀態，整理**可優化調整的建議**與**現有問題**，供排程與維運參考。

---

## 一、10 項可優化調整的建議

| # | 建議 | 說明 | 優先度 |
|---|------|------|--------|
| 1 | **移除或精簡未使用的 App.css** | `src/App.css` 為 Vite 模板殘留（#root、.logo、.card 等），未被 `App.tsx` 或 `main.tsx` 引用，可刪除或清空，避免日後誤用。 | 低 |
| 2 | **統一 Toast 系統** | 目前同時掛 `Toaster`（Radix）與 `Sonner`，實際僅 `toast` from 'sonner' 被使用（Media、Resources）。可考慮只保留 Sonner，減少 bundle 與維護。 | 中 |
| 3 | **React Query 使用策略** | `QueryClientProvider` 已包住 App，但尚無任何 `useQuery`/`useMutation`。接 Supabase 後再導入，或暫時移除以減少依賴；若保留，建議在服務層註明「接 API 時改用」。 | 中 |
| 4 | **index.html 補上 favicon** | `public/favicon.ico` 已存在，但 `index.html` 未含 `<link rel="icon" href="/favicon.ico">`，部分環境可能不顯示站點圖示。 | 低 |
| 5 | **內頁 section 統一使用 .section-container** | `docs/DESIGN_CONTENT_AUDIT.md` 與 `index.css` 已定義 `.section-container`，部分內頁仍用 `container mx-auto px-6`。可逐步改為 `.section-container`，與導覽、頁尾內距一致。 | 低 |
| 6 | **後台登入密碼改為環境變數** | 目前 `AuthContext` 內 `MOCK_PASSWORD = 'admin'` 硬編碼。可改為讀取 `VITE_ADMIN_PASSWORD`（或接 Supabase Auth 後移除），避免密碼進版控。 | 高 |
| 7 | **接 Supabase 時表名集中從 config 讀取** | `services/booking.ts` 與未來 API 呼叫應使用 `getTableName('BOOKINGS')` 等（`config/supabase-naming.ts`），避免表名散落。 | 中（接 API 時） |
| 8 | **ErrorBoundary 可選：錯誤上報** | 目前僅 `console.error`。可選接 Supabase、Logflare 等，在 `componentDidCatch` 內上報錯誤與路由，利於監控。 | 低 |
| 9 | **首頁區塊 code split（選做）** | 首頁有多個 section（Intro、ShortVideo、Resources 等），可用 `React.lazy` 對非首屏區塊做動態載入，進一步縮小首屏 JS。 | 低 |
| 10 | **補上 CI 或 pre-commit** | 建議在 Git 提交或 CI 中執行 `npm run lint`、`npm run build`、`npm run test`，避免壞版進主線。 | 中 |

---

## 二、10 個專案目前現有的問題

| # | 問題 | 說明 | 影響 |
|---|------|------|------|
| 1 | **後台密碼硬編碼** | `src/auth/AuthContext.tsx` 中 `MOCK_PASSWORD = 'admin'`，且登入狀態存於 localStorage（`admin_auth_mock`）。 | 安全與部署：密碼易被得知，且未接正式 Auth。 |
| 2 | **資料僅存 localStorage** | 預約、CRM、任務、推播、媒體、主題皆存於瀏覽器 localStorage。 | 換裝置／清除快取即消失，無備份、無法多裝置同步。 |
| 3 | **App.css 未被引用** | `src/App.css` 存在但未被任何檔案 import。 | 死碼，可能造成混淆或誤改。 |
| 4 | **兩套 Toast 並存** | App 同時渲染 Radix `Toaster` 與 `Sonner`，實際僅 Sonner 被呼叫。 | 多餘程式與可能的重複 UI。 |
| 5 | **index.html 未設定 favicon** | 未含 `<link rel="icon" href="/favicon.ico">`。 | 部分瀏覽器或分頁可能不顯示站點圖示。 |
| 6 | **Tailwind content 含不存在的路徑** | `tailwind.config.ts` 的 content 含 `./pages/**`、`./components/**`，專案實際為 `src/pages`、`src/components`。 | 目前依賴 `./src/**` 涵蓋，無實質錯誤，但多餘路徑易誤導。 |
| 7 | **404 僅 console 紀錄** | `NotFound` 頁面僅 `console.error` 路徑，未導向或上報。 | 無法統計 404 或追蹤錯誤路徑（可選改為上報或 analytics）。 |
| 8 | **媒體庫上傳為 blob URL** | 上傳圖片存成 `URL.createObjectURL`，關閉分頁或重新整理可能失效。 | 媒體不持久、無法跨裝置使用。 |
| 9 | **NavLink 元件未被使用** | `src/components/NavLink.tsx` 存在，但 `Navigation` 使用 `react-router-dom` 的 `Link`。 | 死碼或未完成的抽象，增加維護成本。 |
| 10 | **表單僅前端驗證** | 預約等表單僅前端 required 與 email 格式檢查，無後端驗證。 | 接 API 前為已知限制；接上後需在後端再驗證。 |

---

## 三、對照與後續

- **優化建議**：多數為程式品質、一致性、未來接 API 的準備；可依優先度與排程逐項處理。
- **現有問題**：部分與 `docs/IMPROVEMENTS.md`、`docs/CHECKLIST.md` 重疊（如 localStorage、媒體 blob、表單驗證）；接 Supabase 與正式 Auth 後可一併改善。
- 若需「上線前必做」清單，可參考 `docs/ENGINEERING_DESIGN.md` 第六節；本文件側重「可優化」與「現有問題」的盤點。

以上共 **10 項優化建議** 與 **10 個現有問題**，可依資源與時程擇項實作或追蹤。
