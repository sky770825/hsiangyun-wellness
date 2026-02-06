#!/bin/bash
# ============================================
# Cursor Autopilot - 自動依照 taskboard 逐條修復
# ============================================
# 使用方式：
#   ./autopilot.sh . audit 2 --git-mode
#   
# 參數：
#   $1: 專案路徑（預設 .）
#   $2: 模式（audit/fix）
#   $3: 一次處理幾條（預設 1）
#   --git-mode: 每次修復後自動 commit
# ============================================

set -e

PROJECT_PATH=${1:-.}
MODE=${2:-audit}
BATCH_SIZE=${3:-1}
GIT_MODE=false

# 解析參數
for arg in "$@"; do
    if [ "$arg" = "--git-mode" ]; then
        GIT_MODE=true
    fi
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🤖 Cursor Autopilot${NC}"
echo "================================"
echo "專案路徑: $PROJECT_PATH"
echo "模式: $MODE"
echo "批次大小: $BATCH_SIZE"
echo "Git 模式: $GIT_MODE"
echo ""

# ============================================
# 檢查必要檔案
# ============================================
TASKBOARD_PATH="$PROJECT_PATH/audit/taskboard.json"

if [ ! -f "$TASKBOARD_PATH" ]; then
    echo -e "${RED}❌ 找不到 taskboard.json${NC}"
    echo "   請先執行: ./tools/cursor_audit/audit.sh $PROJECT_PATH audit"
    exit 1
fi

# ============================================
# 讀取 taskboard.json
# ============================================
echo "📋 讀取 taskboard..."

# 使用 jq 讀取（如果有安裝的話）
if command -v jq &> /dev/null; then
    # 取得所有 READY 狀態的 task
    READY_TASKS=$(jq -r '.tasks[] | select(.status == "READY") | @json' "$TASKBOARD_PATH")
    READY_COUNT=$(echo "$READY_TASKS" | wc -l | xargs)
    
    echo "   找到 $READY_COUNT 個 READY 任務"
    
    if [ "$READY_COUNT" -eq 0 ]; then
        echo -e "${GREEN}✅ 沒有待處理的任務${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ 需要安裝 jq${NC}"
    echo "   安裝方式: brew install jq (macOS) 或 apt install jq (Ubuntu)"
    exit 1
fi

# ============================================
# 主要處理邏輯
# ============================================
PROCESSED=0

echo "$READY_TASKS" | while IFS= read -r task_json; do
    if [ $PROCESSED -ge $BATCH_SIZE ]; then
        echo ""
        echo "已處理 $BATCH_SIZE 個任務，停止"
        break
    fi
    
    # 解析 task
    TASK_ID=$(echo "$task_json" | jq -r '.id')
    TASK_TITLE=$(echo "$task_json" | jq -r '.title')
    TASK_SEVERITY=$(echo "$task_json" | jq -r '.severity')
    TASK_CATEGORY=$(echo "$task_json" | jq -r '.category')
    TASK_DESC=$(echo "$task_json" | jq -r '.description')
    TASK_FILE=$(echo "$task_json" | jq -r '.file // "N/A"')
    
    echo ""
    echo "================================"
    echo -e "${BLUE}處理任務 #$TASK_ID${NC}"
    echo "標題: $TASK_TITLE"
    echo "嚴重度: $TASK_SEVERITY"
    echo "分類: $TASK_CATEGORY"
    echo "檔案: $TASK_FILE"
    echo ""
    
    # ============================================
    # 更新狀態為 DOING
    # ============================================
    jq --arg id "$TASK_ID" \
       '(.tasks[] | select(.id == $id) | .status) = "DOING"' \
       "$TASKBOARD_PATH" > "$TASKBOARD_PATH.tmp" && \
       mv "$TASKBOARD_PATH.tmp" "$TASKBOARD_PATH"
    
    echo "   狀態已更新為 DOING"
    
    # ============================================
    # 組裝 Cursor prompt
    # ============================================
    CURSOR_PROMPT="# Cursor AI 自動修復任務

