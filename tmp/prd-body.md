# [PRD] 指标挂靠核心页面

## 一、背景与目标

**要解决什么问题**

v2 重构后，"指标管理"被定义为核心页面，但当前 `/indicator-management` 仅是一个占位组件。业务用户（如财务部数据管理员）每天需要将大量待选指标挂接到指标树、标签集和规则上，形成指标的知识图谱。当前 v1 的交互依赖传统表单和表格，操作路径长、无法直观看到"指标归属到哪里"，学习成本高。

v2 希望用**连线式挂靠**重构这一核心流程：用户在 4 面板布局中，通过直观的 SVG 连线把待选指标挂到目标节点，系统实时反馈挂接关系，降低认知负荷。

**预期达成的目标**

- 用户完成单个指标挂靠的操作步数从 v1 的 4-5 步降至 2 步（点击指标 → 空格确认）。
- 新用户在无培训情况下，5 分钟内独立完成首次指标挂靠。
- 页面渲染 1000 个指标/树节点时 FCP < 1.5s，交互帧率保持 60fps。
- 通过 WCAG AA 可访问性审计（对比度、焦点管理、动画降级）。

---

## 二、用户场景

### 场景 1：财务部的月度指标归类

> 小张是财务部数据管理员。每月初，他需要把上月新增的 30 多个指标挂到"财务指标树"下，并打上"利润""成本"等标签。
>
> 当前他打开 v1 的指标管理页，面对的是一张张表格：先在左侧树找到目标分类，再在右侧表格勾选指标，最后点"保存"。他经常忘记指标是否已经挂过，重复操作后又要去另一页面解绑。
>
> 他期望的交互是：页面中间直观看到所有待选指标卡片，点击一个指标后，可挂靠的目标节点高亮，其他区域变暗；把鼠标移到"利润"标签上，按空格就完成挂靠，指标卡片显示"已挂靠"。如果挂错了，5 秒内可以撤销。

### 场景 2：为规则配置阈值参数

> 小李需要给"营收波动检测"规则下的 5 个指标配置上下限阈值。挂接完成后，他点击规则节点旁的"配置参数"图标，右侧滑出 Drawer，里面已经继承父规则"基础设施监控"的默认阈值；他只需要修改其中一个指标的波动窗口，系统会高亮显示"已覆盖"。

### 场景 3：跨部门切换

> 小王先处理财务部的指标，完成后要切换到市场部。他点击 Header 头像栏的部门切换器，左侧指标树和右上标签集平滑切换为市场部的数据；中间待选指标和右下规则区域保持不变（规则全局共享）。

---

## 三、功能需求

### 核心功能

#### 3.1 页面布局（4 面板）

- [ ] 页面采用固定 4 面板布局：左上**指标树**、中间**待选指标**、右上**标签集**、右下**规则**。
- [ ] 各面板宽度/高度可通过 `react-resizable-panels` 调整，默认比例符合调研报告中的示意图。
- [ ] 页面默认加载深色主题（`data-theme="dark"`），浅色主题作为后续迭代保留接口。

#### 3.2 待选指标区域

- [ ] 中间区域以自适应网格展示待选指标卡片（`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`）。
- [ ] 卡片显示指标名称、编码、一级/二级分类、状态徽章。
- [ ] 未挂靠任何树节点、标签、规则，且 **`indicatorType !== '虚拟分组'`** 的指标显示在待选区域。
- [ ] 已挂靠的指标保留在原位置，以禁用态显示（`opacity: 0.5`、绿色"已挂靠"徽章）。
- [ ] 数据量超过 100 条时自动启用虚拟滚动（推荐 `react-window` 或 `@tanstack/react-virtual`）。

#### 3.3 连线式挂靠

