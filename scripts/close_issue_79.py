import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from github_issues_api import GitHubAPI, get_repo_info

body = """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57)

## 验收标准
- [x] 知识图谱中节点 hover 显示"修改关系"浮动按钮
- [x] 连线 hover 显示"删除该关系"浮动按钮
- [x] 点击"修改关系"→ 弹窗：选择关系类型 + 选择新目标节点
- [x] 点击"删除该关系"→ 确认弹窗 → store 更新 → 报告版本递进
- [x] 修改后触发 toast "关联关系已更新，建议重跑报告"

## 技术要点
- [x] 修改逻辑复用 store 操作（本地 edges state + toast action）
- [x] 弹窗复用 shadcn/ui `Dialog`
- [x] 反哺不直接在报告页面上改数据，而是修改 store 状态（通过 JSON content 解析）

## 实现文件
- `src/hooks/useECharts.ts` — 扩展返回 instance state
- `src/components/report/KnowledgeGraphChart.tsx` — editable 模式 + hover 交互 + Dialog
- `src/components/report/KnowledgeGraphChart.test.tsx` — 扩展测试
- `src/pages/report-management/ReportDetailPage.tsx` — 集成知识图谱 section + toast
- `src/pages/report-management/ReportDetailPage.test.tsx` — 追加集成测试

## 备注
- 由 agent 通过 TDD 完成（6 slices）
- 全量回归：1259/1259 通过
- ECharts canvas 在 jsdom 中需要 mock
"""

api = GitHubAPI(*get_repo_info())
result = api.update_issue(79, title="[AFK] #13 反哺：修改关联关系", body=body, state="closed")
print(f"Closed #{result['number']} {result['title']}")
