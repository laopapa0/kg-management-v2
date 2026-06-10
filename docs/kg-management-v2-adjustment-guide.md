# kg-management-v2 项目调整指导文档（第一波）

## 项目信息

| 项目 | 内容 |
|------|------|
| **项目名称** | 数据指标知识图谱管理平台 |
| **GitHub 仓库** | `https://github.com/laopapa0/kg-management-v2` |
| **技术栈** | React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| **文档日期** | 2025-06-10 |
| **调整波次** | 第一波，共 6 项调整 |

---

## 调整概览

| 编号 | 文件 | 调整内容 |
|------|------|----------|
| 1 | `src/pages/dashboard/DashboardPage.tsx` | 工作台标题改为白色 |
| 2 | `src/pages/link-relation/LinkRelationManagePage.tsx` | 使用追踪区域上方增加筛选横栏（部门+时间） |
| 3 | `src/components/timeline/ChangeTimeline.tsx` | 变更记录上方增加 Tab 筛选栏（全部/新增/修改/删除） |
| 4 | `src/pages/link-relation/LinkRelationManagePage.tsx` | 部门筛选项改为固定四部门 |
| 5 | `src/components/timeline/ChangeTimeline.tsx` | Tab 筛选栏改为批注样式（Tabs 组件） |
| 6 | `src/pages/knowledge-upload/KnowledgeUploadPage.tsx` | 样式参考（作为调整 5 的参考源） |

> **文件清单（最终需同步 3 个文件）**
> - `src/pages/dashboard/DashboardPage.tsx`
> - `src/pages/link-relation/LinkRelationManagePage.tsx`
> - `src/components/timeline/ChangeTimeline.tsx`

---

## 调整 1：工作台标题改为白色

**文件**：`src/pages/dashboard/DashboardPage.tsx`

**定位**：第 153 行

**操作**：给 `<h1>` 增加 `text-white` 类

```tsx
// 修改前
<h1 className="text-display">工作台</h1>

// 修改后
<h1 className="text-display text-white">工作台</h1>
```

**说明**：`text-display` 默认文字颜色为深灰色 `var(--gray-800)`，在深色主题下不可见，追加 `text-white` 强制白色。

---

## 调整 2：使用追踪区域上方增加筛选横栏

**文件**：`src/pages/link-relation/LinkRelationManagePage.tsx`

本调整涉及 5 个修改点：导入类型、常量、状态、筛选函数、UI。

### 2-1 导入类型补充

找到类型导入行：

```tsx
import type { LinkRelation, LinkChangeLog, ChangeLogEntry } from '@/models/linkRelationModel'
```

追加 `LinkUsageConnection`：

```tsx
import type { LinkRelation, LinkChangeLog, ChangeLogEntry, LinkUsageConnection } from '@/models/linkRelationModel'
```

### 2-2 新增常量（添加在 `DIRECTION_OPTIONS` 下方）

```tsx
const TIME_FILTER_OPTIONS = [
  { label: '全部时间', value: 'all' },
  { label: '最近7天', value: '7' },
  { label: '最近30天', value: '30' },
  { label: '最近90天', value: '90' },
]

/** 判断连接是否满足时间筛选条件 */
function matchTimeFilter(createdAt: string, filterValue: string): boolean {
  if (filterValue === 'all' || !filterValue) return true
  const days = parseInt(filterValue, 10)
  if (isNaN(days)) return true
  const connDate = new Date(createdAt)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  return connDate >= cutoffDate
}
```

### 2-3 新增 State（添加在 `changeLogs` state 下方）

```tsx
// 使用追踪筛选状态：按 relationId 存储筛选值
const [usageDeptFilter, setUsageDeptFilter] = useState<Record<string, string>>({})
const [usageTimeFilter, setUsageTimeFilter] = useState<Record<string, string>>({})
```

### 2-4 新增筛选函数（添加在 `handleToggle` 函数之后、`columns` 之前）

```tsx
/** 获取指定 relationId 的筛选后连接数据 */
const getFilteredConnections = useCallback(
  (connections: LinkUsageConnection[], relationId: string) => {
    const deptFilter = usageDeptFilter[relationId] || '全部'
    const timeFilter = usageTimeFilter[relationId] || 'all'

    return connections.filter((conn) => {
      // 部门筛选
      const deptMatch =
        deptFilter === '全部' ||
        extractDeptFromSourceName(conn.sourceName) === deptFilter
      // 时间筛选
      const timeMatch = matchTimeFilter(conn.createdAt, timeFilter)
      return deptMatch && timeMatch
    })
  },
  [usageDeptFilter, usageTimeFilter],
)
```

### 2-5 新增筛选 UI + 替换数据源

在展开行渲染区域，找到：

