import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReportAlert from './ReportAlert'

describe('ReportAlert', () => {
  it('renders title and message', () => {
    render(<ReportAlert variant="danger" title="警告" message="发现异常值" />)
    expect(screen.getByText('警告')).toBeInTheDocument()
    expect(screen.getByText('发现异常值')).toBeInTheDocument()
  })

  it.each([
    ['danger', 'report-alert-danger'],
    ['warning', 'report-alert-warning'],
    ['info', 'report-alert-info'],
    ['success', 'report-alert-success'],
  ] as const)('applies %s class for variant', (variant, expectedClass) => {
    const { container } = render(<ReportAlert variant={variant} title="t" message="m" />)
    expect(container.firstChild).toHaveClass(expectedClass)
  })
})
