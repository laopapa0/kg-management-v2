import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PanelHeader from './PanelHeader'

describe('PanelHeader', () => {
  it('renders the given title', () => {
    render(<PanelHeader title="指标树" />)

    expect(screen.getByText('指标树')).toBeInTheDocument()
  })

  it('has a 40px height container', () => {
    const { container } = render(<PanelHeader title="指标树" />)

    expect(container.firstChild).toHaveClass('h-10')
  })

  it('has an add button that is hidden by default and visible on group hover', () => {
    render(<PanelHeader title="指标树" />)

    const header = screen.getByTestId('panel-header')
    const addButton = screen.getByTestId('panel-header-add-button')

    expect(header).toHaveClass('group')
    expect(addButton).toHaveClass('opacity-0')
    expect(addButton).toHaveClass('group-hover:opacity-100')
    expect(addButton).toHaveClass('duration-150')
  })

  it('calls onAdd when the add button is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(<PanelHeader title="指标树" onAdd={onAdd} />)

    const header = screen.getByTestId('panel-header')
    await user.hover(header)

    const addButton = screen.getByTestId('panel-header-add-button')
    await user.click(addButton)

    expect(onAdd).toHaveBeenCalledTimes(1)
  })
})
