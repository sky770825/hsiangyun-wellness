# 專案檢查清單：條件／風險、細節靈感、按鈕功能、可擴充功能

以下全部列出，便於日後維修與擴充時對照。

**開發流程**：請依 [DEVELOPMENT_PROCESS.md](./DEVELOPMENT_PROCESS.md) 四大流程對照細項；高階原則、可精簡項目與**上線前檢查**見 [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md)。

---

## 1. 可能沒注意到的條件及風險

| 項目 | 說明 | 建議 |
|------|------|------|
| **後台無登入保護** | `/admin` 任何人皆可進入，可讀寫 localStorage | 接 Supabase Auth 後加上 ProtectedRoute，未登入導向登入頁 |
| **預約資料僅存 localStorage** | 換裝置／清除快取即消失，無備份 | 接 Supabase 後改為 API 寫入 `bookings` 表 |
| **媒體庫圖片存 blob / base64** | 目前為 object URL 或 base64，關閉分頁可能失效，容量有限 | 接 Supabase Storage 後改為上傳取得 URL 再寫入 |
| **主題僅存 localStorage** | 多裝置不同步；無版本控管 | 可改為從 API/DB 讀取，或加「匯出／匯入主題」 |
| **表單無伺服端驗證** | 預約表單僅前端 required，可被繞過 | 後端 API 需再驗證 email 格式、長度、必填 |
| **無 rate limit** | 預約可重複送出、推播可重複點擊 | 後端或 Supabase Edge Function 可加限流 |
| **圖片載入失敗** | 故事/媒體若 URL 失效會破圖 | 用 `onError`  fallback 隱藏或顯示預設圖 |
| **無錯誤邊界** | 某元件拋錯會整頁白屏 | 可加 React Error Boundary 包住路由或整站 |
| **404 僅 console 紀錄** | 404 只打 log，無送後端 | 可選：送 analytics 或 log 到 Supabase |
| **無 CSRF / XSS 防護** | 若後端接表單需防 CSRF；使用者輸入需避免 innerHTML | 表單用 token；顯示文案用 text 或 React 預設跳脫 |
| **無隱私聲明／個資條款** | 預約會收個資 | 建議加「隱私權政策」頁與表單勾選同意 |
| **無無障礙完整通過** | 部分按鈕/連結可能缺 aria、focus 樣式 | 可補 aria-label、鍵盤導覽、focus 可見性 |

---

## 2. 可以增加的細節靈感

| 類別 | 細節 | 實作方向 |
|------|------|----------|
| **預約表單** | 送出中 loading、防重複送出 | 按鈕 disabled + 轉圈；submit 後設 flag |
| **預約表單** | 成功後可選「再預約一筆」 | 顯示成功後多一個「再填一筆」清空表單 |
| **首頁 Hero** | 語錄輪播可暫停／手動切換 | 已有手動點點，可加 hover 暫停自動輪播 |
| **學員故事** | 照片 lazy load、點擊放大 | 加 loading="lazy"；可加 lightbox 元件 |
| **Resources** | 測驗錨點捲動後按鈕可高亮 | 滾動到 #quiz 時導覽或按鈕樣式變化（可選） |
| **全站** | 麵包屑（例如 首頁 > 學員故事） | 在 PageLayout 或各頁加 Breadcrumb，路徑從 ROUTES 來 |
| **全站** | 每頁不同 title / description（SEO） | 用 react-helmet-async 或 document.title 依路由設定 |
| **後台** | 列表空狀態插畫或引導文案 | 預約/CRM/任務/推播無資料時顯示「建立第一筆…」 |
| **後台** | 刪除前二次確認 | 媒體刪除、推播發送前用 AlertDialog 確認 |
| **後台** | 操作成功 toasts | 儲存／刪除／發送後用 toast 提示成功或失敗 |
| **字體** | 主題切換時字體載入 | 若自訂 Google Font，動態加 link 避免缺字 |

---

## 3. 按鈕／功能是否有漏掉實作

