# Slice 9 审查报告 — #48-#53

> 审查日期: 2026-06-08  
> 基准: `dcf5f6e...HEAD` (commits: #48/#51/#50/#49/#53)  
> 变更: 25 文件, +2,667 / -44 行

---

## Issue 列表

| Issue | Commit | 标题 |
|-------|--------|------|
| [#48](https://github.com/laopapa0/kg-management-v2/issues/48) | `4b172d1` + `58c4bdd` | TreeSearchInput + 高亮/过滤模式切换 |
| [#51](https://github.com/laopapa0/kg-management-v2/issues/51) | `90fd480` | TreeView 键盘导航 + F2/Delete/Ctrl+Z |
| [#50](https://github.com/laopapa0/kg-management-v2/issues/50) | `5d64fde` | useFocusTrap + 焦点记忆 |
| [#49](https://github.com/laopapa0/kg-management-v2/issues/49) | `89a80f9` | Cmd+K 命令面板 |
| [#53](https://github.com/laopapa0/kg-management-v2/issues/53) | `55d2247` | 测试补齐 + WCAG 可访问性审计 |
| [#52](https://github.com/laopapa0/kg-management-v2/issues/52) | — | 虚拟滚动阈值控制（未实现） |

---

## 标准审查

### Bug（需修复）

**1. `useTreeKeyboard.ts:1688` — `useCallback` 依赖数组不完整**

`handleKeyDown` 内部使用了 `onEditNode` 和 `onDeleteNode`，但依赖数组缺少这两个变量，会导致**闭包陈旧**，F2/Delete 始终调用首次渲染时的回调（或 undefined）。

**2. `IndicatorTreePanel.tsx:2517` — `setTimeout` 无清理**

`expandAndSelectNode` 中 `setTimeout(() => setHighlightedId(...), 500)` 未存 ref，组件在 500ms 内卸载时会**对已卸载组件 setState**。

**3. `wcag-audit.test.ts:3070` — `require('fs')` / `__dirname` 不可用**

vitest jsdom 环境下 `require('fs')` 会报错。应改用 vitest 的 `import` 或 fs 内联 mock。`__dirname` 在 ESM 中也不可用。

### 建议

**4. `IndicatorAttachmentPage.tsx:2124` — Cmd+K 缺少输入框屏蔽**

第一个 `useEffect` 的 Space key handler 已检查 `INPUT/TEXTAREA` 并跳过，但 Cmd+K handler 未做同样判断。在输入框中按 Ctrl+K 会意外弹出面板。

### 总体评价

import 使用 `@/` 规范，文件放置合理（`src/components/search/`、`src/components/command/`、`src/hooks/`、`src/components/tree/`），类型安全无 `any`。4 个问题中 3 个为 Bug。

---

## 规格审查

### #48 — TreeSearchInput + 高亮/过滤模式

| 验收项 | 状态 | 位置 |
|--------|------|------|
| 36px 输入框、Search 图标、清空按钮 | `x` | `TreeSearchInput.tsx:663-684` |
| 高亮模式: opacity 0.35 + scale 0.98 + pointer-events none | `x` | `TagPill.tsx:730`, `RulePanel.tsx:249` |
| 过滤模式: 未匹配节点隐藏，树收缩 | `x` | `TagSetPanel.tsx:289-296`, `RulePanel.tsx:270-272` |
| 匹配文字暗金色背景加粗 | `~` | 样式 token 可能依赖已有代码，需人工验证 |
| 空搜索结果情境化空状态 | `x` | `"未找到匹配标签"`、`"未找到匹配规则"` |

### #51 — TreeView 键盘导航

| 验收项 | 状态 | 位置 |
|--------|------|------|
| Arrow / Home / End / `*` 同级展开 | `x` | `useTreeKeyboard.ts:1604-1670` |
| F2 inline 编辑 / Delete 删除 | `x` | `useTreeKeyboard.ts:1672-1685` |
| Ctrl+Z 不拦截，透传到全局 undo | `x` | `TreeView.test.tsx:1201` |
| role="tree/treeitem" / aria-expanded / aria-selected | `x` | `TreeView.tsx:227-230, 252-255` |

### #50 — useFocusTrap + 焦点记忆

| 验收项 | 状态 | 位置 |
|--------|------|------|
| Tab 在容器内循环（正向/Shift+Tab） | `x` | `useFocusTrap.ts:1990-2008` |
| 关闭时焦点返回触发元素 | `x` | `useFocusTrap.ts:1992-1995` |
| inline 编辑期间屏蔽全局快捷键 | `x` | `IndicatorAttachmentPage.tsx:2108-2115` |

### #49 — Cmd+K 命令面板

| 验收项 | 状态 | 位置 |
|--------|------|------|
| Cmd+K / Ctrl+K 打开 | `x` | `IndicatorAttachmentPage.tsx:2124-2128` |
| 搜索指标/标签/规则、按类别分组 | `x` | `AttachmentCommandPalette.tsx:411-458` |
| 选择指标后跳转定位 | `x` | scrollIntoView / expandAndSelectNode |
| 选择标签/规则后跳转 | `~` | `onNavigateToTag`/`onNavigateToRule` 回调**未传给组件**，标签和规则的定位跳转缺失 |
| 键盘提示 footer | `x` | `AttachmentCommandPalette.tsx:299-303` |

### #52 — 虚拟滚动

**未实现，无任何提交。**

### #53 — 测试补齐 + WCAG

| 验收项 | 状态 | 说明 |
|--------|------|------|
| `attachmentStorage.test.ts` 完整 | `x` | clone fallback、cache、corruption、QuotaExceededError |
| `useConnectionMode.test.ts` | `✗` | diff 中无此文件 |
| `CascadingStateEngine.test.ts` | `x` | edge cases 覆盖 |
| `TreeView.test.tsx` 展开/收起/拖拽/键盘 | `x` | ARIA + 键盘测试 |
| `IndicatorCard.test.tsx` | `x` | 键盘 + 已挂靠 |
| Lighthouse >= 90 | `~` | 无法从 diff 静态验证 |
| 颜色对比度 >= AA | `x` | tertiary `#64748B`→`#7A8FA8` 提升对比度；WCAG audit 测试验证 |
| `prefers-reduced-motion` | `x` | 媒体查询已添加 |

### 范围蔓延

| 变更 | 评估 |
|------|------|
| `gridSearchQuery` + `grid-search-input`（>500 指标搜索框） | 不在 Slice 9 spec 中，属新功能 |
| `paletteToastTargetId` MiniToast | 跨 slice UX polish |

---

## 汇总

| Issue | 通过 | 部分 | 缺失 |
|-------|------|------|------|
| #48 搜索框 | 5 | 1 | 0 |
| #51 树键盘 | 5 | 0 | 0 |
| #50 焦点Trap | 3 | 0 | 0 |
| #49 命令面板 | 4 | 1 | 0 |
| #52 虚拟滚动 | 0 | 0 | 全部 |
| #53 测试+WCAG | 5 | 1 | 1 |
| **合计** | **22** | **3** | **1(issue)** |

### 优先修复项

| 优先级 | 问题 |
|--------|------|
| P0 | `useTreeKeyboard` 依赖缺失 — F2/Delete 失效 |
| P0 | `wcag-audit.test.ts` — `require('fs')` 导致测试无法运行 |
| P1 | `IndicatorTreePanel` setTimeout 无清理 |
| P1 | #49 tag/rule 跳转回调未接入 |
| P2 | Cmd+K 输入框 guard 缺失 |
| P2 | #52 虚拟滚动未实现 |
