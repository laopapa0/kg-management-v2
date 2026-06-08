"""
发布 PRD #57 拆解后的 issues 到 GitHub。
"""
import sys
sys.path.insert(0, '.')
from scripts.github_issues_api import GitHubAPI, get_repo_info

api = GitHubAPI(*get_repo_info())

ISSUES = []

# ── 一、旧代码归档 ──

ISSUES.append((
    "[AFK] #1 旧模块路由清单 + 归档文档",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

梳理当前平台全部路由（约 19 条），生成归档文档 `docs/legacy-routes.md`，标注每条路由的处理方式（保留/注释/物理删除），并注明旧页面的关键文件和未来复用场景（如巡检→报告管理、知识管理→知识库管理）。

不改代码，只出文档。

## 验收标准
- [ ] 遍历 `src/App.tsx` 全部已注册路由，生成表格（路由路径、页面组件、所属模块、当前状态、处理方式）
- [ ] 标注每个旧页面的关键源文件路径
- [ ] 标注未来复用场景（巡检相关→报告管理、知识管理→知识库管理、标签/规则配置旧页面→已内置）
- [ ] Sidebar 当前 3 组 18 项菜单项也一并列入表格
- [ ] 文档输出到 `docs/legacy-routes.md`

## 技术要点
- 不修改任何代码文件
- 使用 CONTEXT.md 中的领域术语（知识库、报告管理、血缘画布等）

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `docs/legacy-routes.md`（新建）"""
))

ISSUES.append((
    "[AFK] #2 App.tsx 路由注释 + Sidebar 精简为 5 项",
    "ready-for-agent",
    "#1",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

基于 #1 的路由清单，注释 14 条旧路由（`/noc/*`、`/platform/*`、`/indicator/create`、`/indicator/edit/:id`、`/inspection-todo`、`/tag-config`、`/rule-config`），保留 `/knowledge-management` 待合并。Sidebar 菜单从 3 组 18 项精简为 5 项：首页、指标管理、血缘画布、报告管理、知识库管理。

## 验收标准
- [ ] `App.tsx` 中旧路由以注释形式保留（非物理删除），注释前加标注 `[LEGACY]`
- [ ] 保留路由为 5 条：`/`、`/indicator-management`、`/lineage`、`/reports`（新建 placeholder）、`/knowledge-upload`
- [ ] `Sidebar.tsx` 菜单精简为 5 项，移除 NOC 管理/平台维护分组
- [ ] 旧文件不删除，仅通过路由注释隐藏

## 技术要点
- 旧代码渐进隐藏，后续可物理删除
- 保留路由确保不破坏数据层（Zustand store、localStorage）
- 文件路径参考 #1 产出的 `docs/legacy-routes.md`

## 阻塞项
- #1 旧模块路由清单

## 影响范围
- `src/App.tsx`
- `src/components/Sidebar.tsx`"""
))

ISSUES.append((
    "[AFK] #3 Dashboard 清理 NOC 卡片 + 替换为 4 核心入口",
    "ready-for-agent",
    "#2",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

`DashboardPage.tsx` 移除 3 个 NOC 快捷入口卡片（审核申请、对象类型、规则库），替换为 4 核心入口（指标管理、血缘画布、报告管理、知识库管理）。Dashboard 中所有 NOC 导航调用一并移除。

## 验收标准
- [ ] Dashboard 快捷入口变为 4 个：指标管理、血缘画布、报告管理、知识库管理
- [ ] 移除 `/noc/audit`、`/noc/object-type`、`/noc/rule` 卡片及对应 navigate 调用
- [ ] 新增 `goToReports` navigate 入口（指向 `/reports` 路由）
- [ ] Dashboard 整体布局不变，仅卡片内容替换

## 技术要点
- 卡片数据结构如为配置数组，直接替换 items 即可
- 不涉及组件结构变更

## 阻塞项
- #2 App.tsx 路由注释 + Sidebar 精简

## 影响范围
- `src/pages/dashboard/DashboardPage.tsx`"""
))

# ── 二、审核剥离 ──

ISSUES.append((
    "[AFK] #4 知识库审核逻辑移除",
    "ready-for-agent",
    "#3",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

`KnowledgeUploadPage.tsx` 移除所有审核相关按钮和入口。`knowledge-management/` 目录下的审核页面仅注释路由不删文件，保留文件管理功能作为知识库基础。

## 验收标准
- [ ] `KnowledgeUploadPage.tsx` 中审核按钮/入口全部移除
- [ ] `knowledge-management/` 审核路由注释（路由已在 #2 中注释）
- [ ] 旧审核文件保留在磁盘上不删除
- [ ] 知识库文件上传→预览→维护的基本流程保持可用

## 技术要点
- 审核代码分散在 `KnowledgeUploadPage`、`KnowledgeAuditList`、`AuditDetailModal` 三处
- 移除按钮但不破坏文件管理基础功能

## 阻塞项
- #3 Dashboard 清理

## 影响范围
- `src/pages/knowledge-upload/KnowledgeUploadPage.tsx`
- `src/pages/knowledge-management/KnowledgeAuditList.tsx`
- `src/pages/knowledge-management/AuditDetailModal.tsx`"""
))

