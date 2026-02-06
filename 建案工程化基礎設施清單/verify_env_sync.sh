#!/bin/bash
# ============================================
# 環境變數同步驗證機制
# ============================================
# 用途：在部署前自動比對 .env.local、Vercel Dashboard、GitHub Secrets 三邊的環境變數是否對齊
# 使用：./verify_env_sync.sh
# 整合進 CI/CD：在 GitHub Actions 的 build step 之前執行
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 環境變數同步檢查工具"
echo "================================"

# ============================================
# 1. 解析 .env.local
# ============================================
echo ""
echo "📄 解析本地環境變數..."

if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ 找不到 .env.local${NC}"
    exit 1
fi

# 提取所有非註解、非空行的 key
LOCAL_KEYS=$(grep -v '^#' .env.local | grep -v '^$' | cut -d '=' -f1 | sort)
LOCAL_COUNT=$(echo "$LOCAL_KEYS" | wc -l | xargs)

echo "   找到 $LOCAL_COUNT 個環境變數"

# ============================================
# 2. 檢查 Vercel 環境變數（需要 Vercel CLI）
# ============================================
echo ""
echo "☁️  檢查 Vercel 環境變數..."

# 檢查 Vercel CLI 是否安裝
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  未安裝 Vercel CLI，跳過 Vercel 檢查${NC}"
    echo "   安裝方式: npm i -g vercel"
    SKIP_VERCEL=true
else
    # 檢查是否已登入
    if ! vercel whoami &> /dev/null; then
        echo -e "${YELLOW}⚠️  尚未登入 Vercel，跳過 Vercel 檢查${NC}"
        echo "   登入方式: vercel login"
        SKIP_VERCEL=true
    else
        # 提取 Vercel 環境變數（production）
        VERCEL_ENV_JSON=$(vercel env pull --environment=production --yes .vercel/.env.production.json 2>/dev/null || echo "{}")
        
        if [ "$VERCEL_ENV_JSON" = "{}" ]; then
            echo -e "${YELLOW}⚠️  無法取得 Vercel 環境變數${NC}"
            SKIP_VERCEL=true
        else
            # 從 JSON 提取 keys
            VERCEL_KEYS=$(cat .vercel/.env.production.json | jq -r 'keys[]' 2>/dev/null | sort || echo "")
            VERCEL_COUNT=$(echo "$VERCEL_KEYS" | wc -l | xargs)
            echo "   找到 $VERCEL_COUNT 個環境變數"
            SKIP_VERCEL=false
        fi
    fi
fi

# ============================================
# 3. 檢查 GitHub Secrets（需要 gh CLI）
# ============================================
echo ""
echo "🔐 檢查 GitHub Secrets..."

# 檢查 gh CLI 是否安裝
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  未安裝 GitHub CLI，跳過 GitHub 檢查${NC}"
    echo "   安裝方式: brew install gh (macOS) 或參考 https://cli.github.com"
    SKIP_GITHUB=true
else
    # 檢查是否在 git repo 內
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  不在 Git repository 內，跳過 GitHub 檢查${NC}"
        SKIP_GITHUB=true
    else
        # 檢查是否已登入
        if ! gh auth status &> /dev/null; then
            echo -e "${YELLOW}⚠️  尚未登入 GitHub，跳過 GitHub 檢查${NC}"
            echo "   登入方式: gh auth login"
            SKIP_GITHUB=true
        else
            # 提取 GitHub Secrets
            GITHUB_KEYS=$(gh secret list --json name --jq '.[].name' 2>/dev/null | sort || echo "")
            
            if [ -z "$GITHUB_KEYS" ]; then
                echo -e "${YELLOW}⚠️  無法取得 GitHub Secrets（可能沒有設定或權限不足）${NC}"
                SKIP_GITHUB=true
            else
                GITHUB_COUNT=$(echo "$GITHUB_KEYS" | wc -l | xargs)
                echo "   找到 $GITHUB_COUNT 個 Secrets"
                SKIP_GITHUB=false
            fi
        fi
    fi
fi

# ============================================
# 4. 比對差異
# ============================================
echo ""
echo "🔍 開始比對..."
echo "================================"

HAS_ERROR=false

# 4.1 比對 .env.local vs Vercel
if [ "$SKIP_VERCEL" = false ]; then
    echo ""
    echo "📊 .env.local ↔️ Vercel 比對"
    
    # 在 local 但不在 Vercel
    MISSING_IN_VERCEL=$(comm -23 <(echo "$LOCAL_KEYS") <(echo "$VERCEL_KEYS"))
    if [ -n "$MISSING_IN_VERCEL" ]; then
        echo -e "${RED}❌ 以下變數在 .env.local 有，但 Vercel 沒有：${NC}"
        echo "$MISSING_IN_VERCEL" | while read key; do
            echo "   - $key"
        done
        HAS_ERROR=true
    fi
    
    # 在 Vercel 但不在 local
    MISSING_IN_LOCAL=$(comm -13 <(echo "$LOCAL_KEYS") <(echo "$VERCEL_KEYS"))
    if [ -n "$MISSING_IN_LOCAL" ]; then
        echo -e "${YELLOW}⚠️  以下變數在 Vercel 有，但 .env.local 沒有：${NC}"
        echo "$MISSING_IN_LOCAL" | while read key; do
            echo "   - $key"
        done
    fi
    
    if [ -z "$MISSING_IN_VERCEL" ] && [ -z "$MISSING_IN_LOCAL" ]; then
        echo -e "${GREEN}✅ .env.local 和 Vercel 環境變數完全同步${NC}"
    fi
