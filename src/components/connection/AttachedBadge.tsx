import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface AttachedIndicator {
  id: string
  name: string
}

interface AttachedBadgeProps {
  count: number
  indicators: AttachedIndicator[]
  onDeleteOne: (indicatorId: string) => void
  onDeleteAll: () => void
}

export default function AttachedBadge({
  count,
  indicators,
  onDeleteOne,
  onDeleteAll,
}: AttachedBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (count === 0) return null

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        data-testid="attached-badge"
        onClick={() => setIsOpen((prev) => !prev)}
        className={[
          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white',
          'bg-[var(--dark-accent-primary)] transition-all duration-150 hover:brightness-110',
        ].join(' ')}
      >
        已挂靠 {count}
      </button>

      {isOpen && (
        <div
          data-testid="attached-panel"
          className={[
            'absolute right-0 top-full z-50 mt-1 w-60 rounded-lg border border-dark-border-default',
            'bg-dark-card-l1 shadow-lg overflow-hidden',
          ].join(' ')}
        >
          <div
            data-testid="attached-panel-header"
            className="flex items-center justify-between border-b border-dark-border-default px-3 py-2"
          >
            <span className="text-xs font-medium text-dark-text-primary">
              已挂靠 {count} 个指标
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex size-5 items-center justify-center rounded text-dark-text-tertiary hover:text-dark-text-primary"
            >
              <X className="size-3" />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {indicators.map((indicator) => (
              <div
                key={indicator.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-dark-elevated/[0.04]"
              >
                <span className="truncate text-xs text-dark-text-primary">{indicator.name}</span>
                <button
                  type="button"
                  data-testid="attached-panel-delete-one"
                  onClick={() => onDeleteOne(indicator.id)}
                  className="flex size-5 shrink-0 items-center justify-center rounded text-dark-text-tertiary hover:text-red-400"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-dark-border-default px-3 py-2">
            <button
              type="button"
              data-testid="attached-panel-delete-all"
              onClick={() => {
                onDeleteAll()
                setIsOpen(false)
              }}
              className="w-full rounded-md bg-red-500/10 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              移除全部
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
