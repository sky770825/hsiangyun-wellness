#!/bin/bash
# ============================================
# 客戶交付檢查清單（Pre-Delivery Checklist）
# ============================================
# 使用方式：
#   ./delivery_checklist.sh
#   ./delivery_checklist.sh --auto-fix  # 嘗試自動修復部分問題
# ============================================

set -e

AUTO_FIX=false
if [ "$1" = "--auto-fix" ]; then
    AUTO_FIX=true
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 客戶交付檢查清單${NC}"
echo "================================"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# ============================================
# 檢查項目函式
# ============================================
check_item() {
    local name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $name${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    elif [ "$result" = "FAIL" ]; then
        echo -e "${RED}❌ $name${NC}"
        if [ -n "$details" ]; then
            echo "   $details"
        fi
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    elif [ "$result" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $name${NC}"
        if [ -n "$details" ]; then
            echo "   $details"
        fi
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
    fi
}

# ============================================
# 1. Supabase RLS 檢查
# ============================================
echo -e "${BLUE}1️⃣  資料庫安全檢查${NC}"
echo ""

# 檢查是否有安裝 Supabase CLI 且專案已連結
if command -v supabase &> /dev/null && [ -f "supabase/config.toml" ] 2>/dev/null; then
    # 檢查所有 public tables 是否啟用 RLS（需已連結遠端專案）
    RLS_CHECK=$(supabase db execute "SELECT tablename FROM pg_tables t LEFT JOIN pg_class c ON c.relname = t.tablename WHERE schemaname = 'public' AND c.relrowsecurity = false" 2>/dev/null || echo "")
    # 若輸出包含 help 或 Usage，表示未連結或指令不支援
    if echo "$RLS_CHECK" | grep -q "Usage:\|Available Commands"; then
        check_item "所有資料表都啟用 RLS" "WARN" "無法檢查（需連結 Supabase 專案：supabase link）"
        check_item "有設定 RLS Policies" "WARN" "無法檢查（需連結 Supabase 專案）"
    elif [ -z "$RLS_CHECK" ]; then
        check_item "所有資料表都啟用 RLS" "PASS"
        POLICY_COUNT=$(supabase db execute "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'" 2>/dev/null | tail -1 | tr -d '\n' | xargs)
        if [ -n "$POLICY_COUNT" ] && [ "$POLICY_COUNT" -eq "$POLICY_COUNT" ] 2>/dev/null && [ "$POLICY_COUNT" -gt 0 ]; then
            check_item "有設定 RLS Policies（共 $POLICY_COUNT 條）" "PASS"
        else
            check_item "有設定 RLS Policies" "FAIL" "沒有任何 RLS policy"
        fi
    else
        check_item "所有資料表都啟用 RLS" "FAIL" "以下表未啟用 RLS: $RLS_CHECK"
        check_item "有設定 RLS Policies" "WARN"
    fi
else
    check_item "Supabase RLS 與 Policies" "WARN" "無法檢查（需安裝 Supabase CLI 且專案內有 supabase/config.toml 並連結專案）"
fi

echo ""

# ============================================
# 2. 環境變數檢查
# ============================================
echo -e "${BLUE}2️⃣  環境變數檢查${NC}"
echo ""

# 檢查 .env.example 是否存在
if [ -f ".env.example" ]; then
    check_item ".env.example 已建立" "PASS"
    
    # 檢查是否有文檔說明
    if grep -q "VITE_SUPABASE_URL" .env.example; then
        check_item ".env.example 包含必要的環境變數" "PASS"
    else
        check_item ".env.example 包含必要的環境變數" "WARN" "可能缺少 Supabase 相關變數"
    fi
else
    check_item ".env.example 已建立" "FAIL" "需要建立 .env.example 給客戶參考"
fi

# 檢查 .env.local 是否不小心被 commit
if git ls-files --error-unmatch .env.local &> /dev/null; then
    check_item ".env.local 未被提交到 Git" "FAIL" ".env.local 包含敏感資訊，不應該 commit"
else
    check_item ".env.local 未被提交到 Git" "PASS"
fi

echo ""

# ============================================
# 3. Vercel 部署檢查
# ============================================
echo -e "${BLUE}3️⃣  部署設定檢查${NC}"
echo ""

# 檢查 vercel.json 是否存在
if [ -f "vercel.json" ]; then
    check_item "vercel.json 已設定" "PASS"
else
    check_item "vercel.json 已設定" "WARN" "沒有 vercel.json（使用預設設定）"
fi

# 檢查是否有設定自訂域名（需要 Vercel CLI）
if command -v vercel &> /dev/null; then
    if vercel whoami &> /dev/null; then
        DOMAINS=$(vercel domains ls 2>/dev/null | wc -l)
        if [ "$DOMAINS" -gt 1 ]; then
            check_item "已設定自訂域名" "PASS"
        else
            check_item "已設定自訂域名" "WARN" "建議設定客戶的自訂域名"
        fi
    else
        check_item "Vercel 已登入" "WARN" "無法檢查域名設定（未登入 Vercel）"
    fi
else
    check_item "Vercel CLI 已安裝" "WARN" "無法檢查部署設定"
fi

echo ""

# ============================================
# 4. 文件檢查
# ============================================
echo -e "${BLUE}4️⃣  文件完整性檢查${NC}"
echo ""

# README.md
if [ -f "README.md" ]; then
    README_LINES=$(wc -l < README.md)
    if [ "$README_LINES" -gt 20 ]; then
        check_item "README.md 已完善（$README_LINES 行）" "PASS"
    else
        check_item "README.md 已完善" "WARN" "README 太短（$README_LINES 行），建議補充使用說明"
    fi
    
    # 檢查是否包含安裝指令
    if grep -q "npm install" README.md; then
        check_item "README 包含安裝指令" "PASS"
    else
        check_item "README 包含安裝指令" "WARN"
    fi
    
    # 檢查是否包含環境變數說明
    if grep -q "環境變數\|Environment" README.md; then
        check_item "README 包含環境變數說明" "PASS"
    else
        check_item "README 包含環境變數說明" "WARN"
    fi
else
    check_item "README.md 已建立" "FAIL" "需要建立 README.md 給客戶參考"
fi

echo ""

# ============================================
# 5. 備份策略檢查
# ============================================
echo -e "${BLUE}5️⃣  備份策略檢查${NC}"
echo ""

# Supabase 自動備份（Pro plan 以上才有）
if command -v supabase &> /dev/null; then
    check_item "已設定 Supabase 自動備份" "WARN" "請在 Supabase Dashboard 確認備份設定"
else
    check_item "已設定資料庫備份策略" "WARN" "請確認客戶的備份需求"
fi

echo ""

# ============================================
# 6. 錯誤監控檢查
# ============================================
echo -e "${BLUE}6️⃣  錯誤監控檢查${NC}"
echo ""

# 檢查是否有設定 Sentry
if grep -q "VITE_SENTRY_DSN" .env.example 2>/dev/null; then
    check_item "已整合錯誤監控（Sentry）" "PASS"
elif [ -f "src/lib/errorMonitoring.ts" ]; then
    check_item "已整合錯誤監控" "PASS"
else
    check_item "已整合錯誤監控" "WARN" "建議設定 Sentry 或其他錯誤監控"
fi

echo ""

# ============================================
# 7. 效能檢查
# ============================================
echo -e "${BLUE}7️⃣  效能檢查${NC}"
echo ""

# 檢查 bundle size
if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    check_item "Build 產出正常（$BUNDLE_SIZE）" "PASS"
else
    check_item "專案可以成功 build" "WARN" "尚未執行過 npm run build"
fi

echo ""

# ============================================
# 8. 安全性檢查
# ============================================
echo -e "${BLUE}8️⃣  安全性檢查${NC}"
echo ""

# 檢查是否有已知的安全漏洞
if [ -f "package.json" ]; then
    NPM_AUDIT=$(npm audit --audit-level=high --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"high":0,"critical":0}}}')
    HIGH_VULN=$(echo "$NPM_AUDIT" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null | tr -d '\n' | head -1)
    CRIT_VULN=$(echo "$NPM_AUDIT" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null | tr -d '\n' | head -1)
    HIGH_VULN=${HIGH_VULN:-0}
    CRIT_VULN=${CRIT_VULN:-0}
    if ! [ "$HIGH_VULN" -eq "$HIGH_VULN" ] 2>/dev/null; then HIGH_VULN=0; fi
    if ! [ "$CRIT_VULN" -eq "$CRIT_VULN" ] 2>/dev/null; then CRIT_VULN=0; fi
    if [ "$HIGH_VULN" -eq 0 ] && [ "$CRIT_VULN" -eq 0 ]; then
        check_item "沒有高風險的 npm 套件漏洞" "PASS"
    else
        check_item "沒有高風險的 npm 套件漏洞" "FAIL" "發現 $HIGH_VULN 個 high、$CRIT_VULN 個 critical 漏洞"
    fi
