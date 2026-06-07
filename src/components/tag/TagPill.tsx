import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TagNode } from '@/models/indicatorAttachmentModel'
import TagColorPicker from './TagColorPicker'

export interface TagPillProps {
  tag: TagNode
  selected: boolean
  partial?: boolean
  onClick?: () => void
  searchTerm?: string
  dimmed?: boolean
  editable?: boolean
  onColorChange?: (color: string) => void
}

function HighlightText({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>
  const lowerTerm = term.toLowerCase()
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0
  while (remaining) {
    const idx = remaining.toLowerCase().indexOf(lowerTerm)
    if (idx === -1) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }
    if (idx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>)
    }
    parts.push(
      <mark
        key={key++}
        data-testid="tag-pill-highlight"
        className="rounded bg-[#B8860B]/20 px-0.5 font-bold text-[#FFD700]"
      >
        {remaining.slice(idx, idx + term.length)}
      </mark>,
    )
    remaining = remaining.slice(idx + term.length)
  }
  return <>{parts}</>
}

export default function TagPill({
  tag,
  selected,
  partial = false,
  onClick,
  searchTerm = '',
  dimmed = false,
  editable = false,
  onColorChange,
}: TagPillProps) {
  const baseColor = tag.color ?? '#64748B'
  const isChecked = selected || partial
  const hasColorBackground = !isChecked && Boolean(tag.color)

  return (
    <div className={cn('inline-flex items-center gap-1', dimmed && 'opacity-[0.35]')}>
      <button
        type="button"
        data-testid={`tag-pill-${tag.id}`}
        data-selected={selected ? 'true' : 'false'}
        data-partial={partial ? 'true' : 'false'}
        data-tag-id={tag.id}
        data-dimmed={dimmed ? 'true' : 'false'}
        onClick={onClick}
        className={cn(
          'inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-colors',
          'border',
          selected && [
            'bg-[#111B26] text-[#4DA6FF] border-[#15417E]',
            'shadow-[0_0_8px_rgba(77,166,255,0.25)]',
          ],
          partial && [
            'bg-[#111B26]/50 text-[#4DA6FF] border-dashed border-[#15417E]',
          ],
          !selected && !partial && [
            !hasColorBackground && 'bg-dark-card-l2',
            'text-dark-text-primary hover:bg-dark-tree-hover-bg',
          ],
        )}
        style={{
          borderColor: isChecked ? '#15417E' : baseColor,
          backgroundColor: hasColorBackground ? `${tag.color}1A` : undefined,
        }}
      >
        <span>
          <HighlightText text={tag.name} term={searchTerm} />
        </span>
        <span
          data-testid={`tag-pill-check-${tag.id}`}
          className={cn(
            'inline-flex size-4 items-center justify-center rounded-full transition-transform duration-150 ease-out',
            selected && 'scale-100 bg-[#4DA6FF] text-[#111B26]',
            partial && 'scale-100 bg-[#4DA6FF]/50 text-[#111B26]',
            !isChecked && 'scale-0',
          )}
        >
          <Check className={cn('size-3', partial && 'opacity-70')} />
        </span>
      </button>
      {editable && onColorChange && (
        <TagColorPicker
          color={tag.color}
          onChange={onColorChange}
          data-testid={`tag-pill-color-trigger-${tag.id}`}
        />
      )}
    </div>
  )
}
