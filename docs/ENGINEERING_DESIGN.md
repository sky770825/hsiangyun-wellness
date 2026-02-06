# 高階工程設計原則

本文件從**高階工程設計**角度整理：哪些事用**原則與自動化**即可、哪些可精簡、哪些必須補強。日常開發以「原則 + 少數關鍵檢查」為主，細項留給工具與單一詳細文件。

---

## 一、思考邏輯重整：從清單到原則

### 1.1 目前狀態

- 已有 **DEVELOPMENT_PROCESS.md**（四大流程、細項檢查表）與 **IMPROVEMENTS.md**（功能改進）、**CHECKLIST.md**（風險與按鈕）。
- 優點：涵蓋效能、響應式、資料、UX，便於對照。
- 風險：細項多、部分重複、與工具職責重疊，長期維護成本高；缺少「上線門檻」與「安全／可觀測」等高階維度。

### 1.2 高階視角下的調整方向

| 維度 | 建議做法 | 理由 |
|------|----------|------|
| **能交給工具的，不寫成人工檢查** | JSX 閉合、型別一致、code split → 交給 ESLint、TypeScript、Vite | 減少重複且執行一致 |
| **用「原則」取代「逐條列舉」** | 例如：「非首屏資源延後載入」「前後台與 config/data 分流」各一條，不拆成多格 | 指令更簡潔，實作方式可變 |
| **合併重複、單一真相來源** | 流程與檢查集中在一份「開發流程」；上線門檻單獨一份短清單 | 避免 CHECKLIST / IMPROVEMENTS / PROCESS 三處講同一件事 |
| **補齊高階缺口** | 可觀測性、授權與 RLS、資料生命週期、發布策略 | 這些決定系統是否可安全上線與維運 |

---

## 二、不需要做／可更高效的事

### 2.1 不需列為「人工每項檢查」的項目

- **JSX 標籤成對、型別與介面一致**  
  → 交給 **ESLint**（react 相關規則）與 **TypeScript**；PR 或 CI 跑 `npm run lint`、`tsc` 即可。
- **靜態資源 hash、code split**  
  → **Vite** 預設已處理；不需寫進流程表「可選」讓人不確定要不要做。
- **斷點一致、容器寬度**  
  → 已由 **Tailwind config** 與 `.section-container` 定義；新區塊「依設計系統」即可，不必每頁逐項勾選。

**建議**：在 DEVELOPMENT_PROCESS 中將上述改為「由 ESLint / TypeScript / Vite / Tailwind 保證」，並註明「CI 建議執行 lint + typecheck」。

### 2.2 更高效的下指令方式

- **單一「上線前檢查」清單**（約 5～7 條）  
  例如：錯誤邊界已包住 App、預約有 loading/防重送、後台有登入保護、敏感操作有確認、無 `dangerouslySetInnerHTML`、環境變數與 Supabase 表名已設定。其餘視為「開發過程依原則即可」。
- **階段性決策紀錄**  
  例如：「目前資料存 localStorage，接 Supabase 後改為 API；表名依 supabase-naming.ts。」之後不需在 IMPROVEMENTS、PROCESS、CHECKLIST 三處重複「接 API 時再實作」，一處紀錄即可。
- **自動化**  
  - 若尚未有 CI：至少本地 `npm run lint`、`npm run build` 通過再合併。  
  - 未來可加：`vitest run`、Supabase 型別生成與型別檢查。

---

## 三、建議保留的精簡原則（取代長表）

下列可作為「開發時心智模型」，不需每次對照十幾格表格。

1. **效能與程式碼**  
   - 延遲：非首屏 lazy、關鍵操作防重送；其餘交給 Vite。  
   - 閉合：非同步有錯誤處理、Effect 有 cleanup、Blob/計時器會釋放；語法與型別交給 Lint/TS。  
   - 模組化：前後台分流、config/data 集中、服務層與 UI 分離、不把使用者輸入用危險 API 渲染。

2. **響應式**  
   - 依 Tailwind 斷點與既有 container／section 規範；新區塊 mobile-first、觸控目標足夠。

3. **資料與互動**  
   - 表名與型別依 `supabase-naming.ts` 與 `admin/types`；寫入前驗證（前端必做，後端接 API 時必做）；按鈕／表單與列表狀態一致、有 loading／錯誤回饋。

4. **存取與 UX**  
   - 建置產物快取交給 Vite；接 API 後再導入列表快取（如 React Query）；關鍵操作有即時回饋（loading／toast）；可選樂觀更新。

細項實作位置仍可保留在 **DEVELOPMENT_PROCESS.md**，但「日常指令」改為上述原則 + 單一上線清單即可。

---

## 四、高階工程上建議補強的部分

### 4.1 可觀測性與錯誤邊界

