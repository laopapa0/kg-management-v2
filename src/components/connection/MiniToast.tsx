import { useEffect, useState } from 'react'
import { findTargetElement } from '@/utils/findTargetElement'

interface MiniToastProps {
  targetId: string
  message: string
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
