# -*- coding: utf-8 -*-
import os
import sys
import json
import urllib.request

token = os.environ.get("GITHUB_TOKEN")
if not token:
    print("ERROR: GITHUB_TOKEN not set")
    sys.exit(1)

owner = "laopapa0"
repo = "kg-management-v2"

title = "[PRD] 界面微调与操作体验增强 — 关联关系/知识库/报告管理"

body = """## 一、背景与目标

### 要解决什么问题

平台四大模块有多处交互粗糙、功能缺失的问题，需要统一微调。具体包括：

- **关联关系管理**：展开详情中的变更记录无法按部门/时间筛选，变更类型混杂不可分类
- **知识库管理**：缺失文档编辑和删除功能，操作无变更记录可追踪
- **报告管理**：自动执行开关藏太深、反哺链路不完整、筛选范围看不到具体指标、历史版本入口混淆、文案不一致
- **指标管理**：已挂靠徽章计数包含虚拟分组节点，数字无业务意义

### 预期目标

- 关联关系变更记录支持部门+时间筛选、按操作类型 Tab 分类
- 知识库管理补齐编辑/删除功能 + 操作变更记录
- 报告管理 autoSchedule 开关外置、Step2 展示指标名清单、历史版本按钮语义明确
- 指标树挂靠徽章只计数真实指标

> **重要说明**：本 PRD 的改动描述基于现有代码实际状态，每个需求点均标注了代码起点（文件+行号）和补充说明，避免子 issue 的 agent 误解。

---

## 二、功能需求

### 2.1 关联关系管理 — 变更记录增强

**代码起点**：
- `LinkRelationManagePage.tsx:320-377` — 展开详情行（含基本信息+使用追踪+变更记录）
- `linkRelationModel.ts:31-39` — `ChangeLogEntry` 接口（含 `operator` 字段，如"财务部-张三"）
- `linkRelationModel.ts:42-45` — `LinkChangeLog` 接口（含 `changes: ChangeLogEntry[]`）
- `linkRelationModel.ts:267-319` — `mockLinkChangeLogs` mock 数据

#### 2.1.1 变更记录区域增加部门筛选和时间过滤

- 在展开详情中的"变更记录"区域上方增加一行筛选栏
- 部门筛选：Dropdown 下拉框，选项为 `['全部', '财务部', '市场部', '网络部', '客服部']`，默认"全部"
  - 从 `ChangeLogEntry.operator` 中提取部门前缀（如"财务部-张三" -> "财务部"）进行过滤
- 时间筛选：两个 DatePicker（或简单日期输入），分别为"开始日期"和"结束日期"
  - 根据 `ChangeLogEntry.timestamp`（格式 `"2026-01-15 09:30:00"`）过滤
- 筛选栏右侧显示"筛选后 N 条"计数

> **补充说明**：部门筛选逻辑是从 `operator` 字段的第一个 `-` 前提取部门名。当前 mock 数据中 operator 格式为 `"{部门}-{姓名}"`，筛选时按此规则解析。如果解析不到 `-`，归入"其他"不显示。

#### 2.1.2 变更记录增加按操作类型 Tab 分类

- 在变更记录区域上方增加 Tab 栏：`全部 | 新增 | 修改 | 删除`
- 默认选中"全部"，点击 Tab 过滤 `ChangeLogEntry.type` 匹配的条目
- Tab 激活态与项目现有 Tab 风格一致（参考 `ReportManagementPage.tsx:124-130` 的 Tab 实现）
- 当筛选后无记录时，显示空状态"暂无此类变更记录"

> **补充说明**：当前 `ChangeLogEntry.type` 有 `"新增"` `"修改"` `"启用"` `"停用"` 四种。Tab 分类中 `"启用"` 和 `"停用"` 均归入 `"修改"` Tab 显示（因为启用/停用本质是修改 enabled 字段）。

**影响文件**：
- `src/pages/link-relation/LinkRelationManagePage.tsx` — 展开详情行增强
- `src/pages/link-relation/LinkRelationManagePage.test.tsx` — 新增筛选+Tab 测试

---

### 2.2 知识库管理 — 编辑/删除文档 + 操作记录

**代码起点**：
- `src/pages/knowledge-upload/MyDocumentsList.tsx` — 文档列表（查看/导入新版本/重新编辑）
- `src/pages/knowledge-upload/MyDocumentsList.tsx` — 导入新版本时直接 `createKnowledgeDocument`，未调用 `addVersionRecord`
- `src/utils/knowledgeBaseStorage.ts:136-156` — `updateKnowledgeDocument()` 已定义但仅在审核状态流转和重新编辑时调用
- `src/utils/knowledgeBaseStorage.ts:203-227` — `addVersionRecord()` 已定义
- `src/models/knowledgeBaseModel.ts:80-90` — `VersionRecord` 接口
- `src/models/knowledgeBaseModel.ts:72` — `KnowledgeDocument.versionRecords?: VersionRecord[]`

#### 2.2.1 增加编辑文档功能

- 在 `MyDocumentsList` 每行操作列增加"编辑"按钮（Pencil 图标）
- 编辑模式：弹窗/Dialog 允许修改文档名称和重新选择文件（类似上传流程但预填已有值）
- 编辑保存后调用 `updateKnowledgeDocument()` + `addVersionRecord()`（changeType 为 `'edit'`）
- 编辑操作实时追加变更记录

> **补充说明**：`VersionRecord.changeType` 当前定义为 `'upload' | 'replace'`，需要扩展为 `'upload' | 'replace' | 'edit' | 'delete'`。此 enum 扩展不影响现有数据读取（新增值即可）。

#### 2.2.2 增加删除文档功能

- 在 `MyDocumentsList` 每行操作列增加"删除"按钮（Trash2 图标，红色）
- 删除确认：点击后弹出确认 Dialog（"确定删除 {文档名}？"）
- 在 `knowledgeBaseStorage.ts` 中新增 `deleteKnowledgeDocument(id: string)` 函数
  - 实现：从 `kg-knowledge-documents` 数组中过滤掉该 ID
- 删除操作记录到变更台账（新增独立变更日志存储，见 2.2.3）
- 删除后刷新列表

#### 2.2.3 操作变更记录管理

- 新增 localStorage key `kgv2-knowledge-change-logs` 存储操作变更记录
- 变更记录数据结构（复用 `ChangeLogEntry` 风格）：
  ```
  interface KnowledgeChangeLog {
    id: string
    documentId: string
    documentName: string
    changeType: 'create' | 'edit' | 'delete' | 'import'
    operator: string
    timestamp: string
    detail?: string
  }
  ```
- 每次新增/编辑/删除/导入新版本时，追加一条记录
- 在 `KnowledgeUploadPage` 中新增第三个 Tab "操作记录"
  - Tab 顺序：上传文档 | 我的文档 | 操作记录
  - 操作记录列表按时间倒序展示，列：时间、文档名、操作类型（badge）、操作人、详情
  - 支持按操作类型筛选（全部/新增/修改/删除/导入）

> **补充说明**：当前的 `VersionRecord` 是文档级别的版本追踪（每个文档自己的版本历史），而 `KnowledgeChangeLog` 是全局级别的操作审计日志。两者互补不冲突——`VersionRecord` 保留在文档详情抽屉中展示，`KnowledgeChangeLog` 在新 Tab 中统一展示。

**影响文件**：
- `src/utils/knowledgeBaseStorage.ts` — 新增 `deleteKnowledgeDocument()` + 日志存储函数
- `src/models/knowledgeBaseModel.ts` — 扩展 `VersionRecord.changeType` + 新增 `KnowledgeChangeLog` 接口
- `src/pages/knowledge-upload/MyDocumentsList.tsx` — 增加编辑/删除按钮
- `src/pages/knowledge-upload/KnowledgeUploadPage.tsx` — 新增"操作记录"Tab
- `src/pages/knowledge-upload/KnowledgeUploadPage.test.tsx` — 更新测试
- `src/pages/knowledge-upload/MyDocumentsList.test.tsx` — 新增编辑/删除测试
- `src/utils/knowledgeBaseStorage.test.ts` — 新增 `deleteKnowledgeDocument` + 日志存储测试

---

### 2.3 报告管理

#### 2.3.1 autoSchedule 开关外置到计划列表行

**代码起点**：
- `ReportPlanDialog.tsx:187-196` — autoSchedule Switch 当前在 Dialog Step 1 内部
- `ReportManagementPage.tsx:149-233` — 计划行结构（名称+频率+标签+版本+操作按钮）

- 从 `ReportPlanDialog` Step 1 中移除 autoSchedule Switch（Dialog 内不再展示此开关）
- 在 `ReportManagementPage` 每个计划行中增加 autoSchedule Switch：
  - 位置：放在计划行右侧操作按钮组中（如"生成报告"按钮旁边）
  - 交互：点击直接切换 `plan.autoSchedule`，调用 `updatePlan(plan)` 保存到 localStorage
  - Toast 提示："自动执行已开启"/"自动执行已关闭" + 5 秒 Undo 按钮
- Switch 样式与项目现有 Switch 一致（参考 `ReportPlanDialog.tsx:188`）
- 计划行已有 `autoSchedule` 标签（第161-165行），Switch 替代标签位置

> **补充说明**：`ReportPlanDialog` 的 Step 1 中移除 Switch，但编辑模式下仍可通过 Dialog 设置 autoSchedule（保留表单字段但不在 Step 1 显示开关 UI）。如果 agent 有疑惑，"放到外面"指的是计划列表行上可直接操作，不进入编辑弹窗。

#### 2.3.2 反哺增强（推迟）

> 本期不做，拆为独立 issue 单独交付。涉及跨模块联动（报告->血缘画布、报告->知识库文档检索+编辑），改动范围大且依赖关系复杂。

#### 2.3.3 Step 2 展示筛选后指标名清单（Chip 列表）

**代码起点**：
- `FilterScopeSelector.tsx:81-96` — `unionIndicatorIds` 并集计算
- `FilterScopeSelector.tsx:98-106` — 实时统计（已选指标数+部门数）
- `FilterScopeSelector.tsx:200-296` — 四个筛选区块的 UI

- 在 `FilterScopeSelector` 底部增加"Chip 列表"区域：
  - 位于实时统计行上方
  - 展示 `unionIndicatorIds` 对应的指标名称列表
  - 每个指标渲染为 Chip（参考 shadcn Badge 或自定义 chip）：
    - 显示指标名称
    - 右侧带叉号删除按钮
  - 点击叉号删除时，同时从对应的 Tree 勾选/Tag 勾选中移除该指标
  - 支持最大展示 10 个 Chip，超出显示 `+N 个指标` 折叠按钮
  - 点击折叠按钮展开全部
- 空状态：无已选指标时隐藏 Chip 区域

> **补充说明**：删除 Chip 时，如果该指标同时被指标树勾选和标签勾选覆盖，需要从两个来源中卸载勾选（用排除集合实现：维护 `chipExcludedIds`，芯片删除加入排除集，并集计算时排除）。这样不会破坏原始的 Tree/Tag 勾选状态。

#### 2.3.4 文案修改：Step 2 "指标范围" -> "指标树范围"

- `FilterScopeSelector.tsx:203` — 标题从 `指标范围` 改为 `指标树范围`
- 对应测试文件中的断言文案同步更新

#### 2.3.5 历史报告页面按钮语义调整

**代码起点**：
- `ReportHistoryPage.tsx:58-131` — 列定义（含"查看报告"外链按钮 + "在线详情"跳转按钮）
- `ReportDetailPage.tsx:292-335` — 版本历史面板（右侧 w-64）

- `ReportHistoryPage` 每行按钮调整：
  - "查看报告"按钮 -> 文案改为"查看最新"（图标 FileText 保留）
    - 功能不变：`window.open('/docs/report.html', '_blank')` 外链打开
  - "在线详情"按钮 -> 文案改为"历史版本"（图标改为 History 或 List）
    - 点击后弹出 Dialog/Sheet，展示该报告所属计划的所有版本列表
    - 不再直接跳转 `/reports/:reportId`

- 历史版本弹窗（新建 `ReportVersionHistoryDialog.tsx`）：
  - 标题："{计划名称} 版本历史"
  - 按 `generatedAt` 倒序展示该计划所有已生成报告
  - 每行：版本号（badge）、生成方式（手动/自动 badge）、生成时间、操作按钮
  - 操作按钮：`[查看]` 按钮 -> 跳转 `/reports/:reportId` 到该版本详情页
  - 当前查看的报告行高亮（蓝色左边框）
  - 与 `ReportDetailPage` 右侧的版本面板数据源一致（均调用 `getReportsByPlanId`）

> **补充说明**：原来"在线详情"按钮直接跳转到报告详情页。改为弹窗后，用户先看到版本列表再选择进入详情。这解决了"如果用户想看历史版本但不知道去哪里找"的问题。弹窗内的"查看"按钮才真正跳转详情页。

**影响文件**：
- `src/components/dialog/ReportPlanDialog.tsx` — 移除 Step 1 的 autoSchedule Switch
- `src/pages/report-management/ReportManagementPage.tsx` — 计划行增加 autoSchedule Switch
- `src/components/report/FilterScopeSelector.tsx` — Chip 列表+文案修改
- `src/pages/report-management/ReportHistoryPage.tsx` — 按钮语义修改
- `src/pages/report-management/ReportVersionHistoryDialog.tsx` — 新建版本历史弹窗
- 对应各文件的测试文件同步更新

---

### 2.4 低优先级

#### 2.4.1 指标树"已挂靠"计数只含真实指标

**代码起点**：
- `AttachedBadge.tsx:42-52` — 当前显示 `已挂靠 {count}`，count 由父组件传入
- `IndicatorTreePanel.tsx:17-25` — `hasAttachedDescendantIndicators()` 判断逻辑（已正确过滤虚拟分组）
- `IndicatorTreePanel.tsx:329-348` — `attachedCount` 的计算方式

- 确认 `IndicatorTreePanel` 中传给 `AttachedBadge` 的 `count` 是否已排除虚拟分组
- 如果当前已正确排除（从代码看 `hasAttachedDescendantIndicators` 已判断 `indicatorType !== '虚拟分组'`），则在 `AttachedBadge` 的 tooltip 中增加提示："其中 N 个真实指标"（如果 count 与 node 下总指标数不同）
- 如果当前 count 包含了虚拟分组，修复计数逻辑

> **补充说明**：此改动极轻量，主要检查计数逻辑和 tooltip 文案，确保显示的 `N` 是业务上有意义的真实指标数量。

#### 2.4.2 在线编辑器调研（不做实现）

- 调研项（只出结论，不写代码）：评估 Monaco Editor / CodeMirror 是否适合嵌入知识文档编辑区
- 输出调研结论到 issue comment，不纳入本次 PRD 的实现范围

#### 2.4.3 规则树节点拖拽（本期不做）

- 用户已确认"低优先级，暂时不动"，不纳入本次实现范围

---

## 三、技术方案

### 模块划分

| Module | 职责 | 新建/修改 |
|--------|------|----------|
| `src/pages/link-relation/LinkRelationManagePage.tsx` | 展开详情增加部门筛选+时间过滤+变更 Tab | 修改 |
| `src/pages/knowledge-upload/KnowledgeUploadPage.tsx` | 新增"操作记录"Tab | 修改 |
| `src/pages/knowledge-upload/MyDocumentsList.tsx` | 增加编辑按钮+删除按钮 | 修改 |
| `src/utils/knowledgeBaseStorage.ts` | 新增 `deleteKnowledgeDocument()` + 变更日志 CRUD | 修改 |
| `src/models/knowledgeBaseModel.ts` | 扩展 `VersionRecord.changeType` + 新增 `KnowledgeChangeLog` | 修改 |
| `src/components/dialog/ReportPlanDialog.tsx` | 移除 Step 1 的 autoSchedule Switch | 修改 |
| `src/pages/report-management/ReportManagementPage.tsx` | 计划行增加 autoSchedule Switch | 修改 |
| `src/components/report/FilterScopeSelector.tsx` | Chip 列表+文案修改 | 修改 |
| `src/pages/report-management/ReportHistoryPage.tsx` | 文案变更："查看最新"+"历史版本"+弹窗触发 | 修改 |
| `src/pages/report-management/ReportVersionHistoryDialog.tsx` | 版本历史弹窗 | 新建 |

### 架构决策

- **过滤逻辑无状态**：部门/时间/Tab 筛选均为前端过滤，不修改原数据，筛选状态用 `useState` 管理
- **Chip 排除集合**：Step 2 指标名 Chip 删除使用 `chipExcludedIds: Set<string>` 方案，不直接修改 Tree/Tag 勾选状态
- **KnowledgeChangeLog 与 VersionRecord 并存**：前者是全局操作审计，后者是文档级版本追踪，互不替代
- **相似度检索 Mock**：本期反哺增强不做，相似度检索方案保留到后续 issue

### 数据模型变更

```
// knowledgeBaseModel.ts — VersionRecord 扩展
type VersionChangeType = 'upload' | 'replace' | 'edit' | 'delete'

// knowledgeBaseModel.ts — 新增
interface KnowledgeChangeLog {
  id: string
  documentId: string
  documentName: string
  changeType: 'create' | 'edit' | 'delete' | 'import'
  operator: string
  timestamp: string
  detail?: string
}
```

### localStorage 新增 Key

| Key | 内容 | 说明 |
|-----|------|------|
| `kgv2-knowledge-change-logs` | `KnowledgeChangeLog[]` | 知识库全局操作审计日志 |

---

## 四、测试策略

| 测试文件 | 测试内容 |
|----------|----------|
| `LinkRelationManagePage.test.tsx` | 部门筛选 Dropdown 渲染+过滤；时间范围过滤；变更 Tab 切换+计数；筛选后空状态 |
| `KnowledgeUploadPage.test.tsx` | "操作记录" Tab 显示；日志列表渲染；操作类型筛选 |
| `MyDocumentsList.test.tsx` | 编辑按钮渲染+弹窗交互；删除按钮+确认弹窗；删除后列表更新 |
| `knowledgeBaseStorage.test.ts` | `deleteKnowledgeDocument()` CRUD 正确性；`addChangeLog()` 追加+读取；`filterChangeLogs()` 过滤 |
| `ReportManagementPage.test.tsx` | autoSchedule Switch 渲染+切换+localStorage 更新+Toast+Undo |
| `FilterScopeSelector.test.tsx` | Chip 列表展示已选指标名；Chip 删除后排除逻辑；最大展示 10 个折叠；标题文案"指标树范围" |
| `ReportHistoryPage.test.tsx` | "查看最新"按钮外链；"历史版本"弹窗触发；弹窗内版本列表+查看按钮 |

---

## 五、范围边界

**本期做**：
- 2.1 关联关系管理 — 变更记录部门/时间筛选 + Tab 分类
- 2.2 知识库管理 — 编辑/删除文档 + 操作记录
- 2.3.1 报告管理 — autoSchedule 开关外置
- 2.3.3 报告管理 — Step 2 指标名 Chip 列表
- 2.3.4 报告管理 — "指标范围"->"指标树范围"文案修改
- 2.3.5 报告管理 — 历史页面按钮语义调整 + 版本弹窗
- 2.4.1 指标树 — 挂靠计数只含真实指标

**本期不做**：
- 2.3.2 反哺增强 — 关系链跳转血缘画布（依赖 LineageCanvasPage 支持 `?focus=` 参数，需单独评估）
- 2.3.2 反哺增强 — 相似度检索知识块管理（依赖 `similarityMock.searchSimilarChunks` 扩展，工作量较大）
- 2.4.2 在线编辑器调研
- 2.4.3 规则树节点操作

> **反哺增强推迟原因**：2.3.2 涉及跨模块联动（报告->血缘画布、报告->知识库文档检索+编辑），改动范围大且依赖关系复杂。建议拆为独立的后续 issue 单独交付。

---

## 六、建议 Issue 拆分

建议拆为 4 个 issues：

| # | Issue | 包含 | 优先级 |
|---|-------|------|--------|
| 1 | 关联关系管理 — 变更记录筛选增强 | 2.1.1 + 2.1.2 | 中 |
| 2 | 知识库管理 — 编辑删除 + 操作记录 | 2.2.1 + 2.2.2 + 2.2.3 | 高 |
| 3 | 报告管理 — 开关外置 + Chip + 文案 + 历史版本 | 2.3.1 + 2.3.3 + 2.3.4 + 2.3.5 | 高 |
| 4 | 报告管理 — 反哺增强（链路跳转 + 相似度知识编辑）| 2.3.2 | 低（单独评估）|

---

## 修订记录

| 日期 | 修订内容 | 修订人 |
|------|---------|--------|
| 2026-06-10 | 基于用户界面微调需求和代码实际状态初稿 | Agent |
"""

labels = "needs-triage"

data = json.dumps({"title": title, "body": body, "labels": [labels]}, ensure_ascii=False).encode("utf-8")

url = f"https://api.github.com/repos/{owner}/{repo}/issues"
req = urllib.request.Request(url, data=data, method="POST")
req.add_header("Authorization", f"Bearer {token}")
req.add_header("Content-Type", "application/json; charset=utf-8")
req.add_header("Accept", "application/vnd.github.v3+json")

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print(f"Issue created: #{result['number']} - {result['html_url']}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode("utf-8"))
except Exception as e:
    print(f"Error: {e}")
