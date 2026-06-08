import { useState, useMemo } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { mockLinkRelations } from '@/models/linkRelationModel'
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
    <div data-testid="link-relation-manage-page" className="h-full bg-dark-page p-6 text-dark-text-primary">
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
        {filtered.map((r) => (
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
              <div className="border-b border-dark-border bg-dark-elevated px-4 py-3 text-sm text-dark-text-secondary">
                <div className="grid grid-cols-3 gap-4">
                  <div>源类型：{r.sourceType}</div>
                  <div>目标类型：{r.targetType}</div>
                  <div>创建时间：{r.createdAt}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