- **現況**：已有 Error Boundary，避免白屏。  
- **缺口**：錯誤是否上報、是否有集中 log（例如 Supabase 或前端 log 服務）。  
- **建議**：在 Error Boundary 內可選「上報錯誤（含環境、路由）」；接 Supabase 後可寫入 log 表或使用 Logflare 等。不一定要立刻做，但列為「上線前決策：錯誤要不要上報、存哪裡」。

### 4.2 授權與資料安全（Supabase RLS）

- **現況**：後台有登入保護（ProtectedRoute），資料存 localStorage。  
- **缺口**：接 Supabase 後，誰能讀寫哪些表、列、欄，應由 **RLS（Row Level Security）** 定義，而非只靠前端隱藏按鈕。  
- **建議**：在「接 Supabase」階段一次性設計：例如 `xiangyun_bookings` 僅已登入管理員可寫、前台僅可 insert；`xiangyun_members` 僅後台可讀寫。並在 SUPABASE_NAMING 或新章節註明「RLS 策略摘要」。

### 4.3 資料生命週期與合規

- **現況**：未明確定義資料保留、刪除、匯出。  
- **缺口**：若涉及個資（預約、學員），長期會需要：保留期限、使用者要求刪除／匯出時的流程。  
- **建議**：在文件註明「預約／學員為個資，接 Supabase 後需訂：保留政策、刪除與匯出方式」，實作可隨法規與營運再細化。

### 4.4 發布與變更策略

- **現況**：未明確寫出 DB 遷移、功能開關、回滾方式。  
- **缺口**：Supabase 表結構變更（新增欄、新表）若未用 migration，日後難以重現與回滾。  
- **建議**：接 Supabase 後採用 **Supabase Migrations**；重大功能可考慮「功能開關」（例如 config 或 feature flag）以便分批釋出。寫入 ENGINEERING_DESIGN 或 SUPABASE_NAMING 的「接 Supabase 時必做」即可。

### 4.5 依賴與升級策略

- **現況**：未定義何時升級依賴、是否追最新 major。  
- **建議**：簡單原則即可，例如「定期依 npm audit 修補安全問題；major 升級需跑完整測試與手動檢查」。不必寫進每日流程，僅在本文或 README 註一筆。

---

## 五、文件與指令結構建議

| 層級 | 文件／指令 | 用途 |
|------|------------|------|
| **原則與高階決策** | **ENGINEERING_DESIGN.md**（本文件） | 什麼不做、什麼自動化、什麼原則、哪些高階缺口要補 |
| **上線門檻** | 本文件「六、上線前檢查（精簡版）」 | 每次要上線／釋出前跑一次，約 5～7 條 |
| **流程與細項** | **DEVELOPMENT_PROCESS.md** | 四大流程細項與對應程式位置；新人或重構時對照 |
| **功能與改進** | **IMPROVEMENTS.md** | 功能建議與優先順序；與 PROCESS 不重複描述「怎麼做」 |
| **風險與按鈕** | **CHECKLIST.md** | 條件／風險、按鈕狀態、可擴充靈感；開頭引用 PROCESS 與本文件 |

**下指令時**：  
- 日常：「依 ENGINEERING_DESIGN 原則 + 必要時對照 DEVELOPMENT_PROCESS。」  
- 上線前：「跑完本文件第六節 + lint + build（+ 若有則 test）。」  
- 接 Supabase：「依 SUPABASE_NAMING + 本文件 4.2、4.3、4.4 做 RLS、資料生命週期、migration。」

---

## 六、上線前檢查（精簡版）

下列為**最小必要**，通過即可視為具備上線條件；其餘以原則與工具為主。

1. **錯誤邊界**：App 已用 Error Boundary 包住，單一元件錯誤不導致白屏。  
2. **關鍵表單**：預約有 loading、防重送、成功／錯誤回饋；若有個資，具隱私同意與隱私權政策。  
3. **後台保護**：後台路由需登入後才可存取（ProtectedRoute）。  
4. **敏感操作**：刪除、發送等具二次確認（AlertDialog）或等效機制。  
5. **無危險渲染**：使用者輸入不以 `dangerouslySetInnerHTML` 渲染。  
6. **建置與品質**：`npm run build` 成功；建議 `npm run lint`（與若有 `npm run test`）通過。  
7. **環境與設定**：若已接 Supabase，環境變數與表名（supabase-naming）已設定且與後端一致。

---

## 七、總結

- **不需要**：把工具已保證的事（Lint/TS/Vite/Tailwind）當成人工逐項檢查；也不要在多份文件重複「接 API 時再做」的同一句話。  
- **更高效**：用「原則 + 單一上線清單 + 自動化（lint/build/test）」下指令；細項留在 DEVELOPMENT_PROCESS 當參考。  
- **需要補**：可觀測性（錯誤上報）、授權與 RLS、資料生命週期、發布／migration 策略；在接 Supabase 與上線前納入決策即可。

依此整理後，日常開發以「原則 + 上線清單」為主，流程分類與細項作為支援，即可兼顧專業度與執行效率。