ISSUES.append((
    "[AFK] #5 NOC 审核页路由注释 + 旧表单页面隐藏",
    "ready-for-agent",
    "#3",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

确认 `/noc/audit` 路由已注释，`IndicatorEditPage.tsx` 随路由隐藏。Dashboard 中 NOC 审核入口已移除。

## 验收标准
- [ ] `/noc/audit` 路由在 `App.tsx` 中已注释（#2 中完成，本次确认）
- [ ] `IndicatorEditPage.tsx` 随路由隐藏，文件不删除
- [ ] Dashboard 中 NOC 审核入口已移除（#3 中完成，本次确认）

## 技术要点
- 审核数据模型接口保留在 `knowledgeBaseModel.ts` 中，不删除
- 审核待办页面也随路由隐藏

## 阻塞项
- #3 Dashboard 清理

## 影响范围
- `src/pages/noc/NocAuditPage.tsx`（路由注释）
- `src/pages/indicator-edit/IndicatorEditPage.tsx`（路由注释）"""
))

# ── 三、报告管理 ──

ISSUES.append((
    "[AFK] #6 报告管理 Shell 页面 + 计划 CRUD",
    "ready-for-agent",
    "#2",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

新建 `/reports` 路由和 `src/pages/report-management/ReportManagementPage.tsx`。报告计划列表展示（计划名称、执行周期、筛选摘要、最近版本号、生成时间）+"新建报告"按钮。支持新建/编辑/删除报告计划。

## 验收标准
- [ ] 新增 `/reports` 路由（已在 #2 注册 #16 的 ReportManagementPlaceholder）
- [ ] 报告计划列表：每行显示名称、周期、筛选摘要、最新版本号、最近生成时间
- [ ] "新建报告计划"按钮 → 弹出创建表单（计划名称 + 执行周期选择 + 描述）
- [ ] 列表支持编辑和删除
- [ ] 空列表时显示情境化空状态

## 技术要点
- 参考 agent-platform `report-history-page.tsx` 的列表 UI 骨架
- Mock 数据初始注入 2-3 条示例计划
- 数据结构预留 `ReportPlan` 接口

## 阻塞项
- #2 App.tsx 路由注释 + Sidebar 精简

## 影响范围
- `src/pages/report-management/ReportManagementPage.tsx`（新建）
- `src/App.tsx`（路由注册）"""
))

