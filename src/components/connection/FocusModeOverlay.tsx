import { useRef, useEffect, useState, useCallback } from 'react'

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface FocusModeOverlayProps {
  isVisible: boolean
  sourceId: string | null
  validTargetIds: Set<string>
  targetType: 'tree' | 'tag' | 'rule' | null
}

function getSourceElementRect(sourceId: string | null): Rect | null {
  if (!sourceId) return null
  const el = document.querySelector(`[data-indicator-id="${sourceId}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
}

function getTargetSelector(targetType: 'tree' | 'tag' | 'rule' | null): string {
  switch (targetType) {
    case 'tree':
      return '[data-node-id]'
    case 'tag':
      return '[data-tag-id]'
    case 'rule':
      return '[data-rule-id]'
    default:
      return ''
  }
}

function getTargetAttr(targetType: 'tree' | 'tag' | 'rule' | null): string {
  switch (targetType) {
    case 'tree':
      return 'data-node-id'
    case 'tag':
      return 'data-tag-id'
    case 'rule':
      return 'data-rule-id'
    default:
      return ''
  }
}

function getTargetRects(
  targetType: 'tree' | 'tag' | 'rule' | null,
  validTargetIds: Set<string>,
): Rect[] {
  const selector = getTargetSelector(targetType)
  const attr = getTargetAttr(targetType)
  if (!selector || !attr) return []

  const rects: Rect[] = []
  document.querySelectorAll(selector).forEach((el) => {
    const id = el.getAttribute(attr)
    if (id && validTargetIds.has(id)) {
      const r = el.getBoundingClientRect()
      rects.push({ x: r.x, y: r.y, width: r.width, height: r.height })
    }
  })
  return rects
}

const SPOTLIGHT_EXCLUDE_CLASS = 'spotlight-exclude'

function addSpotlightExclude(el: Element | null) {
  if (el) el.classList.add(SPOTLIGHT_EXCLUDE_CLASS)
}

function clearAllSpotlightExclude() {
  document.querySelectorAll(`.${SPOTLIGHT_EXCLUDE_CLASS}`).forEach((el) => {
    el.classList.remove(SPOTLIGHT_EXCLUDE_CLASS)
  })
}

function updateSpotlightExcludes(
  sourceId: string | null,
  targetType: 'tree' | 'tag' | 'rule' | null,
  validTargetIds: Set<string>,
) {
  clearAllSpotlightExclude()

  // Source indicator
  if (sourceId) {
    const sourceEl = document.querySelector(`[data-indicator-id="${sourceId}"]`)
    addSpotlightExclude(sourceEl)
  }

  // Valid targets
  const selector = getTargetSelector(targetType)
  const attr = getTargetAttr(targetType)
  if (selector && attr) {
    document.querySelectorAll(selector).forEach((el) => {
      const id = el.getAttribute(attr)
      if (id && validTargetIds.has(id)) {
        addSpotlightExclude(el)
      }
    })
  }
}

export default function FocusModeOverlay({
  isVisible,
  sourceId,
  validTargetIds,
  targetType,
}: FocusModeOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [opacity, setOpacity] = useState(0)
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [exclusionRects, setExclusionRects] = useState<Rect[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const validTargetIdsRef = useRef(validTargetIds)
  validTargetIdsRef.current = validTargetIds

  const updateRects = useCallback(() => {
    const rects: Rect[] = []
    const sourceRect = getSourceElementRect(sourceId)
    if (sourceRect) rects.push(sourceRect)
    rects.push(...getTargetRects(targetType, validTargetIdsRef.current))
    setExclusionRects(rects)
  }, [sourceId, targetType])

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      timerRef.current = setTimeout(() => setOpacity(1), 0)
      updateRects()
      updateSpotlightExcludes(sourceId, targetType, validTargetIdsRef.current)

      const handleScroll = () => {
        updateRects()
        updateSpotlightExcludes(sourceId, targetType, validTargetIdsRef.current)
      }
      const handleResize = () => {
        updateRects()
        updateSpotlightExcludes(sourceId, targetType, validTargetIdsRef.current)
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize)

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
        clearAllSpotlightExclude()
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
      }
    } else {
      setOpacity(0)
      clearAllSpotlightExclude()
      exitTimerRef.current = setTimeout(() => {
        setShouldRender(false)
        exitTimerRef.current = null
      }, 200)
      return () => {
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current)
          exitTimerRef.current = null
        }
      }
    }
  }, [isVisible, updateRects, sourceId, targetType])

  if (!shouldRender) return null

  return (
    <svg
      ref={svgRef}
      data-testid="focus-mode-overlay"
      className="fixed inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 40,
        opacity,
        transition: isVisible
          ? 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)'
          : 'opacity 200ms ease-in',
      }}
    >
      <defs>
        <mask id="focus-spotlight-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {exclusionRects.map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={r.y}
              width={r.width}
              height={r.height}
              fill="black"
            />
          ))}
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="var(--dark-conn-spotlight)"
        mask="url(#focus-spotlight-mask)"
      />
    </svg>
  )
}
