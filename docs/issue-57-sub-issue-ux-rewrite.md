## Sub-issue: 指标挂靠交互流程调整 — 影响分析 (Slice 9+ issues #48-#53)

### 变更描述

当前挂靠流程：点击待选指标 → 连线模式（用户选择 tree/tag/rule 目标）→ Space 确认。  
新流程改为：
1. 点击待选指标 → 直接挂靠到指标树（tree-only，不再有 targetType 选择）
2. 挂靠后**自动选中该指标**在树中
3. TagSetPanel / RulePanel 切换为**"配置模式"**：多选标签/规则来关联到该选中指标（直接操作 `tagIds`/`ruleIds`）
4. 显示"已选标签 / 已选规则"小型横幅 pills
5. 树中删除指标 → 回到待挂靠列表
6. 支持从树**拖拽指标到待选列表**

### 对 Slice 9+ issues 的影响评估

| Issue | 影响程度 | 说明 |
|-------|---------|------|
| **#48** 搜索框 | 🟢 低 | TagSetPanel/RulePanel 需支持"浏览模式"+"配置模式"双模式，搜索在两种模式下均应工作 |
| **#49** 命令面板 | 🟢 低 | "选择标签/规则后展开树并选中"可调整为"选中后在配置模式中勾选该项" |
| **#50** 焦点 Trap | 🟡 中 | 当前连线模式下的 Tab 循环逻辑针对 tree/tag/rule 三类目标。新流程下连线模式只针对 tree（简化），tag/rule 配置变成 click-based 多选。焦点 trap 可能需要重新设计或简化 |
| **#51** 树键盘导航 | 🟢 无 | TreeView 纯组件增强，与挂靠交互方式无关 |
| **#52** 虚拟滚动 | 🟢 低 | "拖拽排序时临时禁用虚拟滚动"需扩展为"外部拖入待选区时也禁用"，逻辑微调 |
| **#53** 测试补齐 | 🟡 中 | `useConnectionMode.test.ts` 会因 targetType 移除而大幅变化；`IndicatorCard.test.ts` 的 click 行为变更。**建议在 #53 执行前完成此调整**，避免测试白写 |
| #54 | 🟢 已关闭 | Bug 已修复 |
| #55 | 🟢 低 | 删除逻辑与挂靠方式无关 |
| #56 | 🟢 无 | 纯主题 CSS |

### 建议执行顺序

1. **先完成 slice 7 的 review 修复**（实线颜色、动画补全）
2. **再执行本变更**（useConnectionMode 简化 + tag/rule 多选模式 + 横幅 + 拖拽到待选）
3. **最后才启动 slice 9**（特别是 #53 测试补齐，避免测试在旧交互上白费功夫）

### 代码改动范围估算

- 简化：`useConnectionMode.ts` (-70 行)、`IndicatorCard.tsx` 点击逻辑
- 新增：`SelectedTagsRulesBanner` 组件、tag/rule 多选 hook
- 修改：`TagSetPanel.tsx`、`RulePanel.tsx`（双模式）、`IndicatorTreePanel.tsx`（auto-select + 拖出）、`IndicatorAttachmentPage.tsx`（drop zone + banner）
- 总计约 10-12 文件，净增 ~200-300 行
