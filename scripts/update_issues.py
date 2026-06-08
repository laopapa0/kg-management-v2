"""
批量更新 GitHub issues 的 title/body。
使用 github_issues_api 模块，token 从环境变量 GITHUB_TOKEN 获取。
"""
from github_issues_api import GitHubAPI, get_repo_info

api = GitHubAPI(*get_repo_info())

# ── 示例：更新 issue #56 ──
body_56 = """## 关联需求

PRD #1 — 指标挂靠核心页面，第 1.2 节：深色/浅色主题切换

## 任务描述

基于 #2 建立的 CSS 变量体系，新增 7 套备选暗色主题（合计 8 套），实现多套暗色方案切换 + Header 内切换器组件。

## 8 套主题方案

| # | 主题 key | 名称 | 来源 | 底色 | 强调色 |
|---|---------|------|------|------|--------|
| 1 | `dark` | 蓝灰（默认） | 当前项目 | `#0F141F` | `#5B8DEF` |
| 2 | `github-dark` | GitHub Dark | Primer Design System | `#0D1117` | `#58A6FF` |
| 3 | `vercel-dark` | Vercel Geist | vercel.com/design | `#0A0A0A` | `#8888FF` |
| 4 | `linear-dark` | Linear | linear.app | `#0D0D0D` | `#5E6AD2` |
| 5 | `tailwind-dark` | Tailwind Plus | tailwindui.com | `#0B1121` | `#38BDF8` |
| 6 | `vscode-dark` | VS Code | VS Code 内置 | `#1E1E1E` | `#569CD6` |
| 7 | `notion-dark` | Notion | notion.so | `#191919` | `#2383E2` |
| 8 | `stripe-dark` | Stripe | stripe.com | `#0C1222` | `#7B8CDE` |

## 验收标准

- [ ] `dark-theme.css` 新增 7 个 `[data-theme="xxx"]` 选择器块，每块包含完整 39 个 `--dark-*` 变量 + 22 个 shadcn HSL 覆盖
- [ ] `ThemeSwitcher` 组件：8 色块 palette grid，hover 显示主题名，点击切换 `data-theme` 属性
- [ ] localStorage key `kgv2-theme` 持久化当前选择
- [ ] 切换器放置在 Header 右侧（部门切换器旁边）
- [ ] 切换即时生效，无需刷新页面
- [ ] 测试文件 `dark-theme.test.ts` 适配多主题验证

## 技术要点

- 所有主题复用现有 `--dark-*` 变量名，不新增变量——仅在不同 `[data-theme]` 下赋予不同色值
- `App.tsx` 中 `useEffect` 从 `data-theme="dark"` 改为读取 localStorage `kgv2-theme`
- 每个主题约 60 行 CSS

## 阻塞项

- #2 Slice 0.1 深色主题 CSS 变量系统

## 影响范围

- `src/styles/dark-theme.css`（+500 行）
- `src/components/theme/ThemeSwitcher.tsx`（新建，~80 行）
- `src/components/Header.tsx`（+ThemeSwitcher 集成）
- `src/styles/dark-theme.test.ts`（适配）"""

