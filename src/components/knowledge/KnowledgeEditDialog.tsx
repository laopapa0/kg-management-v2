import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export interface KnowledgeEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialContent: string
  onSave: (content: string) => void
  title?: string
}

export default function KnowledgeEditDialog({
  open,
  onOpenChange,
  initialContent,
  onSave,
  title = '更新知识',
}: KnowledgeEditDialogProps) {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent, open])

  const handleSave = () => {
    if (!content.trim()) return
    onSave(content.trim())
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const isEmpty = !content.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <textarea
            data-testid="knowledge-edit-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入知识内容..."
            rows={6}
            className="w-full rounded-md border border-dark-border bg-dark-card-l1 p-3 text-sm text-dark-text-primary placeholder:text-dark-text-secondary focus:border-dark-accent-primary focus:outline-none resize-none"
          />
        </div>
        <DialogFooter>
          <button
            data-testid="knowledge-edit-cancel"
            onClick={handleCancel}
            className="rounded-md border border-dark-border px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-card-l2"
          >
            取消
          </button>
          <button
            data-testid="knowledge-edit-save"
            onClick={handleSave}
            disabled={isEmpty}
            className="rounded-md bg-dark-accent-primary px-4 py-2 text-sm text-white hover:bg-dark-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
