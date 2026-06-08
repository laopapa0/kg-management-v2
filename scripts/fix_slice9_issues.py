"""
修复 slice 9 issues #48-#53 的乱码 — 直接从 .py 文件执行避免 PowerShell 管道编码问题。
"""
import sys
sys.path.insert(0, 'scripts')
from github_issues_api import GitHubAPI, get_repo_info

api = GitHubAPI(*get_repo_info())

# ── 辅助：先还原标题（去掉被乱码的标题）──
issues_to_fix = {
    48: "[Slice 9.1] 本地搜索框 + 高亮/过滤模式切换（适配双模式）",
    49: "[Slice 9.2] Cmd+K 命令面板（适配指标选中+配置模式）",
    50: "[Slice 9.3] useFocusTrap + 焦点记忆（适配 tree-only 连线 + 配置模式）",
    52: "[Slice 9.5] 虚拟滚动阈值控制 + prefers-reduced-motion 降级（适配拖入待选区）",
    53: "[Slice 9.6] 核心模块测试补齐 + WCAG 可访问性审计（适配新UX交互）",
}

# ── #48 搜索框 ──
body_48 = """## 关联需求

PRD #1 — 指标挂靠核心页面

> **UX 调整关联 (见 #57 sub-issue)**：TagSetPanel 和 RulePanel 已改为双模式（浏览模式 + 指标配置模式）。搜索框在两种模式下均应正常工作——浏览模式下搜索所有标签/规则，配置模式下搜索过滤可用的标签/规则。

## 任务描述

为标签集和规则面板提供统一的搜索框组件，支持"高亮模式"和"过滤模式"切换。高亮模式下未匹配节点以 opacity 0.35 淡化但仍保留结构；过滤模式下完全隐藏未匹配节点。

完成此 slice 后，搜索体验统一且灵活。

## 验收标准

- [ ] 可复用的 `TreeSearchInput` 组件：36px 高度，左侧搜索图标，右侧清空按钮。
- [ ] 搜索框聚焦时边框高亮 + 外发光。
- [ ] 输入后 150ms 防抖触发过滤。
- [ ] 支持"高亮模式"（默认）和"过滤模式"切换按钮。
- [ ] 高亮模式：匹配节点正常显示，未匹配 opacity 0.35 + scale 0.98 + pointer-events none。
- [ ] 过滤模式：未匹配节点完全隐藏，树自动收缩。
- [ ] 匹配文字以暗金色背景高亮加粗。
- [ ] 空搜索结果时显示情境化空状态。
- [ ] **新增**：搜索框在配置模式（选中指标后编辑标签/规则）下继续可用，过滤词应仅应用于 Node 匹配，不影响 indicator 关联逻辑。

## 技术要点

- 搜索逻辑与 TreeView 解耦，通过 props 传入 filteredNodeIds。
- 模式切换状态持久化到 UI state。
- **新增**：双模式兼容——搜索框自身不感知当前是浏览模式还是配置模式，由 TagSetPanel/RulePanel 决定如何消费搜索结果（浏览模式下高亮/过滤，配置模式下仅过滤可选列表不改变已关联集合）。

## 阻塞项

- UX 交互调整（#57 sub-issue: TagSetPanel/RulePanel 双模式先完成）
- #27 Slice 4.3 标签搜索过滤
- #30 Slice 4.6 规则搜索过滤

## 影响范围

- `src/components/search/TreeSearchInput.tsx`
- `src/pages/indicator-management/TagSetPanel.tsx`
- `src/pages/indicator-management/RulePanel.tsx`"""

