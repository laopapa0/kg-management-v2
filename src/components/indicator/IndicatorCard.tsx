import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
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
  state: cardState = 'default',
  onClick,
}: IndicatorCardProps) {
  const isHover = cardState === 'hover'
  const isSelected = cardState === 'selected'
  const isAttached = cardState === 'attached'

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  const controls = useAnimation()
  const controlsRef = useRef(controls)
  controlsRef.current = controls

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        sourceId: string
        targetId: string
      }
      if (detail.sourceId !== id) return

      const targetEl = document.querySelector(`[data-indicator-id="${detail.targetId}"]`) as HTMLElement | null
      const cardEl = document.querySelector(`[data-indicator-id="${id}"]`) as HTMLElement | null
      if (!targetEl || !cardEl) return

      const targetRect = targetEl.getBoundingClientRect()
      const cardRect = cardEl.getBoundingClientRect()

      const deltaX =
        targetRect.left +
        targetRect.width / 2 -
        (cardRect.left + cardRect.width / 2)
      const deltaY =
        targetRect.top +
        targetRect.height / 2 -
        (cardRect.top + cardRect.height / 2)

      // T+0: scale 1→0.9
      // T+100ms: fly to target (200ms)
      // T+300ms: fade out
      controlsRef.current
        .start({ scale: 0.9, transition: { duration: 0 } })
        .then(() =>
          controlsRef.current.start({
            x: deltaX,
            y: deltaY,
            transition: { duration: 0.2, delay: 0.1 },
          }),
        )
        .then(() =>
          controlsRef.current.start({
            opacity: 0,
            transition: { duration: 0 },
          }),
        )
    }

    window.addEventListener('connection-confirmed', handler)
    return () => window.removeEventListener('connection-confirmed', handler)
  }, [id])

  return (
    <motion.div
      id={id}
      data-testid="indicator-card"
      data-indicator-id={id}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      animate={controls}
        className={[
          'relative flex w-full min-h-[120px] flex-col gap-3 rounded-lg border p-4',
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
    </motion.div>
  )
}
