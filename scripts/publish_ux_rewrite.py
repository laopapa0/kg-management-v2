"""
发布 UX 交互流程改造 issue（连线模式简化 + 标签/规则配置模式）
"""
import sys
sys.path.insert(0, '.')
from scripts.github_issues_api import GitHubAPI, get_repo_info

api = GitHubAPI(*get_repo_info())

# ── Issue A: 连线模式 tree-only + 自动选中 ──
body_a = """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 指标挂靠交互流程调整

> 此 issue 取代原有"通过连线将指标挂靠到标签树/规则树"的交互方式。新流程：点击待选指标 → 直接挂靠到指标树 → 自动选中该指标 → 通过复选框多选标签和规则。

## 任务描述

简化 `useConnectionMode`：移除 `targetType` 参数，连线模式仅支持挂靠到指标树。`start()` 不再需要 targetType 选择，`confirm()` 只处理 `treeParentId` 赋值。挂靠成功后自动选中新挂靠的指标节点并展开其路径。

## 验收标准

### useConnectionMode 简化
- [ ] `start(sourceId)` 签名移除 `targetType` 参数，内部硬编码 `targetType='tree'`
- [ ] `computeValidTargetIds` 删除 tag/rule 分支，只保留树节点（虚拟分组）的计算逻辑
- [ ] `confirm()` 删除 tag/rule 分支，只保留 `treeParentId` 赋值
- [ ] `ConnectionState` 接口中 `targetType` 字段可移除或标记 deprecated
- [ ] Space 键触发 `start(card.dataset.indicatorId!)` 时不再需要选择目标类型

### IndicatorCard 点击
- [ ] 卡片 onClick 简化为 `start(ind.id)`（不再传 `'tree'` 参数）
- [ ] 移除任何 targetType 选择的 UI（如选择目标的提示文字）

### 自动选中
- [ ] `IndicatorAttachmentPage` 监听 `connection-confirmed` 事件，成功后调用 `treePanelRef.expandAndSelectNode(sourceId)`
- [ ] `IndicatorTreePanel` 的 `expandAndSelectNode` 方法展开祖先路径并选中节点（已有实现，本次只需确保调用链路正确）
- [ ] 选中态持久化到 `selectedIndicatorId`（新 state，驱动 tag/rule 配置模式）

### 连线层简化
- [ ] `ConnectionLayer` 的 `validTargetIds` 只包含树节点，不再包含 tag/rule 节点
- [ ] `FocusModeOverlay` 的 spotlight 排除区只高亮树节点作为有效目标
- [ ] 删除 `IndicatorAttachmentPage` 中按 `data-node-id`/`data-tag-id`/`data-rule-id` 分发 hover 目标的逻辑（只需 `data-node-id`）

## 技术要点
- `useConnectionMode` 的 `validTargetIds` 不再需要区分三种目标类型
- 选中指标的状态 (`selectedIndicatorId`) 放在 `IndicatorAttachmentPage` 的本地 state 中，通过 props 下传给 TagSetPanel 和 RulePanel
- 连线模式状态栏文案同步更新（移除 tag/rule 相关提示）

## 阻塞项
无阻塞——可立即开始。

## 影响范围
- `src/hooks/useConnectionMode.ts`
- `src/components/connection/ConnectionLayer.tsx`
- `src/components/connection/FocusModeOverlay.tsx`
- `src/components/indicator/IndicatorCard.tsx`
- `src/pages/indicator-management/IndicatorAttachmentPage.tsx`
- `src/pages/indicator-management/IndicatorTreePanel.tsx`"""

api.create_issue(
    "[AFK] 连线模式简化为 tree-only + 挂靠后自动选中指标",
    body_a,
    labels=["ready-for-agent"],
)
print("Created issue A")