# ── #49 命令面板 ──
body_49 = """## 关联需求

PRD #1 — 指标挂靠核心页面

> **UX 调整关联 (见 #57 sub-issue)**：由于 tag/rule 不再通过连线模式挂靠，而是通过"选中指标 → 多选标签/规则"的配置模式完成。命令面板选择标签/规则后的导航行为需调整。

## 任务描述

实现全局 Cmd+K 命令面板。用户可以通过键盘快速搜索指标、标签、规则，选择后自动跳转定位到对应面板和目标节点。

完成此 slice 后，高级用户有了全局快速入口。

## 验收标准

- [ ] 按 Cmd/Ctrl+K 打开命令面板（使用项目已有的 `cmdk` 依赖）。
- [ ] 面板最大宽度 640px，200ms 入场动画。
- [ ] 支持搜索指标（按名称/编码）、标签、规则。
- [ ] 结果按类别分组：指标 / 标签 / 规则。
- [ ] ↑↓ 导航，Enter 执行，Esc 关闭。
- [ ] 选择**指标**后：若指标在待选区则滚动到该卡片并高亮；若在树中则展开树节点并**选中**（触发 tag/rule 配置模式激活）。
- [ ] 选择**标签/规则**后：若当前有选中的指标，直接切换该标签/规则的关联状态（勾选/取消）并显示 mini toast 确认；若无选中指标则展开对应树节点并高亮提示用户先选中指标。
- [ ] 命令面板本身显示可用快捷键提示。

## 技术要点

- `cmdk` 已安装，直接复用 `Command` 组件。
- 索引数据从 `attachmentStore` 实时派生。
- **新增**：标签/规则选择逻辑需先检查 `selectedIndicatorId`（状态从 IndicatorAttachmentPage 传入），有选中指标时走配置模式 toggle，无选中指标时走导航模式。

## 阻塞项

- #48 Slice 9.1 本地搜索框
- UX 交互调整（#57 sub-issue: 指标选中态 + tag/rule 配置模式）

## 影响范围

- `src/components/command/AttachmentCommandPalette.tsx`（新建）
- `src/pages/indicator-management/IndicatorAttachmentPage.tsx`"""

# ── #50 焦点Trap ──
body_50 = """## 关联需求

PRD #1 — 指标挂靠核心页面

> **UX 调整关联 (见 #57 sub-issue)**：连线模式已简化为仅支持挂靠到指标树（不再有 tag/rule 目标）。tag/rule 的挂靠改为"选中指标后在面板上多选"的 click-based 配置模式。焦点 Trap 的 scope 需要相应缩减，同时新增配置模式的焦点管理。

## 任务描述

实现 `useFocusTrap` Hook，管理页面中的焦点行为：连线模式下焦点不逃离有效交互区域；配置模式下确保 tag/rule 多选交互可得体焦点管理；Drawer/弹窗关闭后焦点返回触发元素；inline 编辑期间完全隔离快捷键。

完成此 slice 后，键盘用户的焦点上下文始终稳定。

## 验收标准

- [ ] `useFocusTrap(activeRef, options)` Hook：激活时限制 Tab 键在指定容器内循环。
- [ ] **连线模式**（tree-only）激活时，Tab 只在源指标卡片、有效目标节点（仅虚拟分组节点）、取消/状态栏按钮之间循环。
- [ ] **配置模式**（选中指标后编辑 tag/rule）：TagSetPanel / RulePanel 内的 Tab 在面板内部循环，不泄漏到树面板。焦点离开配置面板时自动退出配置模式（或保留选中态）。
- [ ] Drawer 关闭后焦点返回触发 Drawer 的按钮。
- [ ] 弹窗关闭后焦点返回打开弹窗的按钮。
- [ ] inline 编辑期间，所有全局快捷键（Space、Delete、F2）被屏蔽。
- [ ] 焦点变化通过 `data-focus-zone` 属性追踪。
- [ ] 测试覆盖焦点循环和焦点记忆（连线模式 + 配置模式两种场景）。

## 技术要点

- 使用 `Tab` / `Shift+Tab` 事件监听 + 容器内可聚焦元素查询。
- 焦点记忆通过 ref 保存上一个触发元素。
- **新增**：`useFocusTrap` 接受 `enabled` 参数以支持动态激活/停用（连线模式进入时激活 tree-zone trap，选中指标时激活 tag/rule-zone trap）。

## 阻塞项

- #35 Slice 5.5 焦点上下文管理
- #45 Slice 8.1 参数 Drawer
- UX 交互调整（#57 sub-issue: 连线模式 tree-only + 配置模式）

## 影响范围

- `src/hooks/useFocusTrap.ts`（新建）
- `src/hooks/useFocusTrap.test.ts`（新建）
- `src/pages/indicator-management/IndicatorAttachmentPage.tsx`"""

