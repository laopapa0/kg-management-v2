# #99 报告管理重构 — 审查报告

> 审查范围: `4fd789c..HEAD` (7 commits，子 issues #100-#103)
> 审查日期: 2026-06-09
> 审查方式: 双轴审查 — 标准轴 + 规格轴

---

## 一、相关 Issues

| Issue | 标题 | 状态 |
|-------|------|------|
| #99 | [PRD] 报告管理重构 — 计划驱动生成 + 历史报告列表 + 流程简化 | open |
| #100 | 路由清理 + ReportPlan 数据模型扩展 | closed |
| #101 | 计划列表优化 — 每行一键生成报告 | closed |
| #102 | PlanDialog 三步向导重写 | closed |
| #103 | 历史报告页面 /reports/history | closed |

---

## 二、审查的 Commits

```
df26c77 feat: ReportManagementPage 添加 Tabs 导航（报告计划/历史报告）
b831eca feat(#103): 历史报告页面 — 卡片式布局重构
1cf3a49 feat(#103): 历史报告页面 /reports/history
644eede feat(#102): PlanDialog 三步向导重写
781fec5 feat(#101): 计划列表每行一键生成报告 + TDD测试
22210f9 fix(#99): 指标树叶子节点禁止编辑 — 仅虚拟分组可编辑
dd304c8 fix(test): TreeView编辑按钮常显后同步测试预期
```

---

## 三、标准审查 Findings

### 硬违规：无

### 判断性问题

1. **handleSave / handleSaveAndGenerate 重复**
   - 位置: `ReportManagementPage.tsx` L54-77 与 L79-101
   - 问题: 约 80% 逻辑重复（form 数据构造、plan upsert），建议提取公共函数 `upsertPlanFromFormData`
   - 影响: 维护成本

2. **分页按钮风格不一致**
   - 位置: `ReportHistoryPage.tsx` L220-237
   - 问题: 分页按钮使用原生 `<button>`，页面其他按钮使用 shadcn `<Button>`
   - 建议: 统一为 shadcn Button

3. **路径硬编码**
   - 位置: `ReportHistoryPage.tsx` L197 `window.open('docs/report.html', '_blank')`
   - 问题: 路径硬编码，Demo 阶段可接受，生产需配置化

### 通过项
- 文件命名符合 `src/pages/<module>/<Component>.tsx` 约定
- 全部颜色使用 CSS 变量（`dark-text-primary`、`dark-border` 等），无 `dark:` prefix
- shadcn/ui 组件正确使用（Button、Tabs、Dialog、Input、Switch、Textarea）
- localStorage key 使用 `kgv2-` 前缀

---

## 四、规格审查 Findings

### (a) 缺失/部分实现

| 节 | Finding |
|----|---------|
| 3.3 | **DataTable 未使用，改用卡片布局。** PRD 明确要求"DataTable 展示所有已生成报告（跨计划）"，但 `ReportHistoryPage.tsx` 使用了 `grid-cols-3` 卡片网格，commit `b831eca` 标注"卡片式布局重构"属有意偏离 |
| 3.3 | 缺少独立的"报告标题"列（`GeneratedReport` 模型无 `title` 字段，以 `planName + version` 代替） |
| 异常 | `handleGenerate` 允许空 `filterScope` 直接生成报告，PRD 要求"筛选范围为空时生成失败提示" |
| 异常 | 已绑定的模板被停用后无不可用警告 |

### (b) 范围蔓延 (Scope Creep)

| Finding |
|---------|
| 卡片式布局替代 DataTable |
| 自建分页组件（每页10条） |
| TreeView `canEditNode` prop（#99 范围外但属合理的 UX 改进） |

### (c) 实现疑点

| 节 | Finding |
|----|---------|
| 3.1 | `handleGenerate` 中 version 用 `v${plan.latestVersion + 1}`，与 `generatedReportModel.getNextVersion()`（`v0.1→v0.2` minor 递增）不一致——两套 version 逻辑可能冲突 |
| 3.2 | PlanDialog 第三步"上一步"回到 Step 1 跳过 Step 2，"取消"按钮直接关弹窗——导航语义不直观 |

### 关键点验证

| 检查项 | 状态 |
|---|---|
| `/reports/generate` 路由已移除 | ✅ |
| PlanDialog 三步导航 + 步骤指示器 | ✅ |
| 历史页"查看报告"外链 (`docs/report.html`) | ✅ |
| 历史页"在线详情"跳转 (`/reports/:reportId`) | ✅ |
| 历史页 DataTable 复用 | ❌ 改用卡片布局 |
| 空状态引导文案 | ✅ |
| 每行"生成报告"按钮 + 生成后跳转 | ✅ |
| `latestVersion=0` 显示"首次生成" | ✅ |

---

## 五、审查结论

| 轴 | Findings | 最严重问题 |
|----|----------|------------|
| 标准 | 0 硬违规 + 3 判断 | handleSave/handleSaveAndGenerate 80% 重复 |
| 规格 | 4 缺失 + 3 蔓延 + 2 疑点 | 两套 version 递增逻辑不一致（操作 `v3/v4` vs 报告 `v0.1/v0.2`） |

核心功能 3.1-3.4 基本实现。以上 findings 均为轻微到中等严重度，无阻塞性问题。
