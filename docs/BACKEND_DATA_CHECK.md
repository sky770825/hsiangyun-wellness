# 後台資料、功能連結與追蹤檢查

本文件對應「資料庫學員種子資料」與後台各頁的資料來源、連結與追蹤關係。

---

## 一、種子資料（Supabase）

已寫入的模擬資料：

### 1. 學員（hsiangyun_members）— 5 筆

| 姓名   | Email                    | 狀態     | 備註摘要 |
|--------|---------------------------|----------|----------|
| 王美玲 | meiling.wang@example.com  | 進行中   | 產後八個月，每週諮詢 |
| 陳雅婷 | yating.chen@example.com   | 跟進中   | 反覆復胖，待首次見面 |
| 林曉慧 | xiaohui.lin@example.com   | 新進     | 朋友轉介 |
| 張雅琪 | yaqi.zhang@example.com    | 已完成   | 12 週陪伴完成 |
| 黃淑芬 | shufen.huang@example.com  | 暫停     | 工作壓力，預計下月恢復 |

### 2. 學員任務（hsiangyun_tasks）— 8 筆

- 王美玲：3 筆（飲食紀錄、諮詢準備、月底回顧）
- 陳雅婷：2 筆（表單連結、安排首次諮詢）
- 林曉慧：1 筆（電話關懷）
- 張雅琪：1 筆（季度追蹤）
- 黃淑芬：1 筆（確認恢復意願）

### 3. 預約（hsiangyun_bookings）— 2 筆

- 吳小華：pending，想了解產後瘦身
- 鄭雅文：contacted，反覆減肥想換方式

---

## 二、後台資料來源與功能連結

| 頁面         | 資料來源（有 Supabase 時）     | 功能與連結 |
|--------------|--------------------------------|------------|
| **總覽**     | fetchBookings / fetchMembers / fetchTasks | 四張卡連到預約、CRM、任務板、推播；下方為預約／學員狀態分布與快速操作 |
| **預約管理** | fetchBookings                  | 列表顯示所有預約，可改狀態；狀態會寫回 Supabase 或 localStorage |
| **CRM 學員** | fetchMembers + fetchBookings   | 從預約轉入、手動新增學員；狀態與進度備註寫回 DB |
| **學員任務板** | fetchTasks + fetchMembers    | 三欄看板（待處理／進行中／已完成），點任務切換狀態；新增任務可選學員 |
| **網站設定** | store（主題）                  | 尚未接 Supabase，仍為 localStorage |
| **媒體庫**   | store                          | 尚未接 Supabase Storage，仍為 localStorage |
| **推播發送** | store                          | 尚未接推播 API，仍為 localStorage |

---

## 三、追蹤關係

- **預約 → 學員**：在「CRM 學員」頁可從「從預約轉入」將一筆預約轉成學員（同 email 不重複加入）。
- **學員 → 任務**：在「學員任務板」新增任務時可選擇學員；任務的 `student_id` 對應 `hsiangyun_members.id`。
- **總覽數字**：待處理預約、進行中學員、未完成任務皆來自同一批 API（fetchBookings / fetchMembers / fetchTasks），與各列表頁一致。

---

## 四、如何驗證

1. 確保 `.env` 已設定 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`。
2. 執行 `npm run dev`，開啟 `/admin`。
3. **總覽**：應看到待處理預約 2、進行中學員 2、未完成任務 6 等（與種子一致）。
4. **預約管理**：應看到吳小華、鄭雅文兩筆。
5. **CRM 學員**：應看到 5 位學員及進度備註；可從預約轉入、改狀態、改備註。
6. **學員任務板**：應看到 8 筆任務分布在三欄；點任務可切換狀態，新增任務可選上述學員。

若未設定 Supabase 或 API 失敗，各頁會回退到 localStorage（空或既有資料）。

---

## 五、讀不到 Supabase 的常見原因

1. **環境變數未設定或未載入**
   - 必須在專案根目錄有 `.env`，且包含：
     - `VITE_SUPABASE_URL=https://你的專案.supabase.co`
     - `VITE_SUPABASE_ANON_KEY=你的 anon key`
   - 變數名稱一定要有 `VITE_` 前綴，Vite 才會注入到前端。
   - 新增或修改 `.env` 後要**重新執行 `npm run dev`** 才會生效。

2. **RLS 權限（已透過 migration 修正）**
   - 後台目前未登入，使用的是 **anon** 角色。
   - 預約、學員、任務表已加上「anon 可 SELECT」的 policy（migrations 內），讀取應可正常。
   - 若曾手動改過 RLS，請確認三張表都有給 `anon` 的 SELECT policy。

3. **如何確認是否有連到 Supabase**
   - 打開開發者工具 → Network，重新整理後台頁面，應看到對 `*.supabase.co` 的 request。
   - 若完全沒有 supabase 請求，多半是 `hasSupabase()` 為 false（環境變數為空）。
