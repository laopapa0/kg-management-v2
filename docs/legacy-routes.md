# 旧模块路由清单与归档

> 本文档依据 PRD #57「平台模块精简 + 四大核心菜单重构」梳理当前平台全部路由与 Sidebar 菜单项，
> 标注每条路由/菜单的处置方式（保留 / 注释 / 物理删除）及未来复用场景。
>
> 生成基准：
> - `src/App.tsx`（21 条已注册路由）
> - `src/components/Sidebar.tsx`（3 组 18 项菜单 + 首页）

---

## 处理策略说明

| 处置方式 | 含义 | 执行要求 |
|----------|------|----------|
| **保留** | 继续使用，属于四大核心菜单 | 需适配新 UX，可能调整入口位置 |
| **注释** | 暂时从路由/菜单中移除，不破坏源码 | 页面文件保留，便于未来参考或改造复用 |
| **物理删除** | 彻底删除路由、页面文件及相关引用 | 仅适用于明确废弃且无复用价值的模块 |

根据 CONTEXT.md 中 v1 → v2 的关键决策：
- **审核** 已砍掉（noc/audit 等）
- **巡检** 已改造为 **报告管理**
- **NOC / 平台维护** 已隐藏
- **预览** 已砍掉
- **映射 / 底座** 已隐藏
- **对象类型体系** 已简化为指标平表字段
- **知识管理** 已改造为 **知识库管理**

---

## App.tsx 注册路由

| 路由路径 | 页面组件 | 所属模块 | 当前状态 | 处理方式 | 关键源文件 | 未来复用场景 |
|----------|----------|----------|----------|----------|------------|--------------|
| `/` | `DashboardPage` | 门户 | 在用 | **保留** | `src/pages/dashboard/DashboardPage.tsx` | 清理 NOC 卡片，替换为四大核心入口（指标管理、知识库管理、血缘画布、报告管理） |
| `/indicator/create` | `IndicatorCreatePage` | 指标旧表单 | 在用 | **注释** | `src/pages/indicator-create/IndicatorCreatePage.tsx` | 旧表单页面；指标录入逻辑未来可复用于知识库/反哺场景 |
| `/indicator/edit/:id` | `IndicatorEditPage` | 指标旧表单 | 在用 | **注释** | `src/pages/indicator-edit/IndicatorEditPage.tsx` | 同上，编辑逻辑未来可复用 |
| `/indicator-management` | `IndicatorManagementPage` | 指标挂靠 | 在用 | **保留** | `src/pages/indicator-management/IndicatorManagementPage.tsx`<br>`IndicatorAttachmentPage.tsx`<br>`IndicatorTreePanel.tsx`<br>`TagSetPanel.tsx`<br>`RulePanel.tsx` | 四大核心菜单之一；当前已实现指标树、标签集、规则树、待选指标、连线挂靠 |
| `/lineage` | `LineageCanvasPage` | 血缘画布 | 在用 | **保留** | `src/pages/lineage/LineageCanvasPage.tsx`<br>`src/components/lineage/` | 四大核心菜单之一；沿用 v1 SVG 实现，主题颜色联动 |
| `/tag-config` | `TagConfigPage` | 配置旧页面 | 在用 | **注释** | `src/pages/tag-config/TagConfigPage.tsx` | 标签配置已内置到「指标管理」页面的 TagSetPanel，旧独立页面可废弃 |
| `/rule-config` | `RuleConfigPage` | 配置旧页面 | 在用 | **注释** | `src/pages/rule-config/RuleConfigPage.tsx` | 规则配置已内置到「指标管理」页面的 RulePanel，旧独立页面可废弃 |
| `/inspection-todo` | `InspectionTodoPage` | 巡检（业务侧） | 在用 | **注释** | `src/pages/business/inspection-todo/InspectionTodoPage.tsx` | **巡检 → 报告管理**：待办/执行逻辑未来可复用于报告待办列表 |
| `/noc/object-type` | `NocObjectTypePage` | NOC 管理 | 在用 | **注释** | `src/pages/noc/NocObjectTypePage.tsx` | NOC 侧功能全部隐藏；对象类型体系已简化为指标平表字段 |
| `/noc/link-relation` | `NocLinkRelationPage` | NOC 管理 | 在用 | **注释** | `src/pages/noc/NocLinkRelationPage.tsx` | NOC 侧隐藏；血缘关系由「血缘画布」统一维护 |
| `/noc/property` | `NocPropertyPage` | NOC 管理 | 在用 | **注释** | `src/pages/noc/NocPropertyPage.tsx` | NOC 侧隐藏 |
| `/noc/tag` | `NocTagPage` | NOC 管理 | 在用 | **注释** | `src/pages/noc/NocTagPage.tsx` | NOC 侧隐藏；业务侧标签由 TagSetPanel 维护 |
| `/noc/rule` | `NocRulePage` | NOC 管理 | 在用 | **注释** | `src/pages/noc/NocRulePage.tsx` | NOC 侧隐藏；业务侧规则由 RulePanel 维护 |
| `/noc/audit` | `NocAuditPage` | NOC 管理 | 在用 | **注释** | `src/pages/noc/NocAuditPage.tsx` | **审核已砍掉**，无复用价值，长期可物理删除 |
| `/noc/inspection` | `InspectionManagementPage` | NOC 管理 | 在用 | **注释** | `src/pages/noc/inspection/InspectionManagementPage.tsx` | **巡检 → 报告管理**：计划/模板/版本管理逻辑复用于新报告管理 |
| `/knowledge-management` | `KnowledgeManagementPage` | 知识管理（旧） | 在用 | **注释** | `src/pages/knowledge-management/KnowledgeManagementPage.tsx`<br>`KnowledgeBaseList.tsx`<br>`KnowledgeBaseDetailDrawer.tsx` | **知识管理 → 知识库管理**：文件列表、详情抽屉复用于新知识库管理 |
| `/knowledge-upload` | `KnowledgeUploadPage` | 知识上传（旧） | 在用 | **注释** | `src/pages/knowledge-upload/KnowledgeUploadPage.tsx`<br>`MyDocumentsList.tsx`<br>`DocumentReeditForm.tsx` | **知识上传 → 知识库管理**：文档上传、版本替换逻辑复用 |
| `/platform/object-type` | `PlatformObjectTypePage` | 平台维护 | 在用 | **注释** | `src/pages/platform/PlatformObjectTypePage.tsx` | 平台维护侧隐藏 |
| `/platform/link-type` | `PlatformLinkTypePage` | 平台维护 | 在用 | **注释** | `src/pages/platform/PlatformLinkTypePage.tsx` | 平台维护侧隐藏 |
| `/platform/property` | `PlatformPropertyPage` | 平台维护 | 在用 | **注释** | `src/pages/platform/PlatformPropertyPage.tsx` | 平台维护侧隐藏 |
| `/platform/graph` | `PlatformGraphPage` | 平台维护 | 在用 | **注释** | `src/pages/platform/PlatformGraphPage.tsx` | 平台维护侧隐藏；图谱管理能力由「血缘画布」统一提供 |

