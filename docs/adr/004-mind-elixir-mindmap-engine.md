# ADR-004: Mind Elixir 5 作为脑图渲染引擎

## 状态

已接受

## 上下文

指标树需要新增脑图可视化视图（思维导图形式），与现有列表树视图可切换。需要选择渲染方案。

### 评估的方案

| 方案 | 新增依赖 | React 节点支持 | 深色主题 | 开发成本 |
|------|:--:|:--:|:--:|:--:|
| ECharts tree | 0 | ❌ Canvas | 手动映射 | 中 |
| @antv/g6 | 1 (500KB+) | ❌ Canvas | 手动映射 | 高 |
| 自建（DnD-Kit + SVG） | 0 | ✅ | 自动 | 极高 |
| **Mind Elixir 5** | 1 (~80KB) | ❌（无 React 组件注入） | CSS 变量 | 低 |

### 真实权衡

- 自建方案可以利用项目的 DnD-Kit、Framer Motion、SVG 连接线等基础设施，但需要手写树布局算法、缩放平移、多选、撤销等交互——这些 Mind Elixir 已内置。手写成本极高且容易引入 bug。
- ECharts tree 零新依赖，但 Canvas 渲染无法注入 React 组件，自定义节点 UI 困难。
- @antv/g6 功能最强但包体积大（500KB+），配置复杂度高，与 Tailwind CSS 深色主题集成需要大量手动映射。

## 决策

选用 **Mind Elixir 5**（`mind-elixir` npm 包，MIT 协议，3.1k GitHub stars）。

## 后果

### 正面

- **低成本**：仅新增一个 ~80KB 依赖。提供内置拖拽、编辑、撤销重做、多选、导出、键盘快捷键等功能，无需从零实现
- **框架无关**：纯 JS 核心，可在 React 组件中用 `new MindElixir({ el })` 实例化
- **主题兼容**：通过 CSS 变量覆盖适配项目深色主题（`--main-color`、`--bgcolor` 等映射到 `--dark-*`）
- **活跃维护**：v5.12.2（2026-05），TypeScript 源码，有 React wrapper 生态（`mind-elixir-react`）

### 负面

- **非 React 原生**：数据通信走 event bus 回调，需要 adapter 做双向同步（平表 ↔ 嵌套树）
- **撤销机制冲突**：Mind Elixir 内置 undo/redo，需禁用走项目 Zustand store 统一管理
- **节点 UI 受限**：节点内容为 HTML 字符串而非 React 组件，无法直接复用项目组件（如 AttachedBadge）
- **z-index 层级**：脑图画布层与现有 SVG 连线层（ConnectionLayer）可能冲突，需控制焦点区域优先级

### 架构约束

- Mind Elixir 只作视图渲染层，数据主权在 `attachmentStore`（Zustand 平表）
- 编辑同步：Mind Elixir `operation` event → `attachmentStore` action（增量）
- 外部变更同步：`indicators` 变化 → `mind.refresh()`（全量）
- 实例生命周期：懒创建 + 存活保持，切换视图时不销毁（避免重建开销）
