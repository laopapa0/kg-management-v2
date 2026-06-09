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
    expect(screen.getByText('候选指标')).toBeInTheDocument()
    expect(screen.getByText('标签集')).toBeInTheDocument()
    expect(screen.getByText('规则')).toBeInTheDocument()
  })

  it('renders ReportManagementPage at /reports', () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('report-management-page')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '报告管理' })).toBeInTheDocument()
    expect(screen.getByTestId('new-report-plan-button')).toBeInTheDocument()
  })

  it('renders LineageCanvasPage at /lineage', () => {
    render(
      <MemoryRouter initialEntries={['/lineage']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('配置链接关系（血缘画布）')).toBeInTheDocument()
  })

  it('renders KnowledgeUploadPage at /knowledge-upload', () => {
    render(
      <MemoryRouter initialEntries={['/knowledge-upload']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('知识上传')).toBeInTheDocument()
  })
})
