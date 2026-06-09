# KG Management V2 - 完整调整指导文件（最终版）

> 本文档记录了云平台对话微调阶段对 `kg-management-v2` 项目的全部修改。本地 Agent 可按此文件逐条修改代码后同步到 GitHub。

---

## 核心根因

### 根因 1：`:root` 缺少暗色默认变量

项目默认暗色主题，但 `:root` 未定义 shadcn 变量（`--background` 等），导致 Dialog 弹窗等组件显示白色背景。

**修复**：在 `:root` 中定义暗色默认的 shadcn 变量，`[data-theme="light"]` 在 `dark-theme.css` 中覆盖为浅色值。

### 根因 2：`darkMode` 配置不匹配

`tailwind.config.js` 的 `darkMode: ["class"]` 期望 `.dark` 类，但项目用 `data-theme` 属性切换主题。

**修复**：改为 `darkMode: ["variant", "&:where([data-theme*=dark], [data-theme*=dark] *)"]`。

---

## 修改文件清单（共 20 个文件）

### 配置文件（3 个）

#### 1. `tailwind.config.js`
```js
darkMode: ["variant", "&:where([data-theme*=dark], [data-theme*=dark] *)"],
```

#### 2. `src/index.css` - `:root` 暗色默认变量
```css
@layer base {
  :root {
    --background: 222 47% 9%;
    --foreground: 210 20% 93%;
    --card: 222 30% 15%;
    --card-foreground: 210 20% 93%;
    --popover: 222 30% 15%;
    --popover-foreground: 210 20% 93%;
    --primary: 217 91% 65%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 20% 18%;
    --secondary-foreground: 210 20% 93%;
    --muted: 220 20% 18%;
    --muted-foreground: 215 16% 62%;
    --accent: 222 30% 23%;
    --accent-foreground: 210 20% 96%;
    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 98%;
    --border: 220 13% 20%;
    --input: 220 13% 20%;
    --ring: 217 91% 65%;
    --radius: 0.5rem;
    --sidebar-background: 220 20% 12%;
    --sidebar-foreground: 215 16% 70%;
    --sidebar-primary: 217 91% 65%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 220 20% 18%;
    --sidebar-accent-foreground: 210 20% 93%;
    --sidebar-border: 220 13% 20%;
    --sidebar-ring: 217 91% 65%;

    /* Design system CSS variables */
    --primary-50: #eef4ff;
    --primary-100: #d9e6ff;
    --primary-200: #bcd3ff;
    --primary-300: #8eb8ff;
    --primary-400: #5a96ff;
    --primary-500: #3478f6;
    --primary-600: #1d5ee0;
    --primary-700: #154bc4;
    --gray-0: #ffffff;
    --gray-50: #f8f9fb;
    --gray-100: #f1f3f6;
    --gray-150: #e8ecf1;
    --gray-200: #dde1e8;
    --gray-300: #c4cad4;
    --gray-400: #9ba4b3;
    --gray-500: #6b7789;
    --gray-600: #4a5568;
    --gray-700: #2d3748;
    --gray-800: #1a202c;
    --gray-900: #0f172a;
    --success-50: #ecfdf5;
    --success-500: #10b981;
    --success-600: #059669;
    --warning-50: #fffbeb;
    --warning-500: #f59e0b;
    --warning-600: #d97706;
    --error-50: #fef2f2;
    --error-500: #ef4444;
    --error-600: #dc2626;
    --info-50: #eff6ff;
    --info-500: #3b82f6;
    --accent-noc: #7c5cfc;
    --accent-platform: #0ea5e9;
  }
}
```

#### 3. `src/styles/dark-theme.css` - 全局暗色滚动条
```css
[data-theme*="dark"] ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
[data-theme*="dark"] ::-webkit-scrollbar-track {
  background: var(--dark-scrollbar-track);
}
[data-theme*="dark"] ::-webkit-scrollbar-thumb {
  background: var(--dark-scrollbar-thumb);
  border-radius: 4px;
}
[data-theme*="dark"] ::-webkit-scrollbar-thumb:hover {
  background: #64748B;
}
[data-theme*="dark"] * {
  scrollbar-width: thin;
  scrollbar-color: var(--dark-scrollbar-thumb) var(--dark-scrollbar-track);
}
```