# ── Issue B: TagSetPanel/RulePanel 配置模式 ──
body_b = """## 关联需求
[PRD #57](https://github.com/laopapa0/kg-management-v2/issues/57) — 指标挂靠交互流程调整

> 依赖：连线模式 tree-only + 自动选中（上一个 issue）先完成。

## 任务描述

当用户在指标树中选中一个指标后，TagSetPanel 和 RulePanel 切换为"配置模式"：
- 每个标签/规则前显示**复选框**，勾选=关联到该指标（tagIds/ruleIds 增删）
- 标签面板**移除颜色编辑器**（花里胡哨难配），标签颜色保留但使用预设值不提供用户自定义
- 规则面板中，勾选规则后显示**中间态**（不是直接√，而是一个"需配置参数"图标），点击"设置"按钮弹出参数配置弹窗
- 页面顶部显示"已选标签/已选规则"小型横幅 pills，点击 pill 可快速取消关联

## 验收标准

### TagSetPanel 配置模式
- [ ] 当 `selectedIndicatorId` 不为 null 时，TagSetPanel 进入配置模式
- [ ] 每个标签 pill 左侧新增 **checkbox**（勾选=已关联到选中指标，未勾选=未关联）
- [ ] 点击 checkbox 直接 toggle `tagIds`（即时更新 store，无需确认）
- [ ] 点击 pill 本身（非 checkbox 区域）仍触发选中/半选逻辑（标签树自身的多选管理）
- [ ] **移除颜色编辑器**：删除 `TagPill` 组件中的颜色选择弹窗、颜色圆形按钮、`onColorChange` 回调。标签颜色保留来自 mock 数据的预设值
- [ ] 配置模式下，浏览模式的"已选 N 个"计数器和"清空"按钮隐藏（避免与指标关联混淆）

### RulePanel 配置模式
- [ ] 当 `selectedIndicatorId` 不为 null 时，RulePanel 进入配置模式
- [ ] 每个规则节点左侧新增 **checkbox**
- [ ] 勾选规则后，checkbox 显示**中间态**（如 `indeterminate` 样式的方形图标，或"⚙️"图标，而非 √ 勾选标记）
- [ ] 中间态的规则节点右侧显示"**设置**"按钮（小号 button，带齿轮图标）
- [ ] 点击"设置"按钮 → 弹出 `ParameterDrawer`（复用已有 #45 的 480px Drawer），预填选中指标的 indicatorId
- [ ] 用户完成参数配置后，中间态变为已确认勾选状态（√），规则关联正式生效
- [ ] 未配置参数的规则（中间态）在保存/离开时保留中间态，不阻止用户继续操作

### 已选标签/规则 横幅
- [ ] 页面底部或配置面板顶部显示横幅 pills：`标签: 核心指标 ✕ | 指标监控 ✕`、`规则: 阈值告警 ✕ | TOP-10 ✕`
- [ ] 每个 pill 右侧有关闭 ✕ 按钮，点击取消该关联
- [ ] 横幅仅在配置模式激活时显示（`selectedIndicatorId` 不为 null）

## 技术要点
- 复选框和中间态通过纯 CSS + Tailwind 实现，不依赖额外组件库
- TagSetPanel 的 checkbox 交互复用 `CascadingStateEngine` 的 toggle 但操作对象从标签选中状态改为 indicator.tagIds
- RulePanel 的"中间态"独立存储：`pendingRuleIds` state（已勾选但未配置参数） vs `confirmedRuleIds`（已配置参数）
- 移除颜色编辑器时保留 `TagNode.color` 字段在模型中，只删除编辑 UI

## 阻塞项
- 连线模式 tree-only + 自动选中（上一个 issue）

## 影响范围
- `src/pages/indicator-management/TagSetPanel.tsx`
- `src/pages/indicator-management/RulePanel.tsx`
- `src/components/tag/TagPill.tsx`
- `src/components/indicator/SelectedTagsRulesBanner.tsx`（新建）
- `src/pages/indicator-management/IndicatorAttachmentPage.tsx`（集成横幅）"""

api.create_issue(
    "[AFK] TagSetPanel/RulePanel 配置模式（复选框 + 去配色 + 规则中间态 + 设置按钮）",
    body_b,
    labels=["ready-for-agent"],
)
print("Created issue B")

print("Done!")