# ── #52 虚拟滚动 ──
body_52 = """## 关联需求

PRD #1 — 指标挂靠核心页面

> **UX 调整关联 (见 #57 sub-issue)**：新增"从指标树拖拽指标到待选列表"交互。虚拟滚动在外部拖入待选区时也需临时禁用，与树内拖拽排序的禁用逻辑一致。

## 任务描述

实现大数据量性能优化：中间待选指标超过 100 条时启用虚拟滚动；所有动画支持 `prefers-reduced-motion` 媒体查询降级。

完成此 slice 后，大数据量场景仍可流畅使用，同时对运动敏感用户友好。

## 验收标准

- [ ] 中间待选指标 <100 条时全量渲染。
- [ ] 100-500 条时启用 `react-window` 虚拟滚动。
- [ ] >500 条时追加客户端搜索过滤。
- [ ] 虚拟滚动与卡片网格布局兼容（使用 `react-window` 的 `VariableSizeGrid` 或 `react-virtuoso`）。
- [ ] **拖拽排序时** 和 **从树拖入待选区时** 临时禁用虚拟滚动（drop zone 需要完整的 DOM 布局来计算落点）。
- [ ] 所有 Framer Motion 动画通过 `MotionConfig reducedMotion="user"` 自动降级。
- [ ] CSS transition 动画通过 `@media (prefers-reduced-motion: reduce)` 降级为 100ms 或取消。
- [ ] 降级后保留功能性反馈（如颜色变化），去除装饰性运动。

## 技术要点

- `react-window` 未安装，需要 `npm install react-window`（或 `react-virtuoso`）。
- 虚拟滚动容器的高度和卡片高度需要精确测量。
- **新增**：待选区 `onDragOver`/`onDrop` 事件触发时设置标志位，使虚拟滚动退化为全量渲染，drop 完成后恢复。

## 阻塞项

- #12 Slice 1.3 指标卡片 + 响应式网格
- UX 交互调整（#57 sub-issue: 树→待选区拖拽）

## 影响范围

- `src/components/indicator/IndicatorGrid.tsx`
- `src/components/motion/MotionProvider.tsx`（新建）
- `src/styles/dark-theme.css`
- `package.json`"""

# ── #53 测试补齐 ──
body_53 = """## 关联需求

PRD #1 — 指标挂靠核心页面

> **UX 调整关联 (见 #57 sub-issue)**：挂靠交互已从"连线模式选择 tree/tag/rule 目标"简化为"点击→挂靠到树→自动选中→多选标签/规则"。`useConnectionMode` 的 targetType 参数已移除，各项测试 scope 需同步调整。**强烈建议在所有 UX 调整完成后才执行此 issue**，避免在旧交互上浪费测试工时。

## 任务描述

补齐 PRD 中指定的深模块测试，并进行 WCAG AA 可访问性审计。确保颜色对比度、焦点指示器、键盘导航、动画降级全部达标。

完成此 slice 后，指标挂靠页面达到生产就绪的质量标准。

## 验收标准

- [ ] `attachmentStorage.test.ts`：CRUD、undo/redo、`kgv2-` 前缀隔离、localStorage 超限降级。
- [ ] `useConnectionMode.test.ts`：状态机转换（**tree-only start/confirm**）、Space/ESC、连续模式（source 切换时重新计算 tree 目标）、误触计数器。
- [ ] `CascadingStateEngine.test.ts`：父子联动、半选、参数继承。
- [ ] `TreeView.test.tsx`：展开/收起、inline 编辑三通道确认、删除策略弹窗判断、拖拽放置位置（**含树内拖拽 + 树→待选区拖出**）。
- [ ] `IndicatorCard.test.tsx`：四态渲染、**点击直接挂靠到树**（不再有 targetType 选择）、已挂靠 hover 提示、fly-out 动画触发。
- [ ] **新增** `tagRuleConfig.test.ts`：选中指标后 TagSetPanel/RulePanel 多选 toggle、双模式切换（浏览↔配置）、已选标签/规则横幅 pills 渲染。
- [ ] **新增** `IndicatorTreePanel.test.tsx`：挂靠后自动选中+展开、删除指标回到待选区验证。
- [ ] Lighthouse 可访问性评分 >= 90。
- [ ] 所有文字色在深色背景上对比度 >= AA（辅助文字 >= 4.5:1，主文字 >= 7:1）。
- [ ] 所有交互元素焦点指示器可见。
- [ ] `prefers-reduced-motion` 测试通过（浏览器 DevTools 模拟）。

## 技术要点

- 测试风格参考现有 `indicatorStorage.test.ts` 和 `InspectionPlanForm.test.tsx`。
- 可访问性审计使用 Lighthouse + axe DevTools。

## 阻塞项

- 全部核心 slice 完成后进行。**尤其依赖 UX 交互调整（#57 sub-issue）完成后再开始。**

## 影响范围

- 多个 `*.test.ts` / `*.test.tsx` 文件
- 可能需微调的可访问性相关 CSS"""

for num, title in issues_to_fix.items():
    body = {48: body_48, 49: body_49, 50: body_50, 52: body_52, 53: body_53}[num]
    api.update_issue(num, title=title, body=body)
    print(f"#{num} updated OK")

print("\nAll 5 issues restored with correct encoding.")
