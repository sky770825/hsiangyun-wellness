# 專案開發流程分類

持續建構網站前，須先依下列**四大流程**完成分類與檢核。開發與重構時請對照此文件，確保效能、響應式、資料與互動、存取與體驗皆符合規範。

**高階視角**：哪些項目可交給工具、可精簡、以及上線前必做與高階缺口（可觀測性、RLS、資料生命週期、發布策略），請見 **[ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md)**。日常以「原則 + 上線前檢查」為主，本文件為細項參考。

---

## 1. 效能與程式碼規範

### 1.1 (a) 注意延遲（Latency）問題

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 非首屏資源延後載入 | 圖片、iframe、第三方腳本不阻塞首屏 | `SafeImage` + `loading="lazy"`；短影音／輪播可考慮 Intersection Observer | ✅ 已用 lazy |
| 避免同步阻塞主線程 | 大量運算、JSON 解析改非同步或分批 | `admin/store` 讀取為同步但資料量小；未來 API 用 async/await | ✅ |
| 請求合併與時機 | 避免短時間重複請求同一資源 | 預約送出用 `loading` 防重送；未來 API 層可加簡單 cache 或 debounce | ✅ 防重送已做 |
| 關鍵路徑精簡 | 首屏 CSS/JS 體積、必要資源優先 | Vite 已 code split；可檢視 `vite build --report` 分析 | 可選 |

**程式參考**：`src/services/booking.ts`、`src/components/SafeImage.tsx`、`src/admin/store.ts`

---

### 1.2 (b) 檢查程式碼是否閉合

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| JSX 標籤成對、無未閉合 | 每個開始標籤皆有對應結束 | **交給工具**：ESLint + TypeScript；CI 或 PR 前跑 `npm run lint` | 工具保證 |
| 非同步流程錯誤處理 | try/catch、Promise catch、錯誤邊界 | `createBooking` 有 try/catch；`ErrorBoundary` 包住 App | ✅ |
| 事件監聽與訂閱卸載 | useEffect 內 addEventListener 需在 cleanup 移除 | `Navigation` scroll、Hero 輪播 setInterval 皆有 cleanup | ✅ |
| 資源釋放 | Blob URL、計時器、訂閱在元件卸載時釋放 | 媒體刪除時 `URL.revokeObjectURL`；輪播 clearInterval | ✅ |

**程式參考**：`src/App.tsx`（ErrorBoundary）、`src/components/Navigation.tsx`、`src/admin/pages/Media.tsx`

---

### 1.3 (c) 強化模組化設計並分流，避免模組間互相影響與模板安全

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 前後台分離 | 前台頁面與後台 Admin 路由、layout、store 分開 | `src/pages/` vs `src/admin/pages/`；`AdminLayout` 獨立 | ✅ |
| 設定與資料分流 | 路由、導覽、文案、表名集中於 config / data | `src/config/`、`src/data/`；Supabase 表名 `src/config/supabase-naming.ts` | ✅ |
| 服務層與 UI 分離 | API／store 呼叫不直接寫在頁面元件深處 | `src/services/booking.ts`、`src/admin/store.ts`；頁面只呼叫 service | ✅ |
| 避免全域污染與隱式依賴 | 少用全域變數；依賴由參數或 context 傳入 | 主題經 ThemeProvider；路由用 React Router | ✅ |
| 模板／顯示安全 | 使用者輸入不以危險 API 渲染（如 innerHTML） | React 預設跳脫；無 `dangerouslySetInnerHTML` 於使用者內容 | ✅ |

**程式參考**：`src/config/`、`src/data/`、`src/services/`、`src/admin/store.ts`、`src/App.tsx`

---

## 2. 響應式設計（Responsive Design）

### 2.1 (a) 調整視覺比例

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 標題與內文階層 | 不同斷點下字級、行高一致可讀 | `index.css` h1～h6 階層；各區塊使用 text-3xl / text-lg 等 | ✅ |
| 容器寬度與留白 | 大螢幕不過寬、小螢幕有呼吸空間 | Tailwind `container` 斷點；`px-4 sm:px-6 lg:px-8`、`.section-container` | ✅ |
| 圖片與媒體比例 | 避免變形、維持合理長寬比 | `SafeImage`、`aspect-video`、`aspect-[4/3]` 等 | ✅ |
| 按鈕與觸控目標 | 行動裝置可點區域足夠（約 44px 起） | 按鈕 size="lg"/"xl"；導覽可檢視觸控區 | ✅ |

**程式參考**：`src/index.css`、`tailwind.config.ts`、`src/layouts/PageLayout.tsx`

---

### 2.2 (b) 符合手機或各種視窗尺寸的程式碼撰寫

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 斷點一致 | 全站使用同一套 sm/md/lg/xl 定義 | Tailwind 預設 + container screens | ✅ |
| 主要區塊在小螢幕可讀 | 單欄、堆疊、字級縮放 | 首頁與內頁多為 `flex-col md:flex-row`、`grid md:grid-cols-2/3` | ✅ |
| 導覽在手機可用 | 漢堡選單、展開收合、焦點不卡住 | `Navigation` 有 mobile menu、aria-expanded | ✅ |
| 表單在手機好填 | 輸入框大小、鍵盤類型、錯誤訊息可見 | 預約表單已 RWD；可補 inputmode / autocomplete 等 | 可補 |

**程式參考**：`src/components/Navigation.tsx`、`src/pages/Booking.tsx`、各頁 section 的 `className`

---

## 3. 資料庫與互動邏輯

