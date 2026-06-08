import { useState, useEffect, useRef } from 'react'
import { getEdgePosition, type Edge } from '@/utils/anchorPosition'

interface SourceAnchorMarkerProps {
  sourceId: string
  onClick: () => void
}

export default function SourceAnchorMarker({ sourceId, onClick }: SourceAnchorMarkerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [sourceName, setSourceName] = useState('')
  const [edge, setEdge] = useState<Edge>('top')
  const [offset, setOffset] = useState(16)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = document.querySelector(`[data-indicator-id="${sourceId}"]`) as HTMLElement | null
    if (!el) return

    setSourceName(el.textContent ?? '')

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting
        setIsVisible(!intersecting)

        if (!intersecting) {
          // Compute position immediately, then keep updating via rAF
          const rect = el.getBoundingClientRect()
          const pos = getEdgePosition(rect, window.innerWidth, window.innerHeight)
          setEdge(pos.edge)
          setOffset(pos.offset)

          const updatePosition = () => {
            const rect = el.getBoundingClientRect()
            const pos = getEdgePosition(rect, window.innerWidth, window.innerHeight)
            setEdge(pos.edge)
            setOffset(pos.offset)
            rafRef.current = requestAnimationFrame(updatePosition)
          }
          rafRef.current = requestAnimationFrame(updatePosition)
        } else {
          cancelAnimationFrame(rafRef.current)
        }
      },
      { threshold: 0 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [sourceId])

  if (!isVisible) return null

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
  }

  if (edge === 'top') {
    style.top = 8
    style.left = offset
    style.transform = 'translateX(-50%)'
  } else if (edge === 'bottom') {
    style.bottom = 8
    style.left = offset
    style.transform = 'translateX(-50%)'
  } else if (edge === 'left') {
    style.left = 8
    style.top = offset
    style.transform = 'translateY(-50%)'
  } else {
    style.right = 8
    style.top = offset
    style.transform = 'translateY(-50%)'
  }

  return (
    <button
      data-testid="source-anchor-marker"
      data-edge={edge}
      title={sourceName}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-accent-primary text-white shadow-lg hover:bg-dark-accent-primary/80"
      style={style}
    >
      <span className="h-2 w-2 rounded-full bg-dark-elevated" />
    </button>
  )
}
