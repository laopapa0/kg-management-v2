import type { ChangeLogEntry } from '@/models/linkRelationModel'

interface ChangeTimelineProps {
  changes: ChangeLogEntry[]
}

export default function ChangeTimeline({ changes }: ChangeTimelineProps) {
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
      <h4 className="mb-3 text-sm font-medium text-dark-text-primary">变更记录</h4>
      <div className="space-y-3">
        {changes.map((change, index) => (
          <div key={index} className="relative flex gap-3">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ${typeColorMap[change.type] ?? 'bg-dark-text-secondary'}`}
              />
              {index < changes.length - 1 && (
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
                <span className="text-xs text-dark-text-secondary">by <span className="operator-name">{change.operator}</span></span>
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
    </div>
  )
}
