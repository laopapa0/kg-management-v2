import { useEffect, useState } from 'react'

interface PulseRingProps {
  targetId: string
}

function findTargetElement(targetId: string): HTMLElement | null {
  return (
    document.querySelector(`[data-node-id="${targetId}"]`) ||
    document.querySelector(`[data-tag-id="${targetId}"]`) ||
    document.querySelector(`[data-rule-id="${targetId}"]`) ||
    document.querySelector(`[data-indicator-id="${targetId}"]`)
  ) as HTMLElement | null
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
        className="absolute inset-0 rounded-full border-[3px]"
        style={{ borderColor: '#3B82F6' }}
      />
      <div
        className="absolute inset-[-4px] rounded-full border-[3px]"
        style={{ borderColor: '#22C55E' }}
      />
    </div>
  )
}
