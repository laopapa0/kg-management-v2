import { Search, X, Eye, ListFilter } from 'lucide-react'

export type SearchMode = 'highlight' | 'filter'

export interface TreeSearchInputProps {
  value: string
  onChange: (value: string) => void
  searchMode?: SearchMode
  onModeChange?: (mode: SearchMode) => void
  placeholder?: string
  'data-testid'?: string
}

export default function TreeSearchInput({
  value,
  onChange,
  searchMode,
  onModeChange,
  placeholder = '搜索标签...',
  'data-testid': testId = 'tree-search-input',
}: TreeSearchInputProps) {
  const showModeToggle = onModeChange !== undefined && searchMode !== undefined

  return (
    <div>
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
          className="h-9 w-full rounded-md border border-dark-border bg-dark-card-l2 py-1 pl-9 pr-8 text-sm text-dark-text-primary placeholder:text-dark-text-tertiary transition-colors focus:border-dark-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-dark-accent-primary/20"
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
      {showModeToggle && (
        <div className="mt-1.5 flex items-center justify-end gap-1">
          <button
            type="button"
            data-testid="search-mode-highlight"
            onClick={() => onModeChange!('highlight')}
            className={[
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors',
              searchMode === 'highlight'
                ? 'bg-dark-accent-primary/15 text-dark-accent-primary'
                : 'text-dark-text-tertiary hover:text-dark-text-secondary',
            ].join(' ')}
          >
            <Eye className="size-3" />
            高亮
          </button>
          <button
            type="button"
            data-testid="search-mode-filter"
            onClick={() => onModeChange!('filter')}
            className={[
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors',
              searchMode === 'filter'
                ? 'bg-dark-accent-primary/15 text-dark-accent-primary'
                : 'text-dark-text-tertiary hover:text-dark-text-secondary',
            ].join(' ')}
          >
            <ListFilter className="size-3" />
            过滤
          </button>
        </div>
      )}
    </div>
  )
}
