import { useEffect, useRef, useState, useMemo } from 'react'
import { getElementCenter } from '@/utils/connectionGeometry'
import { createOptimizedPathD } from '@/utils/connectionRenderer'
import type { Point } from '@/utils/connectionRenderer'
import DeleteConnectionButton from './DeleteConnectionButton'

export interface PersistentConnection {
  sourceId: string
  targetId: string
}

interface PersistentConnectionLayerProps {
  connections: PersistentConnection[]
  onDelete?: (connection: PersistentConnection) => void
}

export default function PersistentConnectionLayer({
  connections,
  onDelete,
}: PersistentConnectionLayerProps) {
  const pathMapRef = useRef(new Map<string, SVGPathElement>())
  const coordsMapRef = useRef(new Map<string, { start: Point; end: Point }>())
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  useEffect(() => {
    if (connections.length === 0) return

    const updateLines = () => {
      for (const conn of connections) {
        const key = `${conn.sourceId}::${conn.targetId}`
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
          coordsMapRef.current.set(key, { start, end })
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

  const hoveredConnection = useMemo(() => {
    if (!hoveredKey) return null
    const [sourceId, targetId] = hoveredKey.split('::')
    const coords = coordsMapRef.current.get(hoveredKey)
    if (!coords || !sourceId || !targetId) return null
    return {
      sourceId,
      targetId,
      midX: (coords.start.x + coords.end.x) / 2,
      midY: (coords.start.y + coords.end.y) / 2,
    }
  }, [hoveredKey])

  const handlePathEnter = (conn: PersistentConnection) => {
    setHoveredKey(`${conn.sourceId}::${conn.targetId}`)
  }

  const handlePathLeave = () => {
    setHoveredKey(null)
  }

  const handleDelete = () => {
    if (!hoveredConnection || !onDelete) return
    onDelete({ sourceId: hoveredConnection.sourceId, targetId: hoveredConnection.targetId })
    setHoveredKey(null)
  }

  if (connections.length === 0) return null

  return (
    <>
      <svg
        data-testid="persistent-connection-layer"
        className="fixed inset-0 pointer-events-none z-40"
        style={{ width: '100vw', height: '100vh' }}
      >
        {connections.map((conn) => {
          const key = `${conn.sourceId}::${conn.targetId}`
          const isHovered = hoveredKey === key
          return (
            <path
              key={key}
              ref={(el) => {
                if (el) pathMapRef.current.set(key, el)
                else pathMapRef.current.delete(key)
              }}
              data-testid="persistent-connection-line"
              onMouseEnter={() => handlePathEnter(conn)}
              onMouseLeave={handlePathLeave}
              stroke={isHovered ? '#7B8CDE' : 'var(--dark-conn-line-valid)'}
              strokeWidth={isHovered ? 2.5 : 2}
              fill="none"
              opacity={1}
              style={{ pointerEvents: 'stroke', transition: 'stroke 200ms, stroke-width 200ms' }}
            />
          )
        })}
      </svg>

      {hoveredConnection && (
        <DeleteConnectionButton
          x={hoveredConnection.midX}
          y={hoveredConnection.midY}
          visible
          onClick={handleDelete}
        />
      )}
    </>
  )
}
