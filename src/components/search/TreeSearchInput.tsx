import { Search, X } from 'lucide-react'

export interface TreeSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'data-testid'?: string
}

export default function TreeSearchInput({
  value,
  onChange,
  placeholder = '搜索标签...',
  'data-testid': testId = 'tree-search-input',
}: TreeSearchInputProps) {
  return (
    <div className="relative">
      <Search
        data-testid="tree-search-icon"
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-dark-text-tertiary"
      />
      <input
        type="text"
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-dark-border bg-dark-card-l2 py-1 pl-9 pr-8 text-sm text-dark-text-primary placeholder:text-dark-text-tertiary transition-colors focus:border-[#4DA6FF] focus:outline-none focus:ring-2 focus:ring-[#4DA6FF]/25"
      />
      {value && (
        <button
          type="button"
          data-testid="tree-search-clear"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-dark-text-tertiary transition-colors hover:text-dark-text-primary"
          aria-label="清空搜索"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