fi

# 檢查 API keys 是否外洩（僅在 Git 倉庫內檢查）
if git rev-parse --git-dir >/dev/null 2>&1; then
    if git log --all --pretty=format: --name-only 2>/dev/null | grep -E '\.env$|\.env\.local$' | head -1 >/dev/null; then
        check_item "沒有外洩 .env 檔案" "WARN" "Git 歷史中可能有 .env 檔案"
    else
        check_item "沒有外洩 .env 檔案" "PASS"
    fi
else
    check_item "沒有外洩 .env 檔案" "WARN" "目前不在 Git 倉庫內，無法檢查歷史"
fi

echo ""

# ============================================
# 9. 客戶文件檢查
# ============================================
echo -e "${BLUE}9️⃣  客戶交付文件${NC}"
echo ""

# 檢查是否有操作手冊
if [ -f "MANUAL.md" ] || [ -f "docs/manual.md" ]; then
    check_item "已建立操作手冊" "PASS"
else
    check_item "已建立操作手冊" "WARN" "建議建立 MANUAL.md 給客戶參考"
fi

# 檢查是否有 CHANGELOG
if [ -f "CHANGELOG.md" ]; then
    check_item "已建立 CHANGELOG" "PASS"
else
    check_item "已建立 CHANGELOG" "WARN" "建議建立 CHANGELOG.md 記錄版本變更"
