"""继续发布 PRD #57 拆解 issues (#11-#22b)"""
import sys
sys.path.insert(0, '.')
from scripts.github_issues_api import GitHubAPI, get_repo_info

api = GitHubAPI(*get_repo_info())

ISSUES = []

ISSUES.append((
    "[AFK] #11 报告版本管理",
    "ready-for-agent",
    "#76",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

`ReportDetailPage.tsx` 增加版本历史面板（展示 v0.1→v0.2→v0.3 版本列表）。支持"重跑生成新版本"按钮（重新进入 #76 的生成向导，预填当前计划的配置）。版本对比：高亮显示两个版本间变化的板块。

## 验收标准
- [ ] 报告详情页顶部显示当前版本号 + 版本切换下拉
- [ ] 版本历史面板：时间线展示每个版本的生成时间、版本号、触发方式（手动/自动）
- [ ] "重跑生成新版本"按钮 → 跳转到 #76 向导（预填筛选+模板）
- [ ] 版本对比：选择两个版本，并排显示，变化板块浅黄色高亮
- [ ] 版本数据通过 store 持久化

## 技术要点
- 参考 agent-platform 的 `GeneratedReport` 类型
- 版本对比只比较板块标题，不做全文 diff
- 当反哺触发修改后，自动调用重跑生成新版本

## 阻塞项
- #76 (#10) 报告生成流程串联

## 影响范围
- `src/pages/report-management/ReportDetailPage.tsx`（新建）
- `src/pages/report-management/ReportManagementPage.tsx`（报告列表到详情跳转）"""
))

ISSUES.append((
    "[HITL] #12 报告组件评论系统",
    "ready-for-human",
    "#76",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

新建 `ReportCommentThread.tsx`：在每个报告板块（图表/表格/分析区）底部提供评论入口。评论锚定到报告版本+板块 ID。支持发表新评论、显示历史评论线程。

## 验收标准
- [ ] 每个报告板块底部有"评论 (N)"按钮，点击展开评论面板
- [ ] 评论输入框 + 提交按钮
- [ ] 评论列表：显示头像（默认占位）、用户名、时间、内容
- [ ] 评论锚定到 `(reportId, version, sectionId)` 三元组
- [ ] 评论数据 mock 初始注入 2-3 条示例
- [ ] 评论数 badge 显示在板块标题旁

## 技术要点
- 复用为通用 `CommentThread` 组件，接受 `targetId` + `targetType` props
- 评论数据存入 Zustand store（#22a 中扩展 `comments` slice）
- agent-platform 无先例，交互细节可自由发挥

## 阻塞项
- #76 (#10) 报告生成流程串联

## 影响范围
- `src/components/report/CommentThread.tsx`（新建）
- `src/pages/report-management/ReportDetailPage.tsx`（集成评论）"""
))

ISSUES.append((
    "[AFK] #13 反哺：修改关联关系",
    "ready-for-agent",
    "#75",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

在报告的知识图谱板块（#75），hover 节点/连线时显示"修改关系"按钮。点击弹出轻量弹窗：选择新目标/删除该关系。修改后指标 store 同步更新，报告版本自动递进。

## 验收标准
- [ ] 知识图谱中节点 hover 显示"修改关系"浮动按钮
- [ ] 连线 hover 显示"删除该关系"浮动按钮
- [ ] 点击"修改关系"→ 弹窗：选择关系类型 + 选择新目标节点
- [ ] 点击"删除该关系"→ 确认弹窗 → store 更新 → 报告版本递进
- [ ] 修改后触发 toast "关联关系已更新，建议重跑报告"

## 技术要点
- 修改逻辑复用 store 操作
- 弹窗复用 shadcn/ui `Dialog`
- 反哺不直接在报告页面上改数据，而是修改 store 状态

## 阻塞项
- #75 (#9c) KnowledgeGraph 关系图谱组件

## 影响范围
- `src/components/report/KnowledgeGraphChart.tsx`
- `src/pages/indicator-management/IndicatorAttachmentPage.tsx`（跳转目标）"""
))

ISSUES.append((
    "[AFK] #14 反哺：更新知识库",
    "ready-for-agent",
    "#76",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

报告分析文字区域显示"更新知识"按钮。点击弹出知识库文档编辑弹窗（文本编辑区），修改后保存到知识库 store，报告版本递进。

## 验收标准
- [ ] 报告分析文字区域旁显示"更新知识"图标按钮
- [ ] 点击弹出轻量编辑弹窗（textarea + 保存按钮）
- [ ] 知识更新后存入 store，关联到对应知识文件
- [ ] 修改后触发 toast "知识已更新，建议重跑报告"
- [ ] 报告版本自动递进

## 技术要点
- 编辑弹窗复用 shadcn/ui `Dialog`
- 知识数据关联到 `KnowledgeDocument` 模型
- 不直接修改原始文件，仅存储修改记录

## 阻塞项
- #76 (#10) 报告生成流程串联

## 影响范围
- `src/pages/report-management/ReportDetailPage.tsx`
- `src/components/knowledge/KnowledgeEditDialog.tsx`（新建）"""
))