## 任務資訊
- ID: $TASK_ID
- 標題: $TASK_TITLE
- 嚴重度: $TASK_SEVERITY
- 分類: $TASK_CATEGORY
- 檔案: $TASK_FILE

## 問題描述
$TASK_DESC

## 修復要求
1. 請根據上述問題描述進行修復
2. 如果涉及程式碼，請直接修改檔案
3. 如果需要新增檔案，請建立
4. 修復完成後回報修改內容

## 驗證要求
- 確保語法正確
- 確保符合專案的 coding style
- 如果有測試，請確保測試通過
"
    
    # ============================================
    # 模式選擇
    # ============================================
    if [ "$MODE" = "audit" ]; then
        # 只顯示 prompt，不實際執行
        echo ""
        echo "📝 Cursor Prompt（請複製貼到 Cursor）:"
        echo "----------------------------------------"
        echo "$CURSOR_PROMPT"
        echo "----------------------------------------"
        echo ""
        echo "等待你在 Cursor 完成修復後，按 Enter 繼續..."
        read -r
        
    elif [ "$MODE" = "fix" ]; then
        # 自動模式（需要 Cursor API，目前不支援）
        echo -e "${YELLOW}⚠️  自動修復模式尚未實作${NC}"
        echo "   目前請使用 audit 模式手動修復"
        
        # TODO: 未來可以整合 Cursor API 或 Claude API
        # curl -X POST "https://api.cursor.sh/v1/chat" \
        #   -H "Authorization: Bearer $CURSOR_API_KEY" \
        #   -d "{\"prompt\":\"$CURSOR_PROMPT\"}"
    fi
    
    # ============================================
    # 驗證修復
    # ============================================
    echo ""
    echo "修復是否完成？(y/n/skip)"
    echo "  y    - 完成，標記為 VERIFY"
    echo "  n    - 失敗，保持 DOING"
    echo "  skip - 跳過，改回 READY"
    read -r RESULT
    
    case $RESULT in
        y)
            # 標記為 VERIFY
            jq --arg id "$TASK_ID" \
               '(.tasks[] | select(.id == $id) | .status) = "VERIFY"' \
               "$TASKBOARD_PATH" > "$TASKBOARD_PATH.tmp" && \
               mv "$TASKBOARD_PATH.tmp" "$TASKBOARD_PATH"
            
            echo -e "${GREEN}✅ 任務 #$TASK_ID 已標記為 VERIFY${NC}"
            
            # Git commit
            if [ "$GIT_MODE" = true ]; then
                git add .
                git commit -m "fix: $TASK_TITLE (task #$TASK_ID)" || true
                echo "   已自動 commit"
            fi
            ;;
        n)
            echo -e "${YELLOW}⚠️  任務 #$TASK_ID 保持 DOING 狀態${NC}"
            ;;
        skip)
            # 改回 READY
            jq --arg id "$TASK_ID" \
               '(.tasks[] | select(.id == $id) | .status) = "READY"' \
               "$TASKBOARD_PATH" > "$TASKBOARD_PATH.tmp" && \
               mv "$TASKBOARD_PATH.tmp" "$TASKBOARD_PATH"
            
            echo "   已跳過，改回 READY"
            ;;
        *)
            echo -e "${RED}無效選項${NC}"
            ;;
    esac
    
    PROCESSED=$((PROCESSED + 1))
done

# ============================================
# 總結
# ============================================
echo ""
echo "================================"
echo -e "${GREEN}✅ Autopilot 完成${NC}"
echo "   處理了 $PROCESSED 個任務"
echo ""
echo "後續步驟："
echo "1. 執行測試確認修復正確"
echo "2. 手動驗證 VERIFY 狀態的任務"
echo "3. 標記為 DONE: jq '(.tasks[] | select(.status == \"VERIFY\") | .status) = \"DONE\"' taskboard.json"
echo ""

# ============================================
# 產生新的 taskboard report
# ============================================
if [ -f "$PROJECT_PATH/audit/taskboard.md" ]; then
    echo "📊 更新 taskboard.md..."
    # TODO: 重新產生 markdown report
    # python3 ./tools/cursor_audit/generate_report.py "$TASKBOARD_PATH"
fi
