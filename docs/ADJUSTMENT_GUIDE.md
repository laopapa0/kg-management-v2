# KG Management V2 - 完整调整指导文件（最终版）

> 本文档记录了云平台对话微调阶段对 `kg-management-v2` 项目的全部修改。
> 
> **核心根因**：项目使用 `data-theme` 属性切换主题，但 `tailwind.config.js` 配置 `darkMode: ["class"]` 期望 `.dark` 类。这导致所有 shadcn/ui 组件中的 `dark:` 前缀**完全不生效**，表现为按钮白色背景、Tabs 浅色样式、文字颜色错误等。
> 
> **修复原则**：所有 shadcn/ui 组件必须**显式使用项目自定义 CSS 变量类名**（如 `bg-transparent`、`border-dark-border`、`text-dark-text-primary` 等），不能依赖 `dark:` 前缀。

---

## 修改概览

### 布局类（5项）
| 批注 | 文件 | 修改内容 |
|------|------|----------|
| #1 | `IndicatorTreePanel.tsx` | 文字超长截断（`truncate` + `min-w-0`） |
| #3 | `IndicatorAttachmentPage.tsx` + `Layout.tsx` | 页面固定高度，三区域独立滚动 |
| #4 | `TagSetPanel.tsx` | 标签集面板 `flex-1` + `overflow-y-auto` |
| #5 | `IndicatorGrid.tsx` | 指标网格 `flex-1` + `overflow-y-auto` |
| #6 | `RulePanel.tsx` | 规则面板 `flex-1` + `overflow-y-auto` |

### 暗色主题类（9项）
| 批注 | 文件 | 修改内容 |
|------|------|----------|
| #7 | `getNodeStyle.ts` + `LineageCanvasPage.tsx` | 画布节点/关系颜色 |
| #8 | `LineageCanvasPage.tsx` | 关系链接/置信度标签颜色 |
| #9 | `ReportManagementPage.tsx` | 计划标签背景色 |
| #10 | `FilterScopeSelector.tsx` | 标签范围改为 TreeView |
| #11 | `FilterScopeSelector.tsx` | 剔除规则改为 TreeView |
| #12 | `KnowledgeUploadPage.tsx` | TabsList 背景 |
| #13 | `KnowledgeUploadPage.tsx` | 「重置」按钮 outline 样式 |
| #14 | `KnowledgeUploadPage.tsx` | 「预览块」按钮 outline 样式 |
| 新增 | `ReportManagementPage.tsx` | 「生成报告」按钮 outline 样式 |
| 新增 | `ReportPlanDialog.tsx` | 「取消」按钮 outline 样式 |
| 新增 | `KnowledgeUploadPage.tsx` | TabsTrigger 未选中/选中配色 |
| 新增 | `DashboardPage.tsx` | 工作台/快捷入口标题文字色 |

---

## 核心修复原理

### 高度链传递（解决 #3 #4 #5 #6）

页面要「像血缘画布那样一页展示，整体不滚动，三个区域分别滚动」，需要正确的高度链：

```
Layout.tsx:
  <main className="pt-12 h-[calc(100dvh-0px)] overflow-hidden">  ← 固定高度，禁止溢出
    <div className="p-6 h-full">                                    ← 高度100%
      {children}                                                   ← 子页面

IndicatorAttachmentPage.tsx:
  <div className="relative h-full w-full">                         ← 继承高度
    <Group className="h-full">                                     ← 高度100%
      <Panel>
        <div className="flex h-full flex-col">                     ← flex列布局
          <PanelHeader />                                          ← 固定高度header
          <div className="flex-1 overflow-y-auto">...</div>        ← 内容区：占据剩余空间+内部滚动
```

**关键**：`flex-1` 让内容区占据 header 以外的剩余空间，`overflow-y-auto` 让内容超出时内部滚动。不要用 `h-full`（会和 header 叠加溢出），也不要用 `h-1/2`（会和 Panel 的 size 设置冲突）。

### shadcn 按钮 outline 暗色适配（解决所有按钮问题）

shadcn Button `variant="outline"` 的默认样式依赖 `dark:` 前缀，但项目中不生效。需要显式覆盖所有状态：

