import { useState, useMemo } from 'react'
import { useCommentStore } from '@/stores/commentStore'

export interface CommentThreadProps {
  targetId: string
  targetType: string
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CommentThread({ targetId, targetType }: CommentThreadProps) {
  const [input, setInput] = useState('')
  const allComments = useCommentStore((state) => state.comments)
  const addComment = useCommentStore((state) => state.addComment)

  const comments = useMemo(
    () => allComments.filter((c) => c.targetId === targetId && c.targetType === targetType),
    [allComments, targetId, targetType],
  )

  const handleSubmit = () => {
    if (!input.trim()) return
    addComment({
      targetId,
      targetType,
      author: '当前用户',
      content: input.trim(),
    })
    setInput('')
  }

  return (
    <div data-testid="comment-thread" className="mt-3 rounded-md border border-dark-border bg-dark-card-l2 p-3">
      {comments.length === 0 ? (
        <p className="text-sm text-dark-text-secondary">暂无评论</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-dark-accent-primary/20 text-xs font-medium text-dark-accent-primary">
                {comment.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-dark-text-primary">{comment.author}</span>
                  <span className="text-xs text-dark-text-secondary">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-sm text-dark-text-secondary">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="输入评论..."
          className="flex-1 rounded-md border border-dark-border bg-dark-card-l1 px-3 py-1.5 text-sm text-dark-text-primary placeholder:text-dark-text-secondary focus:border-dark-accent-primary focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          className="rounded-md bg-dark-accent-primary px-3 py-1.5 text-sm text-white hover:bg-dark-accent-primary/90"
        >
          提交
        </button>
      </div>
    </div>
  )
}
