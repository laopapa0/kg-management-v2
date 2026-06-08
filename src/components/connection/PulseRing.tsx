import { useEffect, useState } from 'react'
import { findTargetElement } from '@/utils/findTargetElement'

interface PulseRingProps {
  targetId: string
}

export default function PulseRing({ targetId }: PulseRingProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const el = findTargetElement(targetId)
  if (!el || !isVisible) return null

  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)

  return (
    <div
      data-testid="pulse-ring"
      className="fixed pointer-events-none animate-pulse-ring"
      style={{
        left: rect.left + rect.width / 2,
        top: rect.top + rect.height / 2,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        zIndex: 55,
      }}
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse-ring-stroke"
        style={{ borderColor: '#3B82F6', borderStyle: 'solid' }}
      />
      <div
        className="absolute inset-[-4px] rounded-full animate-pulse-ring-stroke"
        style={{ borderColor: '#22C55E', borderStyle: 'solid' }}
      />
    </div>
  )
}