### 3.1 (a) 確保資料庫撰寫的正確性

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 表名與欄位命名一致 | 依 Supabase 命名規範與主目錄前綴 | `src/config/supabase-naming.ts`：`TABLE_NAMES`、`DB_SCHEMA_PREFIX` | ✅ 已定義 |
| 寫入前驗證 | 必填、格式、長度在後端或 Edge Function 再驗證 | 目前前端驗證；接 Supabase 後需後端驗證 email 等 | 接 API 時實作 |
| 讀寫錯誤處理 | 失敗時不靜默、有 toast 或錯誤狀態 | 預約送出 catch 顯示錯誤；未來 API 層統一錯誤處理 | 部分 |
| 型別與介面一致 | 前端型別與 DB 欄位對齊 | `admin/types.ts`、`services/types.ts`；接 API 時對照 Supabase 型別 | ✅ |

**程式參考**：`src/config/supabase-naming.ts`、`src/admin/types.ts`、`src/services/`、`docs/SUPABASE_NAMING.md`

---

### 3.2 (b) 處理資料庫與按鈕、連結及頁面之間的連動性

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 預約送出 → 寫入 → 後台列表 | 表單送出後寫入 store/API，後台即時反映 | `createBooking` → `saveBookings`；後台 `loadBookings()` | ✅ localStorage |
| 後台狀態變更 → 列表更新 | 預約狀態、學員狀態、任務狀態改寫後畫面更新 | 各 admin 頁面 setState 後重新 render；未來可加 React Query 失效 | ✅ |
| 連結與路由一致 | 按鈕、導覽、Footer 使用 ROUTES 常數 | `config/routes.ts`、各頁 Link to={ROUTES.xxx} | ✅ |
| 表單成功／失敗回饋 | 按鈕 loading、成功訊息、錯誤提示 | Booking 有 loading、submitted、error；toast 用於後台 | ✅ |

**程式參考**：`src/pages/Booking.tsx`、`src/admin/pages/Bookings.tsx`、`src/config/routes.ts`、`src/services/booking.ts`

---

## 4. 存取與使用者體驗

### 4.1 (a) 優化快取（Cache）與暫存機制

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 靜態資源快取 | 建置產物檔名 hash、長期快取 | Vite 預設 output 含 hash | ✅ |
| 列表／查詢結果暫存 | 避免重複請求相同資料 | 目前 store 為記憶體/localStorage；接 API 後可用 React Query 或 SWR | 接 API 時導入 |
| 表單暫存（選用） | 草稿存 localStorage 避免誤關遺失 | 未實作；可選在 Booking 加 draft 存回 | 可選 |

**程式參考**：`vite.config`、未來 `services/` 與 React Query

---

### 4.2 (b) 記憶體管理與刷新機制

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 元件卸載時清理 | 計時器、監聽、Blob URL 釋放 | 見 1.2(b) | ✅ |
| 列表更新時舊資料不殘留 | 狀態更新後 UI 反映最新 list | setState 取代原陣列；無閉包舊值 | ✅ |
| 頁面可見時再重新拉資料（選用） | 從後台返回預約頁時可 refetch | 目前單頁載入一次；未來可於 focus 或 route 時 invalidate | 接 API 時 |

**程式參考**：`src/admin/store.ts`、各 admin 頁面 useState/loadX()

---

### 4.3 (c) 導入樂觀設計（Optimistic UI）

| 檢查項 | 說明 | 對應位置／作法 | 狀態 |
|--------|------|----------------|------|
| 樂觀更新 | 先更新 UI，請求失敗再回滾 | 目前預約送出為「等成功再更新」；可改為先顯示成功再於 catch 還原 | 可選 |
| 按鈕與表單即時回饋 | 送出中 disabled、loading 文案 | Booking 有 loading、送出中… | ✅ |
| 列表操作即時反映 | 刪除、狀態變更先從畫面移除／更新 | 後台刪除、拖曳任務狀態皆先更新 UI 再寫 store | ✅ 已樂觀 |

**程式參考**：`src/pages/Booking.tsx`、`src/admin/pages/Media.tsx`、`src/admin/pages/TaskBoard.tsx`

---

## 流程對照總表

| 大類 | 子項 | 重點 | 優先檢核時機 |
|------|------|------|----------------|
| 1. 效能與程式碼規範 | (a) 延遲 | 非首屏 lazy、防重送、請求時機 | 新增頁面／串接 API |
| | (b) 閉合 | 錯誤處理、cleanup、資源釋放 | 每次 PR／重構 |
| | (c) 模組化與安全 | 前後台分流、config/data、無危險 API | 新增功能時 |
| 2. 響應式設計 | (a) 視覺比例 | 字級、容器、圖片比例、觸控目標 | 新增區塊／改版 |
| | (b) 多視窗 | 斷點、手機選單、表單 | 新增頁面／表單 |
| 3. 資料庫與互動 | (a) 正確性 | 表名、驗證、錯誤處理、型別 | 接 Supabase／改 schema |
| | (b) 連動 | 按鈕→寫入→列表、路由一致、回饋 | 新增表單／後台功能 |
| 4. 存取與 UX | (a) 快取 | 靜態 hash、列表暫存 | 接 API、上線前 |
| | (b) 記憶體與刷新 | cleanup、refetch 時機 | 重構、接 API |
| | (c) 樂觀 UI | 即時回饋、樂觀更新 | 表單與列表功能 |

---

## 使用方式

- **新功能開發前**：依上表確認該功能落在哪一類，對應子項逐項檢查。
- **Code Review／重構**：以「1. 效能與程式碼規範」與「3. 資料庫與互動」為主。
- **上線前**：四大類皆至少跑過一輪，並更新本文件「狀態」欄。

若你希望某類（例如「接 Supabase 後」）再細化成 checklist，可在此文件下新增「階段性檢查表」章節，並與 `docs/SUPABASE_NAMING.md`、`docs/IMPROVEMENTS.md` 互相參照。
