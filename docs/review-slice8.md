# Slice 8 双轴审查报告

**基准点**: `7c23aa8` (fix(#44-review))  
**Commits**: `52c1924` (#45) → `4896b85` (#46) → `2a70435` (#47)  
**变更规模**: 14 个文件，+1812 行，-4 行  
**审查日期**: 2026-06-08

---

## 标准审查

### 硬违规

- **ParameterDrawer.tsx:109-115** — 内联 `style` 对象每次渲染创建新引用。`width: '480px'` 与 `className="w-[480px]"` 重复。`maxWidth` 可用 `max-w-[480px]`，`boxShadow` 可用 `shadow-[-4px_0_24px_rgba(0,0,0,0.4)]`。使用 `useMemo` 或定义为模块级常量。（React 模式 / Tailwind 一致性）

- **RuleSummaryBadge.tsx:20-23** — `LEVEL_COLORS` 使用浅色主题 Tailwind 类名（如 `bg-red-100`、`text-red-700`），与项目中优先使用深色 CSS 变量（如 `bg-dark-card-l2`）不一致。这些颜色在深色背景下会错误渲染。（Tailwind 一致性）

- **PersistentConnectionLayer.tsx:150** — 内联 `style={{ width: '100vw', height: '100vh' }}` 可用 Tailwind 的 `w-screen h-screen` 代替。同时合并已存在的 `className="fixed inset-0"` — `inset-0` 已覆盖尺寸。（Tailwind 一致性 / React 模式）

### 判断性建议

- **ParameterFields.tsx:101,110,394** — 继承/覆盖徽章和选中药丸使用硬编码颜色（`#3B82F6`、`#F5A623`），而非深色 CSS 变量。虽然遵循了代码库中语义颜色的已有模式，但无法适配未来的主题切换。

- **ParameterFields.tsx:336** — `variant={field.value === u ? 'default' : 'outline'}` 在 `UNIT_OPTIONS.map()` 内部每次渲染都会重新执行，为 3 个按钮各创建新的比较结果。可使用 `useCallback` 优化的点击处理器。

- **ruleParameterInheritance.ts:40-48** — `getDescendantRuleIds` 中的 BFS 使用 `Array.shift()`，其时间复杂度为 O(n²)。在规则数量较小时可接受，但若出现深层树结构可能会造成性能问题。可考虑使用索引指针方案。

- **ParameterDrawer.tsx:187** — `APPEARANCE_FIELDS: string[] = []` 是一个空数组。第 37 行将其定义为空，第 93 行却统计其 `configured` 计数。该字段始终为 `{ configured: 0, total: 0 }`，属于死代码。

- **RuleSummaryBadge.tsx:101** — `useEffect` 的依赖项为 `[parameters, summary]`，但 `summary` 完全由 `parameters` 派生而来（见第 97 行），因此 `summary` 是冗余依赖项。React 不会因此报错，但属于代码异味。

- **PersistentConnectionLayer.tsx:38-54** — `updateLines` 每次 `connections` 或 `exitingKeys` 变化时都会重新创建并绑定。可用 `useCallback` 封装，避免不必要的 `addEventListener`/`removeEventListener` 调用。

### 测试质量

所有测试文件均遵循一致、高质量的模式：`beforeEach` 会重置 `localStorage`、Zustand store 状态及 mock；在合适场景使用 `userEvent`；对动画使用 `vi.useFakeTimers`/`useRealTimers` 并配合 `act`；使用 `.test-cleanup` 类进行 DOM 清理。

测试覆盖了渲染验证、用户交互流程、验证边界情况以及动画时序，而非仅做浅层渲染。纯单元测试（`ruleParameterInheritance.test.ts`）直接调用纯函数并通过断言验证返回值 — 简洁且高效。

测试文件数量（7 个文件共约 800 行）与修改代码规模（1812 行）相匹配，属于合理的覆盖范围。

---

## 规格审查

### #45 参数 Drawer

- ✅ 宽度 480px（`ParameterDrawer.tsx:112`）、右侧滑入方向（`:105`）、box-shadow（`:114`）
- ✅ 三段式 Accordion（Content/Interaction/Appearance），标题 11px + uppercase + `tracking-[0.5px]`（`:142`）
- ✅ Content 段默认展开（`defaultValue={['content']}`，`:137`），其余折叠
- ✅ 已配置徽章 SectionBadge（`:54-64`）
- ✅ 使用 vaul Drawer 组件（`drawer.tsx:4`）
- ❌ **未配置 300ms + `[0.16, 1, 0.3, 1]` easing** — `DrawerContent` 未设置 `duration` 或自定义 easing（`drawer.tsx:48-73`），依赖 vaul 默认动画
- ❌ **Accordion 动画时长未设置** — `Accordion` 组件未配置 250ms（展开）/ 200ms（收起）（`ParameterDrawer.tsx:135-139`）

### #46 参数表单控件

- ✅ 数值输入（`type="number"`，`ParameterFields.tsx:229`）、范围 `~` 分隔（`:263`）、≤4 项 pill 单选（`:382-401`）、Segmented Button 单位选择（`:331-344`）
- ✅ 提交时全局校验 + 滚动到 `[aria-invalid="true"]`（`ParameterDrawer.tsx:206-214`）
- ✅ Blur 模式验证 + `refine` 检查 upperLimit > lowerLimit（`ParameterFields.tsx:150, :36-44`）
- ❌ **数值缺少自定义步进按钮** — 仅依赖浏览器原生 spinner，无独立加减按钮
- ❌ **枚举 >4 项下拉无搜索** — `Select` 组件无搜索过滤能力；虽然当前数据无 >4 枚举场景，但基建未就绪
- ❌ **时间窗口未实现"数字输入 + 单位下拉"模式** — `window` 字段仅为普通 Input + placeholder（`:494-502`），无独立数字与单位（秒/分/时/天）拆分
- ❌ **错误文本 12px + `errorSlideIn` 动画缺失** — `FormMessage` 默认 `text-sm`（14px）（`form.tsx:150`）；全仓库无 `errorSlideIn` 定义
- ❌ **Switch 控件缺失** — 当前规则类型无布尔字段，但若未来扩展需补全

### #47 三层继承模型

- ✅ 继承链递归计算（`ruleParameterInheritance.ts:7-34`）、继承态 `opacity-70`（`ParameterFields.tsx:227`）、已覆盖 2px `#F5A623` 指示条（`:221`）
- ✅ 继承 / 已覆盖徽章（`:99-111`）、恢复默认箭头（`:122`）、`restore()` 逻辑（`:201-203`）
- ✅ 级联更新跳过 `overriddenFields`（`ruleParameterInheritance.ts:117`）+ Toast 提示 >5 子节点（`ParameterDrawer.tsx:160-162`）
- ✅ 摘要标签 200ms 淡入更新（`RuleSummaryBadge.tsx:101-105, :128-129`）
- ❌ **继承参数 hover 无 Tooltip 继承链** — `InheritanceBadges` 无 Tooltip（`ParameterFields.tsx:96-129`），`RuleSummaryBadge` 的 Tooltip 只显示参数值不展示继承路径
- ⚠️ **`useFieldInheritance` 比较使用 `!==`**（`:79-80`）— 对 number/string 混合值可能出现误判；建议使用 `String(value) !== String(inheritedValue)` 或 loose equal

---

## 总结

| 轴线 | Findings | 最严重问题 |
|------|----------|-----------|
| 标准 | 3 硬违规 + 6 判断 | `RuleSummaryBadge.tsx` 浅色 Tailwind 类在深色背景下错误渲染 |
| 规格 | #45 缺 2 / #46 缺 5 / #47 缺 1 | #46 时间窗口 + errorSlideIn + 搜索下拉三项基建缺失 |
