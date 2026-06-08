# #44 审查报告 — 删除挂靠辅助路径

> 审查日期: 2026-06-08  
> 基准: `97f5515...HEAD` (commit `dfb7e6b`)  
> 关联: [issue #44](https://github.com/laopapa0/kg-management-v2/issues/44)

文件: `InAttachedBadge.tsx`, `InlineConfirmButton.tsx`, `BatchDetachMenu.tsx`, `PersistentConnectionLayer.tsx` + 3 面板集成

---

## 规格轴

| # | 验收项 | 状态 | 细节 |
|---|--------|------|------|
| 1 | Inline Confirm: 红底 + "确认删除？" + w-5→w-20 + 150ms | `x` | `w-5`→`w-20`, `bg-red-500`, `transition-all duration-150` |
| 2 | 二次点击执行; click elsewhere / Esc 100ms 恢复 | `x` | `cancelDuration=100` + `setTimeout` 延迟 |
| 3 | "已挂靠 N" 徽章, 背景 #7B8CDE | `x` | `bg-[#7B8CDE]` + text "已挂靠 {count}" |
| 4 | 240px 列表面板 + 逐条删除 + 移除全部 | `x` | `w-60`(240px) + `onDeleteOne` + "移除全部" |
| 5 | 右键 Context Menu 四项 | `~` | Context Menu 结构完备，但各节点仅传入**单个** detachOption（树→"移除所有挂靠"、规则→"移除所有规则挂靠"、标签→"移除所有标签集挂靠"）。spec 描述的四项（查看+标签+规则+全部）为并集描述，按类型分拆可能符合设计意图，但 spec 字面上未完全对齐 |
| 6 | 批量移除轻量确认对话框列明数量 | `x` | `confirm-count` + "共影响 N 个指标" |

---

## 标准轴

| 问题 | 等级 |
|------|------|
| `PersistentConnectionLayer.tsx` 使用 `./InlineConfirmButton` / `./DeleteConnectionButton` 相对导入 | 违反 `@/` 约定 |
| `handleDelete` / `handleInlineConfirm` 逻辑重复（仅 `setHoveredKey(null)` vs 已隐含在 `activeConnection` 逻辑中） | 建议合并 |
| `IndicatorTreePanel` / `TagSetPanel` 中 `onViewAttached={() => {}}` 空回调 | 建议实现或移除 |
| `useEffect`/timer/事件监听器 cleanup 均正确 | 通过 |
| 无 `any` 类型滥用 | 通过 |

---

## 总结

| 轴线 | 结论 |
|------|------|
| **规格** | 6/7 验收项通过；Context Menu 选项按节点类型分布而非四合一排列，属轻微偏离 |
| **标准** | 1 处 import 违规 + 2 处建议优化，整体代码质量良好 |

Inline Confirm 两段式交互和跨三面板的 AttachedBadge/BatchDetachMenu 集成设计合理，测试覆盖充分（InlineConfirm 状态切换、Outside click、Escape、PersistentConnectionLayer requiresConfirm 分支均已覆盖）。