body_57 = """## 一、背景与目标

### 要解决什么问题

依据 `# 0606 平台核心功能简化与页面重构.md` 第 1.1 节决策，当前平台功能过于繁杂，运营 NOC 侧认为业务部门界面操作复杂，需大幅简化。需要隐藏运营侧不需要的功能，将导航重构为四大核心菜单。

### 预期目标

- 平台可见路由从 20+ 条精简到 5 条（首页 + 4 大菜单）
- Sidebar 菜单从 3 个分组 18 项精简到 4 个核心项
- 所有审核功能入口/逻辑全部下线
- Dashboard 不再展示 NOC 相关快捷入口

---

## 二、隐藏清单

### 完整隐藏的路由（16 条）

| 分类 | 路由 | 原因 |
|------|------|------|
| NOC | `/noc/object-type` | 运营侧功能 |
| NOC | `/noc/link-relation` | 运营侧功能 |
| NOC | `/noc/property` | 运营侧功能 |
| NOC | `/noc/tag` | 运营侧功能 |
| NOC | `/noc/rule` | 运营侧功能 |
| NOC | `/noc/audit` | 全模块砍审核 |
| NOC | `/noc/inspection` | 运营侧功能 |
| Platform | `/platform/object-type` | 映射/底座 |
| Platform | `/platform/link-type` | 映射/底座 |
| Platform | `/platform/property` | 映射/底座 |
| Platform | `/platform/graph` | 映射/底座 |
| 旧页面 | `/indicator/create` | 旧 v1 表单（含审核步骤） |
| 旧页面 | `/indicator/edit/:id` | 旧 v1 表单（含审核步骤） |
| 旧页面 | `/inspection-todo` | 后续改造为报告管理 |
| 旧页面 | `/tag-config` | 已内置到指标管理标签集 |
| 旧页面 | `/rule-config` | 已内置到指标管理规则树 |

### 合并路由

| 原路由 | 处理 | 目标 |
|--------|------|------|
| `/knowledge-management` | 合并 | 与 `/knowledge-upload` 合并为知识库管理 |

---

## 三、精简后路由与 Sidebar

### 路由表（5 条）

```
/                       →  DashboardPage            （首页）
/indicator-management    →  IndicatorManagementPage  （指标管理，内置标签树+规则树）
/lineage                 →  LineageCanvasPage        （血缘画布）
/reports                 →  ReportManagementPage     （报告管理，新建 placeholder）
/knowledge-upload        →  KnowledgeUploadPage      （知识库管理）
```

### Sidebar 菜单

```
首页        →  /
指标管理     →  /indicator-management
血缘画布     →  /lineage
报告管理     →  /reports
知识库管理   →  /knowledge-upload
```

### 报告管理 placeholder 页面

- 新建 `/reports` 路由 + `src/pages/report-management/ReportManagementPage.tsx`
- 页面内容：标题 "报告管理" + 空状态提示 "报告管理功能开发中，基于巡检模块改造"
- 后续基于 `/inspection-todo` 的巡检逻辑升级为完整报告管理

---

## 四、Dashboard 清理

删除 NOC 相关快捷入口卡片：

| 删除 | 路由 | 原卡片标题 |
|------|------|-----------|
| ❌ | `/noc/audit` | 审核申请 |
| ❌ | `/noc/object-type` | 对象类型 |
| ❌ | `/noc/rule` | 规则库 |

调整后快捷卡片（4 个）：

| 保留 | 路由 | 卡片标题 |
|------|------|---------|
| ✅ | `/indicator-management` | 指标管理 |
| ✅ | `/lineage` | 血缘画布 |
| 🆕 | `/reports` | 报告管理 |
| ✅ | `/knowledge-upload` | 知识库管理 |

Dashboard 中所有 `navigate("/noc/audit")` 等 NOC 导航调用一并移除。

---

## 五、审核逻辑清理

| 位置 | 清理内容 |
|------|---------|
| `DashboardPage.tsx` | 移除 `/noc/audit` 导航卡片和 `navigate` 调用 |
| `IndicatorCreatePage.tsx` | 随路由隐藏一起下线 |
| `IndicatorEditPage.tsx` | 随路由隐藏一起下线 |
| `KnowledgeUploadPage.tsx` | 移除 "预览并发送审核" 按钮和入口 |

---

## 六、实施策略

### 渐进隐藏（不删除文件）

- 页面文件（`/noc/*`、`/platform/*` 下约 50 个文件）**暂不物理删除**
- 仅在 `App.tsx` 中注释路由 + `Sidebar.tsx` 中移除菜单项
- 保留文件作为后续改造参考（如巡检 → 报告管理）

### 数据/状态兼容

- Zustand store（`useAttachmentStore`）不受影响——指标管理页内部状态逻辑不变
- localStorage key 前缀 `kgv2-` 隔离 v1 数据，不需迁移

---

## 七、建议 issue 拆分

建议拆为 3 个 issues：
- **1** = 路由精简 + Sidebar 重构（关联紧密）
- **2** = Dashboard 清理 + 报告管理 placeholder + 审核逻辑剥离
- **3** = 全量测试更新（路由/Sidebar/Dashboard 相关测试适配）

---

## 八、影响范围

- `src/App.tsx` — 路由表精简
- `src/components/Sidebar.tsx` — 菜单重构
- `src/pages/dashboard/DashboardPage.tsx` — 移除 NOC 快捷入口
- `src/pages/report-management/ReportManagementPage.tsx` — 新建
- `src/pages/knowledge-upload/KnowledgeUploadPage.tsx` — 移除审核入口
- `*.test.tsx` — 路由/菜单/Dashboard 相关测试适配"""

api.update_issue(56, "[Slice 0.8] 8 套暗色主题方案 + ThemeSwitcher 切换器", body_56)
api.update_issue(57, "[PRD] 平台模块精简 + 四大核心菜单重构", body_57)
print("Done!")
