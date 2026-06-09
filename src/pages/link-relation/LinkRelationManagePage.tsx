import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


import DataTable, { type Column } from '@/components/DataTable'
import ChangeTimeline from '@/components/timeline/ChangeTimeline'
import LinkRelationFormDialog from './LinkRelationFormDialog'
import {
  mockLinkRelations,
  mockLinkUsages,
  mockLinkChangeLogs,
} from '@/models/linkRelationModel'
import type { LinkRelation, LinkChangeLog, ChangeLogEntry } from '@/models/linkRelationModel'
import { IconRenderer } from '@/utils/icons.tsx'

const SOURCE_TYPE_OPTIONS = ['全部', '指标', '虚拟分组', '外部因素']
const DIRECTION_OPTIONS = ['全部', '有向', '无向']

export default function LinkRelationManagePage() {
  const [relations, setRelations] = useState<LinkRelation[]>(mockLinkRelations)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [directionFilter, setDirectionFilter] = useState('全部')
  const [sourceTypeFilter, setSourceTypeFilter] = useState('全部')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRelation, setEditingRelation] = useState<LinkRelation | undefined>(undefined)
  const [changeLogs, setChangeLogs] = useState<LinkChangeLog[]>(mockLinkChangeLogs)
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
      // Record change log
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      const entry: ChangeLogEntry = {
        timestamp: now,
        type: newEnabled ? '启用' : '停用',
        field: 'enabled',
        oldValue: String(relation.enabled),
        newValue: String(newEnabled),
        operator: 'admin',
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
      <h1 className="mb-6 text-xl font-semibold">关联关系类型管理</h1>
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
      <div className="rounded-md border border-dark-border bg-dark-card">
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
                <h4 className="mb-2 text-sm font-medium text-dark-text-primary">使用追踪</h4>
                {usage && usage.connections.length > 0 ? (
                  <>
                    <p className="mb-2 text-sm">
                      该类型已被 <span className="font-medium text-dark-text-primary">{usage.connectionCount}</span> 条血缘连线引用
                    </p>
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
                        {usage.connections.map((conn, idx) => (
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
    </div>
  )
}
