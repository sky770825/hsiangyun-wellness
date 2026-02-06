#!/bin/bash
# ============================================
# Supabase Migration 標準流程
# ============================================
# 使用方式：
#   ./migration_workflow.sh          # 互動式流程
#   ./migration_workflow.sh auto     # 自動模式（CI/CD 用）
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MODE=${1:-interactive}

echo -e "${BLUE}🗄️  Supabase Migration 工作流程${NC}"
echo "================================"

# ============================================
# 檢查必要工具
# ============================================
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ 未安裝 Supabase CLI${NC}"
    echo "   安裝方式: npm install -g supabase"
    exit 1
fi

# 檢查是否在專案目錄內
if [ ! -d "supabase" ]; then
    echo -e "${RED}❌ 找不到 supabase/ 目錄${NC}"
    echo "   請在專案根目錄執行此腳本，或先執行 supabase init"
    exit 1
fi

# ============================================
# 1. 檢查本地是否有未提交的變更
# ============================================
echo ""
echo -e "${BLUE}步驟 1: 檢查本地變更${NC}"

MIGRATION_DIR="supabase/migrations"

# 檢查是否有未套用的 migration
if [ -d "$MIGRATION_DIR" ]; then
    MIGRATION_COUNT=$(ls -1 $MIGRATION_DIR/*.sql 2>/dev/null | wc -l | xargs)
    echo "   現有 migration 檔案數: $MIGRATION_COUNT"
fi

# ============================================
# 2. 產生新的 migration（如果有變更）
# ============================================
echo ""
echo -e "${BLUE}步驟 2: 檢查 schema 差異${NC}"

if [ "$MODE" = "interactive" ]; then
    echo "   是否有在 Supabase Studio 修改 schema？(y/n)"
    read -r HAS_CHANGES
    
    if [ "$HAS_CHANGES" = "y" ]; then
        echo "   請輸入 migration 名稱（例如：add_user_profiles）："
        read -r MIGRATION_NAME
        
        if [ -z "$MIGRATION_NAME" ]; then
            echo -e "${RED}❌ Migration 名稱不能為空${NC}"
            exit 1
        fi
        
        echo ""
        echo "   產生 migration 檔..."
        supabase db diff -f "$MIGRATION_NAME"
        
        # 顯示產生的檔案
        LATEST_MIGRATION=$(ls -t $MIGRATION_DIR/*.sql | head -1)
        echo ""
        echo -e "${GREEN}✅ 已產生 migration：${NC}"
        echo "   $LATEST_MIGRATION"
        echo ""
        echo "   內容預覽："
        echo "   ----------------------------------------"
        head -20 "$LATEST_MIGRATION"
        echo "   ----------------------------------------"
        echo ""
        echo "   是否繼續套用此 migration？(y/n)"
        read -r CONFIRM
        
        if [ "$CONFIRM" != "y" ]; then
            echo -e "${YELLOW}⚠️  已取消，你可以手動編輯 $LATEST_MIGRATION${NC}"
            exit 0
        fi
    else
        echo "   跳過 migration 產生"
    fi
else
    # 自動模式：直接產生 diff（如果有變更的話）
    echo "   自動模式：檢查是否有 schema 差異..."
    
    # 嘗試產生 diff
    DIFF_OUTPUT=$(supabase db diff 2>&1 || true)
    
    if echo "$DIFF_OUTPUT" | grep -q "No schema changes"; then
        echo -e "${GREEN}✅ 沒有 schema 變更${NC}"
    else
        echo -e "${YELLOW}⚠️  偵測到 schema 變更，但自動模式不產生 migration${NC}"
        echo "   請手動執行: supabase db diff -f your_migration_name"
    fi
fi

# ============================================
# 3. 套用 migration 到本地
# ============================================
echo ""
echo -e "${BLUE}步驟 3: 套用 migration 到本地資料庫${NC}"

if [ "$MODE" = "interactive" ]; then
    echo "   是否要重設本地資料庫？(y/n)"
    echo "   (這會清空所有資料並重新執行所有 migrations)"
    read -r RESET_LOCAL
    
    if [ "$RESET_LOCAL" = "y" ]; then
        echo "   重設本地資料庫..."
        supabase db reset
        echo -e "${GREEN}✅ 本地資料庫已重設${NC}"
    else
        echo "   跳過本地資料庫重設"
    fi
else
    # 自動模式：只執行未套用的 migration
    echo "   套用未執行的 migrations..."
    supabase migration up || echo -e "${YELLOW}⚠️  Migration 套用可能有問題${NC}"
fi

# ============================================
# 4. 產生 TypeScript types
# ============================================
echo ""
echo -e "${BLUE}步驟 4: 產生 TypeScript types${NC}"

# 檢查是否有 types 目錄
if [ ! -d "src/types" ]; then
    mkdir -p src/types
fi

echo "   產生 database.ts..."
supabase gen types typescript --local > src/types/database.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 已產生 src/types/database.ts${NC}"
    
    # 提示是否要 commit
    if [ "$MODE" = "interactive" ]; then
        echo ""
        echo "   是否要 git add types 檔案？(y/n)"
        read -r ADD_TYPES
        
        if [ "$ADD_TYPES" = "y" ]; then
            git add src/types/database.ts
            echo -e "${GREEN}✅ 已加入 git staging${NC}"
        fi
    else
        # 自動模式：直接 commit
        if git rev-parse --git-dir > /dev/null 2>&1; then
            git add src/types/database.ts
            git commit -m "chore: update database types" || echo "   (沒有變更，跳過 commit)"
        fi
    fi
else
    echo -e "${RED}❌ 產生 types 失敗${NC}"
fi

# ============================================
# 5. 推送到 production（需要確認）
# ============================================
if [ "$MODE" = "interactive" ]; then
    echo ""
    echo -e "${BLUE}步驟 5: 推送到 Supabase Production${NC}"
    echo ""
    echo -e "${RED}⚠️  WARNING: 這會直接修改 production 資料庫！${NC}"
    echo "   是否確定要推送？(yes/no)"
    read -r PUSH_PROD
    
    if [ "$PUSH_PROD" = "yes" ]; then
        echo ""
        echo "   推送 migrations 到 production..."
        supabase db push
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 已推送到 production${NC}"
        else
            echo -e "${RED}❌ 推送失敗${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  已取消推送${NC}"
        echo "   稍後手動推送: supabase db push"
    fi
else
    # 自動模式：不推送到 production（太危險）
    echo ""
    echo -e "${YELLOW}⚠️  自動模式不會推送到 production${NC}"
    echo "   請手動執行: supabase db push"
fi

# ============================================
# 6. 驗證 RLS policies
# ============================================
echo ""
echo -e "${BLUE}步驟 6: 驗證 RLS policies${NC}"

# 執行 RLS 檢查 SQL
RLS_CHECK=$(supabase db execute "
SELECT
  schemaname,
  tablename,
  CASE WHEN c.relrowsecurity THEN '✅' ELSE '❌' END as rls_status
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY rls_status, tablename;
" 2>/dev/null || echo "")

if [ -n "$RLS_CHECK" ]; then
    echo "$RLS_CHECK"
else
    echo -e "${YELLOW}⚠️  無法檢查 RLS 狀態${NC}"
fi

# ============================================
# 7. 總結
# ============================================
echo ""
echo "================================"
echo -e "${GREEN}✅ Migration 工作流程完成${NC}"
echo ""
echo "後續步驟："
echo "1. 測試本地應用程式：npm run dev"
echo "2. 檢查 types 是否正確：檢查 src/types/database.ts"
echo "3. 如果還沒推送，執行：supabase db push"
echo "4. 提交 migration 檔案到 git："
echo "   git add supabase/migrations/"
echo "   git commit -m 'feat: add new migration'"
echo ""

# ============================================
# 附錄：常見錯誤排查
# ============================================
if [ "$MODE" = "interactive" ]; then
    echo "常見問題排查："
    echo "----------------------------------------"
    echo "Q: supabase db diff 顯示 'No schema changes'"
    echo "A: 確認你有在 Supabase Studio 修改 schema，或者本地 schema 已經是最新"
    echo ""
    echo "Q: supabase db push 失敗"
    echo "A: 檢查是否有衝突的 migration，或 production 的 schema 已被手動修改"
    echo ""
    echo "Q: types 產生錯誤"
    echo "A: 確認本地資料庫正在運行：supabase status"
    echo ""
fi
