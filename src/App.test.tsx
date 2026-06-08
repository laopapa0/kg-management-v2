import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App routing', () => {
  it('默认在 html 元素上设置 data-theme="dark"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('renders IndicatorAttachmentPage at /indicator-management', () => {
    render(
      <MemoryRouter initialEntries={['/indicator-management']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('指标树')).toBeInTheDocument()
    expect(screen.getByText('待选指标')).toBeInTheDocument()
    expect(screen.getByText('标签集')).toBeInTheDocument()
    expect(screen.getByText('规则')).toBeInTheDocument()
  })

  it('renders ReportManagementPage placeholder at /reports', () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('report-management-page')).toBeInTheDocument()
    expect(screen.getByText(/四大核心菜单之一/i)).toBeInTheDocument()
  })
})
