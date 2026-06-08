import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { getElementCenter } from '@/utils/connectionGeometry'
import { createOptimizedPathD } from '@/utils/connectionRenderer'
import { findTargetElement } from '@/utils/findTargetElement'
import type { Point } from '@/utils/connectionRenderer'
import DeleteConnectionButton from '@/components/connection/DeleteConnectionButton'
import InlineConfirmButton from '@/components/connection/InlineConfirmButton'

export interface PersistentConnection {
  sourceId: string
  targetId: string
}

interface PersistentConnectionLayerProps {
  connections: PersistentConnection[]
  onDelete?: (connection: PersistentConnection) => void
  requiresConfirm?: (connection: PersistentConnection) => boolean
}

export default function PersistentConnectionLayer({
  connections,
  onDelete,
  requiresConfirm,
}: PersistentConnectionLayerProps) {
  const pathMapRef = useRef(new Map<string, SVGPathElement>())
  const coordsMapRef = useRef(new Map<string, { start: Point; end: Point }>())
  const renderedKeysRef = useRef(new Set<string>())
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null)
  const [exitingKeys, setExitingKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const allKeys = new Set([
      ...connections.map((c) => `${c.sourceId}::${c.targetId}`),
      ...exitingKeys,
    ])

    const updateLines = () => {
      for (const key of allKeys) {
        const pathEl = pathMapRef.current.get(key)
        if (!pathEl) continue

        const [sourceId, targetId] = key.split('::')
        const sourceEl = document.querySelector(`[data-indicator-id="${sourceId}"]`) as HTMLElement | null
        const targetEl = findTargetElement(targetId)

        if (sourceEl && targetEl) {
          const start = getElementCenter(sourceEl)
          const end = getElementCenter(targetEl)
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
  }, [connections, exitingKeys])

  const activeKey = confirmingKey ?? hoveredKey

  const activeConnection = useMemo(() => {
    if (!activeKey) return null
    const [sourceId, targetId] = activeKey.split('::')
    const coords = coordsMapRef.current.get(activeKey)
    if (!coords || !sourceId || !targetId) return null
    return {
      sourceId,
      targetId,
      midX: (coords.start.x + coords.end.x) / 2,
      midY: (coords.start.y + coords.end.y) / 2,
      needsConfirm: requiresConfirm?.({ sourceId, targetId }) ?? false,
    }
  }, [activeKey, requiresConfirm])

  const handlePathEnter = (conn: PersistentConnection) => {
    const key = `${conn.sourceId}::${conn.targetId}`
    if (!exitingKeys.has(key)) {
      setHoveredKey(key)
    }
  }

  const handlePathLeave = () => {
    setHoveredKey(null)
  }

  const performDelete = useCallback(
    (connection: PersistentConnection) => {
      const key = `${connection.sourceId}::${connection.targetId}`
      setExitingKeys((prev) => new Set(prev).add(key))
      setConfirmingKey(null)
      setHoveredKey(null)

      // Notify parent immediately so undo toast shows right away
      onDelete?.(connection)

      // Remove from exiting keys after fade-out animation completes
      setTimeout(() => {
        setExitingKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }, 200)
    },
    [onDelete],
  )

  const handleDelete = () => {
    if (!activeConnection) return
    performDelete({ sourceId: activeConnection.sourceId, targetId: activeConnection.targetId })
  }

  const handleInlineConfirm = () => {
    if (!activeConnection) return
    performDelete({ sourceId: activeConnection.sourceId, targetId: activeConnection.targetId })
  }

  const allConnections = useMemo(() => {
    const map = new Map<string, PersistentConnection>()
    for (const conn of connections) {
      map.set(`${conn.sourceId}::${conn.targetId}`, conn)
    }
    for (const key of exitingKeys) {
      if (!map.has(key)) {
        const [sourceId, targetId] = key.split('::')
        map.set(key, { sourceId, targetId })
      }
    }
    return Array.from(map.entries())
  }, [connections, exitingKeys])

  if (allConnections.length === 0) return null

  return (
    <>
      <svg
        data-testid="persistent-connection-layer"
        className="fixed inset-0 pointer-events-none z-40"
        style={{ width: '100vw', height: '100vh' }}
      >
        {allConnections.map(([key, conn]) => {
          const isHovered = (hoveredKey === key || confirmingKey === key) && !exitingKeys.has(key)
          const isExiting = exitingKeys.has(key)
          const isNew = !renderedKeysRef.current.has(key)
          if (isNew) {
            renderedKeysRef.current.add(key)
          }
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
              stroke={isHovered ? '#7B8CDE' : '#3B82F6'}
              strokeWidth={isHovered ? 2.5 : 2}
              fill="none"
              opacity={isExiting ? 0 : 1}
              className={isNew ? 'animate-persistent-line-fade-in' : ''}
              style={{
                pointerEvents: isExiting ? 'none' : 'stroke',
                transition: 'stroke 200ms, stroke-width 200ms, opacity 200ms',
              }}
            />
          )
        })}
      </svg>

      {activeConnection && !exitingKeys.has(`${activeConnection.sourceId}::${activeConnection.targetId}`) && (
        <div
          style={{
            position: 'fixed',
            left: activeConnection.midX - 10,
            top: activeConnection.midY - 10,
            zIndex: 50,
          }}
        >
          {activeConnection.needsConfirm ? (
            <InlineConfirmButton
              onConfirm={handleInlineConfirm}
              confirmText="确认删除？"
              onConfirmingChange={(isConfirming) => {
                if (isConfirming) {
                  setConfirmingKey(activeKey)
                } else {
                  setConfirmingKey(null)
                }
              }}
            />
          ) : (
            <DeleteConnectionButton
              x={activeConnection.midX}
              y={activeConnection.midY}
              visible
              onClick={handleDelete}
            />
          )}
        </div>
      )}
    </>
  )
}
