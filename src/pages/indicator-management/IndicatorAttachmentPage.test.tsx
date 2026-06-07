import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import IndicatorAttachmentPage from './IndicatorAttachmentPage'

describe('IndicatorAttachmentPage', () => {
  it('renders four panels with correct titles', () => {
    render(<IndicatorAttachmentPage />)

    expect(screen.getByText('指标树')).toBeInTheDocument()
    expect(screen.getByText('待选指标')).toBeInTheDocument()
    expect(screen.getByText('标签集')).toBeInTheDocument()
    expect(screen.getByText('规则')).toBeInTheDocument()
  })

  it('renders resizable panel handles', () => {
    render(<IndicatorAttachmentPage />)

    const handles = screen.getAllByRole('separator')
    expect(handles.length).toBeGreaterThanOrEqual(2)
  })

  it('applies dark theme elevated/card backgrounds to panels', () => {
    render(<IndicatorAttachmentPage />)

    const treePanel = screen.getByTestId('panel-indicator-tree')
    const indicatorPanel = screen.getByTestId('panel-pending-indicators')
    const tagPanel = screen.getByTestId('panel-tag-set')
    const rulePanel = screen.getByTestId('panel-rules')

    expect(treePanel).toHaveClass('bg-dark-card-l1')
    expect(indicatorPanel).toHaveClass('bg-dark-elevated')
    expect(tagPanel).toHaveClass('bg-dark-card-l1')
    expect(rulePanel).toHaveClass('bg-dark-card-l1')
  })

  it('marks panels with data-panel attributes for react-resizable-panels', () => {
    render(<IndicatorAttachmentPage />)

    expect(screen.getByTestId('panel-indicator-tree').closest('[data-panel]')).toBeInTheDocument()
    expect(screen.getByTestId('panel-pending-indicators').closest('[data-panel]')).toBeInTheDocument()
    expect(screen.getByTestId('panel-tag-set').closest('[data-panel]')).toBeInTheDocument()
    expect(screen.getByTestId('panel-rules').closest('[data-panel]')).toBeInTheDocument()
  })
})
