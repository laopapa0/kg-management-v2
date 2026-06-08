import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReportTag from './ReportTag'

describe('ReportTag', () => {
  it('renders children text', () => {
    render(<ReportTag variant="danger">真异常</ReportTag>)
    expect(screen.getByText('真异常')).toBeInTheDocument()
  })

  it.each([
    ['danger', 'report-tag-danger'],
    ['warning', 'report-tag-warning'],
    ['info', 'report-tag-info'],
    ['success', 'report-tag-success'],
    ['purple', 'report-tag-purple'],
  ] as const)('applies %s class for variant', (variant, expectedClass) => {
    const { container } = render(<ReportTag variant={variant}>test</ReportTag>)
    expect(container.firstChild).toHaveClass(expectedClass)
  })
})
