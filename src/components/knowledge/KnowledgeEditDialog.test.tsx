import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KnowledgeEditDialog from './KnowledgeEditDialog'

describe('KnowledgeEditDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    initialContent: '初始知识内容',
    onSave: vi.fn(),
    title: '更新知识',
  }

  it('renders textarea and save/cancel buttons', () => {
    render(<KnowledgeEditDialog {...defaultProps} />)

    expect(screen.getByPlaceholderText('输入知识内容...')).toBeInTheDocument()
    expect(screen.getByText('保存')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
  })

  it('shows initial content in textarea', () => {
    render(<KnowledgeEditDialog {...defaultProps} />)

    const textarea = screen.getByPlaceholderText('输入知识内容...') as HTMLTextAreaElement
    expect(textarea.value).toBe('初始知识内容')
  })

  it('calls onSave with edited content when clicking save', () => {
    const onSave = vi.fn()
    render(<KnowledgeEditDialog {...defaultProps} onSave={onSave} />)

    const textarea = screen.getByPlaceholderText('输入知识内容...')
    fireEvent.change(textarea, { target: { value: '修改后的内容' } })

    fireEvent.click(screen.getByText('保存'))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith('修改后的内容')
  })

  it('calls onOpenChange(false) when clicking cancel', () => {
    const onOpenChange = vi.fn()
    render(<KnowledgeEditDialog {...defaultProps} onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByText('取消'))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables save button when content is empty', () => {
    render(<KnowledgeEditDialog {...defaultProps} initialContent="" />)

    const saveBtn = screen.getByText('保存')
    expect(saveBtn).toBeDisabled()
  })

  it('disables save button when content is whitespace only', () => {
    render(<KnowledgeEditDialog {...defaultProps} initialContent="   " />)

    const saveBtn = screen.getByText('保存')
    expect(saveBtn).toBeDisabled()
  })
})
