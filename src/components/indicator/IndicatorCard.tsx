import { Badge } from '@/components/ui/badge'
import { DURATION } from '@/components/motion/motion.tokens'

export interface IndicatorCardProps {
  id: string
  name: string
  code: string
  level1: string
  level2: string
  source?: string
  state?: 'default' | 'hover' | 'selected' | 'attached'
  onClick?: () => void
}

export default function IndicatorCard({
  id,
  name,
  code,
  level1,
  level2,
  source,
  state = 'default',
  onClick,
}: IndicatorCardProps) {
  const isHover = state === 'hover'
  const isSelected = state === 'selected'
  const isAttached = state === 'attached'

  return (
    <div
      data-testid="indicator-card"
      data-indicator-id={id}
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={[
        'relative flex min-h-[120px] flex-col gap-3 rounded-lg border p-4',
        'bg-dark-card-l1 text-dark-text-primary',
        'outline-none transition-all',
        isAttached ? 'opacity-50' : 'opacity-100',
        isHover ? '-translate-y-px shadow-card-hover' : 'shadow-none',
        isSelected
          ? 'border-dark-accent-primary ring-2 ring-dark-accent-primary shadow-[0_0_12px_rgba(91,141,239,0.35)]'
          : 'border-dark-border',
        onClick && !isAttached ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
      style={{ transitionDuration: `${DURATION.fast * 1000}ms` }}
    >
      {isSelected && (
        <span
          data-testid="pulse-dot"
          className="absolute right-3 top-3 flex size-2"
        >
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-dark-accent-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-dark-accent-primary" />
        </span>
      )}

      <div className="flex flex-col gap-1 pr-4">
        <h4 className="text-body font-medium text-dark-text-primary">{name}</h4>
        <span className="text-caption text-dark-text-secondary font-mono">{code}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="bg-dark-card-l2 text-dark-text-secondary">
          {level1}
        </Badge>
        <Badge variant="secondary" className="bg-dark-card-l2 text-dark-text-secondary">
          {level2}
        </Badge>
      </div>

      <div className="mt-auto flex items-center justify-between">
        {source ? (
          <span className="text-caption text-dark-text-tertiary">{source}</span>
        ) : (
          <span />
        )}
        {isAttached && (
          <Badge className="bg-dark-status-success/20 text-dark-status-success border-transparent">
            已挂靠
          </Badge>
        )}
      </div>
    </div>
  )
}