```tsx
<Button
  variant="outline"
  className="
    bg-transparent                    ← 透明背景（覆盖默认白色）
    border-dark-border                ← 暗色边框
    text-dark-text-primary            ← 暗色文字
    hover:bg-dark-card-l2             ← hover暗色背景
    hover:text-dark-text-primary      ← hover暗色文字
    hover:border-dark-border-hover    ← hover暗色边框（可选）
  "
>
```

### shadcn TabsTrigger 暗色适配

同样，`dark:` 前缀不生效，需要显式覆盖：

```tsx
<TabsTrigger
  className="
    text-dark-text-secondary                          ← 未选中文字色
    data-[state=active]:bg-dark-card-l1               ← 选中背景色
    data-[state=active]:text-dark-text-primary         ← 选中文字色
  "
>
```

---

## 详细修改说明

### 一、Layout.tsx - 高度链修复

**文件**：`src/components/Layout.tsx`

**修改1**（第27行，main className）：
```tsx
// 修改前：
className="pt-12 min-h-[100dvh] transition-[margin] duration-250"
// 修改后：
className="pt-12 h-[calc(100dvh-0px)] overflow-hidden transition-[margin] duration-250"
```

**修改2**（第34行，children wrapper）：
```tsx
// 修改前：
<div className="p-6">
// 修改后：
<div className="p-6 h-full">
```

---

### 二、IndicatorAttachmentPage.tsx - 布局高度

**文件**：`src/pages/indicator-management/IndicatorAttachmentPage.tsx`

**修改1**（最外层 div className）：
```tsx
// 修改前：
className="relative h-full w-full bg-dark-page p-3 text-dark-text-primary"
// 修改后：
className="relative h-full w-full text-dark-text-primary"
```
移除 `bg-dark-page`（Layout 已提供背景）和 `p-3`（Layout 已有 p-6）。

**修改2**（中间 Panel header div，添加 `shrink-0`）：
```tsx
// 修改前：
className="flex items-center justify-between px-3 py-2"
// 修改后：
className="flex items-center justify-between shrink-0 px-3 py-2"
```

---

### 三、IndicatorTreePanel.tsx - 文字截断 + 滚动

**文件**：`src/pages/indicator-management/IndicatorTreePanel.tsx`

**修改1**（文字截断，第309行外层 div 加 `min-w-0`，第312行 span 加 `truncate`）：
```tsx
<div className="flex items-center justify-between gap-2">
  <div className="flex flex-col justify-center min-w-0">   ← 新增 min-w-0
    <span className="text-body leading-tight truncate">     ← 新增 truncate
      {node.indicator.name}
    </span>
```

**修改2**（两个容器 div 的 className，第265行和第277行）：
```tsx
// 修改前：
className="... overflow-y-auto ..."   // 可能有 h-full 或 flex-1
// 统一为：
className="flex-1 overflow-y-auto px-2 pb-2"
```

---

### 四、IndicatorGrid.tsx - 网格滚动

**文件**：`src/components/indicator/IndicatorGrid.tsx`

**修改**（第15行 GRID_CLASSES）：
```tsx
// 修改前：
const GRID_CLASSES = 'grid grid-cols-1 gap-4 overflow-y-auto p-4 ...'
// 修改后：
const GRID_CLASSES = 'grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 ...'
```

---

### 五、TagSetPanel.tsx - 标签集滚动

**文件**：`src/pages/indicator-management/TagSetPanel.tsx`

**修改**（第240行和第251行两个容器 div）：
```tsx
// 修改前（可能为 h-full 或 h-1/2）：
className="h-1/2 overflow-y-auto px-3 pb-2"
// 修改后：
className="flex-1 overflow-y-auto px-3 pb-2"
```

---

### 六、RulePanel.tsx - 规则面板滚动

**文件**：`src/pages/indicator-management/RulePanel.tsx`

**修改**（第210行和第221行两个容器 div）：
```tsx
// 修改前（可能为 h-full 或 h-1/2）：
className="h-1/2 overflow-y-auto px-2 pb-2"
// 修改后：
className="flex-1 overflow-y-auto px-2 pb-2"
```

---

### 七、getNodeStyle.ts - 画布节点暗色背景

**文件**：`src/pages/lineage/getNodeStyle.ts`

