import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import DashboardPage from './DashboardPage'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function renderWithRouter(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DashboardPage />
    </MemoryRouter>
  )
}

describe('DashboardPage quick access', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  it('renders 4 core quick access cards', () => {
    renderWithRouter()

    const coreCards = ['指标管理', '血缘画布', '报告管理', '知识库管理']
    for (const title of coreCards) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })

  it('does not render NOC quick access cards', () => {
    renderWithRouter()

    const nocCards = ['审核申请', '对象类型', '规则库']
    for (const title of nocCards) {
      expect(screen.queryByText(title)).not.toBeInTheDocument()
    }
  })

  it('navigates to /indicator-management when clicking 指标管理 card', async () => {
    renderWithRouter()

    const card = screen.getByText('指标管理').closest('div')
    await userEvent.click(card!)
    expect(navigateMock).toHaveBeenCalledWith('/indicator-management')
  })

  it('navigates to /lineage when clicking 血缘画布 card', async () => {
    renderWithRouter()

    const card = screen.getByText('血缘画布').closest('div')
    await userEvent.click(card!)
    expect(navigateMock).toHaveBeenCalledWith('/lineage')
  })

  it('navigates to /reports when clicking 报告管理 card', async () => {
    renderWithRouter()

    const card = screen.getByText('报告管理').closest('div')
    await userEvent.click(card!)
    expect(navigateMock).toHaveBeenCalledWith('/reports')
  })

  it('navigates to /knowledge-upload when clicking 知识库管理 card', async () => {
    renderWithRouter()

    const card = screen.getByText('知识库管理').closest('div')
    await userEvent.click(card!)
    expect(navigateMock).toHaveBeenCalledWith('/knowledge-upload')
  })
})

describe('DashboardPage NOC navigation removal', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  it('does not render 查看全部 button', () => {
    renderWithRouter()

    expect(screen.queryByText('查看全部')).not.toBeInTheDocument()
  })

  it('does not render 前往审核 button', () => {
    renderWithRouter()

    expect(screen.queryByText('前往审核')).not.toBeInTheDocument()
  })

  it('does not navigate to /noc/audit when clicking pending audit items', async () => {
    renderWithRouter()

    const items = screen.getAllByText('5G用户渗透率')
    const firstItem = items[0].closest('div')
    await userEvent.click(firstItem!)
    expect(navigateMock).not.toHaveBeenCalledWith('/noc/audit')
  })
})
