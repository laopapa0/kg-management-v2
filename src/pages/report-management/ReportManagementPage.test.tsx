import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReportManagementPage from './ReportManagementPage'

describe('ReportManagementPage placeholder', () => {
  it('renders placeholder title and description', () => {
    render(<ReportManagementPage />)

    expect(screen.getByText('报告管理')).toBeInTheDocument()
    expect(screen.getByText(/四大核心菜单之一/i)).toBeInTheDocument()
    expect(screen.getByTestId('report-management-page')).toBeInTheDocument()
  })
})