**全部替换**：
```tsx
export interface NodeStyle {
  borderColor: string;
  bgColor: string;
}

export function getNodeStyle(role: string): NodeStyle {
  switch (role) {
    case 'root':
      return { borderColor: '#dc2626', bgColor: '#450a0a' };
    case 'anomaly':
      return { borderColor: '#f59e0b', bgColor: '#451a03' };
    case 'affected':
      return { borderColor: '#7c5cfc', bgColor: '#2e1065' };
    case 'normal':
      return { borderColor: '#10b981', bgColor: '#064e3b' };
    default:
      return { borderColor: '#9ba4b3', bgColor: '#1e293b' };
  }
}
```

---

### 八、LineageCanvasPage.tsx - 画布颜色

**文件**：`src/pages/lineage/LineageCanvasPage.tsx`

**修改1**（第477行，节点默认 fill）：
```tsx
fill={isSelected ? bgColor : '#1e293b'}
```

**修改2**（第500行，节点名称文字 fill）：
```tsx
fill="#e2e8f0"
```

**修改3**（第350行，网格背景点）：
```tsx
<circle cx="10" cy="10" r="1.5" fill="#334155" />
```

**修改4**（第394-398行，关系标签 rect）：
```tsx
fill="#1e293b"
stroke={isHighlighted ? '#3478f6' : '#334155'}
```

**修改5**（第424-441行，置信度标签背景和文字）：
```tsx
fill={
  rel.confidence >= 80 ? '#064e3b'
  : rel.confidence >= 50 ? '#78350f'
  : '#7f1d1d'
}
// ...
fill={
  rel.confidence >= 80 ? '#34d399'
  : rel.confidence >= 50 ? '#fbbf24'
  : '#f87171'
}
```

---

### 九、ReportManagementPage.tsx - 按钮 + 标签

**文件**：`src/pages/report-management/ReportManagementPage.tsx`

**修改1**（第87-95行，「生成报告」按钮）：
```tsx
<Button
  variant="outline"
  onClick={() => navigate('/reports/generate')}
  className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
>
  <Play size={16} />
  生成报告
</Button>
```

**修改2**（第147行，计划排期标签背景）：
```tsx
<span className="rounded-full bg-[#1e293b] px-2 py-0.5 text-xs text-dark-text-secondary">
```

---

### 十、ReportPlanDialog.tsx - 取消按钮

**文件**：`src/components/dialog/ReportPlanDialog.tsx`

**修改**（第129-135行）：
```tsx
<Button
  variant="outline"
  onClick={() => onOpenChange(false)}
  className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
>
  取消
</Button>
```

---

### 十一、KnowledgeUploadPage.tsx - Tabs + 按钮

**文件**：`src/pages/knowledge-upload/KnowledgeUploadPage.tsx`

**修改1**（第171-174行，TabsList + TabsTrigger）：
```tsx
<TabsList className="mb-4 bg-dark-card-l2 border border-dark-border">
  <TabsTrigger
    value="upload"
    className="text-dark-text-secondary data-[state=active]:bg-dark-card-l1 data-[state=active]:text-dark-text-primary"
  >
    上传新文档
  </TabsTrigger>
  <TabsTrigger
    value="my"
    className="text-dark-text-secondary data-[state=active]:bg-dark-card-l1 data-[state=active]:text-dark-text-primary"
  >
    我的文档
  </TabsTrigger>
</TabsList>
```

**修改2**（第274行附近，「重置」按钮）：
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={handleReset}
  className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
>
```

**修改3**（第362行附近，「预览块」按钮）：
```tsx
<Button
  variant="outline"
  onClick={handlePreviewChunks}
  className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
>
```

---

### 十二、FilterScopeSelector.tsx - 树形展示

**文件**：`src/components/report/FilterScopeSelector.tsx`

**修改1**（标签范围，替换简单列表为 TreeView）：
```tsx
<TreeView
  nodes={tagTree}
  renderNode={(node) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        data-testid={`scope-tag-checkbox-${node.id}`}
        checked={checkedTagIds.has(node.id)}
        onChange={() => toggleTag(node.id)}
        onClick={(e) => e.stopPropagation()}
        className="size-4 cursor-pointer accent-dark-accent-primary"
      />
      <span className="text-sm text-dark-text-secondary">{node.name}</span>
    </label>
  )}
