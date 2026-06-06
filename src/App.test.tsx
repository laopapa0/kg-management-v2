import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App routing', () => {
  it('renders IndicatorManagementPage at /indicator-management', () => {
    render(
      <MemoryRouter initialEntries={['/indicator-management']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText(/indicator management/i)).toBeInTheDocument()
  })

  it('still renders IndicatorCreatePage at /indicator/create', () => {
    render(
      <MemoryRouter initialEntries={['/indicator/create']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText(/新增对象实例（指标）/i)).toBeInTheDocument()
  })

  it('still renders IndicatorEditPage at /indicator/edit/:id', () => {
    render(
      <MemoryRouter initialEntries={['/indicator/edit/123']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText(/变更对象实例（指标）/i)).toBeInTheDocument()
  })
})
