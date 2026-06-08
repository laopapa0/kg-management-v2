# Slice 7 完整审查报告 — 挂靠数据更新 + 反馈 + 删除

> 审查日期: 2026-06-08  
> 基准: `df2f693...HEAD`  
> 范围: 4 commits (#41-#44) + 1 fix commit  
> 变更: 49 文件, +6,924 / -297 行

---

## Issue 列表

| Issue | Commit | 标题 |
|-------|--------|------|
| [#41](https://github.com/laopapa0/kg-management-v2/issues/41) | `de3cdc2` | 挂靠数据更新 + 源卡片 fly-out 动画 |
| [#42](https://github.com/laopapa0/kg-management-v2/issues/42) | `9f6bb49` | 目标双色环脉冲 + mini toast + 实线连线 |
| [#43](https://github.com/laopapa0/kg-management-v2/issues/43) | `97f5515` | 删除挂靠：连线中点按钮 + Undo Toast |
| [#44](https://github.com/laopapa0/kg-management-v2/issues/44) | `dfb7e6b` | 删除挂靠辅助：Inline Confirm + 徽章 + Context Menu |
| fix | `7c23aa8` | #44 review 修复 + #42/#43 动画补全 |

---

## 逐 Issue 审查结果

### #41 — 挂靠数据更新 + fly-out 动画

| 轴线 | 通过 | 部分 | 未通过 |
|------|------|------|------|
| 规格 | 9/9 | 0 | 0 |
| 标准 | 通过 | 3 判断(低) | 0 |

- 三路数据更新 (`treeParentId` / `tagIds` / `ruleIds`) 完整
- fly-out 三段动画 (scale→fly→fade) + Framer Motion useAnimation 编排
- `connection-confirmed` CustomEvent 同一 tick 触发数据更新+动画
- 标准: 3 个判断性问题 (FocusModeOverlay render 中写 ref、动画 Promise 无可中断、mock data `as` 断言)

### #42 — 目标双色环脉冲 + mini toast + 实线

| 轴线 | 通过 | 部分 | 未通过 |
|------|------|------|------|
| 规格 | 3/6 | 2/6 | 1/6 |
| 标准 | 通过 | `findTargetElement` 重复定义 | 0 |

- `x` 双色环 #3B82F6/#22C55E + 目标弹跳 + 实线滚动跟随
- `~` stroke-width 动画: ~~缺失~~ → `7c23aa8` 新增 `pulse-ring-stroke` animation
- `~` mini toast 与 ring **同时**触发，spec 要求 ring 消散后才显示
- `✗` P0: 实线颜色 ~~`#22C55E`~~ → `7c23aa8` 已修复为 `#3B82F6`；渐显动画 ~~缺失~~ → `7c23aa8` 新增 `persistent-line-fade-in` 200ms

### #43 — 删除挂靠主路径

| 轴线 | 通过 | 部分 | 未通过 |
|------|------|------|------|
| 规格 | 5/6 | 1/6 | 0 |
| 标准 | 通过 | timer cleanup 建议 | 0 |

- `x` hover 高亮 #7B8CDE 2.5px + 中点 20×20 × 按钮 + 三路删除 + 无确认 + 5s Undo Toast
- `~` 连线删除后 ~~立即 unmount~~ → `7c23aa8` 新增 exiting opacity=0 + 200ms transition fade-out

### #44 — 删除挂靠辅助路径

| 轴线 | 通过 | 部分 | 未通过 |
|------|------|------|------|
| 规格 | 6/7 | 1/7 | 0 |
| 标准 | 通过 | relative import + 空回调 | 0 |

- `x` InlineConfirm (w-5→w-20, 100ms cancel) + 徽章面板 240px + BatchDetachMenu + 确认对话框
- `~` Context Menu 四项按节点类型分拆 (树→"移除所有挂靠"、规则→"移除规则挂靠"、标签→"移除标签挂靠")，与 spec 四合一描述有轻微偏离
- 标准: `~~./InlineConfirmButton~~` → `7c23aa8` 已修复 `@/`; `findTargetElement` 提取到 `src/utils/`; `onViewAttached` 改为 optional

---

## 跨 Issue 交叉问题

| 问题 | 状态 | 说明 |
|------|------|------|
| `findTargetElement` 重复定义 | `7c23aa8` 已修复 | 提取到 `src/utils/findTargetElement.ts`，PulseRing/MiniToast 统一引用 |
| 实线颜色 #42 vs #43 不一致 | `7c23aa8` 已修复 | 统一为 `#3B82F6`，hover 态 `#7B8CDE` |
| 连线渐显/渐隐动画 | `7c23aa8` 已修复 | 新增 `persistent-line-fade-in` + exiting opacity transition |
| `PersistentConnectionLayer` 同时服务于 #42(实线) 和 #43(删除)，职责清晰 | 通过 | props `requiresConfirm` 区分规则/非规则删除路径 |
| 三面板 (Tree/Tag/Rule) 的 AttachedBadge 集成 | 通过 | 分别通过 `attachedIndicatorsByXxx` 的 useMemo 计算 |

---

## 最终汇总

| | #41 | #42 | #43 | #44 | 合计 |
|------|------|------|------|------|------|
| 规格通过 | 9 | 5 | 6 | 7 | **27/33** |
| 修复后通过 | 9 | **7** | **6** | 7 | **29/33** |
| 剩余待处理 | 0 | 2 | 1 | 1 | **4** |

### 剩余待处理项 (按优先级)

| 优先级 | Issue | 问题 |
|--------|-------|------|
| P1 | #42 | mini toast 与 pulse ring 同时触发，spec 要求 ring 消散后才显示 |
| P2 | #42 | stroke-width 3px→1px 动画已补充 CSS，待验证 PulseRing 是否应用 `animate-pulse-ring-stroke` class |
| P2 | #43 | 确认 PersistentConnectionLayer exiting 动画在删除 scenario 中正确触发 |
| P3 | #44 | Context Menu 按节点类型的单选项 vs spec 四项并集，待确认是否为设计意图 |

### 代码质量总体评估

- **数据层**: `useConnectionMode.confirm()` + `useConnectionDelete` 三路分支逻辑清晰，undo/redo 完整
- **视图层**: `PersistentConnectionLayer` 同时承载实线渲染+hover 交互+删除入口，职责合理；`AttachedBadge`/`BatchDetachMenu` 跨三面板复用
- **动画层**: Framer Motion (fly-out) + CSS keyframes (pulse/bounce/fade-in/scale-in) 分层清晰
- **测试**: 每个新建组件/hook 均有对应 `.test.*` 文件，覆盖正常路径+边界条件 (计 14 个新/改测试文件)