- [ ] 点击待选指标卡片进入**连线模式**：卡片显示品牌色边框 + 外发光 + 脉冲指示器，鼠标变为 `crosshair`。
- [ ] 从卡片锚点生成 SVG 虚线连线，跟随鼠标移动（`stroke-dasharray: 6 4` + 蚂蚁线流动动画）。
- [ ] 连线模式下非目标区域叠加 Spotlight Focus Mask（`rgba(15, 23, 42, 0.45)`），可挂靠目标排除在遮罩外。
- [ ] 无效目标应用 `saturate(0.3) brightness(0.6)` 滤镜，连线悬停无效目标时变红 + 光标 `not-allowed`。
- [ ] 有效目标悬停时触发三层 hover 反馈（边框高亮 `#3B82F6`、蓝色背景叠加、scale 1.02 脉冲），连线变绿色 `#22C55E`。
- [ ] 按 **空格** 确认挂靠，执行 fly-out 动画：源卡片飞向目标 → 目标双色环脉冲（蓝+绿）→ 显示 mini toast "✓ 指标已挂靠"。
- [ ] 按 **ESC** 取消连线，遮罩和连线 200ms 淡出，焦点返回源卡片。
- [ ] 误触空格（未悬停有效目标）时连线执行 shake 微反馈（±3px，150ms×2），连续 3 次后显示轻量提示文字。
- [ ] 支持"连续挂靠"开关：开启后确认一个挂靠仍保持连线模式，可直接点击下一个源指标。

#### 3.4 指标树（左上）

- [ ] 指标树以 `treeParentId` 关系渲染，采用**固定三层结构**（一级 → 二级 → 指标），通过 `indicatorType` 区分虚拟分组节点与真实指标。
- [ ] 树节点 hover 显示微妙背景色变化 + 左侧 4px 高亮条；选中状态显示显著背景色 + 实心强调条 + 文字加粗。
- [ ] 展开/收起动画：高度渐变（展开 250ms / 收起 200ms）+ 透明度渐变 + 箭头旋转。
- [ ] 面板标题栏 hover 显示 "+" 按钮，点击弹出添加节点弹窗（默认作为选中节点的子节点；**选中指标叶子节点时禁用添加**，无选中则作为根节点创建一级分组）。
- [ ] 节点 hover 显示编辑图标（✏️）和删除图标（🗑️），点击编辑图标触发 inline 编辑（Enter 保存 / Esc 取消 / blur 自动保存）。
- [ ] 删除节点采用三级渐进确认：空节点直接删 + Undo Toast；有子节点弹窗警告；有已挂靠指标特殊提示（指标将回到待选区）。
- [ ] 拖拽调整层级：节点左侧拖拽手柄（⋮⋮）触发，悬停目标高亮，间隙显示蓝色放置指示线，释放后 FLIP 动画。

#### 3.5 标签集（右上）

- [ ] 标签集以树状呈现，**同一层级标签一行并列显示**（Flexbox wrap）。
- [ ] 标签行数超过 3 行时折叠，显示 "+N" 展开按钮。
- [ ] 选中状态：背景 `#111B26`、边框 `#15417E`、文字 `#4DA6FF`、勾选图标、外发光。
- [ ] 半选状态：半填充勾选图标 + 半透明背景 + 虚线边框。
- [ ] 父子联动：选中父标签自动全选子标签；子标签部分选中时父标签半选；取消父标签同步取消所有子标签。
- [ ] **空格** = 选中/取消当前标签；**Ctrl+Alt+Shift+Space** = 全选当前层级。
- [ ] 面板顶部显示"已选 N 个"计数器 + "清空"按钮。
- [ ] 搜索框支持本地过滤，默认"高亮模式"（未匹配节点 opacity 0.35），可切换为"过滤模式"。
- [ ] 支持 8 色预设 + 自定义颜色。

#### 3.6 规则（右下）

