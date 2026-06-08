import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useCommentStore } from '@/stores/commentStore'
import { __resetCommentStorageCache } from '@/utils/commentStorage'
import CommentThread from './CommentThread'

describe('CommentThread', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetCommentStorageCache()
    useCommentStore.setState(useCommentStore.getInitialState())
  })

  it('renders comment list with author, content and timestamp', () => {
    const targetId = 'r1:v0.1:s1'
    const targetType = 'report-section'

    useCommentStore.getState().addComment({
      targetId,
      targetType,
      author: '张三',
      content: '这个数据看起来有问题',
    })
    useCommentStore.getState().addComment({
      targetId,
      targetType,
      author: '李四',
      content: '已确认，下版修正',
    })

    render(<CommentThread targetId={targetId} targetType={targetType} />)

    expect(screen.getByText('张三')).toBeInTheDocument()
    expect(screen.getByText('这个数据看起来有问题')).toBeInTheDocument()
    expect(screen.getByText('李四')).toBeInTheDocument()
    expect(screen.getByText('已确认，下版修正')).toBeInTheDocument()
  })

  it('shows empty state when no comments', () => {
    render(<CommentThread targetId="r1:v0.1:s1" targetType="report-section" />)

    expect(screen.getByText('暂无评论')).toBeInTheDocument()
  })

  it('submits a new comment via input and button', () => {
    const targetId = 'r1:v0.1:s1'
    const targetType = 'report-section'

    render(<CommentThread targetId={targetId} targetType={targetType} />)

    const input = screen.getByPlaceholderText('输入评论...')
    fireEvent.change(input, { target: { value: '新评论内容' } })

    fireEvent.click(screen.getByText('提交'))

    expect(screen.getByText('新评论内容')).toBeInTheDocument()
  })

  it('clears input after submit', () => {
    const targetId = 'r1:v0.1:s1'
    const targetType = 'report-section'

    render(<CommentThread targetId={targetId} targetType={targetType} />)

    const input = screen.getByPlaceholderText('输入评论...') as HTMLInputElement
    fireEvent.change(input, { target: { value: '新评论内容' } })
    fireEvent.click(screen.getByText('提交'))

    expect(input.value).toBe('')
  })
})