ISSUES.append((
    "[AFK] #7 筛选范围选择器组件",
    "ready-for-agent",
    "#6",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

新建 `FilterScopeSelector.tsx`：左侧指标树层级多选 + 右侧标签多选，取并集作为报告指标范围。支持跨部门选指标（报告配置不限分权分域）。可选剔除指定规则/关联关系。

## 验收标准
- [ ] 左侧：指标树层级勾选（展开收起，选中父节点自动包含子级）
- [ ] 右侧：标签多选（从所有部门标签池中选，跨部门）
- [ ] 并集逻辑：选中的指标 = 树勾选指标 ∪ 标签关联指标
- [ ] "剔除规则"：列表勾选不需要纳入报告的规则
- [ ] "剔除关联关系"：列表勾选不需要纳入报告的关系类型
- [ ] 底部显示实时统计："已选 N 个指标，覆盖 M 个部门"

## 技术要点
- 读取 `attachmentStore` 中所有部门的 indicators / tagNodes / rules
- 跨部门不受分权分域限制，直接从 store 的全量数据中选
- 组件接受 `value` + `onChange` props，与报告生成向导解耦

## 阻塞项
- #6 报告管理 Shell 页面

## 影响范围
- `src/components/report/FilterScopeSelector.tsx`（新建）"""
))

ISSUES.append((
    "[AFK] #8 报告模板管理",
    "ready-for-agent",
    "#6",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

新建 `ReportTemplatesPage.tsx`：预设模板列表（模板名、描述、板块列表、使用次数）。新建/编辑模板：填写模板名、描述、板块列表（每个板块有标题+提示词预选项/建议文案）。提示词配置不接 AI 后端，纯文本存储。

## 验收标准
- [ ] 模板列表：每行显示名称、板块数、使用次数、启用状态
- [ ] "新建模板"按钮 → 模板名 + 描述 + 板块管理面板
- [ ] 板块管理：添加/删除/排序板块，每个板块配置标题 + 提示词输入框
- [ ] 提示词输入框下方提供预选项/建议文案（如"分析指标同比/环比变化"、"检测异常值并标注"）
- [ ] 启用/停用开关
- [ ] Mock 数据初始注入 2 个预设模板

## 技术要点
- 参考 agent-platform `report-templates-page.tsx` 的板块卡片 UI
- 提示词预选项以预设标签形式呈现，点击即可填充到输入框
- 数据结构参考 agent-platform 的 `ReportTemplate` + `ReportSection`

## 阻塞项
- #6 报告管理 Shell 页面

## 影响范围
- `src/pages/report-management/ReportTemplatesPage.tsx`（新建）"""
))

ISSUES.append((
    "[AFK] #9a StatsCardGrid + 统计表格组件",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 报告渲染组件

## 任务描述

基于 `report.html` 中的样式，封装两类纯 UI 组件：指标卡片网格（`StatsCardGrid`）和异常汇总表格（`AnomalyTable`），含标签/警报样式。

## 验收标准
- [ ] `StatsCardGrid`：自适应网格，每卡片内容为标题+数值+单位。使用 `report.html` 的 `.stat-card` 样式
- [ ] `AnomalyTable`：表格列含序号、指标名、异常日期、异常值、日变化、审核判定。判定列用彩色标签（真异常/月末效应/数据质量/边界）
- [ ] 标签组件：`.tag-danger`（红）、`.tag-warning`（橙）、`.tag-info`（蓝）、`.tag-success`（绿）、`.tag-purple`（紫）
- [ ] 警报组件：`.alert-danger`、`.alert-warning`、`.alert-info`、`.alert-success`（左侧色条+背景）
- [ ] 图表解读注释：`.chart-note` 样式（灰色背景+说明文字+口径标注）

## 技术要点
- 从 `report.html` 的 CSS 提取样式，适配 Tailwind + CSS 变量
- 组件接受 props 驱动数据，不内置 mock 数据
- 放在 `src/components/report/` 目录下

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/components/report/StatsCardGrid.tsx`（新建）
- `src/components/report/AnomalyTable.tsx`（新建）
- `src/components/report/ReportTag.tsx`（新建）
- `src/components/report/ReportAlert.tsx`（新建）
- `src/styles/dark-theme.css`（新增报告组件 CSS 变量）"""
))

ISSUES.append((
    "[AFK] #9b ECharts 图表组件",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 报告渲染组件

## 任务描述

基于 `report.html` 中的 ECharts 配置，封装 React 图表组件：柱状图（`ChartBar`）、仪表盘（`ChartGauge`）、折线图（`ChartLine`）。安装 `echarts` 依赖。

## 验收标准
- [ ] 安装 `npm install echarts`（或已有）
- [ ] `ChartBar`：支持多系列、渐变填充、数值标签
- [ ] `ChartGauge`：仪表盘样式（弧形进度，红黄绿分区，中心数值）
- [ ] `ChartLine`：平滑折线、面积填充、异常点标记（红色圆点标注）
- [ ] 所有图表使用深色主题配色，颜色跟随 CSS 变量
- [ ] 组件在卸载时正确销毁 ECharts 实例（避免内存泄漏）

## 技术要点
- 使用 ECharts 的 `echarts.init()` + `setOption()`，通过 ref 管理实例
- resize 时图表自适应
- 不内置数据，通过 props 传入 ECharts option 或简化数据格式

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/components/report/ChartBar.tsx`（新建）
- `src/components/report/ChartGauge.tsx`（新建）
- `src/components/report/ChartLine.tsx`（新建）
- `package.json`（新增 echarts 依赖）"""
))

ISSUES.append((
    "[AFK] #9c KnowledgeGraph 关系图谱组件",
    "ready-for-agent",
    None,
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 报告渲染组件

## 任务描述

基于 `report.html` 中的 ECharts force-directed graph，封装 `KnowledgeGraphChart` 组件：节点（异常指标+邻居）、连线（实线已验证传导/虚线无数据证据）、归因面板（图表下方显示归因分析和建议部门）。

## 验收标准
- [ ] 节点渲染：红色=异常中心，蓝色=DEPENDS_ON 上游，橙色=已偏离邻居，绿色=未偏离邻居
- [ ] 连线样式：实线 2.5px（已验证传导），虚线 1px（无数据证据），每条连线显示关系类型标签
- [ ] 图例说明面板：颜色+连线含义
- [ ] 节点可拖拽（ECharts `roam: true`），支持缩放
- [ ] 归因分析面板：图表下方显示归因结果（成功/存在但未传导/无法归因），含建议负责部门
- [ ] 组件卸载时销毁 ECharts 实例

## 技术要点
- ECharts `type: 'graph'` + `layout: 'force'`
- 节点大小根据重要性分级（异常中心 55px > 上游 22px > 其他 15px）
- 归因面板用 #9a 的 `ReportAlert` 组件

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/components/report/KnowledgeGraphChart.tsx`（新建）
- 依赖 #9a 的 ReportAlert 组件（可先 mock 占位）"""
))

