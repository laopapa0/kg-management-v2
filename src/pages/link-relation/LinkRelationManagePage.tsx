import { useState, useMemo } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import ChangeTimeline from '@/components/timeline/ChangeTimeline'
import { mockLinkRelations, mockLinkUsages, mockLinkChangeLogs } from '@/models/linkRelationModel'
import type { LinkRelation } from '@/models/linkRelationModel'

export default function LinkRelationManagePage() {
  const [relations, setRelations] = useState<LinkRelation[]>(mockLinkRelations)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return relations
    const kw = search.toLowerCase()
    return relations.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        r.description.toLowerCase().includes(kw),
    )
  }, [relations, search])

  const handleToggle = (id: string) => {
    setRelations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    )
  }

  return (
    <div data-testid="link-relation-manage-page" className="h-full text-dark-text-primary">
      <h1 className="mb-6 text-xl font-semibold">关联关系类型管理</h1>
      <div className="mb-4">
        <Input
          placeholder="搜索关系类型..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
      </div>
      <div className="rounded-md border border-dark-border bg-dark-card">
        {/* Header */}
        <div className="flex items-center border-b border-dark-border px-4 py-2 text-sm font-medium text-dark-text-secondary">
          <span className="w-32">名称</span>
          <span className="flex-1">描述</span>
          <span className="w-20 text-center">状态</span>
          <span className="w-20 text-center">使用次数</span>
          <span className="w-20 text-center">操作</span>
        </div>
        {filtered.map((r) => {
          const usage = mockLinkUsages.find((u) => u.relationId === r.id)
          const changeLog = mockLinkChangeLogs.find((c) => c.relationId === r.id)
          return (
            <div key={r.id}>
              <div className="flex items-center border-b border-dark-border px-4 py-3 last:border-b-0">
                <span className="w-32 font-medium">{r.name}</span>
                <span className="flex-1 text-sm text-dark-text-secondary">{r.description}</span>
                <span className="w-20 text-center">
                  <Switch checked={r.enabled} onCheckedChange={() => handleToggle(r.id)} />
                </span>
                <span className="w-20 text-center text-sm">{r.usageCount}</span>
                <span className="w-20 text-center">
                  <button
                    className="text-xs text-blue-400 hover:underline"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    {expandedId === r.id ? '收起' : '查看详情'}
                  </button>
                </span>
              </div>
              {expandedId === r.id && (
                <div className="border-b border-dark-border bg-dark-elevated px-4 py-4 text-sm text-dark-text-secondary">
                  {/* 基本信息 */}
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div>源类型：{r.sourceType}</div>
                    <div>目标类型：{r.targetType}</div>
                    <div>创建时间：{r.createdAt}</div>
                  </div>
                  {/* 使用追踪 */}
                  <div className="mb-4 border-t border-dark-border pt-4" data-testid="usage-tracking">
                    <h4 className="mb-2 text-sm font-medium text-dark-text-primary">
                      使用追踪
                    </h4>
                    {usage ? (
                      <>
                        <p className="mb-2 text-sm">
                          被 <span className="font-medium text-dark-text-primary">{usage.connectionCount}</span> 个血缘连线引用
                        </p>
                        <div className="space-y-1">
                          {usage.connections.map((conn, idx) => (
                            <div key={idx} className="text-xs">
                              {conn.sourceName} <span className="text-dark-text-secondary">→</span> {conn.targetName}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm">暂无使用记录</p>
                    )}
                  </div>
                  {/* 变更记录 */}
                  <div className="border-t border-dark-border pt-4">
                    {changeLog ? (
                      <ChangeTimeline changes={changeLog.changes} />
                    ) : (
                      <ChangeTimeline changes={[]} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
