import { useEffect, useRef } from 'react'
import { getElementCenter } from '@/utils/connectionGeometry'
import { createOptimizedPathD, isInViewport, getViewportRect } from '@/utils/connectionRenderer'
import ConnectionLine from './ConnectionLine'

const EMPTY_SET: ReadonlySet<string> = Object.freeze(new Set<string>())

interface ConnectionLayerProps {
  sourceId: string | null
  hoverTargetId?: string | null
  validTargetIds?: Set<string>
}

export default function ConnectionLayer({
  sourceId,
  hoverTargetId = null,
  validTargetIds = EMPTY_SET,
}: ConnectionLayerProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  const isInvalidHover =
    hoverTargetId !== null && !validTargetIds.has(hoverTargetId)
  const isValidHover =
    hoverTargetId !== null && validTargetIds.has(hoverTargetId)

  useEffect(() => {
    if (!sourceId) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const updateLine = () => {
      const sourceEl = document.querySelector(`[data-indicator-id="${sourceId}"]`) as HTMLElement | null
      if (!sourceEl || !pathRef.current) {
        rafRef.current = requestAnimationFrame(updateLine)
        return
      }

      const start = getElementCenter(sourceEl)

      // Viewport clipping: skip rendering when source is completely off-screen
      const viewport = getViewportRect()
      if (!isInViewport(start, viewport)) {
        pathRef.current?.setAttribute('d', '')
        rafRef.current = requestAnimationFrame(updateLine)
        return
      }

      const end = mouseRef.current
      pathRef.current.setAttribute('d', createOptimizedPathD(start, end))
      rafRef.current = requestAnimationFrame(updateLine)
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = requestAnimationFrame(updateLine)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [sourceId])

  if (!sourceId) return null

  return (
    <svg
      data-testid="connection-layer"
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    >
      <defs>
        <marker
          id="conn-arrow"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--dark-conn-line-default)" />
        </marker>
        <marker
          id="conn-arrow-invalid"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--dark-conn-line-invalid)" />
        </marker>
        <marker
          id="conn-arrow-valid"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="var(--dark-conn-line-valid)" />
        </marker>
      </defs>
      <ConnectionLine
        pathRef={pathRef}
        isValidHover={isValidHover}
        isInvalidHover={isInvalidHover}
      />
    </svg>
  )
}
