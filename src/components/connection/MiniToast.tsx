import { useEffect, useState } from 'react'

interface MiniToastProps {
  targetId: string
  message: string
}

function findTargetElement(targetId: string): HTMLElement | null {
  return (
    document.querySelector(`[data-node-id="${targetId}"]`) ||
    document.querySelector(`[data-tag-id="${targetId}"]`) ||
    document.querySelector(`[data-rule-id="${targetId}"]`) ||
    document.querySelector(`[data-indicator-id="${targetId}"]`)
  ) as HTMLElement | null
}

export default function MiniToast({ targetId, message }: MiniToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const el = findTargetElement(targetId)
  if (!el || !isVisible) return null

  const rect = el.getBoundingClientRect()

  return (
    <div
      data-testid="mini-toast"
      className="fixed pointer-events-none z-50 rounded-md bg-dark-card-l2/90 px-3 py-1.5 text-xs text-dark-text-secondary backdrop-blur-sm border border-dark-border"
      style={{
        left: rect.left + rect.width / 2,
        top: rect.top - 20,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
    >
      {message}
    </div>
  )
}
