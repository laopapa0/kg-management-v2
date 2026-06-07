import { useState, useEffect } from 'react'

interface SourceAnchorMarkerProps {
  sourceId: string
  onClick: () => void
}

export default function SourceAnchorMarker({ sourceId, onClick }: SourceAnchorMarkerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [sourceName, setSourceName] = useState('')

  useEffect(() => {
    const el = document.getElementById(sourceId)
    if (!el) return

    setSourceName(el.textContent ?? '')

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [sourceId])

  if (isVisible) return null

  return (
    <button
      data-testid="source-anchor-marker"
      title={sourceName}
      onClick={onClick}
      className="fixed z-50 flex h-8 w-8 items-center justify-center rounded-full bg-dark-accent-primary text-white shadow-lg hover:bg-dark-accent-primary/80"
      style={{ top: 16, right: 16 }}
    >
      <span className="h-2 w-2 rounded-full bg-white" />
    </button>
  )
}
