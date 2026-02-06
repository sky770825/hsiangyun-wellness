# 預約前後端同步測試單

## 前後端是否同步？

- **前端**：預約陪跑頁面（`/book`）表單送出後，會呼叫 `createBooking()`。
- **後端**：
  - 若已設定 **Supabase**（`.env` 有 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`），資料會寫入 Supabase 的 `hsiangyun_bookings` 表。
  - 後台「預約管理」（`/admin/bookings`）會用 `fetchBookings()` 從同一張表讀取，因此**會同步**。
- 若**未**設定 Supabase，表單與後台都只會使用 **localStorage**（`admin_bookings`），資料不會進資料庫，但前後端仍會一致（同一台電腦、同一瀏覽器）。

## 前置條件（要進資料庫時）

1. **Supabase 專案**：已建立專案，且已執行 migrations（含 `hsiangyun_bookings` 與 RLS）。
2. **環境變數**：專案根目錄 `.env` 或 `.env.local` 內要有：
   ```env
   VITE_SUPABASE_URL=https://你的專案.supabase.co
   VITE_SUPABASE_ANON_KEY=你的 anon key
   ```
3. **RLS**：已套用 `anon_insert_bookings`、`anon_select_bookings`，以及（可選）`anon_update_bookings`、`anon_delete_bookings`，後台才能讀／更新／刪除。

## 測試步驟：兩筆測試單 → 後台與資料庫 → 再刪除

### 一、送出兩筆測試預約（前端）

1. 啟動開發伺服器：`npm run dev`，開啟前台首頁。
2. 進入 **預約陪跑** 頁（例如點選「預約陪跑」或網址 `/book`）。
3. **第一筆**：
   - 姓名：`測試一`
   - Email：`test1@booking-sync.test`
   - 留言：（可填「同步測試第一筆」）
   - 勾選同意隱私權政策 → 送出。
4. 確認出現成功訊息後，再填 **第二筆**：
   - 姓名：`測試二`
   - Email：`test2@booking-sync.test`
   - 留言：（可填「同步測試第二筆」）
   - 勾選同意 → 送出。

### 二、在後台確認（預約管理）

1. 開啟後台：`/admin` → 左側選「預約管理」（或直接 `/admin/bookings`）。
2. 確認列表中有剛送出的兩筆：
   - `測試一` / `test1@booking-sync.test`
   - `測試二` / `test2@booking-sync.test`
3. 可再確認：切換「卡片／表格」、排序、篩選狀態或日期，兩筆都應正確顯示。

### 三、在資料庫確認（有 Supabase 時）

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard) → 選專案。
2. 左側 **Table Editor** → 選表 `hsiangyun_bookings`。
3. 應能看到兩筆 `name` 為「測試一」「測試二」、`email` 為上述兩個測試信箱的資料。

### 四、刪除兩筆測試單

1. 留在後台「預約管理」頁。
2. 找到「測試一」那筆，點該筆的 **刪除** 按鈕（垃圾桶圖示）→ 在確認對話框按「刪除」。
3. 再對「測試二」重複一次刪除。
4. 確認列表已無這兩筆；若有開 Supabase Table Editor，重新整理後表中也應無這兩筆。

## 若未設定 Supabase

- 表單仍可送出，後台仍可看到預約（來自 localStorage）。
- 更新狀態、刪除都會只影響 localStorage，不會寫入資料庫。
- 要讓資料進資料庫，請完成「前置條件」並重跑上述測試。

## 快速檢查清單

| 項目 | 結果 |
|------|------|
| 前台表單可送出 | ☐ |
| 後台預約管理看得到兩筆 | ☐ |
| Supabase Table Editor 看得到兩筆（有設 Supabase 時） | ☐ |
| 後台可更新狀態且仍同步（有 anon UPDATE 時） | ☐ |
| 後台可刪除兩筆測試單 | ☐ |
| 刪除後列表與資料庫皆無該兩筆 | ☐ |
