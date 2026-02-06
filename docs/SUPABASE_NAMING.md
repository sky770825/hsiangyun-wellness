# Supabase 環境命名規範

以 **Supabase** 為檔案與資料庫命名基準，主目錄名稱以**導師姓名（許湘芸）**的英文命名為準，作為後續所有資料表與相關內容的前綴。

---

## 一、導師資訊

| 項目 | 內容 |
|------|------|
| **導師姓名（中文）** | 許湘芸 |
| **導師姓名（英文）** | Xu Xiangyun（湘芸 Xiangyun） |

---

## 二、主目錄英文命名選項（五選一）

以下五個選項皆以「許湘芸」為基礎，可作為 **Supabase 專案／Schema 或資料表前綴** 使用。擇定後請填入 `src/config/supabase-naming.ts` 的 `DB_SCHEMA_PREFIX`。

| 編號 | 英文命名 | 說明 | 適用情境 |
|------|----------|------|----------|
| **1** | `xiangyun` | 湘芸，簡短、好記、好打 | 單一導師、網址或識別碼希望簡潔時 |
| **2** | `xu_xiangyun` | 許湘芸 全名，snake_case | 資料庫／API 常用，語意完整 |
| **3** | `xiangyun_xu` | 名_姓 順序 | 習慣「名在前」的系統或報表 |
| **4** | `hsiangyun` | 湘芸 威妥瑪拼法 | 若需與既有英文拼法一致時可選 |
| **5** | `xiangyun_wellness` | 湘芸 + 領域（身心／療癒） | 多導師或多品牌時便於區分 |

**建議**：若僅有一位導師且以 Supabase 為唯一後端，可優先選 **`xiangyun`** 或 **`xu_xiangyun`**。

---

## 三、主目錄與資料表規劃

確定主目錄英文名稱後，將以該名稱作為 **前綴**，命名後續會用到的資料與結構：

### 3.1 預計使用的資料內容

| 類別 | 說明 | 建議資料表名稱（前綴以 `xiangyun` 為例） |
|------|------|------------------------------------------|
| **會員名單** | 學員／會員基本資料、狀態、來源 | `xiangyun_members` 或 `xiangyun_students` |
| **預約資訊** | 預約表單提交、狀態、時間 | `xiangyun_bookings` |
| **預約狀態紀錄** | 預約狀態變更（待處理／已聯絡／已確認／取消） | 可合併於 `xiangyun_bookings` 或另建 `xiangyun_booking_logs` |
| **學員任務／進度** | 任務板、陪跑進度 | `xiangyun_tasks` 或 `xiangyun_student_tasks` |
| **推播／訊息** | 推播內容、發送狀態 | `xiangyun_push_messages` |
| **媒體／資源** | 媒體庫、網站用圖 | `xiangyun_media` |
| **網站設定** | 主題、文案開關等 | `xiangyun_site_settings` 或 `xiangyun_theme` |

實際表名 = **`{主目錄英文名稱}_{功能}`**，例如選定 `xu_xiangyun` 則為 `xu_xiangyun_bookings`。

### 3.2 命名規則（Supabase 慣例）

- 使用 **小寫英文**、**snake_case**（底線連接）。
- 表名、欄位名皆以主目錄前綴 + 功能命名，避免與其他專案衝突。
- 之後新增的「會員名單、預約資訊等」皆依此規則命名，以利維護與擴充。

---

## 四、與程式碼的對應

- 主目錄名稱（五選一）會寫在 **`src/config/supabase-naming.ts`**。
- 前端或 Edge Functions 讀取該設定，組出正確的 Supabase 表名（如 `xiangyun_bookings`）。
- 環境變數仍使用 `.env` / `VITE_SUPABASE_*`，不與「主目錄英文名稱」混淆。

選定命名後，只需修改 `supabase-naming.ts` 內的前綴常數，即可統一所有資料表與後續擴充。
