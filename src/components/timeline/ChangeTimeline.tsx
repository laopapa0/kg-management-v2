import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ChangeLogEntry } from '@/models/linkRelationModel'

interface ChangeTimelineProps {
  changes: ChangeLogEntry[]
}

type FilterType = 'all' | '新增' | '修改' | '删除'

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: '新增', label: '新增' },
  { key: '修改', label: '修改' },
  { key: '删除', label: '删除' },
]

const typeColorMap: Record<string, string> = {
  新增: 'bg-green-500',
  修改: 'bg-blue-500',
  删除: 'bg-red-500',
}

export default function ChangeTimeline({ changes }: ChangeTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredChanges =
    activeFilter === 'all'
      ? changes
      : changes.filter((change) => change.type === activeFilter)

  if (changes.length === 0) {
    return (
      <div data-testid="change-timeline">
        <h4 className="mb-3 text-sm font-medium text-dark-text-primary">变更记录</h4>
        <p className="text-sm text-dark-text-secondary">暂无变更记录</p>
      </div>
    )
  }

  return (
    <div data-testid="change-timeline">
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

      {filteredChanges.length === 0 ? (
        <p className="text-sm text-dark-text-secondary">当前筛选条件下暂无变更记录</p>
      ) : (
        <div className="space-y-3">
          {filteredChanges.map((change, index) => (
            <div key={index} className="relative flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${typeColorMap[change.type] ?? 'bg-dark-text-secondary'}`}
                />
                {index < filteredChanges.length - 1 && (
                  <div className="mt-1 h-full w-px bg-dark-border" />
                )}
              </div>
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