```tsx
const usage = mockLinkUsages.find((u) => u.relationId === r.id)
const changeLog = changeLogs.find((c) => c.relationId === r.id)
```

在其下方插入筛选计算：

```tsx
const usage = mockLinkUsages.find((u) => u.relationId === r.id)
const changeLog = changeLogs.find((c) => c.relationId === r.id)
// 获取筛选后的连接数据
const filteredConnections = usage
  ? getFilteredConnections(usage.connections, r.id)
  : []
// 获取当前行的部门选项
const deptOptions = getDeptOptions(usage?.connections)
```

在 `<h4>使用追踪</h4>` 标题上方，插入筛选横栏：

```tsx
{/* 使用追踪筛选横栏 */}
{usage && usage.connections.length > 0 && (
  <div className="mb-3 flex items-center gap-3 flex-wrap">
    <span className="text-xs text-dark-text-secondary">筛选：</span>
    {/* 按部门筛选 */}
    <select
      data-testid="usage-dept-filter"
      value={usageDeptFilter[r.id] || '全部'}
      onChange={(e) =>
        setUsageDeptFilter((prev) => ({ ...prev, [r.id]: e.target.value }))
      }
      className="h-8 w-28 rounded-md border border-dark-border bg-dark-card-l1 px-2 text-xs text-dark-text-primary focus:border-dark-accent-primary-hover focus:outline-none"
    >
      {deptOptions.map((opt) => (
        <option key={opt} value={opt}>
          {opt === '全部' ? '全部部门' : opt}
        </option>
      ))}
    </select>
    {/* 按时间筛选 */}
    <select
      data-testid="usage-time-filter"
      value={usageTimeFilter[r.id] || 'all'}
      onChange={(e) =>
        setUsageTimeFilter((prev) => ({ ...prev, [r.id]: e.target.value }))
      }
      className="h-8 w-28 rounded-md border border-dark-border bg-dark-card-l1 px-2 text-xs text-dark-text-primary focus:border-dark-accent-primary-hover focus:outline-none"
    >
      {TIME_FILTER_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {/* 重置筛选 */}
    <button
      data-testid="usage-filter-reset"
      className="text-xs text-blue-400 hover:underline"
      onClick={() => {
        setUsageDeptFilter((prev) => ({ ...prev, [r.id]: '全部' }))
        setUsageTimeFilter((prev) => ({ ...prev, [r.id]: 'all' }))
      }}
    >
      重置
    </button>
    {/* 筛选结果统计 */}
    <span className="ml-auto text-xs text-dark-text-secondary">
      共 {filteredConnections.length} 条
      {filteredConnections.length !== (usage?.connections.length ?? 0) &&
        ` / 总计 ${usage?.connections.length ?? 0} 条`}
    </span>
  </div>
)}
```

### 2-6 表格数据源改为 `filteredConnections`

找到表格 `<table>` 上方的条件：

```tsx
{usage && usage.connections.length > 0 ? (
```

保持不变，找到表格内的 `usage.connections.map`，替换为 `filteredConnections.map`：

```tsx
{filteredConnections.length > 0 ? (
  <table className="w-full border-collapse text-xs">
    ...表头...
    <tbody>
      {filteredConnections.map((conn, idx) => (
        ...行渲染...
      ))}
    </tbody>
  </table>
) : (
  <p className="py-4 text-center text-sm text-dark-text-secondary">
    暂无符合筛选条件的数据
  </p>
)}
```

---

## 调整 3：变更记录上方增加 Tab 筛选栏

**文件**：`src/components/timeline/ChangeTimeline.tsx`

**操作**：用完整新文件替换。