| 位置 | 按鈕／行為 | 目前狀態 | 建議 |
|------|------------|----------|------|
| **Resources 頁** | 「開始測驗」 | 已改為 Link 至 `ROUTES.RESOURCES#quiz` 捲動到測驗區 | ✅ 已實作 |
| **Resources 頁** | 「免費下載 PDF」 | 按鈕 + toast「PDF 準備中」；之後可換成真實 PDF 連結 | ✅ 有回饋 |
| **Resources 頁** | 「訂閱每日語錄」 | 已改為 Link 至 `ROUTES.RESOURCES#quotes` 捲動到語錄區 | ✅ 已實作 |
| **首頁 ResourcesSection** | 三張卡「開始測驗／免費下載／訂閱語錄」 | 已用 `to={resource.link}` 連到 `/resources#quiz` 等 | ✅ 已實作 |
| **預約表單** | 「送出預約」 | 已寫入 store、顯示感謝；可補 loading、防重送 | ✅ 已實作 |
| **後台媒體** | 「選擇檔案上傳」 | 已觸發 input、寫入 store | ✅ 已實作 |
| **後台媒體** | 「刪除」 | 已從列表移除、revoke URL；可加確認對話框 | 建議補確認 |
| **後台推播** | 「發送」 | 僅改狀態為 sent，未真的送推播 | 接 Firebase/OneSignal 再實作 |
| **後台任務板** | 任務卡點擊 | 會切換到下一欄（todo→in_progress→done） | ✅ 已實作 |
| **後台 CRM** | 「加入學員」 | 已從預約寫入 CRM | ✅ 已實作 |
| **Navigation** | Logo 首頁連結 | 已改為 `ROUTES.HOME` | ✅ 已模組化 |
| **NotFound** | 「返回首頁」 | 已改為 `<Link to={ROUTES.HOME}>`，文案改中文 | ✅ 已模組化 |

---

## 4. 其他沒想到但可以做的功能

| 功能 | 說明 |
|------|------|
| **測驗頁／流程** | 獨立測驗頁：幾題選擇題 → 結果分類（假瘦語言類型）→ 可連到預約或資源 |
| **實際 PDF 下載** | 將「鬆動設定點的三個小行動」做成 PDF 放 public 或 CDN，按鈕連到檔案 |
| **訂閱管道** | 訂閱每日語錄：表單收 email 寫入 Supabase；或連到 Line 官方帳號／IG |
| **後台登入** | Supabase Auth（email+密碼或 magic link），僅登入者可進 `/admin` |
| **預約通知** | 新預約時發送 Email 或 Line 通知教練；可 Supabase Edge Function + 寄信 |
| **學員端連結** | 給學員專屬連結（如 /s/學員id）可看自己的進度摘要（需權限控管） |
| **簡單數據統計** | 後台總覽：預約數、學員狀態分布、任務完成率（從現有 store 或 DB 算） |
| **多語系** | 若未來要中英切換，可先將文案收進 i18n 檔，按語系 key 讀取 |
| **列印樣式** | 加 `@media print` 或列印專用頁（例如預約確認單、學員進度表） |
| **離線／PWA** | 若需離線看靜態內容，可加 service worker + manifest |
| **Cookie 同意橫幅** | 若有 analytics 或追蹤，可加一鍵同意/拒絕並存偏好 |
| **後台操作紀錄** | 誰在何時改了主題、刪了媒體等（需登入 + 寫入 log 表） |

---

## 模組化狀態（便於維修）

- **路由**：`config/routes.ts` 集中前台 `ROUTES` 與後台 `ADMIN_ROUTES`；`config/sections.ts` 為區塊錨點 `SECTION_IDS`。
- **導覽**：使用 `NAV_ITEMS`、`ROUTES`；後台使用 `ADMIN_NAV`（path 來自 `ADMIN_ROUTES`），避免硬編碼。
- **資料**：`data/*` 依功能分檔，`config/*` 放站名、導覽、路由、錨點。
- **後台**：`admin/store.ts` 集中讀寫；型別在 `admin/types.ts`；`admin/pages/index.ts` 統一匯出後台頁面。
- **頁面**：`pages/index.ts` 統一匯出前台頁面；各頁從 `@/layouts`、`@/data`、`@/config` 引入。
- **App**：路由與頁面改由 `@/admin/pages`、`./pages` 匯入，便於日後新增或抽換頁面。

以上依此清單逐項補齊或改為從設定讀取，日後維修與擴充會更一致。
