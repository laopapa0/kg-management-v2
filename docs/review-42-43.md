# #42 + #43 合并审查报告

> 审查日期: 2026-06-08  
> 基准: `5e6cdcb...HEAD`（#42=`9f6bb49`, #43=`97f5515`）

---

## #42 — 目标双色环脉冲 + mini toast + 实线连线

[issue #42](https://github.com/laopapa0/kg-management-v2/issues/42)

### 规格轴

| # | 验收项 | 状态 | 细节 |
|---|--------|------|------|
| 1 | 双色环 #3B82F6 / #22C55E | `~` | 颜色正确，`border-[3px]` 硬编码无 stroke-width 动画 |
| 2 | Ring: scale→1.4, opacity→0, 400ms | `~` | scale/opacity 正确，缺 stroke-width 3px→1px |
| 3 | 目标弹跳 scale(1→1.02→1) 200ms | `x` | `useTargetBounce.ts` + `animate-target-bounce` |
| 4 | mini toast 上方 20px, 2s | `~` | 与 pulse **同时触发**，spec 要求 Ring 消散后才显示 |
| 5 | 实线渐显 #3B82F6, opacity 0→1, 200ms | `✗` P0 | 颜色用 `var(--dark-conn-line-valid)`=#22C55E（绿）应为 #3B82F6（蓝）；无渐显动画 |
| 6 | 实线跟随滚动 | `x` | scroll+resize 监听更新 path |

### 标准轴

- `~` `findTargetElement` 在 PulseRing + MiniToast 中重复定义，应提取到 `src/utils/`

---

## #43 — 删除挂靠：连线中点按钮 + 5s Undo Toast

[issue #43](https://github.com/laopapa0/kg-management-v2/issues/43)

### 规格轴

| # | 验收项 | 状态 | 细节 |
|---|--------|------|------|
| 1 | hover 高亮 #7B8CDE, 2.5px, 200ms | `x` | `PersistentConnectionLayer.tsx:112-116` transition |
| 2 | 中点 20×20px 红色 × 按钮, scale 0→1 150ms 弹性 | `x` | 几何中点计算 + `animate-scale-in` cubic-bezier 弹性 |
| 3 | tree/tag/rule 三路数据删除 | `x` | `useConnectionDelete.ts:51-60` |
| 4 | 标签/树直接删无确认弹窗 | `x` | 直接执行删除 |
| 5 | 连线 200ms 淡出 + 卡片恢复 | `~` | store 更新后 path 立即 unmount，无 200ms fade-out 过渡 |
| 6 | 底部 5s Undo Toast + 撤销恢复 | `x` | 撤销后 persistentConnections 重新计算，连线重新渲染 |

### 标准轴

- 全部通过。建议 `useConnectionDelete` 补充 `useEffect cleanup` 在组件卸载时清除 timer。

---

## 汇总

| | #42 | #43 |
|------|------|------|
| 通过 | 3 / 6 | 5 / 6 |
| 部分 | 2 / 6 | 1 / 6 |
| 未通过 | 1 / 6 | 0 / 6 |
| 最严重 | 实线颜色绿色→蓝色 + 渐显缺失 | 连线删除 200ms fade-out 缺失 |

两个 issue 的数据更新逻辑均正确、测试覆盖充分。剩余问题都集中在**动画细节**（时序、过渡效果、颜色值），属视觉打磨范畴。
