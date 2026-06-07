import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TagPill from './TagPill'
import type { TagNode } from '@/models/indicatorAttachmentModel'

const sampleTag: TagNode = { id: 't1', name: '测试标签', color: '#3B82F6' }
const noColorTag: TagNode = { id: 't2', name: '无色标签' }

describe('TagPill', () => {
  it('renders tag name', () => {
    render(<TagPill tag={sampleTag} selected={false} />)
    expect(screen.getByText('测试标签')).toBeInTheDocument()
  })

  it('applies selected visual state', () => {
    render(<TagPill tag={sampleTag} selected />)
    const pill = screen.getByTestId('tag-pill-t1')
    expect(pill).toHaveAttribute('data-selected', 'true')
    expect(pill).toHaveClass('bg-[#111B26]')
    expect(pill).toHaveClass('text-[#4DA6FF]')
    expect(pill).toHaveClass('border-[#15417E]')
  })

  it('applies partial visual state', () => {
    render(<TagPill tag={sampleTag} selected={false} partial />)
    const pill = screen.getByTestId('tag-pill-t1')
    expect(pill).toHaveAttribute('data-partial', 'true')
    expect(pill).toHaveClass('bg-[#111B26]/50')
    expect(pill).toHaveClass('border-dashed')
    expect(pill).toHaveClass('border-[#15417E]')
  })

  it('shows check icon with scale animation when selected', () => {
    render(<TagPill tag={sampleTag} selected />)
    const check = screen.getByTestId('tag-pill-check-t1')
    expect(check).toHaveClass('scale-100')
    expect(check).toHaveClass('bg-[#4DA6FF]')
  })

  it('shows semi-transparent check icon when partial', () => {
    render(<TagPill tag={sampleTag} selected={false} partial />)
    const check = screen.getByTestId('tag-pill-check-t1')
    expect(check).toHaveClass('scale-100')
    expect(check).toHaveClass('bg-[#4DA6FF]/50')
    const checkIcon = check.querySelector('svg')
    expect(checkIcon).toHaveClass('opacity-70')
  })

  it('hides check icon when unselected', () => {
    render(<TagPill tag={sampleTag} selected={false} />)
    const check = screen.getByTestId('tag-pill-check-t1')
    expect(check).toHaveClass('scale-0')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<TagPill tag={sampleTag} selected={false} onClick={onClick} />)

    await user.click(screen.getByTestId('tag-pill-t1'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies 10% color background when unselected with color', () => {
    render(<TagPill tag={sampleTag} selected={false} />)
    const pill = screen.getByTestId('tag-pill-t1')
    expect(pill).toHaveStyle({ backgroundColor: '#3B82F61A' })
  })

  it('falls back to default background when unselected without color', () => {
    render(<TagPill tag={noColorTag} selected={false} />)
    const pill = screen.getByTestId('tag-pill-t2')
    expect(pill).toHaveClass('bg-dark-card-l2')
  })

  it('uses highlight background when selected regardless of tag color', () => {
    render(<TagPill tag={sampleTag} selected />)
    const pill = screen.getByTestId('tag-pill-t1')
    expect(pill).toHaveClass('bg-[#111B26]')
    expect(pill).not.toHaveStyle({ backgroundColor: '#3B82F61A' })
  })

  it('renders color picker when editable and calls onColorChange', async () => {
    const user = userEvent.setup()
    const onColorChange = vi.fn()
    render(
      <TagPill
        tag={sampleTag}
        selected={false}
        editable
        onColorChange={onColorChange}
      />,
    )

    const trigger = screen.getByTestId('tag-pill-color-trigger-t1')
    expect(trigger).toBeInTheDocument()

    await user.click(trigger)
    await user.click(screen.getByTestId('tag-color-preset-#EB2F96'))

    expect(onColorChange).toHaveBeenCalledWith('#EB2F96')
  })
})