ISSUES.append((
    "[AFK] #10 报告生成流程串联",
    "ready-for-agent",
    "#7,#8",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

新建 `ReportGenerationWizard.tsx`：三步向导（筛选→模板→确认生成），串联 #7 的筛选选择器和 #8 的模板选择。最终"生成"按钮触发 mock 即时报告生成（不接 AI 后端，使用预置 mock 数据）。

## 验收标准
- [ ] 步骤 1"筛选范围"：嵌入 #7 的 `FilterScopeSelector` 组件
- [ ] 步骤 2"选择模板"：从 #8 的模板列表中选择一个，预览板块结构
- [ ] 步骤 3"确认并生成"：展示筛选摘要+模板预览，点击"生成报告"按钮
- [ ] 生成后自动跳转到报告详情页（#11），初始化为 v0.1
- [ ] 生成流程中可返回上一步修改
- [ ] Mock 生成：即时返回预置报告数据，无需等待异步任务

## 技术要点
- 参考 agent-platform `report-generation-page.tsx` 的多步表单 UI
- 报告数据 mock：在 `src/data/` 下新建 `mockReportData.ts`，提供预置的报告 JSON
- 生成后的 `GeneratedReport` 对象存入 Zustand store（#22a 中扩展）

## 阻塞项
- #7 筛选范围选择器
- #8 报告模板管理

## 影响范围
- `src/pages/report-management/ReportGenerationWizard.tsx`（新建）
- `src/data/mockReportData.ts`（新建）"""
))

ISSUES.append((
    "[AFK] #11 报告版本管理",
    "ready-for-agent",
    "#10",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

`ReportDetailPage.tsx` 增加版本历史面板（展示 v0.1→v0.2→v0.3 版本列表）。支持"重跑生成新版本"按钮（重新进入 #10 的生成向导，预填当前计划的配置）。版本对比：高亮显示两个版本间变化的板块。

## 验收标准
- [ ] 报告详情页顶部显示当前版本号 + 版本切换下拉
- [ ] 版本历史面板：时间线展示每个版本的生成时间、版本号、触发方式（手动/自动）
- [ ] "重跑生成新版本"按钮 → 跳转到 #10 向导（预填筛选+模板）
- [ ] 版本对比：选择两个版本，并排显示，变化板块浅黄色高亮
- [ ] 版本数据通过 store 持久化

## 技术要点
- 参考 agent-platform 的 `GeneratedReport` 类型
- 版本对比只比较板块标题，不做全文 diff
- 当 #12 反哺触发修改后，自动调用重跑生成新版本

## 阻塞项
- #10 报告生成流程串联

## 影响范围
- `src/pages/report-management/ReportDetailPage.tsx`（新建）
- `src/pages/report-management/ReportManagementPage.tsx`（报告列表→详情跳转）"""
))

