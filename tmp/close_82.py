import sys
sys.path.insert(0, 'scripts')
import github_issues_api as gh

owner, repo = gh.get_repo_info()
api = gh.GitHubAPI(owner, repo)

api.update_issue(82, state='closed')
print('#82 closed')

comment = """> 此内容由 AI 在分诊过程中生成。

已完成 ✅

**实现内容：**
- 扩展 `linkRelationModel`：新增 `LinkUsage` / `ChangeLogEntry` / `LinkChangeLog` 类型 + 7 种关系类型各自的使用追踪 mock 数据 + 变更历史 mock 数据
- 新建 `ChangeTimeline` 组件：时间线展示变更历史，支持创建/修改/停用/启用四种变更类型，展示时间、操作人、字段、旧值→新值
- 扩展 `LinkRelationManagePage` 展开详情区域：
  - 使用追踪：显示"被 N 个血缘连线引用"统计 + 具体连线列表（源指标 → 目标指标）
  - 变更记录：复用 `ChangeTimeline` 组件展示完整变更历史
- 验收测试：ChangeTimeline 6 个 + LinkRelationManagePage 新增 3 个（使用追踪统计 / 连线列表 / 变更时间线）

**提交：** `cd644b8`
"""
api.add_comment(82, comment)
print('Comment added')