- [ ] 规则以树状呈现，指标通过 `ruleIds` 多对多关联。
- [ ] 规则节点显示"已配置参数"智能摘要标签（如 `阈值: 80~120% · P2`）。
- [ ] 点击规则节点旁的"配置参数"图标，右侧滑出 480px Drawer。
- [ ] Drawer 内分三段：Content（核心参数）、Interaction（行为配置）、Appearance（显示设置），基础参数默认展开，高级参数折叠。
- [ ] 参数采用三层继承模型：自动继承父节点值、显式覆盖显示橙色左边框 + "已覆盖"徽章 + 恢复默认按钮、恢复继承一键还原。
- [ ] Hover 摘要标签显示完整参数 Tooltip。

#### 3.7 删除挂靠

- [ ] 主路径：hover 连线 → 连线高亮 → 中点浮现 "×" 删除按钮 → 点击删除 → 规则挂靠显示 Inline Confirm。
- [ ] 辅路径：hover 目标节点显示"已挂靠 N"徽章 → 点击展开列表面板 → 可逐条/全部删除。
- [ ] 补充路径：右键目标节点 Context Menu → 按类型/全部移除挂靠。
- [ ] 标签集和指标树挂靠删除后直接执行 + 5 秒 Undo Toast；规则挂靠轻量 Inline Confirm + Undo Toast。
- [ ] 删除父节点时，子指标保留并回到待选区域。

#### 3.8 部门切换

- [ ] Header 头像栏添加部门切换器，默认选中"财务部"。
- [ ] 切换部门后，左上指标树和右上标签集平滑切换（exit: opacity+x:-20 → enter: opacity+x:20→0，250ms）。
- [ ] 中间待选指标和右下规则区域全局不变。

#### 3.9 搜索与命令面板

- [ ] 标签集/规则面板顶部提供搜索框，支持 `/` 快捷键聚焦。
- [ ] 全局 **Cmd/Ctrl+K** 打开命令面板，支持搜索指标、标签、规则，选择后自动跳转定位。

#### 3.10 快捷键系统

- [ ] 实现焦点上下文管理：连线模式下 Space 统一确认挂靠；非连线模式下 Space 行为由焦点面板决定。
- [ ] 树导航遵循 WAI-ARIA TreeView：`↑↓` 移动、`→←` 展开收起、`Home/End` 跳转、`*` 展开同级。
- [ ] `F2` 重命名选中节点，`Delete` 删除选中节点，`Esc` 取消当前模态，`Ctrl+Z` 撤销。

#### 3.11 动画系统

- [ ] 建立 `motion.tokens.ts` 强制动画 Token，禁止硬编码。
- [ ] 11 个核心场景动画：节点展开/收起、节点添加/删除、连线出现/消失、卡片 hover/选中、挂靠成功、部门切换、搜索过滤、空状态出现。
- [ ] 所有动画支持 `prefers-reduced-motion` 降级。

### 异常与边界

- 当待选指标区域为空时，显示情境化空状态："暂无待选指标" + "从左侧指标树中添加指标" + 引导操作按钮。
- 当指标树/标签集/规则树为空时，显示对应的空状态插画和创建引导按钮（指标树为空时提示联系管理员）。
- 当用户尝试将指标挂接到已挂接的同一目标时，系统静默忽略（no-op）并微闪目标节点提示已存在关系。
- 当源指标在连线模式下滚出视口时，在视口边缘显示"源指标锚点标记"，点击后自动滚动回源位置。
- 当删除含有子节点的父节点时，子节点独立保留并回到待选区；若子节点数量 > 10，Undo Toast 增加"查看详情"入口。
- 当参数输入验证失败时（如上限 ≤ 下限），输入框边框变红，显示错误文本，Drawer 自动滚动到第一个错误字段。
- 当 localStorage 写入失败（如配额超限）时，降级为内存存储并显示非阻塞提示"本地存储已满，部分数据可能无法持久化"。
- 当部门数据正在异步加载时，树/标签集面板显示骨架屏，禁用连线模式入口。

---

## 四、技术方案

### 模块划分

