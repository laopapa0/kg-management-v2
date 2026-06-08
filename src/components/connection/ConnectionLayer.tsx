import { useEffect, useRef } from 'react'
import { getElementCenter, createPathD } from './connectionGeometry'

interface ConnectionLayerProps {
  sourceId: string | null
  hoverTargetId?: string | null
  validTargetIds?: Set<string>
}

export default function ConnectionLayer({
  sourceId,
  hoverTargetId = null,
  validTargetIds = new Set(),
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

    const handleScroll = () => {
      // Scroll changes element positions, rAF loop will pick up new coordinates
    }

    const updateLine = () => {
      const sourceEl = document.getElementById(sourceId)
      if (!sourceEl || !pathRef.current) {
        rafRef.current = requestAnimationFrame(updateLine)
        return
      }

      const start = getElementCenter(sourceEl)
      const end = mouseRef.current
      pathRef.current.setAttribute('d', createPathD(start, end))
      rafRef.current = requestAnimationFrame(updateLine)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll, { passive: true })
    rafRef.current = requestAnimationFrame(updateLine)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [sourceId])

  if (!sourceId) return null

  const strokeColor = isInvalidHover
    ? '#EF4444'
    : isValidHover
      ? '#22C55E'
      : '#64748B'

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
          <polygon
            points="0 0, 8 3, 0 6"
            fill={strokeColor}
          />
        </marker>
      </defs>
      <path
        ref={pathRef}
        data-testid="connection-line-path"
        stroke={strokeColor}
        strokeWidth={isValidHover ? 3 : 2.5}
        strokeDasharray="6 4"
        fill="none"
        markerEnd="url(#conn-arrow)"
        className={isInvalidHover ? '' : 'animate-ant-line'}
        style={{
          animationDuration: isValidHover ? '0.3s' : '0.5s',
        }}
      />
    </svg>
  )
}