fi

echo ""

# ============================================
# 10. Git 清理檢查
# ============================================
echo -e "${BLUE}🔟 Git 清理檢查${NC}"
echo ""

# 檢查是否有未提交的變更（僅在 Git 倉庫內）
if git rev-parse --git-dir >/dev/null 2>&1; then
    if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
        check_item "沒有未提交的變更" "PASS"
    else
        check_item "沒有未提交的變更" "WARN" "有未提交的變更"
    fi
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
    if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
        check_item "在主要分支上" "PASS"
    else
        check_item "在主要分支上" "WARN" "目前在 $CURRENT_BRANCH 分支"
    fi
else
    check_item "Git 倉庫狀態" "WARN" "目前不在 Git 倉庫內，跳過未提交變更與分支檢查"
fi

echo ""

# ============================================
# 總結報告
# ============================================
echo "================================"
echo -e "${BLUE}📊 檢查總結${NC}"
echo ""
echo "總檢查項目: $TOTAL_CHECKS"
echo -e "${GREEN}通過: $PASSED_CHECKS${NC}"
echo -e "${YELLOW}警告: $WARNING_CHECKS${NC}"
echo -e "${RED}失敗: $FAILED_CHECKS${NC}"
echo ""

if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "${GREEN}🎉 恭喜！所有關鍵檢查都通過了${NC}"
    echo "   建議："
    echo "   1. 再次確認功能完整性"
    echo "   2. 與客戶約時間進行驗收"
    echo "   3. 準備交付文件"
    exit 0
else
    echo -e "${RED}⚠️  有 $FAILED_CHECKS 個關鍵問題需要修復${NC}"
    echo "   請修復後再交付給客戶"
    exit 1
fi
