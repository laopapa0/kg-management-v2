import { describe, it, expect, beforeEach } from 'vitest'
import { useCommentStore } from './commentStore'
import { __resetCommentStorageCache, getComments } from '@/utils/commentStorage'

describe('commentStore', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetCommentStorageCache()
    useCommentStore.setState(useCommentStore.getInitialState())
  })

  it('initializes with empty comments', () => {
    const state = useCommentStore.getState()
    expect(state.comments).toEqual([])
  })

  it('adds a comment and persists to localStorage', () => {
    const comment = useCommentStore.getState().addComment({
      targetId: 'r1:v0.1:s1',
      targetType: 'report-section',
      author: '张三',
      content: '测试评论',
    })

    expect(comment.author).toBe('张三')
    expect(comment.content).toBe('测试评论')
    expect(comment.targetId).toBe('r1:v0.1:s1')
    expect(comment.id).toBeDefined()
    expect(comment.createdAt).toBeDefined()

    // Store state updated
    expect(useCommentStore.getState().comments).toHaveLength(1)

    // localStorage persisted
    const stored = getComments()
    expect(stored).toHaveLength(1)
    expect(stored[0].content).toBe('测试评论')
  })

  it('filters comments by target', () => {
    const store = useCommentStore.getState()

    store.addComment({ targetId: 'r1:v0.1:s1', targetType: 'report-section', author: 'A', content: 'c1' })
    store.addComment({ targetId: 'r1:v0.1:s1', targetType: 'report-section', author: 'B', content: 'c2' })
    store.addComment({ targetId: 'r1:v0.1:s2', targetType: 'report-section', author: 'C', content: 'c3' })
    store.addComment({ targetId: 'r1:v0.1:s1', targetType: 'other', author: 'D', content: 'c4' })

    const result = store.getCommentsByTarget('r1:v0.1:s1', 'report-section')
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.content)).toContain('c1')
    expect(result.map((c) => c.content)).toContain('c2')
  })

  it('init loads existing comments from localStorage', () => {
    // Seed localStorage directly
    localStorage.setItem(
      'kgv2-comments',
      JSON.stringify([
        { id: 'c1', targetId: 'r1:v0.1:s1', targetType: 'report-section', author: '张三', content: '已有评论', createdAt: '2024-01-01T00:00:00Z' },
      ]),
    )

    useCommentStore.getState().init()
    expect(useCommentStore.getState().comments).toHaveLength(1)
    expect(useCommentStore.getState().comments[0].content).toBe('已有评论')
  })
})