| Module | 职责 | 新建/修改 |
|--------|------|----------|
| `src/models/indicatorAttachmentModel.ts` | 扩展 Indicator + 定义 TagNode / Rule / RuleParameter 类型 | 新建 |
| `src/stores/attachmentStore.ts` | 页面状态管理：待选指标、连线模式、undo 栈、部门数据 | 新建 |
| `src/utils/attachmentStorage.ts` | localStorage CRUD（`kgv2-` 前缀），持久化部门数据、树、标签集、规则 | 新建 |
| `src/hooks/useConnectionMode.ts` | 连线模式状态机：激活/取消/确认/悬停目标/连续模式 | 新建 |
| `src/hooks/useFocusTrap.ts` | 焦点陷阱、焦点记忆、焦点区域隔离 | 新建 |
| `src/components/motion/motion.tokens.ts` | 强制动画 Token 系统：时长、easing、spring | 新建 |
| `src/components/connection/ConnectionLayer.tsx` | SVG fixed 定位连线层，渲染进行中和已确认连线 | 新建 |
| `src/components/connection/FocusModeOverlay.tsx` | Spotlight mask / dimming 两种聚焦遮罩 | 新建 |
| `src/components/tree/TreeView.tsx` | 通用树组件：展开/收起、hover/选中、inline 编辑、拖拽手柄 | 新建 |
| `src/components/tree/CascadingStateEngine.ts` | 级联状态引擎：标签父子联动 + 规则参数继承 | 新建 |
| `src/components/indicator/IndicatorCard.tsx` | 指标卡片：四层状态渲染（默认/hover/选中/已挂靠） | 新建 |
| `src/components/indicator/IndicatorGrid.tsx` | 待选指标网格：响应式 + 虚拟滚动阈值控制 | 新建 |
| `src/pages/indicator-management/IndicatorAttachmentPage.tsx` | 4 面板页面容器 | 新建（替换占位） |
| `src/pages/indicator-management/TagSetPanel.tsx` | 标签集面板：并列多选、搜索、父子联动 | 新建 |
| `src/pages/indicator-management/RulePanel.tsx` | 规则面板：摘要标签、参数配置入口 | 新建 |
| `src/pages/indicator-management/ParameterDrawer.tsx` | 右侧 480px Drawer：参数表单、继承/覆盖模型 | 新建 |
| `src/styles/dark-theme.css` | 39 个深色 CSS 变量挂载到 `[data-theme="dark"]` | 新建 |
| `src/components/Header.tsx` | 修改：添加部门切换器 | 修改 |

### 关键接口

```typescript
// indicatorAttachmentModel.ts
interface Indicator {
  id: string;
  name: string;
  code: string;
  indicatorType: '虚拟分组' | '原子指标' | '派生指标';  // 区分虚拟分组与真实指标
  level1: string;
  level2: string;
  granularity: string;
  frequency: string;
  department: string;
  source?: string;
  treeParentId?: string;   // 指标树父节点（一对一归属）
  tagIds: string[];        // 标签集（多对多）
  ruleIds: string[];       // 规则（多对多）
}

interface TagNode {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  children?: TagNode[];
}

interface Rule {
  id: string;
  name: string;
  type: 'threshold' | 'fluctuation' | 'topn';
  parentId?: string;
  parameters?: RuleParameter[];
  children?: Rule[];
}

interface RuleParameter {
  ruleId: string;
  indicatorId: string;
  upperLimit?: number;
  lowerLimit?: number;
  unit?: string;
  level?: 'P1' | 'P2' | 'P3' | 'P4';
  isInherited?: boolean;
  overriddenFields?: string[];
}
```

```typescript
// useConnectionMode.ts
interface ConnectionState {
  isConnecting: boolean;
  sourceId: string | null;
  validTargetIds: Set<string>;
  hoverTargetId: string | null;
  targetType: 'tree' | 'tag' | 'rule' | null;
  isContinuous: boolean;
}

function useConnectionMode(): {
  state: ConnectionState;
  start(sourceId: string, targetType: 'tree' | 'tag' | 'rule'): void;
  cancel(): void;
  confirm(): boolean;
  setHoverTarget(id: string | null): void;
};
```

