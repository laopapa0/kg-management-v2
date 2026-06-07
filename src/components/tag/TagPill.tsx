import type { TagNode } from '@/models/indicatorAttachmentModel'

export interface TagPillProps {
  tag: TagNode
  selected: boolean
}

export default function TagPill({ tag, selected }: TagPillProps) {
  const baseColor = tag.color ?? '#64748B'
  return (
    <span
      data-testid={`tag-pill-${tag.id}`}
      data-selected={selected ? 'true' : 'false'}
      data-tag-id={tag.id}
      className={[
        'inline-flex h-7 items-center whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-colors duration-150',
        'border',
        selected
          ? 'bg-[#111B26] text-[#4DA6FF] border-[#15417E]'
          : 'bg-dark-card-l2 text-dark-text-primary hover:bg-dark-tree-hover-bg',
      ].join(' ')}
      style={{
        borderColor: selected ? '#15417E' : baseColor,
        boxShadow: selected ? '0 0 8px rgba(77, 166, 255, 0.25)' : undefined,
      }}
    >
      {tag.name}
    </span>
  )
}