ISSUES.append((
    "[AFK] #15 关联关系类型管理页面",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 图谱关联关系管理

> PPT: "有哪些关联关系可以维护定义、启停用等等"

## 任务描述

新增 `LinkRelationManagePage.tsx`：列表展示所有关联关系类型（名称、描述、启停状态、使用次数）。支持启用/停用、查看详情。

## 验收标准
- [ ] 关系类型列表：每行显示名称、描述、启停状态（toggle 开关）、使用次数
- [ ] 启用/停用开关：即时切换
- [ ] "查看详情"展开行：显示关系类型元数据（源类型、目标类型、创建时间）
- [ ] Mock 数据：预设 5-8 种关联关系类型（AGGREGATES、DEPENDS_ON、DRIVES、TRANSMISSION 等）
- [ ] 列表支持搜索/过滤

## 技术要点
- 关联关系类型数据从新建 `mockLinkRelations.ts` 注入
- 参考 agent-platform `db-viewer` 的表格样式但更精简

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/pages/link-relation/LinkRelationManagePage.tsx`（新建）
- `src/data/mockLinkRelations.ts`（新建）"""
))

ISSUES.append((
    "[AFK] #16 关联关系使用追踪 + 变更记录",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 图谱关联关系管理

> PPT: "可查看血缘画布那里应用了哪些关联关系"、"查看关联关系调整的记录"

## 任务描述

在关联关系详情中展示：① 哪些血缘画布/图谱中应用了该关系类型（统计+指标列表）② 变更历史时间线（谁/何时/改了啥）。

## 验收标准
- [ ] ① 使用追踪：关系详情页显示"被 N 个血缘连线引用"统计 + 具体连线列表（源指标→目标指标）
- [ ] ② 变更记录：时间线组件展示变更历史（时间、变更类型、变更前/后值、操作人 mock）
- [ ] 数据 mock，不接真实变更日志

## 技术要点
- 使用追踪从 `persistentConnections` 中推导
- 变更记录用时间线组件

## 阻塞项
- #15 关联关系类型管理页面

## 影响范围
- `src/pages/link-relation/LinkRelationManagePage.tsx`
- `src/components/timeline/ChangeTimeline.tsx`（新建）"""
))

ISSUES.append((
    "[AFK] #17 规则管理操作优化",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 规则管理

> PPT: "现有可以，适当优化操作便捷"

## 任务描述

RulePanel.tsx 微调：增加规则启停开关、摘要标签展示字段可配置。

## 验收标准
- [ ] 规则节点增加启用/停用 toggle 开关（红色=停用，绿色=启用）
- [ ] `RuleSummaryBadge` 展示字段可配置（当前仅显示阈值范围，增加可选显示：告警级别、算法类型）
- [ ] 停用的规则在规则树中 opacity 0.4 显示
- [ ] 操作不破坏现有规则挂靠/参数配置功能

## 技术要点
- Rule 模型增加 `enabled?: boolean` 字段（默认 true）
- 摘要标签通过组件 props 控制展示字段

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/pages/indicator-management/RulePanel.tsx`
- `src/components/rule/RuleSummaryBadge.tsx`
- `src/models/indicatorAttachmentModel.ts`（Rule 类型扩展）"""
))

ISSUES.append((
    "[AFK] #18 知识库文件管理 + 版本替换",
    "ready-for-agent",
    "#68",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 知识库管理

## 任务描述

`KnowledgeUploadPage.tsx` 移除审核按钮后，增加"导入并替换"功能。新文件导入后 mock 相似度审查（比对文件名、大小），确认替换后覆盖原文件对应部分。知识库文件数据存 store。

## 验收标准
- [ ] 知识库文件列表：显示文件名、版本号、上传时间、文件大小
- [ ] "导入新版本"按钮 → 文件选择 → mock 相似度审查（进度条动画 → 显示相似度百分比）
- [ ] 确认替换后，原文件内容被新版本覆盖，版本号递进
- [ ] 文件管理增删改查在 store 中持久化
- [ ] 审核相关代码和 UI 已完全移除

## 技术要点
- Mock 相似度：随机 70-98%，延时 1.5s 模拟审查
- 文件上传仅保存文件名+大小，不实际读取内容（demo 级别）
- 复用现有 `KnowledgeUploadPage` 结构

## 阻塞项
- #68 (#4) 知识库审核逻辑移除

## 影响范围
- `src/pages/knowledge-upload/KnowledgeUploadPage.tsx`
- `src/stores/attachmentStore.ts`（扩展 knowledgeFiles slice）"""
))

