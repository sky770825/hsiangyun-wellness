# 接案工具包 - 完整解決方案

> 針對你提出的 10 個需求，從 CRITICAL 到 LOW 的完整解決方案

## 📦 內容清單

### 🔴 CRITICAL（立即可用）

#### 1. Supabase RLS Policy 範本庫
**檔案**: `supabase_rls_templates.sql`

**用途**: 涵蓋 7 種常見情境的 RLS policy 範本
- 只能讀寫自己的資料（最常用）
- 公開讀取，私有寫入
- 管理員全權存取
- 團隊協作（多人共用）
- 階層式存取控制
- 時間限制存取
- Storage Bucket Policies

**使用方式**:
```bash
# 1. 開啟 Supabase SQL Editor
# 2. 複製對應情境的 policy
# 3. 替換 {table_name} 為你的表名
# 4. 執行

# 檢查 RLS 覆蓋率
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT tablename FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE c.relrowsecurity = true
);
```

**防災價值**: 沒有 RLS = 資料庫對外裸奔，商業專案出事客戶會找你

---

#### 2. 環境變數同步驗證機制
**檔案**: `verify_env_sync.sh`

**用途**: 自動比對 `.env.local`、Vercel Dashboard、GitHub Secrets 三邊的環境變數是否對齊

**使用方式**:
```bash
# 執行驗證
./verify_env_sync.sh

# 整合進 CI/CD（在 .github/workflows/deploy.yml）
- name: Verify env sync
  run: ./tools/verify_env_sync.sh
```

**必要工具**:
- `vercel` CLI: `npm i -g vercel`
- `gh` CLI: `brew install gh` (macOS)
- `jq`: `brew install jq`

**防災價值**: 你現在最常卡關的根本原因，部署前自動擋住不一致

---

### 🟠 HIGH（嚴重影響效率）

#### 3. 專案腳手架 Template
**檔案**: `PROJECT_TEMPLATE_README.md`

**用途**: 一鍵開新專案，架構全部預裝好

**結構**:
```
template-repo/
├── .github/workflows/      # CI/CD 預設
├── src/
│   ├── lib/supabase.ts
│   └── types/database.ts
├── tools/
│   ├── verify_env_sync.sh
│   ├── supabase_rls_templates.sql
│   └── cursor_audit/
├── supabase/migrations/
├── .env.example
├── .cursorrules
└── vercel.json
```

**建立方式**:
```bash
# 在 GitHub 建立 template repo
# 勾選 "Template repository"

# 使用範本開新專案
gh repo create my-new-project \
  --template YOUR_USERNAME/supabase-vite-template \
  --private
```

**效率提升**: 從 2 小時設定時間縮短到 10 分鐘

---

#### 4. 資料庫 Migration 標準流程
**檔案**: `migration_workflow.sh`

**用途**: 強制走正確的 migration 流程，避免多專案並行時出問題

**標準流程**:
```bash
# 1. 在 Supabase Studio 修改 schema

# 2. 執行工作流程腳本（互動式）
./migration_workflow.sh

# 或自動模式（CI/CD）
./migration_workflow.sh auto
```

**腳本會自動處理**:
1. 產生 migration 檔: `supabase db diff -f name`
2. 套用到本地: `supabase db reset`
3. 產生 TypeScript types: `supabase gen types`
4. Git commit types 檔案
5. 推送到 production: `supabase db push`（需確認）
6. 驗證 RLS policies

**整合進 CI/CD**: 見 `github_auto_types.yml`

---

#### 5. 錯誤監控和告警
**檔案**: 
- `errorMonitoring.ts` - 前端監控程式碼
- `n8n_error_notification_workflow.json` - n8n workflow

**用途**: Sentry + n8n webhook + LINE 通知，前端 crash、Supabase 錯誤、Edge Function 失敗都能即時通知

**設定步驟**:
```bash
# 1. 安裝 Sentry
npm install @sentry/react @sentry/browser

# 2. 在 main.tsx 初始化
import { initErrorMonitoring, setupGlobalErrorHandler } from './lib/errorMonitoring';
initErrorMonitoring();
setupGlobalErrorHandler();

# 3. 設定環境變數
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_N8N_ERROR_WEBHOOK_URL=https://your-n8n.com/webhook/error

# 4. 在 n8n 匯入 workflow
# 5. 設定 LINE Notify Token
```

