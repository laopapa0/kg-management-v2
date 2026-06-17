import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NocRulePage from './NocRulePage'

// Mock AnimatePresence to skip exit animations in jsdom
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

// vaul uses PointerEvents which are not fully supported in JSDOM
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn()
}

describe('NocRulePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('左侧分类树应只渲染 3 个分类节点', () => {
    render(<NocRulePage />)

    const tree = screen.getByTestId('rule-category-tree')
    expect(within(tree).getByText('阈值上下限')).toBeInTheDocument()
    expect(within(tree).getByText('TOPN 监控')).toBeInTheDocument()
    expect(within(tree).getByText('波动算法')).toBeInTheDocument()
    expect(within(tree).queryByText('异常规则')).not.toBeInTheDocument()
    expect(within(tree).queryByText('质量规则')).not.toBeInTheDocument()
    expect(within(tree).queryByText('合规规则')).not.toBeInTheDocument()
  })

  it('右侧规则表格应渲染 9 条规则', () => {
    render(<NocRulePage />)

    expect(screen.getByText('共 9 条')).toBeInTheDocument()
  })

  it('不应显示"检测冲突"按钮', () => {
    render(<NocRulePage />)

    expect(screen.queryByText('检测冲突')).not.toBeInTheDocument()
  })

  it('规则编辑弹窗中不应显示"继承关系" Tab', async () => {
    const user = userEvent.setup()
    render(<NocRulePage />)

    const editBtn = screen.getAllByText('编辑')[0]
    await user.click(editBtn)

    expect(screen.queryByText('继承关系')).not.toBeInTheDocument()
    expect(screen.getByText('基本信息')).toBeInTheDocument()
    expect(screen.getByText('参数定义')).toBeInTheDocument()
  })
})
