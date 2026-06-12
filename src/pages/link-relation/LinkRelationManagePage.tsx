import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import DataTable, { type Column } from '@/components/DataTable'
import ChangeTimeline from '@/components/timeline/ChangeTimeline'
import LinkRelationFormDialog from './LinkRelationFormDialog'
import {
  mockLinkRelations,
  mockLinkUsages,
  mockLinkChangeLogs,
} from '@/models/linkRelationModel'
import type { LinkRelation, LinkChangeLog, ChangeLogEntry, LinkUsageConnection } from '@/models/linkRelationModel'
import { mockAiRecommendations } from '@/models/linkRelationModel'
import AiRecommendationList from '@/components/link-relation/AiRecommendationList'
import { IconRenderer } from '@/utils/icons.tsx'

const SOURCE_TYPE_OPTIONS = ['全部', '指标', '虚拟分组', '外部因素']
const DIRECTION_OPTIONS = ['全部', '有向', '无向']

const TIME_FILTER_OPTIONS = [
  { label: '全部时间', value: 'all' },
  { label: '最近7天', value: '7' },
  { label: '最近30天', value: '30' },
  { label: '最近90天', value: '90' },
]

function matchTimeFilter(createdAt: string, filterValue: string): boolean {
  if (filterValue === 'all' || !filterValue) return true
  const days = parseInt(filterValue, 10)
  if (isNaN(days)) return true
  const connDate = new Date(createdAt)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  return connDate >= cutoffDate
}