**監控範圍**:
- 前端 crash（未處理的錯誤）
- Supabase 錯誤（攔截所有 API 錯誤）
- Edge Function 錯誤
- 自訂錯誤回報

**通知路徑**: 錯誤 → Sentry → n8n → LINE（你的手機）

---

### 🟡 MEDIUM（明顯改善工作品質）

#### 6. 自動產生型別的 CI Hook
**檔案**: `github_auto_types.yml`

**用途**: Migration 跑完就自動 commit 新的型別檔，前端永遠不會跟 DB schema 脫節

**使用方式**:
```bash
# 複製到 .github/workflows/auto-types.yml

# 設定 GitHub Secrets
# SUPABASE_ACCESS_TOKEN
# SUPABASE_PROJECT_ID
```

**工作流程**:
1. 偵測到 `supabase/migrations/` 有變更
2. 執行 `supabase db push --dry-run`
3. 產生新的 `src/types/database.ts`
4. 如果有變更，自動 commit
5. 在 PR 上留言通知

---

#### 7. autopilot.sh（自動修復腳本）
**檔案**: `autopilot.sh`

**用途**: 讀取 taskboard.json → 取第一條 READY → 組裝 prompt → 呼叫 Cursor → 標記 DOING → 驗證 → 標記 DONE

**使用方式**:
```bash
# 互動模式（推薦）
./autopilot.sh . audit 2 --git-mode

# 參數說明:
# . = 專案路徑
# audit = 模式（audit/fix）
# 2 = 一次處理幾條
# --git-mode = 每次修復後自動 commit
```

**工作流程**:
1. 讀取 `audit/taskboard.json`
2. 找出所有 READY 的任務
3. 逐一處理：
   - 更新狀態為 DOING
   - 顯示 Cursor prompt
   - 等待你在 Cursor 完成修復
   - 詢問是否完成 (y/n/skip)
   - 標記為 VERIFY 或改回 READY
   - 可選：自動 git commit

**效率提升**: 多專案並行的修復效率大幅提升

---

#### 8. 客戶交付 Checklist
**檔案**: `delivery_checklist.sh`

**用途**: 交付前自動檢查 15+ 項目，確保不漏東西

**檢查項目**:
- ✅ RLS 全開
- ✅ 環境變數文件化
- ✅ Vercel 設定
- ✅ 文件完整性（README、操作手冊）
- ✅ 備份策略
- ✅ 錯誤監控
- ✅ 安全性（npm audit）
- ✅ Git 清理

**使用方式**:
```bash
# 執行檢查
./delivery_checklist.sh

# 嘗試自動修復部分問題
./delivery_checklist.sh --auto-fix
```

**輸出範例**:
```
✅ 所有資料表都啟用 RLS
✅ .env.example 已建立
⚠️  已設定自訂域名（建議設定客戶的自訂域名）
❌ 已建立操作手冊（需要建立 MANUAL.md）

總檢查項目: 25
通過: 20
警告: 3
失敗: 2
```

---

### 🔵 LOW（錦上添花但有長期價值）

#### 9. 多專案共用元件庫
**建議方案**:

方案 A: 私有 npm 套件
```bash
# 建立共用元件 repo
mkdir shared-components
cd shared-components
npm init -y

# 發布到 GitHub Packages
npm publish --registry=https://npm.pkg.github.com
```

方案 B: Git Submodule
```bash
# 在共用 repo
git submodule add https://github.com/you/shared-components.git src/shared

# 更新
git submodule update --remote
```

方案 C: Monorepo（推薦）
```bash
# 使用 Turborepo 或 pnpm workspace
pnpm create turbo@latest
```

**常見共用元件**:
- 登入頁面
- 檔案上傳元件
- 資料表格
- Form 驗證
- Loading 狀態

---

#### 10. Projects Hub 時間趨勢追蹤
**檔案**: `track_trends.py`

**用途**: 每次跑 audit 時把結果 append 到歷史，Hub 顯示趨勢線

**使用方式**:
```bash
# 在 collect.py 之後執行
python3 collect.py
python3 track_trends.py

# 或整合進 collect.py
```

**產出**:
- `out/dashboard_history.json` - 歷史記錄（最多 30 次）
- `out/dashboard_trends.md` - 趨勢報告

**趨勢分析**:
- 哪些專案在改善（問題減少）
- 哪些專案在惡化（新增問題）
- 哪些專案穩定
- 新專案

