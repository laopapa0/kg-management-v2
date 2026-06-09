import { Plus } from 'lucide-react'

export interface PanelHeaderProps {
  title: string
  description?: string
  onAdd?: () => void
}

export default function PanelHeader({ title, description, onAdd }: PanelHeaderProps) {
  return (
    <div
      data-testid="panel-header"
      className="group flex h-10 items-center justify-between px-3"
    >
      <div className="flex flex-col">
        <h3 className="text-h3 font-semibold text-dark-text-primary">{title}</h3>
        {description && <p className="text-xs text-dark-text-tertiary">{description}</p>}
      </div>

      <button
        data-testid="panel-header-add-button"
        type="button"
        aria-label={`添加${title}`}
        onClick={onAdd}
        className="flex items-center justify-center rounded-md p-1.5 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 text-dark-text-secondary hover:bg-dark-tree-hover-bg hover:text-dark-accent-primary"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