fi

# 4.2 比對 .env.local vs GitHub
if [ "$SKIP_GITHUB" = false ]; then
    echo ""
    echo "📊 .env.local ↔️ GitHub Secrets 比對"
    
    # 過濾掉不需要同步到 GitHub 的變數（通常是本地開發用的）
    # 你可以自訂這個清單
    EXCLUDE_FROM_GITHUB="NEXT_PUBLIC_|VITE_PUBLIC_"
    
    LOCAL_KEYS_FOR_GITHUB=$(echo "$LOCAL_KEYS" | grep -v -E "$EXCLUDE_FROM_GITHUB" || true)
    
    # 在 local 但不在 GitHub
    MISSING_IN_GITHUB=$(comm -23 <(echo "$LOCAL_KEYS_FOR_GITHUB") <(echo "$GITHUB_KEYS"))
    if [ -n "$MISSING_IN_GITHUB" ]; then
        echo -e "${RED}❌ 以下變數在 .env.local 有，但 GitHub Secrets 沒有：${NC}"
        echo "$MISSING_IN_GITHUB" | while read key; do
            echo "   - $key"
        done
        HAS_ERROR=true
    fi
    
    # 在 GitHub 但不在 local
    MISSING_IN_LOCAL_GH=$(comm -13 <(echo "$LOCAL_KEYS_FOR_GITHUB") <(echo "$GITHUB_KEYS"))
    if [ -n "$MISSING_IN_LOCAL_GH" ]; then
        echo -e "${YELLOW}⚠️  以下變數在 GitHub Secrets 有，但 .env.local 沒有：${NC}"
        echo "$MISSING_IN_LOCAL_GH" | while read key; do
            echo "   - $key"
        done
    fi
    
    if [ -z "$MISSING_IN_GITHUB" ] && [ -z "$MISSING_IN_LOCAL_GH" ]; then
        echo -e "${GREEN}✅ .env.local 和 GitHub Secrets 完全同步${NC}"
    fi
fi

# 4.3 比對 Vercel vs GitHub
if [ "$SKIP_VERCEL" = false ] && [ "$SKIP_GITHUB" = false ]; then
    echo ""
    echo "📊 Vercel ↔️ GitHub Secrets 比對"
    
    # 在 Vercel 但不在 GitHub
    MISSING_IN_GITHUB_FROM_VERCEL=$(comm -23 <(echo "$VERCEL_KEYS") <(echo "$GITHUB_KEYS"))
    if [ -n "$MISSING_IN_GITHUB_FROM_VERCEL" ]; then
        echo -e "${YELLOW}⚠️  以下變數在 Vercel 有，但 GitHub Secrets 沒有：${NC}"
        echo "$MISSING_IN_GITHUB_FROM_VERCEL" | while read key; do
            echo "   - $key"
        done
    fi
    
    # 在 GitHub 但不在 Vercel
    MISSING_IN_VERCEL_FROM_GITHUB=$(comm -13 <(echo "$VERCEL_KEYS") <(echo "$GITHUB_KEYS"))
    if [ -n "$MISSING_IN_VERCEL_FROM_GITHUB" ]; then
        echo -e "${YELLOW}⚠️  以下變數在 GitHub Secrets 有，但 Vercel 沒有：${NC}"
        echo "$MISSING_IN_VERCEL_FROM_GITHUB" | while read key; do
            echo "   - $key"
        done
    fi
    
    if [ -z "$MISSING_IN_GITHUB_FROM_VERCEL" ] && [ -z "$MISSING_IN_VERCEL_FROM_GITHUB" ]; then
        echo -e "${GREEN}✅ Vercel 和 GitHub Secrets 完全同步${NC}"
    fi
fi

# ============================================
# 5. 總結報告
# ============================================
echo ""
echo "================================"

if [ "$HAS_ERROR" = true ]; then
    echo -e "${RED}❌ 檢查失敗：環境變數不同步${NC}"
    echo ""
    echo "建議修復步驟："
    echo "1. 檢查上面列出的缺失變數"
    echo "2. 在 Vercel Dashboard 補上缺失的環境變數"
    echo "3. 在 GitHub Settings > Secrets 補上缺失的 Secrets"
    echo "4. 重新執行此腳本確認"
    exit 1
else
    echo -e "${GREEN}✅ 所有檢查通過，環境變數同步正常${NC}"
    exit 0
fi
