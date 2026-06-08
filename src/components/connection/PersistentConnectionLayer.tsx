import { useEffect, useRef } from 'react'
import { getElementCenter } from '@/utils/connectionGeometry'
import { createOptimizedPathD } from '@/utils/connectionRenderer'

export interface PersistentConnection {
  sourceId: string
  targetId: string
}

interface PersistentConnectionLayerProps {
  connections: PersistentConnection[]
}

export default function PersistentConnectionLayer({ connections }: PersistentConnectionLayerProps) {
  const pathMapRef = useRef(new Map<string, SVGPathElement>())

  useEffect(() => {
    if (connections.length === 0) return

    const updateLines = () => {
      for (const conn of connections) {
        const key = `${conn.sourceId}-${conn.targetId}`
        const pathEl = pathMapRef.current.get(key)
        if (!pathEl) continue

        const sourceEl = document.querySelector(`[data-indicator-id="${conn.sourceId}"]`) as HTMLElement | null
        const targetEl =
          document.querySelector(`[data-node-id="${conn.targetId}"]`) ||
          document.querySelector(`[data-tag-id="${conn.targetId}"]`) ||
          document.querySelector(`[data-rule-id="${conn.targetId}"]`)

        if (sourceEl && targetEl) {
          const start = getElementCenter(sourceEl)
          const end = getElementCenter(targetEl as HTMLElement)
          pathEl.setAttribute('d', createOptimizedPathD(start, end))
        }
      }
    }

    updateLines()

    const handleScroll = () => updateLines()
    const handleResize = () => updateLines()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [connections])

  if (connections.length === 0) return null

  return (
    <svg
      data-testid="persistent-connection-layer"
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: '100vw', height: '100vh' }}
    >
      {connections.map((conn) => (
        <path
          key={`${conn.sourceId}-${conn.targetId}`}
          ref={(el) => {
            if (el) pathMapRef.current.set(`${conn.sourceId}-${conn.targetId}`, el)
            else pathMapRef.current.delete(`${conn.sourceId}-${conn.targetId}`)
          }}
          data-testid="persistent-connection-line"
          stroke="var(--dark-conn-line-valid)"
          strokeWidth={2}
          fill="none"
          opacity={1}
        />
      ))}
    </svg>
  )
}
