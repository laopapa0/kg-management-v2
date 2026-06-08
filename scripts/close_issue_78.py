import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from github_issues_api import GitHubAPI, get_repo_info

body = """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57)

## 验收标准
- [x] 每个报告板块底部有"评论 (N)"按钮，点击展开评论面板
- [x] 评论输入框 + 提交按钮
- [x] 评论列表：显示头像（默认占位）、用户名、时间、内容
- [x] 评论锚定到 `(reportId, version, sectionId)` 三元组
- [x] 评论数据 mock 初始注入 2-3 条示例
- [x] 评论数 badge 显示在板块标题旁

## 技术要点
- [x] 复用为通用 `CommentThread` 组件，接受 `targetId` + `targetType` props
- [x] 评论数据存入 Zustand store（`commentStore`）
- [x] localStorage 持久化 key: `kgv2-comments`

## 实现文件
- `src/models/commentModel.ts`
- `src/stores/commentStore.ts`
- `src/utils/commentStorage.ts`
- `src/components/report/CommentThread.tsx`
- `src/pages/report-management/ReportDetailPage.tsx`（集成）

## 备注
- 由 agent 通过 TDD 完成（6 slices）
- 全量回归：1249/1249 通过
"""

api = GitHubAPI(*get_repo_info())
result = api.update_issue(78, title="[HITL] #12 报告组件评论系统", body=body, state="closed")
print(f"Closed #{result['number']} {result['title']}")
