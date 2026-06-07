import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TreePine } from 'lucide-react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={<TreePine data-testid="custom-icon" />}
        title="暂无指标"
        description="当前部门下没有指标数据"
      />
    )

    expect(screen.getByText('暂无指标')).toBeInTheDocument()
    expect(screen.getByText('当前部门下没有指标数据')).toBeInTheDocument()
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders the action node when provided', () => {
    render(
      <EmptyState
        icon={<TreePine />}
        title="暂无指标"
        description="去添加一个吧"
        action={<button data-testid="add-action">添加指标</button>}
      />
    )

    expect(screen.getByTestId('add-action')).toBeInTheDocument()
  })

  it('renders a no-action hint when action is omitted', () => {
    render(
      <EmptyState
        icon={<TreePine />}
        title="暂无规则"
        description="规则由系统管理员维护"
      />
    )

    expect(screen.getByText('暂无操作')).toBeInTheDocument()
  })

  it('has a 48px icon container', () => {
    render(
      <EmptyState
        icon={<TreePine data-testid="custom-icon" />}
        title="暂无指标"
        description="当前部门下没有指标数据"
      />
    )

    const iconContainer = screen.getByTestId('empty-state-icon')
    expect(iconContainer).toHaveClass('size-12')
  })

  it('uses a motion wrapper for appear animation', () => {
    const { container } = render(
      <EmptyState
        icon={<TreePine />}
        title="暂无指标"
        description="当前部门下没有指标数据"
      />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName.toLowerCase()).toBe('div')
    expect(wrapper).toHaveAttribute('data-testid', 'empty-state-wrapper')
  })
})