```tsx
import { useState } from 'react'
import type { ChangeLogEntry } from '@/models/linkRelationModel'

interface ChangeTimelineProps {
  changes: ChangeLogEntry[]
}

// Tab 筛选项定义
type FilterType = 'all' | 'create' | 'modify' | 'delete'

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'create', label: '新增' },
  { key: 'modify', label: '修改' },
  { key: 'delete', label: '删除' },
]

// 筛选映射：将 Tab 的 key 映射到 ChangeLogEntry 的 type 字段
const filterTypeMap: Record<Exclude<FilterType, 'all'>, string> = {
  create: '创建',
  modify: '修改',
  delete: '停用',
}

export default function ChangeTimeline({ changes }: ChangeTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // 根据当前选中的筛选条件过滤变更记录
  const filteredChanges =
    activeFilter === 'all'
      ? changes
      : changes.filter((change) => change.type === filterTypeMap[activeFilter])

  // 无原始数据时的空状态
  if (changes.length === 0) {
    return (
      <div data-testid="change-timeline">
        <h4 className="mb-3 text-sm font-medium text-dark-text-primary">变更记录</h4>
        <p className="text-sm text-dark-text-secondary">暂无变更记录</p>
      </div>
    )
  }

  const typeColorMap: Record<string, string> = {
    创建: 'bg-green-500',
    修改: 'bg-blue-500',
    停用: 'bg-red-500',
    启用: 'bg-green-500',
  }

  return (
    <div data-testid="change-timeline">
      {/* Tab 筛选栏 —— 手写 button 样式（将被调整 5 替换） */}
      <div className="mb-3 flex gap-1 rounded-lg bg-dark-surface p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === tab.key
                ? 'bg-dark-accent text-white'
                : 'text-dark-text-secondary hover:text-dark-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <h4 className="mb-3 text-sm font-medium text-dark-text-primary">变更记录</h4>

      {/* 筛选后为空的状态 */}
      {filteredChanges.length === 0 ? (
        <p className="text-sm text-dark-text-secondary">当前筛选条件下暂无变更记录</p>
      ) : (
        <div className="space-y-3">
          {filteredChanges.map((change, index) => (
            <div key={index} className="relative flex gap-3">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${typeColorMap[change.type] ?? 'bg-dark-text-secondary'}`}
                />
                {index < filteredChanges.length - 1 && (
                  <div className="mt-1 h-full w-px bg-dark-border" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dark-text-secondary">{change.timestamp}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs text-white ${typeColorMap[change.type] ?? 'bg-dark-text-secondary'}`}
                  >
                    {change.type}
                  </span>
                  <span className="text-xs text-dark-text-secondary">
                    by <span className="operator-name">{change.operator}</span>
                  </span>
                </div>
                <div className="mt-1 text-sm text-dark-text-primary">
                  <span className="text-dark-text-secondary">{change.field}:</span>{' '}
                  <span className="line-through text-red-400">{change.oldValue}</span>{' '}
                  <span className="text-dark-text-secondary">→</span>{' '}
                  <span className="text-green-400">{change.newValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 调整 4：部门筛选项改为固定四部门

**文件**：`src/pages/link-relation/LinkRelationManagePage.tsx`

**依赖**：需先完成调整 2

**操作**：替换 `extractDeptFromSourceName` 和 `getDeptOptions` 两个工具函数。

在调整 2 中，已在 `TIME_FILTER_OPTIONS` 和 `matchTimeFilter` 下方预留了位置。将原来的函数替换为：

```tsx
/** 将业务域映射到固定部门 */
function mapToDepartment(businessDomain: string): string {
  const domain = businessDomain.trim()
  if (['收入', '成本'].includes(domain)) return '财务部'
  if (['用户', '交付'].includes(domain)) return '市场部'
  if (domain === '网络') return '网络部'
  if (['服务', '投诉'].includes(domain)) return '客服部'
  return '市场部' // 默认
}

/** 从 sourceName 中提取部门，例如 "月_收入_总收入" -> "财务部" */
function extractDeptFromSourceName(sourceName: string): string {
  const parts = sourceName.split('_')
  const businessDomain = parts.length >= 2 ? parts[1] : ''
  return mapToDepartment(businessDomain)
}

/** 获取固定的部门筛选项 */
function getDeptOptions(_connections?: LinkUsageConnection[]): string[] {
  return ['全部', '财务部', '市场部', '网络部', '客服部']
}
```

**业务域映射规则**：

| 业务域（sourceName 第 2 段） | 映射部门 |
|---------------------------|----------|
| 收入、成本 | 财务部 |
| 用户、交付 | 市场部 |
| 网络 | 网络部 |
| 服务、投诉 | 客服部 |
| 其他 | 市场部（默认） |

---

## 调整 5：Tab 筛选栏改为批注样式（Tabs 组件）

**文件**：`src/components/timeline/ChangeTimeline.tsx`

**依赖**：需先完成调整 3

**样式参考**：`src/pages/knowledge-upload/KnowledgeUploadPage.tsx` 第 171 行

```tsx
<TabsList className="mb-4 bg-dark-card-l2 border border-dark-border">
  <TabsTrigger
    value="upload"
    className="text-dark-text-secondary data-[state=active]:bg-dark-card-l1 data-[state=active]:text-dark-text-primary"
  >
```

**操作**：用完整新文件替换。

```tsx
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ChangeLogEntry } from '@/models/linkRelationModel'

interface ChangeTimelineProps {
  changes: ChangeLogEntry[]
}

// Tab 筛选项定义
type FilterType = 'all' | 'create' | 'modify' | 'delete'

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'create', label: '新增' },
  { key: 'modify', label: '修改' },
  { key: 'delete', label: '删除' },
]

// 筛选映射：将 Tab 的 key 映射到 ChangeLogEntry 的 type 字段
const filterTypeMap: Record<Exclude<FilterType, 'all'>, string> = {
  create: '创建',
  modify: '修改',
  delete: '停用',
}

export default function ChangeTimeline({ changes }: ChangeTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // 根据当前选中的筛选条件过滤变更记录
  const filteredChanges =
    activeFilter === 'all'
      ? changes
      : changes.filter((change) => change.type === filterTypeMap[activeFilter])

  // 无原始数据时的空状态
  if (changes.length === 0) {
    return (
      <div data-testid="change-timeline">
        <h4 className="mb-3 text-sm font-medium text-dark-text-primary">变更记录</h4>
        <p className="text-sm text-dark-text-secondary">暂无变更记录</p>
      </div>
    )
  }

  const typeColorMap: Record<string, string> = {
    创建: 'bg-green-500',
    修改: 'bg-blue-500',
    停用: 'bg-red-500',
    启用: 'bg-green-500',
  }

  return (
    <div data-testid="change-timeline">
      {/* Tab 筛选栏 —— shadcn/ui Tabs 批注样式 */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterType)}>
        <TabsList className="mb-3 bg-dark-card-l2 border border-dark-border">
          {filterTabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="text-dark-text-secondary data-[state=active]:bg-dark-card-l1 data-[state=active]:text-dark-text-primary"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <h4 className="mb-3 text-sm font-medium text-dark-text-primary">变更记录</h4>

      {/* 筛选后为空的状态 */}
      {filteredChanges.length === 0 ? (
        <p className="text-sm text-dark-text-secondary">当前筛选条件下暂无变更记录</p>
      ) : (
        <div className="space-y-3">
          {filteredChanges.map((change, index) => (
            <div key={index} className="relative flex gap-3">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${typeColorMap[change.type] ?? 'bg-dark-text-secondary'}`}
                />
                {index < filteredChanges.length - 1 && (
                  <div className="mt-1 h-full w-px bg-dark-border" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dark-text-secondary">{change.timestamp}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs text-white ${typeColorMap[change.type] ?? 'bg-dark-text-secondary'}`}
                  >
                    {change.type}
                  </span>
                  <span className="text-xs text-dark-text-secondary">
                    by <span className="operator-name">{change.operator}</span>
                  </span>
                </div>
                <div className="mt-1 text-sm text-dark-text-primary">
                  <span className="text-dark-text-secondary">{change.field}:</span>{' '}
                  <span className="line-through text-red-400">{change.oldValue}</span>{' '}
                  <span className="text-dark-text-secondary">→</span>{' '}
                  <span className="text-green-400">{change.newValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 调整 6：样式修改参考

**文件**：`src/pages/knowledge-upload/KnowledgeUploadPage.tsx` 第 171 行

**说明**：该位置的 `TabsList` + `TabsTrigger` 样式作为调整 5 的样式参考源。具体参考值：

```tsx
<TabsList className="mb-4 bg-dark-card-l2 border border-dark-border">
  <TabsTrigger
    value="xxx"
    className="text-dark-text-secondary data-[state=active]:bg-dark-card-l1 data-[state=active]:text-dark-text-primary"
  >
```

已在调整 5 中应用，无需单独修改此文件。

---

## 本地同步步骤

### 方式一：文件整体替换（推荐）

将以下 3 个文件直接覆盖本地项目中对应位置的文件：

| 文件 | 在本项目中获取方式 |
|------|------------------|
| `src/pages/dashboard/DashboardPage.tsx` | 仅修改第 153 行（调整 1） |
| `src/pages/link-relation/LinkRelationManagePage.tsx` | 按顺序执行调整 2 和调整 4 |
| `src/components/timeline/ChangeTimeline.tsx` | 使用调整 5 的完整代码替换 |

### 方式二：Git 提交

```bash
# 1. 查看变更
git diff

# 2. 添加文件
git add src/pages/dashboard/DashboardPage.tsx \
       src/pages/link-relation/LinkRelationManagePage.tsx \
       src/components/timeline/ChangeTimeline.tsx

# 3. 提交
git commit -m "adjust: 第一波调整 - 标题白色+筛选横栏+Tab批注样式+固定四部门"

# 4. 推送
git push origin main
```

---

## 构建验证

```bash
npm run build
```

构建成功后 `dist/` 目录应包含 `index.html` 和 `assets/`。

---

## 注意事项

1. **执行顺序**：调整 2 必须早于调整 4（调整 4 在调整 2 基础上修改函数）
2. **调整 3 和 5**：调整 5 的代码已包含调整 3 的全部功能，直接用调整 5 的完整代码替换文件即可
3. **筛选状态隔离**：部门和时间筛选按 `relationId` 独立存储，多行展开互不干扰
4. **部门映射**：基于 `sourceName` 的 `周期_业务域_指标名` 命名规范提取业务域后映射