ISSUES.append((
    "[AFK] #19 知识库文档评论",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 知识库管理

## 任务描述

复用 #12 的 `CommentThread` 通用组件，挂到知识文件详情页底部。评论锚定到知识文件 ID+版本号。

## 验收标准
- [ ] 知识文件详情页底部显示"评论 (N)"入口
- [ ] 评论功能复用 #12 的 `CommentThread` 组件
- [ ] 评论锚定到 `(knowledgeFileId, version)` 
- [ ] 可发布新评论，显示历史评论列表

## 技术要点
- `CommentThread` 通过 props 区分 `targetType: 'report' | 'knowledge'`
- 数据存入 #22a 扩展的 `knowledgeComments` slice

## 阻塞项
- #12 报告组件评论（CommentThread 通用组件先完成）

## 影响范围
- `src/pages/knowledge-upload/KnowledgeUploadPage.tsx`（挂载评论）
- `src/components/report/CommentThread.tsx`（复用）"""
))

ISSUES.append((
    "[AFK] #20 血缘画布操作简化",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 血缘画布

## 任务描述

`LineageCanvasPage.tsx` 砍掉/合并预览模式。新增浮动快捷操作栏（选中节点后 hover 显示"添加上游关系"+"添加下游关系"按钮，自动预填源/目标）。

## 验收标准
- [ ] 预览模式入口已移除或合并到画布主视图
- [ ] 选中节点后，节点旁 hover 显示浮动操作栏（添加上游/下游关系）
- [ ] 点击"添加上游关系"→ 弹出选择器（选择源指标）→ 确认后关系即时生成
- [ ] 点击"添加下游关系"→ 同理
- [ ] 新增的关联关系即时显示在画布上
- [ ] 操作栏 200ms 淡入/150ms 淡出

## 技术要点
- 画布内核不改（沿用 v1 SVG 实现），只改交互入口层
- 浮动操作栏使用 `position: absolute` + 节点坐标计算

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/pages/lineage/LineageCanvasPage.tsx`
- `src/components/lineage/FloatingActionBar.tsx`（新建）"""
))

