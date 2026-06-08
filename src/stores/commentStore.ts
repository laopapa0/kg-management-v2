import { create } from 'zustand'
import type { Comment } from '@/models/commentModel'
import { createComment } from '@/models/commentModel'
import { getComments, saveComments, addComment as storageAddComment } from '@/utils/commentStorage'

export interface CommentState {
  comments: Comment[]

  init: () => void
  addComment: (data: Omit<Comment, 'id' | 'createdAt'>) => Comment
  getCommentsByTarget: (targetId: string, targetType: string) => Comment[]
  __reset: () => void
}

const initialState: Pick<CommentState, 'comments'> = {
  comments: [],
}

export const useCommentStore = create<CommentState>((set, get) => ({
  ...initialState,

  init: () => {
    set({ comments: getComments() })
  },

  addComment: (data) => {
    const comment = createComment(data)
    const next = [...get().comments, comment]
    set({ comments: next })
    storageAddComment(comment)
    return comment
  },

  getCommentsByTarget: (targetId, targetType) => {
    return get().comments.filter((c) => c.targetId === targetId && c.targetType === targetType)
  },

  __reset: () => {
    set({ ...initialState })
  },
}))

Object.defineProperty(useCommentStore, 'getInitialState', {
  value: () => ({ ...initialState }),
})

export function initializeCommentStore(): void {
  useCommentStore.getState().init()
}