**範例報告**:
```markdown
## 📈 專案趨勢

### ✅ 改善中 (2 個專案)
- **project-a**: 問題減少 5 個
  - 完成了 8 個任務

### ⚠️ 惡化中 (1 個專案)
- **project-b**: 新增 3 個問題
  - ⚠️ 新增 1 個 CRITICAL

### 💡 建議
優先處理以下專案：
1. **project-b** - CRITICAL 增加 1 個
```

---

## 🚀 快速開始

### 1. 立即部署 CRITICAL 項目

```bash
# 1. RLS 檢查
cat supabase_rls_templates.sql
# 複製對應的 policy 到 Supabase SQL Editor

# 2. 環境變數驗證
chmod +x verify_env_sync.sh
./verify_env_sync.sh
```

### 2. 設定 HIGH 項目

```bash
# 1. 建立 template repo
# 參考 PROJECT_TEMPLATE_README.md

# 2. 設定 migration 流程
chmod +x migration_workflow.sh
./migration_workflow.sh

# 3. 設定錯誤監控
npm install @sentry/react
# 複製 errorMonitoring.ts 到 src/lib/
# 在 n8n 匯入 workflow
```

### 3. 整合 MEDIUM 項目

```bash
# 1. CI 自動產生型別
mkdir -p .github/workflows
cp github_auto_types.yml .github/workflows/

# 2. 使用 autopilot
chmod +x autopilot.sh
./autopilot.sh . audit 2 --git-mode

# 3. 交付前檢查
chmod +x delivery_checklist.sh
./delivery_checklist.sh
```

### 4. 啟用 LOW 項目

```bash
# 時間趨勢追蹤
python3 collect.py
python3 track_trends.py
```

---

## 📊 效益評估

| 項目 | 節省時間 | ROI |
|------|---------|-----|
| RLS 範本庫 | 每個專案 30 分鐘 | 極高 |
| 環境變數驗證 | 避免 1-2 小時的除錯 | 極高 |
| 專案腳手架 | 每個專案 1-2 小時 | 極高 |
| Migration 流程 | 避免資料損失 | 極高 |
| 錯誤監控 | 即時發現問題 | 高 |
| 自動型別產生 | 每次 migration 5 分鐘 | 中 |
| Autopilot | 加速 50% | 中 |
| 交付 Checklist | 避免返工 | 高 |
| 共用元件庫 | 長期累積 | 中 |
| 趨勢追蹤 | 管理多專案 | 低 |

---

## ⚠️ 注意事項

1. **環境變數驗證**: 需要安裝 `vercel`、`gh`、`jq` CLI
2. **Migration 流程**: 務必在測試環境先跑過
3. **錯誤監控**: LINE Notify Token 需要自己申請
4. **Autopilot**: 目前是半自動，需要在 Cursor 手動修復
5. **RLS 檢查**: 每次 migration 後都要重新驗證

---

## 🔧 疑難排解

### Q: verify_env_sync.sh 無法執行
A: 
```bash
chmod +x verify_env_sync.sh
# 確認已安裝 vercel、gh、jq
```

### Q: Supabase CLI 無法連線
A:
```bash
# 重新登入
supabase login
# 重新連結專案
supabase link --project-ref YOUR_REF
```

### Q: GitHub Actions 無法自動 commit types
A: 確認已設定 `SUPABASE_ACCESS_TOKEN` 和 `SUPABASE_PROJECT_ID` 在 GitHub Secrets

### Q: n8n webhook 收不到錯誤
A: 檢查 `VITE_N8N_ERROR_WEBHOOK_URL` 是否正確，確認 n8n workflow 已啟用

---

## 📝 後續優化

1. **Autopilot 完全自動化**: 整合 Claude API 或 Cursor API
2. **共用元件庫**: 建立 Turborepo monorepo
3. **趨勢視覺化**: 用 Chart.js 顯示趨勢圖表
4. **CI/CD 完整流程**: 整合所有腳本到單一 GitHub Action
5. **客戶交付自動化**: 一鍵產生交付文件包

---

## 📞 支援

如果遇到問題：
1. 檢查相關檔案的註解
2. 執行 `--help` 參數（如果有的話）
3. 查看 GitHub Issues（如果有建立 repo）

---

**製作日期**: 2026-02-06
**版本**: 1.0
**適用範圍**: Supabase + Vite + Vercel 接案專案