```typescript
// CascadingStateEngine.ts
interface CascadingStateEngine<T> {
  toggle(id: string): { selected: Set<string>; partial: Set<string> };
  selectAll(ids: string[]): { selected: Set<string>; partial: Set<string> };
  clear(): { selected: Set<string>; partial: Set<string> };
}
```

### 架构决策

- **状态管理**：采用 Zustand 单 store 管理页面级状态（连线模式、部门、undo 栈），避免 props drilling。组件级状态保留 `useState`。
- **存储策略**：热数据（当前展开状态、选中项）存 localStorage（`kgv2-attachment-ui`）；温数据（部门完整数据、树结构缓存）存 IndexedDB（通过 `idb` 库），避免 localStorage 5MB 限制和阻塞写入。
- **SVG vs Canvas**：连线层在 <50 条线时使用 SVG `<path>` + CSS `stroke-dashoffset`；50-200 条引入视口裁剪；>200 条时静态连线切换 Canvas（V2 预留）。
- **动画库**：Framer Motion 处理 DOM 进出动画（`AnimatePresence`）和 spring 物理动画；CSS transition 处理 hover/focus 等简单反馈；SVG 连线动画用 CSS。
- **虚拟滚动阈值**：<100 条全量渲染；100-500 条启用 `react-window`；>500 条追加客户端过滤。拖拽排序时临时禁用虚拟滚动。
- **主题**：先实现深色主题蓝黑色调，浅色主题保留切换接口但本期不做。
- **废弃模块**：本期不删除 `/noc/*` 和 `/platform/*`，仅在 Sidebar 中隐藏入口；审核流程清理单独提 issue。

---

## 五、数据模型

### Schema 变更

- `Indicator.indicatorType` — 新增字段，区分 `'虚拟分组'` / `'原子指标'` / `'派生指标'`。
- `Indicator.treeParentId?: string` — 指标树中的父节点 ID，一对一归属。**一级虚拟分组节点 `treeParentId` 为 `undefined`；真实指标 `treeParentId` 为 `undefined` 时表示待挂靠。**
- `Indicator.tagIds: string[]` — 关联标签 ID 数组，多对多，默认空数组。
- `Indicator.ruleIds: string[]` — 关联规则 ID 数组，多对多，默认空数组。

### 新增实体

- `TagNode` — 标签集节点，独立存储，支持层级（`parentId`）。**本期扁平化为 2 层深度。**
- `Rule` — 规则节点，独立存储，支持层级（`parentId`）。**本期扁平化为 2 层深度。**
- `RuleParameter` — 规则参数实例，联合主键 `(ruleId, indicatorId)`，记录是否继承、哪些字段被覆盖。

### 持久化 Key

- `kgv2-attachment-departments` — 部门列表。
- `kgv2-attachment-indicators-{departmentId}` — 部门指标平表。
- `kgv2-attachment-tagnodes-{departmentId}` — 部门标签集。
- `kgv2-attachment-rules` — 规则树（全局）。
- `kgv2-attachment-rule-params` — 规则参数（全局）。
- `kgv2-attachment-ui` — UI 状态（展开节点、选中项、部门选择）。

### 数据迁移

- 首次加载时若检测到旧 `kg-` 前缀数据，不自动迁移（v2 与 v1 数据模型不兼容），显示新用户引导空状态。

---

## 六、测试策略

**测试范围**

- `src/utils/attachmentStorage.ts`
- `src/hooks/useConnectionMode.ts`
- `src/components/tree/CascadingStateEngine.ts`
- `src/components/tree/TreeView.tsx`
- `src/components/indicator/IndicatorCard.tsx`

**测试重点**

