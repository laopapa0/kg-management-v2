import { useState, useMemo } from 'react'
import {
  Link, ArrowRight, Combine, GitBranch, Shuffle,
  Layers, Replace, ExternalLink, ArrowLeftRight, TrendingUp,
  TrendingDown, Activity, BarChart3, PieChart, LineChart,
  Network, Share2, Merge, Split, Workflow, Search, X,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface IconPickerProps {
  value?: string
  onChange: (icon: string) => void
  'data-testid'?: string
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Link, ArrowRight, Combine, GitBranch, Shuffle,
  Layers, Replace, ExternalLink, ArrowLeftRight, TrendingUp,
  TrendingDown, Activity, BarChart3, PieChart, LineChart,
  Network, Share2, Merge, Split, Workflow,
}

const ICON_NAMES = Object.keys(ICON_MAP)

function IconRenderer({ name, size = 18 }: { name: string; size?: number }) {
  const Comp = ICON_MAP[name] || Link
  return <Comp size={size} className="text-dark-text-secondary" />
}

export default function IconPicker({
  value,
  onChange,
  'data-testid': testId = 'icon-picker-trigger',
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ICON_NAMES
    return ICON_NAMES.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const handleSelect = (name: string) => {
    onChange(name)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-dark-border px-2.5 text-sm text-dark-text-secondary hover:border-dark-accent-primary-hover transition-colors"
        >
          <IconRenderer name={value || 'Link'} size={16} />
          <span>{value || 'Link'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 border-dark-border bg-dark-card-l2 p-3"
        align="start"
        sideOffset={4}
      >
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-text-tertiary" />
          <input
            type="text"
            data-testid="icon-picker-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full pl-8 pr-7 rounded-md border border-dark-border-hover text-[13px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover bg-dark-card-l1"
            placeholder="搜索图标..."
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-text-tertiary"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1 max-h-[220px] overflow-y-auto">
          {filteredIcons.map((name) => (
            <button
              key={name}
              type="button"
              data-testid={`icon-picker-option-${name}`}
              onClick={() => handleSelect(name)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-md transition-colors',
                value === name
                  ? 'bg-dark-accent-primary/10 border border-dark-accent-primary'
                  : 'hover:bg-dark-page border border-transparent',
              )}
            >
              <IconRenderer name={name} size={20} />
              <span className="text-[10px] text-dark-text-secondary truncate max-w-full">{name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