/** 将业务域映射到固定部门 */
function mapToDepartment(businessDomain: string): string {
  const domain = businessDomain.trim()
  if (['收入', '成本'].includes(domain)) return '财务部'
  if (['用户', '交付'].includes(domain)) return '市场部'
  if (domain === '网络') return '网络部'
  if (['服务', '投诉'].includes(domain)) return '客服部'
  return '市场部'
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

export default function LinkRelationManagePage() {
  const [tab, setTab] = useState<'relations' | 'ai'>('relations')
  const [relations, setRelations] = useState<LinkRelation[]>(mockLinkRelations)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [directionFilter, setDirectionFilter] = useState('全部')
  const [sourceTypeFilter, setSourceTypeFilter] = useState('全部')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRelation, setEditingRelation] = useState<LinkRelation | undefined>(undefined)
  const [changeLogs, setChangeLogs] = useState<LinkChangeLog[]>(mockLinkChangeLogs)
  const [usageDeptFilter, setUsageDeptFilter] = useState<Record<string, string>>({})
  const [usageTimeFilter, setUsageTimeFilter] = useState<Record<string, string>>({})
  const pageSize = 10
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    let result = relations

    if (search.trim()) {
      const kw = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.code.toLowerCase().includes(kw) ||
          r.name.toLowerCase().includes(kw) ||
          r.displayName.toLowerCase().includes(kw) ||
          r.description.toLowerCase().includes(kw) ||
          r.sourceTypes.some((t) => t.toLowerCase().includes(kw)) ||
          r.targetTypes.some((t) => t.toLowerCase().includes(kw)),
      )
    }

    if (directionFilter !== '全部') {
      result = result.filter((r) => r.direction === directionFilter)
    }

    if (sourceTypeFilter !== '全部') {
      result = result.filter((r) => r.sourceTypes.includes(sourceTypeFilter))
    }

    return result
  }, [relations, search, directionFilter, sourceTypeFilter])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const handleReset = useCallback(() => {
    setSearch('')
    setDirectionFilter('全部')
    setSourceTypeFilter('全部')
    setPage(1)
  }, [])

  // / key shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleToggle = (id: string) => {
    setRelations((prev) => {
      const relation = prev.find((r) => r.id === id)
      if (!relation) return prev
      const newEnabled = !relation.enabled
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      const entry: ChangeLogEntry = {
        timestamp: now,
        type: '修改',
        field: 'enabled',
        oldValue: String(relation.enabled),
        newValue: String(newEnabled),
        operator: '运营部-系统',
      }
      setChangeLogs((logs) => {
        const existing = logs.find((l) => l.relationId === id)
        if (existing) {
          return logs.map((l) =>
            l.relationId === id ? { ...l, changes: [...l.changes, entry] } : l,
          )
        }
        return [...logs, { relationId: id, changes: [entry] }]
      })
      return prev.map((r) => (r.id === id ? { ...r, enabled: newEnabled } : r))
    })
  }

  const getFilteredConnections = useCallback(
    (connections: LinkUsageConnection[], relationId: string) => {
      const deptFilter = usageDeptFilter[relationId] || '全部'
      const timeFilter = usageTimeFilter[relationId] || 'all'

      return connections.filter((conn) => {
        const deptMatch =
          deptFilter === '全部' ||
          extractDeptFromSourceName(conn.sourceName) === deptFilter
        const timeMatch = matchTimeFilter(conn.createdAt, timeFilter)
        return deptMatch && timeMatch
      })
    },
    [usageDeptFilter, usageTimeFilter],
  )

  const columns: Column<LinkRelation>[] = useMemo(
    () => [
      {
        key: 'icon',
        title: '图标',
        width: 'w-16',
        align: 'center',
        render: (r: LinkRelation) => <IconRenderer name={r.icon} size={18} />,
      },
      {
        key: 'displayName',
        title: '中文名',
        width: 'w-24',
        render: (r: LinkRelation) => (
          <span className="font-medium text-dark-text-primary">{r.displayName}</span>
        ),
      },
      {
        key: 'code',
        title: '编码',
        width: 'w-28',
        render: (r: LinkRelation) => (
          <code className="text-[12px] font-mono text-dark-text-secondary">{r.code}</code>
        ),
      },
      {
        key: 'name',
        title: '英文名',
        width: 'w-28',
        render: (r: LinkRelation) => (
          <span className="text-[13px] text-dark-text-secondary">{r.name}</span>
        ),
      },
      {
        key: 'direction',
        title: '方向',
        width: 'w-16',
        align: 'center',
        render: (r: LinkRelation) => (
          <span className="text-[13px]">{r.direction}</span>
        ),
      },
      {
        key: 'color',
        title: '颜色',
        width: 'w-20',
        render: (r: LinkRelation) => (
          <div className="flex items-center gap-2">
            <span
              className="size-4 rounded-full border border-dark-border shrink-0"
              style={{ backgroundColor: r.color }}
            />
            <code className="text-[11px] font-mono text-dark-text-secondary">{r.color}</code>
          </div>
        ),
      },
      {
        key: 'sourceTypes',
        title: '源类型',
        width: 'w-28',
        render: (r: LinkRelation) => (
          <span className="text-[12px] text-dark-text-secondary">{r.sourceTypes.join(', ')}</span>
        ),
      },
      {
        key: 'targetTypes',
        title: '目标类型',
        width: 'w-28',
        render: (r: LinkRelation) => (
          <span className="text-[12px] text-dark-text-secondary">{r.targetTypes.join(', ')}</span>
        ),
      },
      {
        key: 'enabled',
        title: '状态',
        width: 'w-16',
        align: 'center',
        render: (r: LinkRelation) => (
          <Switch checked={r.enabled} onCheckedChange={() => handleToggle(r.id)} />
        ),
      },
      {
        key: 'action',
        title: '操作',
        width: 'w-28',
        align: 'center',
        render: (r: LinkRelation) => (
          <div className="flex items-center justify-center gap-2">
            <button
              data-testid="edit-relation-btn"
              className="text-xs text-blue-400 hover:underline"
              onClick={() => {
                setEditingRelation(r)
                setDialogOpen(true)
              }}
            >
              编辑
            </button>
            <button
              className="text-xs text-blue-400 hover:underline"
              onClick={() => setExpandedId((prev) => (prev === r.id ? null : r.id))}
            >
              查看详情
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div data-testid="link-relation-manage-page" className="h-full text-dark-text-primary">
      <h1 className="mb-4 text-xl font-semibold">基础维护</h1>
      {/* Tab 导航 */}
      <div data-testid="link-relation-tabs" className="mb-4 flex gap-0 border-b border-dark-border">
        <button
          data-testid="tab-relations"
          onClick={() => setTab('relations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'relations'
              ? 'border-dark-accent-primary text-dark-accent-primary'
              : 'border-transparent text-dark-text-secondary hover:text-dark-text-primary'
          }`}
        >
          关联关系管理
        </button>
        <button
          data-testid="tab-ai"
          onClick={() => setTab('ai')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'ai'
              ? 'border-dark-accent-primary text-dark-accent-primary'
              : 'border-transparent text-dark-text-secondary hover:text-dark-text-primary'
          }`}
        >
          AI推荐管理
        </button>
      </div>

      {tab === 'ai' && (
        <AiRecommendationList recommendations={mockAiRecommendations} />
      )}

      {tab === 'relations' && (
      <>
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Button
          data-testid="add-relation-btn"
          onClick={() => setDialogOpen(true)}
          className="bg-dark-accent-primary hover:bg-dark-accent-primary-active h-9"
        >
          新增
        </Button>
        <Input
          ref={searchRef}
          placeholder="搜索关系类型..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-80"
        />
        <select
          data-testid="direction-filter"
          value={directionFilter}
          onChange={(e) => { setDirectionFilter(e.target.value); setPage(1) }}
          className="h-9 w-24 rounded-md border border-dark-border bg-dark-card-l1 px-2 text-sm text-dark-text-primary focus:border-dark-accent-primary-hover focus:outline-none"
        >
          {DIRECTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          data-testid="source-type-filter"
          value={sourceTypeFilter}
          onChange={(e) => { setSourceTypeFilter(e.target.value); setPage(1) }}
          className="h-9 w-28 rounded-md border border-dark-border bg-dark-card-l1 px-2 text-sm text-dark-text-primary focus:border-dark-accent-primary-hover focus:outline-none"
        >
          {SOURCE_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <Button
          data-testid="filter-reset"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-9"
        >
          重置
        </Button>
      </div>
      <LinkRelationFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingRelation(undefined)
        }}
        existingRelations={relations}
        initialData={editingRelation}
        onSubmit={(data) => {
          if (editingRelation) {
            // Edit mode
            setRelations((prev) =>
              prev.map((r) =>
                r.id === editingRelation.id
                  ? { ...r, ...data }
                  : r,
              ),
            )
          } else {
            // Create mode
            const newRelation: LinkRelation = {
              ...data,
              id: `LKT-${String(relations.length + 1).padStart(3, '0')}`,
              usageCount: 0,
              createdAt: new Date().toISOString().split('T')[0],
            }
            setRelations((prev) => [newRelation, ...prev])
          }
          setDialogOpen(false)
          setEditingRelation(undefined)
        }}
      />
      <div className="rounded-md border border-dark-border bg-dark-card-l1">
        <DataTable
          columns={columns}
          data={paginated}
          rowKey="id"
          emptyText="暂无关联关系类型"
          pagination={{
            current: page,
            pageSize,
            total: filtered.length,
            onChange: setPage,
          }}
        />
        {paginated.map((r) => {
          if (expandedId !== r.id) return null
          const usage = mockLinkUsages.find((u) => u.relationId === r.id)
          const changeLog = changeLogs.find((c) => c.relationId === r.id)
          const filteredConnections = usage
            ? getFilteredConnections(usage.connections, r.id)
            : []
          const deptOptions = getDeptOptions(usage?.connections)
          return (
            <div
              key={`detail-${r.id}`}
              className="border-t border-dark-border bg-dark-elevated px-4 py-4 text-sm text-dark-text-secondary"
            >
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div>源类型：{r.sourceTypes.join(', ')}</div>
                <div>目标类型：{r.targetTypes.join(', ')}</div>
                <div>创建时间：{r.createdAt}</div>
              </div>
              <div className="mb-4 border-t border-dark-border pt-4" data-testid="usage-tracking">
                {usage && usage.connections.length > 0 && (
                  <div className="mb-3 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-dark-text-secondary">筛选：</span>
                    <Select
                      value={usageDeptFilter[r.id] || '全部'}
                      onValueChange={(v) =>
                        setUsageDeptFilter((prev) => ({ ...prev, [r.id]: v }))
                      }
                    >
                      <SelectTrigger
                        data-testid="usage-dept-filter"
                        className="h-8 w-32"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deptOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt === '全部' ? '全部部门' : opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={usageTimeFilter[r.id] || 'all'}
                      onValueChange={(v) =>
                        setUsageTimeFilter((prev) => ({ ...prev, [r.id]: v }))
                      }
                    >
                      <SelectTrigger
                        data-testid="usage-time-filter"
                        className="h-8 w-32"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_FILTER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <span className="ml-auto text-xs text-dark-text-secondary">
                      共 {filteredConnections.length} 条
                      {filteredConnections.length !== (usage?.connections.length ?? 0) &&
                        ` / 总计 ${usage?.connections.length ?? 0} 条`}
                    </span>
                  </div>
                )}
                <h4 className="mb-2 text-sm font-medium text-dark-text-primary">使用追踪</h4>
                {usage && usage.connections.length > 0 ? (
                  <>
                    <p className="mb-2 text-sm">
                      该类型已被 <span className="font-medium text-dark-text-primary">{usage.connectionCount}</span> 条血缘连线引用
                    </p>
                    {filteredConnections.length > 0 ? (
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-dark-border text-dark-text-secondary">
                            <th className="py-1.5 text-left font-medium">来源指标</th>
                            <th className="py-1.5 text-left font-medium">目标指标</th>
                            <th className="py-1.5 text-left font-medium">创建时间</th>
                            <th className="py-1.5 text-left font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredConnections.map((conn, idx) => (
                            <tr key={idx} className="border-b border-dark-border/50">
                              <td className="py-1.5">{conn.sourceName}</td>
                              <td className="py-1.5">{conn.targetName}</td>
                              <td className="py-1.5">{conn.createdAt}</td>
                              <td className="py-1.5">
                                <button className="text-blue-400 hover:underline">跳转画布</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="py-4 text-center text-sm text-dark-text-secondary">
                        暂无符合筛选条件的数据
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm">暂无连线引用此关系类型</p>
                )}
              </div>
              <div className="border-t border-dark-border pt-4">
                {changeLog ? (
                  <ChangeTimeline changes={changeLog.changes} />
                ) : (
                  <ChangeTimeline changes={[]} />
                )}
              </div>
            </div>
          )
        })}
      </div>
      </>
      )}
    </div>
  )
}