### 布局文件（4 个）

#### 4. `src/components/Layout.tsx`
```tsx
<main className="pt-12 h-[calc(100dvh-0px)] overflow-hidden ...">
  <div className="p-6 h-full">
```

#### 5. `src/pages/indicator-management/IndicatorAttachmentPage.tsx`
```tsx
<div className="relative h-full w-full text-dark-text-primary">
  {/* header */}
  <div className="flex items-center justify-between shrink-0 px-3 py-2">
```

#### 6. `src/pages/indicator-management/IndicatorTreePanel.tsx`
```tsx
{/* 文字截断 */}
<div className="flex flex-col justify-center min-w-0">
  <span className="text-body leading-tight truncate">

{/* 两个容器 div 都改为 */}
className="flex-1 overflow-y-auto px-2 pb-2"
```

#### 7. `src/components/indicator/IndicatorGrid.tsx`
```tsx
const GRID_CLASSES =
  'grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2 ...'
```

### 面板文件（2 个）

#### 8. `src/pages/indicator-management/TagSetPanel.tsx`
```tsx
className="flex-1 overflow-y-auto px-3 pb-2"
```

#### 9. `src/pages/indicator-management/RulePanel.tsx`
```tsx
className="flex-1 overflow-y-auto px-2 pb-2"
```

### 画布文件（2 个）

#### 10. `src/pages/lineage/getNodeStyle.ts`
```tsx
export function getNodeStyle(role: string): NodeStyle {
  switch (role) {
    case 'root':    return { borderColor: '#dc2626', bgColor: '#450a0a' };
    case 'anomaly': return { borderColor: '#f59e0b', bgColor: '#451a03' };
    case 'affected':return { borderColor: '#7c5cfc', bgColor: '#2e1065' };
    case 'normal':  return { borderColor: '#10b981', bgColor: '#064e3b' };
    default:        return { borderColor: '#9ba4b3', bgColor: '#1e293b' };
  }
}
```

#### 11. `src/pages/lineage/LineageCanvasPage.tsx`
```tsx
// 节点默认 fill
fill={isSelected ? bgColor : '#1e293b'}

// 节点名称文字 fill
fill="#e2e8f0"

// 关系标签 rect
fill="#1e293b"
stroke={isHighlighted ? '#3478f6' : '#334155'}

// 置信度标签背景
fill={rel.confidence >= 80 ? '#064e3b' : rel.confidence >= 50 ? '#78350f' : '#7f1d1d'}

// 置信度标签文字
fill={rel.confidence >= 80 ? '#34d399' : rel.confidence >= 50 ? '#fbbf24' : '#f87171'}

// 弹窗 1：创建关系
<DialogContent className="sm:max-w-[560px] bg-dark-card-l1 text-dark-text-primary border-dark-border">
  <DialogTitle className="text-[18px] text-dark-text-primary">

// 弹窗 2：血缘预览
<DialogContent className="sm:max-w-[900px] ... bg-dark-card-l1 text-dark-text-primary border-dark-border">
  <DialogTitle className="text-[18px] ... text-dark-text-primary">

// 弹窗 outline 按钮
className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
```

### 报告文件（2 个）

#### 12. `src/pages/report-management/ReportManagementPage.tsx`
```tsx
// 生成报告按钮
className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"

// 计划标签背景
<span className="rounded-full bg-[#1e293b] px-2 py-0.5 text-xs text-dark-text-secondary">
```

#### 13. `src/components/dialog/ReportPlanDialog.tsx`
```tsx
className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
```

### 知识上传文件（1 个）

