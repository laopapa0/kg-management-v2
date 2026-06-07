import { useEffect, useRef, useState } from 'react'
import type { TagNode } from '@/models/indicatorAttachmentModel'
import TagPill from './TagPill'

export interface TagCloudProps {
  tags: TagNode[]
  selectedTagIds: Set<string>
  partialTagIds?: Set<string>
  maxRows?: number
  onToggle?: (id: string) => void
  dimmedTagIds?: Set<string>
  searchTerm?: string
}

const TAG_HEIGHT = 28
const GAP = 8
const TRANSITION_DURATION_MS = 250

export default function TagCloud({
  tags,
  selectedTagIds,
  partialTagIds = new Set(),
  maxRows = 3,
  onToggle,
  dimmedTagIds = new Set(),
  searchTerm = '',
}: TagCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)
  const [totalRows, setTotalRows] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateMetrics = () => {
      const height = el.scrollHeight
      const rowHeight = TAG_HEIGHT + GAP
      const rows = Math.max(1, Math.round(height / rowHeight))
      setTotalRows(rows)
      setNeedsCollapse(rows > maxRows)
    }

    updateMetrics()

    const observer = new ResizeObserver(updateMetrics)
    observer.observe(el)
    return () => observer.disconnect()
  }, [tags, maxRows])

  const collapsedMaxHeight = maxRows * TAG_HEIGHT + (maxRows - 1) * GAP
  const maxHeight = expanded ? containerRef.current?.scrollHeight : collapsedMaxHeight

  return (
    <div data-testid="tag-cloud">
      <div
        ref={containerRef}
        data-testid="tag-cloud-container"
        data-expanded={expanded}
        data-needs-collapse={needsCollapse}
        className="flex flex-wrap gap-2 overflow-hidden transition-[max-height] ease-out"
        style={{
          maxHeight,
          transitionDuration: `${TRANSITION_DURATION_MS}ms`,
        }}
      >
        {tags.map((tag) => (
          <TagPill
            key={tag.id}
            tag={tag}
            selected={selectedTagIds.has(tag.id)}
            partial={partialTagIds.has(tag.id)}
            onClick={() => onToggle?.(tag.id)}
            dimmed={dimmedTagIds.has(tag.id)}
            searchTerm={searchTerm}
          />
        ))}
      </div>
      {needsCollapse && (
        <button
          type="button"
          data-testid="tag-cloud-toggle"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex h-7 items-center rounded-md border border-dashed border-dark-border bg-transparent px-2.5 text-xs text-dark-text-secondary hover:text-dark-text-primary transition-colors"
        >
          {expanded ? '收起' : `+${totalRows - maxRows}`}
        </button>
      )}
    </div>
  )
}