/>
```

**修改2**（剔除规则，同上替换为 TreeView）：
```tsx
<TreeView
  nodes={allRules}
  renderNode={(node) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        data-testid={`scope-rule-checkbox-${node.id}`}
        checked={checkedRuleIds.has(node.id)}
        onChange={() => toggleRule(node.id)}
        onClick={(e) => e.stopPropagation()}
        className="size-4 cursor-pointer accent-dark-accent-primary"
      />
      <span className="text-sm text-dark-text-secondary">{node.name}</span>
    </label>
  )}
/>
```

---

### 十三、TagPill.tsx - 树中标签不用颜色

**文件**：`src/components/tag/TagPill.tsx`

**修改1**：TagPillProps 接口添加 `inTree?: boolean`

**修改2**：组件参数解构添加 `inTree = false`

**修改3**：修改 baseColor 和 style：
```tsx
const baseColor = inTree ? 'transparent' : (tag.color ?? '#64748B')
// ...
style={{
  borderColor: isChecked ? '#15417E' : (inTree ? 'var(--dark-border-color, #334155)' : baseColor),
  backgroundColor: (hasColorBackground && !inTree) ? `${tag.color}1A` : undefined,
}}
```

---

### 十四、DashboardPage.tsx - 文字颜色

**文件**：`src/pages/dashboard/DashboardPage.tsx`

**修改**（最外层 div）：
```tsx
// 修改前：
<div>
// 修改后：
<div className="text-dark-text-primary">
```

---

## 本地 Agent 操作步骤

### 1. 获取最新代码
```bash
cd kg-management-v2
git pull origin main
```

### 2. 按文件顺序修改

建议按以下顺序修改，避免冲突：

1. `src/components/Layout.tsx`
2. `src/pages/indicator-management/IndicatorAttachmentPage.tsx`
3. `src/pages/indicator-management/IndicatorTreePanel.tsx`
4. `src/components/indicator/IndicatorGrid.tsx`
5. `src/pages/indicator-management/TagSetPanel.tsx`
6. `src/pages/indicator-management/RulePanel.tsx`
7. `src/pages/lineage/getNodeStyle.ts`
8. `src/pages/lineage/LineageCanvasPage.tsx`
9. `src/pages/report-management/ReportManagementPage.tsx`
10. `src/components/dialog/ReportPlanDialog.tsx`
11. `src/pages/knowledge-upload/KnowledgeUploadPage.tsx`
12. `src/components/report/FilterScopeSelector.tsx`
13. `src/components/tag/TagPill.tsx`
14. `src/pages/dashboard/DashboardPage.tsx`

### 3. 构建验证
```bash
npm install
npx vite build
```

### 4. 提交推送
```bash
git add -A
git commit -m "fix: 14项批注调整 + 布局/暗色主题全面修复

- 修复 Layout 高度链，指标管理页面三区域独立滚动
- 修复所有 shadcn outline 按钮暗色样式（bg-transparent + hover）
- 修复 TabsTrigger 未选中/选中暗色配色
- 修复血缘画布节点/关系暗色颜色
- 修复 Dashboard 文字颜色继承
- 标签范围/剔除规则改为 TreeView 树形展示
- 标签树中 TagPill 不使用彩色边框"
git push origin main
```

---

## 修改统计

| 类别 | 数量 |
|------|------|
| 布局调整（高度链 + flex-1 + overflow） | 6 项 |
| 文字截断 | 1 项 |
| 暗色主题颜色对齐（画布） | 2 项 |
| 按钮 outline 暗色适配 | 4 项 |
| Tabs 暗色适配 | 1 项 |
| 树形展示升级 | 2 项 |
| TagPill inTree 扩展 | 1 项 |
| 文字颜色修复 | 2 项 |
| **合计** | **19 项** |

---

## 部署验证

部署地址：https://xe5m2ln4cvvyi.ok.kimi.link

验证清单：
- [x] 指标管理页面一屏展示，三个区域各自独立滚动
- [x] 指标树文字超长时显示省略号
- [x] 血缘画布节点选中后暗色背景（非白色）
- [x] 所有 outline 按钮透明背景 + 暗色边框 + hover 效果
- [x] TabsTrigger 未选中/选中状态配色正确
- [x] Dashboard 工作台/快捷入口标题文字色正确
- [x] 标签范围/剔除规则以 TreeView 树形展示
- [x] 标签树中标签不使用彩色边框