ISSUES.append((
    "[HITL] #12 报告组件评论系统",
    "ready-for-human",
    "#10",
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
- #10 报告生成流程串联

## 影响范围
- `src/components/report/CommentThread.tsx`（新建）
- `src/pages/report-management/ReportDetailPage.tsx`（集成评论）"""
))

ISSUES.append((
    "[AFK] #13 反哺：修改关联关系",
    "ready-for-agent",
    "#9c",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 平台模块精简 + 四大核心菜单重构

## 任务描述

在报告的知识图谱板块（#9c），hover 节点/连线时显示"修改关系"按钮。点击弹出轻量弹窗：选择新目标/删除该关系。修改后指标 store 同步更新，报告版本自动递进（触发 #11 重跑）。

## 验收标准
- [ ] 知识图谱中节点 hover 显示"修改关系"浮动按钮
- [ ] 连线 hover 显示"删除该关系"浮动按钮
- [ ] 点击"修改关系"→ 弹窗：选择关系类型 + 选择新目标节点（从指标树/标签集/规则树中选）
- [ ] 点击"删除该关系"→ 确认弹窗 → store 更新 → 报告版本递进
- [ ] 修改后触发 toast "关联关系已更新，建议重跑报告"

## 技术要点
- 修改逻辑复用 `useConnectionMode` 或直接操作 store
- 弹窗复用 shadcn/ui `Dialog`
- 反哺不直接在报告页面上改数据，而是跳转到指标管理页的对应位置

## 阻塞项
- #9c KnowledgeGraph 关系图谱组件

## 影响范围
- `src/components/report/KnowledgeGraphChart.tsx`
- `src/pages/indicator-management/IndicatorAttachmentPage.tsx`（可能跳转目标）"""
))

ISSUES.append((
    "[AFK] #14 反哺：更新知识库",
    "ready-for-agent",
    "#10",
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
- #10 报告生成流程串联

## 影响范围
- `src/pages/report-management/ReportDetailPage.tsx`
- `src/components/knowledge/KnowledgeEditDialog.tsx`（新建）"""
))

# ── 四、图谱关联关系管理 ──

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
- 关联关系类型数据从 `mockAttachmentData.ts` 或新建 `mockLinkRelations.ts` 注入
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
    "#15",
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
- 使用追踪从 `persistentConnections`（#42 产物）中推导
- 变更记录用时间线组件，参考 shadcn/ui 无内置时可自定义 CSS

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
- 摘要标签通过组件 props 控制展示字段，不改核心逻辑

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/pages/indicator-management/RulePanel.tsx`
- `src/components/rule/RuleSummaryBadge.tsx`
- `src/models/indicatorAttachmentModel.ts`（Rule 类型扩展）"""
))

# ── 五、知识库 + 血缘 ──

ISSUES.append((
    "[AFK] #18 知识库文件管理 + 版本替换",
    "ready-for-agent",
    "#4",
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
- #4 知识库审核逻辑移除

## 影响范围
- `src/pages/knowledge-upload/KnowledgeUploadPage.tsx`
- `src/pages/knowledge-upload/KnowledgeFileList.tsx`（新建或重构）
- `src/stores/attachmentStore.ts`（扩展 knowledgeFiles slice）"""
))

ISSUES.append((
    "[AFK] #19 知识库文档评论",
    "ready-for-agent",
    "#12",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 知识库管理

## 任务描述

复用 #12 的 `CommentThread` 通用组件，挂到知识文件详情页底部。评论锚定到知识文件 ID+版本号。支持发表新评论和展示历史评论线程。

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
- 自动预填指：当前选中节点自动设为关系的一端

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/pages/lineage/LineageCanvasPage.tsx`
- `src/components/lineage/FloatingActionBar.tsx`（新建）"""
))

# ── 六、自动化 + 收尾 ──

