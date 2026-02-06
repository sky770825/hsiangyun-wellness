# 後台管理

後台與前台使用**同一套設計系統**（Tailwind、CSS 變數、字體與顏色），可 1:1 控制前台視覺與內容。

## 進入方式

- 開發：`npm run dev` 後開啟 **http://localhost:8080/admin**
- 側欄可點「前往前台」回到官網

## 功能模組

| 路徑 | 說明 |
|------|------|
| `/admin` | 總覽：待處理預約、進行中學員、未完成任務、草稿推播 |
| `/admin/settings` | **網站設定**：字形、字體大小、主色系（HSL），即時套用整站 |
| `/admin/media` | **媒體庫**：上傳圖片、指定用途（Hero / 形象照 / 裝飾圖） |
| `/admin/bookings` | **預約管理**：前台預約表單列表、狀態（待處理 / 已聯繫 / 已確認 / 已取消） |
| `/admin/crm` | **CRM 學員**：從預約轉入或手動新增、狀態與進度備註 |
| `/admin/tasks` | **學員任務板**：看板（待處理 / 進行中 / 已完成）、可綁定學員 |
| `/admin/push` | **推播發送**：新建草稿、發送（實際發送需接 Firebase / OneSignal 等） |

## 資料儲存（目前與之後）

- **目前**：使用 `localStorage`（`src/admin/store.ts`），不需後端即可操作。
- **之後**：接 **Supabase** 時可改為：
  - 主題 → `site_settings` 或 `theme` 表
  - 媒體 → Supabase Storage + `media` 表
  - 預約 → `bookings` 表
  - CRM → `students` 表
  - 任務 → `tasks` 表
  - 推播 → `push_messages` 表 + 推播服務 API

## 更進階的做法（可選）

- **Headless CMS**：若希望非工程師也能改文案與版位，可將部分內容改由 Strapi / Payload / Directus 管理，前台用 API 取資料。
- **即時同步**：多分頁時，可用 Supabase Realtime 或 `window.storage` 事件同步主題與列表。
- **權限**：接 Supabase Auth 後，可限制只有登入管理員能存取 `/admin/*`。
