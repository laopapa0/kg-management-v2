import { useMemo } from 'react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { useAttachmentStore } from '@/stores/attachmentStore'
import { Keyboard } from 'lucide-react'

export interface AttachmentCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIndicatorId: string | null
  onSelectIndicator: (indicatorId: string) => void
  onToggleTag: (tagId: string) => void
  onToggleRule: (ruleId: string) => void
  onNavigateToTag?: (tagId: string) => void
  onNavigateToRule?: (ruleId: string) => void
}

export default function AttachmentCommandPalette({
  open,
  onOpenChange,
  selectedIndicatorId,
  onSelectIndicator,
  onToggleTag,
  onToggleRule,
  onNavigateToTag,
  onNavigateToRule,
}: AttachmentCommandPaletteProps) {
  const indicators = useAttachmentStore((state) => state.indicators)
  const tagNodes = useAttachmentStore((state) => state.tagNodes)
  const rules = useAttachmentStore((state) => state.rules)

  const searchableIndicators = useMemo(
    () => indicators.filter((i) => i.indicatorType !== '虚拟分组'),
    [indicators],
  )

  const handleSelectIndicator = (indicatorId: string) => {
    onSelectIndicator(indicatorId)
    onOpenChange(false)
  }

  const handleSelectTag = (tagId: string) => {
    if (selectedIndicatorId) {
      onToggleTag(tagId)
    } else if (onNavigateToTag) {
      onNavigateToTag(tagId)
    }
    onOpenChange(false)
  }

  const handleSelectRule = (ruleId: string) => {
    if (selectedIndicatorId) {
      onToggleRule(ruleId)
    } else if (onNavigateToRule) {
      onNavigateToRule(ruleId)
    }
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-[640px]"
      title="命令面板"
      description="搜索指标、标签或规则"
    >
      <CommandInput placeholder="搜索指标、标签、规则..." />
      <CommandList>
        <CommandEmpty>未找到结果</CommandEmpty>

        <CommandGroup heading="指标">
          {searchableIndicators.map((indicator) => (
            <CommandItem
              key={indicator.id}
              data-testid="command-item"
              value={`indicator-${indicator.id}-${indicator.name}-${indicator.code}`}
              onSelect={() => handleSelectIndicator(indicator.id)}
            >
              <span className="truncate">{indicator.name}</span>
              <span className="ml-2 text-xs text-dark-text-tertiary">
                {indicator.code}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="标签">
          {tagNodes.map((tag) => (
            <CommandItem
              key={tag.id}
              data-testid="command-item"
              value={`tag-${tag.id}-${tag.name}`}
              onSelect={() => handleSelectTag(tag.id)}
            >
              {tag.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="规则">
          {rules.map((rule) => (
            <CommandItem
              key={rule.id}
              data-testid="command-item"
              value={`rule-${rule.id}-${rule.name}`}
              onSelect={() => handleSelectRule(rule.id)}
            >
              <span className="truncate">{rule.name}</span>
              <span className="ml-2 text-xs text-dark-text-tertiary">
                {rule.type}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between border-t border-dark-border px-3 py-2 text-xs text-dark-text-tertiary">
        <div className="flex items-center gap-3">
          <span>↑↓ 导航</span>
          <span>Enter 执行</span>
          <span>Esc 关闭</span>
        </div>
        <Keyboard className="size-3.5 opacity-50" />
      </div>
    </CommandDialog>
  )
}