ISSUES.append((
    "[AFK] #21 报告自动化调度（Demo 级别）",
    "ready-for-agent",
    "#6",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 报告管理

> PPT: "报告自动化生成，可按需调整优化"

## 任务描述

报告计划增加"自动执行"开关 + 周期选择（每日/每周/每月）。Mock 定时触发（不依赖真实调度系统，使用前端 `setInterval` 模拟）。状态栏显示"上次执行时间 / 下次执行时间"。

## 验收标准
- [ ] 报告计划编辑表单增加"自动执行"开关 + "执行周期"下拉（每日/每周/每月）
- [ ] 开启自动执行后，报告列表卡片上显示"自动"徽章 + 下次执行时间
- [ ] Mock 调度：打开页面时检查需要自动执行的计划，模拟生成新版本
- [ ] 状态栏显示最近一次自动执行时间和结果

## 技术要点
- 纯前端模拟，使用 `setInterval` + 页面可见性检查
- 不依赖后端 cron 或 CloudWatch
- 自动生成复用 #10 的 mock 生成逻辑

## 阻塞项
- #6 报告管理 Shell 页面

## 影响范围
- `src/pages/report-management/ReportManagementPage.tsx`
- `src/pages/report-management/ReportDetailPage.tsx`
- `src/hooks/useAutoScheduler.ts`（新建）"""
))

ISSUES.append((
    "[AFK] #22a Zustand store 扩展",
    "ready-for-agent",
    "#6,#12",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 跨模块基础设施

## 任务描述

`attachmentStore.ts` 扩展新增 4 段 state：
- `reports` — `ReportPlan[]` + `GeneratedReport[]`
- `comments` — `ReportComment[]`（报告评论，锚定 reportId+sectionId）
- `knowledgeComments` — `KnowledgeComment[]`（知识库评论，锚定 fileId）
- `linkRelations` — `LinkRelationType[]`（关联关系类型）

同时新建对应的 TypeScript 类型文件。

## 验收标准
- [ ] `src/models/reportModel.ts` 新建：`ReportPlan`、`GeneratedReport`、`ReportSection`、`ReportComment` 接口
- [ ] `src/models/linkRelationModel.ts` 新建：`LinkRelationType`、`LinkRelationChange` 接口
- [ ] `attachmentStore.ts` 新增 reports/comments/knowledgeComments/linkRelations 四个 slice
- [ ] 各 slice 的初始 mock 数据注入逻辑
- [ ] localStorage 持久化 key 前缀统一 `kgv2-report-*`、`kgv2-link-*`
- [ ] 保持与现有 `indicators`/`tagNodes`/`rules` slice 的风格一致

## 技术要点
- 使用 Zustand 的 `immer` middleware（如已安装）或手动 immutability
- `GeneratedReport` 参考 agent-platform 的类型定义
- 不要在 store 中放 AI 生成逻辑，只放数据结构

## 阻塞项
- #6 报告管理 Shell（需要 ReportPlan 类型）
- #12 报告组件评论（需要 ReportComment 类型）

## 影响范围
- `src/stores/attachmentStore.ts`
- `src/models/reportModel.ts`（新建）
- `src/models/linkRelationModel.ts`（新建）"""
))

ISSUES.append((
    "[AFK] #22b 导航一致性修复",
    "ready-for-agent",
    "#2",
    """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 跨模块基础设施

## 任务描述

Header 面包屑 `routeNameMap` 同步更新（如 `/lineage` 从"配置链接关系"→"血缘画布"）。Sidebar 高亮选中态与当前路由对齐。新增 404 迁移提示（提示旧 URL 用户已迁移到新路由）。

## 验收标准
- [ ] Header 面包屑名称映射更新：`/lineage`→"血缘画布"、`/reports`→"报告管理"、`/knowledge-upload`→"知识库管理"
- [ ] Sidebar 选中态（高亮/active）与当前路由完全匹配
- [ ] 访问已被注释的旧路由时，显示 404 页面含迁移提示："该页面已迁移，请通过新导航访问"
- [ ] `/knowledge-management` 访问时重定向到 `/knowledge-upload`

## 技术要点
- `routeNameMap` 在 `Header.tsx` 中
- Sidebar 高亮逻辑在 `Sidebar.tsx` 中
- 404 页面在 `App.tsx` 的 `<Route path="*">` 中处理

## 阻塞项
- #2 App.tsx 路由注释 + Sidebar 精简

## 影响范围
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- `src/App.tsx`
- `src/pages/NotFoundPage.tsx`（可能新建）"""
))

# ── 发布 ──
created_numbers = []
for title, label, blocks, body in ISSUES:
    issue = api.create_issue(title, body, labels=[label])
    num = issue["number"]
    created_numbers.append(num)
    print(f"Created #{num}: {title}")
    if blocks:
        api.add_comment(num, f"> 阻塞于 #{blocks}")

print(f"\nDone! Created {len(created_numbers)} issues: #{created_numbers}")
