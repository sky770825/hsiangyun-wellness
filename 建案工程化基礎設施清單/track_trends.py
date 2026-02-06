#!/usr/bin/env python3
"""
Projects Hub - 時間趨勢追蹤擴充
在原本的 collect.py 基礎上，加入歷史記錄功能
"""
import json
import os
from pathlib import Path
from datetime import datetime


def append_to_history(dashboard_data: dict, history_file: Path):
    """將當前 dashboard 數據追加到歷史記錄"""
    
    # 讀取現有歷史（如果有的話）
    if history_file.exists():
        history = json.loads(history_file.read_text(encoding="utf-8"))
    else:
        history = {"snapshots": []}
    
    # 建立新的快照
    snapshot = {
        "timestamp": datetime.now().isoformat(),
        "project_count": dashboard_data["project_count"],
        "projects": []
    }
    
    # 只保留關鍵數據（不保留完整路徑等）
    for proj in dashboard_data["projects"]:
        snapshot["projects"].append({
            "name": proj["name"],
            "counts": proj["counts"],
            "total": proj["total"],
            "status_count": proj["status_count"]
        })
    
    # 追加到歷史
    history["snapshots"].append(snapshot)
    
    # 只保留最近 30 次記錄（避免檔案過大）
    if len(history["snapshots"]) > 30:
        history["snapshots"] = history["snapshots"][-30:]
    
    # 寫回檔案
    history_file.write_text(
        json.dumps(history, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    
    return history


def analyze_trends(history: dict) -> dict:
    """分析趨勢"""
    if len(history["snapshots"]) < 2:
        return {"message": "需要至少 2 次記錄才能分析趨勢"}
    
    snapshots = history["snapshots"]
    latest = snapshots[-1]
    previous = snapshots[-2]
    
    trends = {
        "overall": {
            "project_count_change": latest["project_count"] - previous["project_count"]
        },
        "projects": []
    }
    
    # 分析每個專案的變化
    for proj in latest["projects"]:
        proj_name = proj["name"]
        
        # 找到前一次的對應專案
        prev_proj = next((p for p in previous["projects"] if p["name"] == proj_name), None)
        
        if prev_proj:
            change = {
                "name": proj_name,
                "critical_change": proj["counts"]["CRITICAL"] - prev_proj["counts"]["CRITICAL"],
                "high_change": proj["counts"]["HIGH"] - prev_proj["counts"]["HIGH"],
                "medium_change": proj["counts"]["MEDIUM"] - prev_proj["counts"]["MEDIUM"],
                "low_change": proj["counts"]["LOW"] - prev_proj["counts"]["LOW"],
                "total_change": proj["total"] - prev_proj["total"],
                "done_change": proj["status_count"].get("DONE", 0) - prev_proj["status_count"].get("DONE", 0),
            }
            
            # 計算趨勢方向
            if change["total_change"] > 0:
                change["trend"] = "worsening"  # 問題增加
            elif change["total_change"] < 0:
                change["trend"] = "improving"  # 問題減少
            else:
                change["trend"] = "stable"
            
            trends["projects"].append(change)
        else:
            # 新專案
            trends["projects"].append({
                "name": proj_name,
                "trend": "new_project"
            })
    
    return trends


def render_trend_report(trends: dict, out_path: Path):
    """產生趨勢報告（Markdown）"""
    lines = []
    lines.append("# Projects Hub - 趨勢報告")
    lines.append(f"- 產生時間: `{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`")
    lines.append("")
    
    if "message" in trends:
        lines.append(trends["message"])
        out_path.write_text("\n".join(lines), encoding="utf-8")
        return
    
    # 總覽
    lines.append("## 📊 總覽")
    overall = trends["overall"]
    if overall["project_count_change"] > 0:
        lines.append(f"- 新增了 {overall['project_count_change']} 個專案")
    elif overall["project_count_change"] < 0:
        lines.append(f"- 減少了 {abs(overall['project_count_change'])} 個專案")
    else:
        lines.append("- 專案數量沒有變化")
    
    lines.append("")
    
    # 專案趨勢
    lines.append("## 📈 專案趨勢")
    lines.append("")
    
    improving = [p for p in trends["projects"] if p.get("trend") == "improving"]
    worsening = [p for p in trends["projects"] if p.get("trend") == "worsening"]
    stable = [p for p in trends["projects"] if p.get("trend") == "stable"]
    new = [p for p in trends["projects"] if p.get("trend") == "new_project"]
    
    if improving:
        lines.append(f"### ✅ 改善中 ({len(improving)} 個專案)")
        lines.append("")
        for p in improving:
            lines.append(f"- **{p['name']}**: 問題減少 {abs(p['total_change'])} 個")
            if p['done_change'] > 0:
                lines.append(f"  - 完成了 {p['done_change']} 個任務")
        lines.append("")
    
    if worsening:
        lines.append(f"### ⚠️ 惡化中 ({len(worsening)} 個專案)")
        lines.append("")
        for p in worsening:
            lines.append(f"- **{p['name']}**: 新增 {p['total_change']} 個問題")
            if p['critical_change'] > 0:
                lines.append(f"  - ⚠️ 新增 {p['critical_change']} 個 CRITICAL")
            if p['high_change'] > 0:
                lines.append(f"  - 新增 {p['high_change']} 個 HIGH")
        lines.append("")
    
    if stable:
        lines.append(f"### ➡️ 穩定 ({len(stable)} 個專案)")
        lines.append("")
        for p in stable:
            lines.append(f"- **{p['name']}**: 沒有變化")
        lines.append("")
    
    if new:
        lines.append(f"### 🆕 新專案 ({len(new)} 個)")
        lines.append("")
        for p in new:
            lines.append(f"- **{p['name']}**")
        lines.append("")
    
    # 建議
    lines.append("## 💡 建議")
    lines.append("")
    
    if worsening:
        lines.append("優先處理以下專案：")
        for p in sorted(worsening, key=lambda x: x['critical_change'], reverse=True)[:3]:
            lines.append(f"1. **{p['name']}** - CRITICAL 增加 {p['critical_change']} 個")
    else:
        lines.append("所有專案都在改善或穩定，繼續保持！")
    
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main():
    """主函式 - 在 collect.py 執行後呼叫"""
    hub = Path(__file__).parent
    out_dir = hub / "out"
    
    # 讀取最新的 dashboard.json
    dashboard_file = out_dir / "dashboard.json"
    if not dashboard_file.exists():
        print("❌ 找不到 dashboard.json，請先執行 collect.py")
        return
    
    dashboard_data = json.loads(dashboard_file.read_text(encoding="utf-8"))
    
    # 追加到歷史記錄
    history_file = out_dir / "dashboard_history.json"
    print("📊 追加歷史記錄...")
    history = append_to_history(dashboard_data, history_file)
    
    print(f"   現有記錄數: {len(history['snapshots'])}")
    
    # 分析趨勢
    print("📈 分析趨勢...")
    trends = analyze_trends(history)
    
    # 產生趨勢報告
    trend_report = out_dir / "dashboard_trends.md"
    render_trend_report(trends, trend_report)
    
    print(f"✅ 趨勢報告已產生: {trend_report}")
    
    # 如果有惡化的專案，印出警告
    if "projects" in trends:
        worsening = [p for p in trends["projects"] if p.get("trend") == "worsening"]
        if worsening:
            print("")
            print(f"⚠️  警告：有 {len(worsening)} 個專案問題增加")
            for p in worsening:
                print(f"   - {p['name']}: +{p['total_change']} 個問題")


if __name__ == "__main__":
    main()
