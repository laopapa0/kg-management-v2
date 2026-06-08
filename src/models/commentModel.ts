/**
 * 评论模型
 *
 * 通用评论线程，锚定到任意 target（报告板块、知识文档等）。
 */

export interface Comment {
  id: string
  targetId: string // e.g. "reportId:version:sectionId"
  targetType: string // e.g. "report-section"
  author: string
  avatar?: string
  content: string
  createdAt: string
}

export function createComment(
  data: Omit<Comment, 'id' | 'createdAt'>,
): Comment {
  return {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...data,
  }
}