---

## Sidebar 导航菜单

Sidebar 当前配置位于 `src/components/Sidebar.tsx`，共 3 组 18 项菜单 + 1 项首页。

### 首页

| 菜单项 | 路由路径 | 所属模块 | 处理方式 | 备注 |
|--------|----------|----------|----------|------|
| 首页 | `/` | 门户 | **保留** | 清理后展示四大核心入口 |

### 业务部门（6 项）

| 菜单项 | 路由路径 | 当前模块 | 处理方式 | 备注 |
|--------|----------|----------|----------|------|
| 指标管理 | `/indicator-management` | 指标挂靠 | **保留** | 四大核心菜单之一 |
| 血缘画布 | `/lineage` | 血缘画布 | **保留** | 四大核心菜单之一 |
| 配置标签 | `/tag-config` | 配置旧页面 | **注释** | 已内置到指标管理 TagSetPanel |
| 配置规则 | `/rule-config` | 配置旧页面 | **注释** | 已内置到指标管理 RulePanel |
| 巡检待办 | `/inspection-todo` | 巡检 | **注释** | 改造为报告管理待办 |
| 知识上传 | `/knowledge-upload` | 知识上传 | **注释** | 改造为知识库管理上传入口 |

### NOC 管理（8 项）

| 菜单项 | 路由路径 | 当前模块 | 处理方式 | 备注 |
|--------|----------|----------|----------|------|
| 对象类型 | `/noc/object-type` | NOC | **注释** | NOC 侧隐藏 |
| 链接关系 | `/noc/link-relation` | NOC | **注释** | NOC 侧隐藏 |
| 属性管理 | `/noc/property` | NOC | **注释** | NOC 侧隐藏 |
| 标签管理 | `/noc/tag` | NOC | **注释** | NOC 侧隐藏 |
| 规则管理 | `/noc/rule` | NOC | **注释** | NOC 侧隐藏 |
| 审核待办 | `/noc/audit` | NOC | **注释** | 审核已砍掉 |
| 巡检管理 | `/noc/inspection` | NOC | **注释** | 改造为报告管理 |
| 知识管理 | `/knowledge-management` | NOC | **注释** | 改造为知识库管理 |

### 平台维护（4 项）

| 菜单项 | 路由路径 | 当前模块 | 处理方式 | 备注 |
|--------|----------|----------|----------|------|
| 对象类型 | `/platform/object-type` | 平台维护 | **注释** | 平台维护侧隐藏 |
| 链接类型 | `/platform/link-type` | 平台维护 | **注释** | 平台维护侧隐藏 |
| 属性管理 | `/platform/property` | 平台维护 | **注释** | 平台维护侧隐藏 |
| 图谱管理 | `/platform/graph` | 平台维护 | **注释** | 平台维护侧隐藏 |

---

## 精简后预期导航结构

根据 PRD #57 和 CONTEXT.md，精简后 Sidebar 应只保留以下入口：

1. **首页** `/`
2. **指标管理** `/indicator-management`
3. **知识库管理** `/knowledge-management`（新路由，替换旧知识管理/知识上传）
4. **血缘画布** `/lineage`
5. **报告管理** `/report-management`（新路由，替换旧巡检相关页面）

原 3 组 18 项全部折叠或注释，仅作为历史归档保留在源码中。

---

## 建议执行顺序

1. **#59 当前文档** — 完成归档，本文档已输出。
2. **#60 App.tsx 路由注释 + Sidebar 精简为 5 项** — 按上表「处理方式=注释」对路由进行注释/移除，Sidebar 收缩为 5 项。
3. **后续子任务** — 按 #57 子 issue 逐步替换/新建四大核心页面（知识库管理、报告管理等）。