#### 14. `src/pages/knowledge-upload/KnowledgeUploadPage.tsx`
```tsx
// TabsList + TabsTrigger
<TabsList className="mb-4 bg-dark-card-l2 border border-dark-border">
  <TabsTrigger
    value="upload"
    className="text-dark-text-secondary data-[state=active]:bg-dark-card-l1 data-[state=active]:text-dark-text-primary"
  >

// 所有 Label
<Label className="text-[13px] text-dark-text-primary font-medium">

// select 文字颜色
<select className="text-[13px] text-dark-text-primary ...">

// 两个弹窗 DialogContent
<DialogContent className="bg-dark-card-l1 text-dark-text-primary border-dark-border">
  <DialogTitle className="text-dark-text-primary">

// outline 按钮
className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
```

### 其他组件文件（5 个）

#### 15. `src/components/report/FilterScopeSelector.tsx`
```tsx
<TreeView
  nodes={tagTree}
  renderNode={(node) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
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

#### 16. `src/components/tag/TagPill.tsx`
```tsx
export interface TagPillProps {
  // ...
  inTree?: boolean
}

const baseColor = inTree ? 'transparent' : (tag.color ?? '#64748B')
style={{
  borderColor: isChecked ? '#15417E' : (inTree ? 'var(--dark-border-color, #334155)' : baseColor),
  backgroundColor: (hasColorBackground && !inTree) ? `${tag.color}1A` : undefined,
}}
```

#### 17. `src/pages/dashboard/DashboardPage.tsx`
```tsx
<div className="text-dark-text-primary">
  <h1 className="text-display text-dark-text-primary">工作台</h1>
```

#### 18. `src/components/ui/dialog.tsx`
```tsx
className={cn(
  "bg-background text-foreground ...",
  className
)}
```

#### 19. `src/components/ui/input.tsx`
```tsx
"text-foreground file:text-foreground placeholder:text-muted-foreground ..."
```

#### 20. `src/components/ui/textarea.tsx`
```tsx
"text-foreground border-input placeholder:text-muted-foreground ..."
```

---

## 布局原则

### 一屏展示，三区域独立滚动

```
Layout.tsx:
  <main className="pt-12 h-[calc(100dvh-0px)] overflow-hidden">
    <div className="p-6 h-full">
      {children}

IndicatorAttachmentPage.tsx:
  <div className="relative h-full w-full">
    <Group className="h-full">
      <Panel>
        <div className="flex h-full flex-col">
          <PanelHeader className="shrink-0" />
          <div className="flex-1 overflow-y-auto">...</div>
```

---

## 本地 Agent 操作步骤

```bash
cd kg-management-v2
git pull origin main
```

按上面「修改文件清单」的 20 个文件逐一修改。然后：

```bash
npm install
npx vite build
```

```bash
git add -A
git commit -m "fix: 全面暗色主题修复 + 布局调整 + 14项批注

- :root 定义暗色默认 shadcn 变量
- 修复 darkMode 配置匹配 data-theme
- 添加全局暗色滚动条（所有暗色主题）
- 修复 Layout 高度链，指标管理三区域独立滚动
- 修复所有 Dialog/Input/Textarea 暗色配色
- 修复血缘画布节点/关系暗色颜色
- 标签范围/剔除规则改为 TreeView
- TagPill 支持 inTree 模式"
git push origin main
```

---

## 部署验证

- [x] 指标管理一屏展示，三区域各自独立滚动
- [x] 指标树文字超长显示省略号
- [x] 血缘画布节点选中后暗色背景
- [x] **血缘画布弹窗 Dialog 暗色背景** + Label/Input/Select/Textarea 全适配
- [x] 知识上传所有 Label 白色清晰
- [x] 知识上传 Input 预填值（`\n`, 1024, 50）白色
- [x] Checkbox 暗色背景 + 蓝色选中
- [x] 所有 outline 按钮透明背景 + 暗色边框 + hover
- [x] TabsTrigger 未选中/选中状态配色正确
- [x] Dashboard 工作台标题白色
- [x] 全局滚动条暗色（所有暗色主题）
- [x] Select 下拉菜单暗色背景