- Storage：CRUD 正确性、undo/redo 行为、`kgv2-` 前缀隔离、localStorage 超限降级。
- useConnectionMode：状态机转换表覆盖（browse→connecting→confirmed→browse）、空格/ESC 处理、连续模式开关、误触计数器。
- CascadingStateEngine：父子联动（父选全选子、子部分选中父半选、同级全选快捷键）、参数继承（默认继承、显式覆盖、恢复继承）。
- TreeView：展开/收起动画状态、inline 编辑三通道确认（Enter/Esc/blur）、删除三级策略的弹窗判断、拖拽放置位置计算。
- IndicatorCard：四种状态渲染差异、连线模式入口点击事件、已挂靠状态 hover 提示。

**Prior art**

- 参考 `src/utils/indicatorStorage.test.ts` 的 localStorage mock 和 CRUD 断言风格。
- 参考 `src/pages/noc/inspection/InspectionPlanForm.test.tsx` 等现有交互测试对 `userEvent` 和 `screen` 的使用方式。
- 参考 `src/models/indicatorModel.test.ts` 对 Zod schema 和类型约束的测试。

---

## 七、范围边界

**本期做**：
- `/indicator-management` 页面的完整 4 面板布局与连线式挂靠交互。
- 指标树、标签集、规则的 CRUD 与拖拽调级。
- 深色主题 CSS 变量系统与基础动画 Token。
- 规则参数配置的右侧 Drawer 与三层继承模型。
- 删除挂靠的分级确认 + Undo Toast。
- Header 部门切换器。
- 搜索过滤与 Cmd+K 命令面板。
- 焦点管理、快捷键、WCAG AA 对比度、`prefers-reduced-motion` 降级。

**本期不做**：
- 浅色主题的完整色值填充（保留切换接口）。
- 跨面板拖拽（V2 预留）。
- 自然语言命令面板（"挂靠 指标A 到 规则B"）。
- 已挂靠指标在卡片上显示目标详情（仅保留"已挂靠"徽章）。
- 删除 v1 废弃模块（`/noc/*`、`/platform/*`）——仅隐藏入口，清理单独 issue。
- v1 审核流程清理（create/edit/knowledge-management 中的审核文案）——单独 issue。
- 服务端同步（本期为纯 local Demo）。
- Canvas 混合渲染（>200 条连线时降级方案 V2 做）。

---

## 八、排期与依赖

**前置依赖**：
- 无外部依赖；基于现有 v2 技术栈（React 19 + Vite + Tailwind + shadcn/ui + framer-motion）实现。
- 需要确认 `react-window` 或 `@tanstack/react-virtual` 依赖是否已安装（当前未安装，需 `npm add`）。

**里程碑**：
- **Phase 1（1 周）**：深色主题 Token + 4 面板静态布局 + 静态树/卡片组件。
- **Phase 2（1-1.5 周）**：连线交互 + 树 CRUD + 拖拽调级 + 焦点管理。
- **Phase 3（1 周）**：标签集多选 + 规则面板 + 参数 Drawer + 删除确认。
- **Phase 4（0.5 周）**：搜索/命令面板 + 快捷键 + 性能优化 + 测试补齐 + WCAG 审计。

**建议拆分方式**：
按上述 Phase 拆分为 4 个独立可交付的 issues，每个 issue 包含对应模块和测试。

---

## 修订记录

| 日期 | 修订内容 | 修订人 |
|------|---------|--------|
| 2026-06-07 | 根据 CONTEXT.md 确认的指标树三层结构，修正 PRD 中以下偏差：<br>1. 指标树由"无限层级"改为"固定三层"（一级→二级→指标）；<br>2. `Indicator` 接口补充 `indicatorType` 字段；<br>3. 待选指标定义增加排除 `indicatorType === '虚拟分组'` 条件；<br>4. `treeParentId` 含义明确区分"一级根节点"与"待挂靠指标"；<br>5. 添加节点逻辑限制"指标叶子节点禁用添加子节点"；<br>6. `TagNode` / `Rule` 描述补充"本期扁平化为 2 层"。 | Agent |
