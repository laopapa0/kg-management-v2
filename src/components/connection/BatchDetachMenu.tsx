import { useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Eye, Trash2 } from 'lucide-react'

interface DetachOption {
  label: string
  count: number
  onConfirm: () => void
}

interface BatchDetachMenuProps {
  children: React.ReactNode
  onViewAttached?: () => void
  detachOptions: DetachOption[]
}

export default function BatchDetachMenu({
  children,
  onViewAttached,
  detachOptions,
}: BatchDetachMenuProps) {
  const [confirmOption, setConfirmOption] = useState<DetachOption | null>(null)

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent data-testid="batch-detach-menu" className="w-48">
          {onViewAttached && (
            <>
              <ContextMenuItem
                data-testid="menu-view-attached"
                onClick={onViewAttached}
              >
                <Eye className="size-4" />
                <span>查看已挂靠指标</span>
              </ContextMenuItem>
              {detachOptions.length > 0 && <ContextMenuSeparator />}
            </>
          )}

          {detachOptions.map((option, index) => (
            <ContextMenuItem
              key={index}
              data-testid={`menu-detach-${index}`}
              variant="destructive"
              onClick={() => setConfirmOption(option)}
            >
              <Trash2 className="size-4" />
              <span>{option.label}</span>
              <span className="ml-auto text-xs text-dark-text-tertiary">
                {option.count}
              </span>
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>

      {/* Light confirm dialog */}
      {confirmOption && (
        <div
          data-testid="batch-detach-confirm-dialog"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmOption(null)
          }}
        >
          <div className="w-80 rounded-lg border border-dark-border-default bg-dark-card-l1 p-4 shadow-lg">
            <h3 className="text-sm font-medium text-dark-text-primary">
              确认批量移除
            </h3>
            <p className="mt-2 text-xs text-dark-text-secondary">
              确定要<span className="text-red-400">{confirmOption.label}</span>吗？
              共影响{' '}
              <span data-testid="confirm-count" className="font-semibold text-dark-text-primary">
                {confirmOption.count}
              </span>{' '}
              个指标。
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                data-testid="confirm-dialog-cancel"
                onClick={() => setConfirmOption(null)}
                className="rounded-md px-3 py-1.5 text-xs text-dark-text-secondary transition-colors hover:bg-dark-card-l2"
              >
                取消
              </button>
              <button
                type="button"
                data-testid="confirm-dialog-confirm"
                onClick={() => {
                  confirmOption.onConfirm()
                  setConfirmOption(null)
                }}
                className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