ISSUES.append((
    "[AFK] #21 报告自动化调度（Demo 级别）",
    "ready-for-agent",
    "#70",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 报告管理

> PPT: "报告自动化生成，可按需调整优化"

## 任务描述

报告计划增加"自动执行"开关 + 周期选择（每日/每周/每月）。Mock 定时触发。状态栏显示"上次执行时间 / 下次执行时间"。

## 验收标准
- [ ] 报告计划编辑表单增加"自动执行"开关 + "执行周期"下拉（每日/每周/每月）
- [ ] 开启自动执行后，报告列表卡片上显示"自动"徽章 + 下次执行时间
- [ ] Mock 调度：打开页面时检查需要自动执行的计划，模拟生成新版本
- [ ] 状态栏显示最近一次自动执行时间和结果

## 技术要点
- 纯前端模拟，使用 `setInterval` + 页面可见性检查
- 不依赖后端 cron

## 阻塞项
- #70 (#6) 报告管理 Shell 页面

## 影响范围
- `src/pages/report-management/ReportManagementPage.tsx`
- `src/pages/report-management/ReportDetailPage.tsx`
- `src/hooks/useAutoScheduler.ts`（新建）"""
))

ISSUES.append((
    "[AFK] #22a Zustand store 扩展",
    "ready-for-agent",
    "#70",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 跨模块基础设施

## 任务描述

`attachmentStore.ts` 扩展新增 reports/comments/linkRelations/knowledgeComments 四段 state。新建对应 TypeScript 类型文件。

## 验收标准
- [ ] `src/models/reportModel.ts` 新建：`ReportPlan`、`GeneratedReport`、`ReportSection`、`ReportComment` 接口
- [ ] `src/models/linkRelationModel.ts` 新建：`LinkRelationType`、`LinkRelationChange` 接口
- [ ] `attachmentStore.ts` 新增四个 slice：reports、comments、knowledgeComments、linkRelations
- [ ] 各 slice 的初始 mock 数据注入逻辑
- [ ] localStorage 持久化 key 前缀统一 `kgv2-report-*`、`kgv2-link-*`
- [ ] 保持与现有 slice 的风格一致

## 技术要点
- 使用 Zustand 的 `immer` middleware（如已安装）或手动 immutability
- `GeneratedReport` 参考 agent-platform 的类型定义

## 阻塞项
- #70 (#6) 报告管理 Shell（需要 ReportPlan 类型）

## 影响范围
- `src/stores/attachmentStore.ts`
- `src/models/reportModel.ts`（新建）
- `src/models/linkRelationModel.ts`（新建）"""
))

ISSUES.append((
    "[AFK] #22b 导航一致性修复",
    "ready-for-agent",
    "#66",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 跨模块基础设施

## 任务描述

Header 面包屑 `routeNameMap` 同步更新。Sidebar 高亮选中态与当前路由对齐。新增 404 迁移提示（提示旧 URL 用户已迁移到新路由）。

## 验收标准
- [ ] Header 面包屑名称映射更新：`/lineage`→"血缘画布"、`/reports`→"报告管理"、`/knowledge-upload`→"知识库管理"
- [ ] Sidebar 选中态（高亮/active）与当前路由完全匹配
- [ ] 访问已被注释的旧路由时，显示 404 页面含迁移提示
- [ ] `/knowledge-management` 访问时重定向到 `/knowledge-upload`

## 技术要点
- `routeNameMap` 在 `Header.tsx` 中
- Sidebar 高亮逻辑在 `Sidebar.tsx` 中
- 404 页面在 `App.tsx` 的 `<Route path="*">` 中处理

## 阻塞项
- #66 (#2) App.tsx 路由注释 + Sidebar 精简

## 影响范围
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- `src/App.tsx`
- `src/pages/NotFoundPage.tsx`（可能新建）"""
))

for title, label, blocks, body in ISSUES:
    issue = api.create_issue(title, body, labels=[label])
    num = issue["number"]
    print(f"Created #{num}: {title}")
    if blocks:
        api.add_comment(num, f"> 阻塞于 #{blocks}")

print(f"\nDone!")
