import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TagCloud from './TagCloud'
import type { TagNode } from '@/models/indicatorAttachmentModel'

function createTags(count: number): TagNode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `tag-${i}`,
    name: `标签 ${i}`,
  }))
}

function mockContainerScrollHeight(value: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get() {
      if (this.getAttribute('data-testid') === 'tag-cloud-container') {
        return value
      }
      return 0
    },
  })
}

describe('TagCloud', () => {
  const originalScrollHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollHeight',
  )

  beforeEach(() => {
    global.ResizeObserver = class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    } as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    if (originalScrollHeight) {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight)
    }
    vi.restoreAllMocks()
  })

  it('renders all tags when there are few tags', () => {
    mockContainerScrollHeight(28) // 1 row, no collapse needed
    const tags = createTags(3)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} />)

    expect(screen.getByTestId('tag-pill-tag-0')).toBeInTheDocument()
    expect(screen.getByTestId('tag-pill-tag-1')).toBeInTheDocument()
    expect(screen.getByTestId('tag-pill-tag-2')).toBeInTheDocument()
    expect(screen.queryByTestId('tag-cloud-toggle')).not.toBeInTheDocument()
  })

  it('shows expand button when tags exceed max rows', () => {
    mockContainerScrollHeight(200) // ~6 rows, 3 rows over maxRows=3
    const tags = createTags(20)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} />)

    const toggle = screen.getByTestId('tag-cloud-toggle')
    expect(toggle).toHaveTextContent('+3')
  })

  it('expands and collapses on toggle click', async () => {
    const user = userEvent.setup()
    mockContainerScrollHeight(200)
    const tags = createTags(20)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} />)

    const toggle = screen.getByTestId('tag-cloud-toggle')
    const container = screen.getByTestId('tag-cloud-container')

    expect(container).toHaveAttribute('data-expanded', 'false')
    expect(toggle).toHaveTextContent('+3')

    await user.click(toggle)
    expect(container).toHaveAttribute('data-expanded', 'true')
    expect(toggle).toHaveTextContent('收起')

    await user.click(toggle)
    expect(container).toHaveAttribute('data-expanded', 'false')
    expect(toggle).toHaveTextContent('+3')
  })

  it('renders tag pills with correct dimensions', () => {
    mockContainerScrollHeight(28)
    const tags = createTags(1)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} />)

    const pill = screen.getByTestId('tag-pill-tag-0')
    expect(pill).toHaveClass('h-7')
    expect(pill).toHaveClass('px-2.5')
    expect(pill).toHaveClass('rounded-md')
    expect(pill).toHaveClass('whitespace-nowrap')
  })

  it('applies dashed border and transparent background to expand button', () => {
    mockContainerScrollHeight(200)
    const tags = createTags(20)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} />)

    const toggle = screen.getByTestId('tag-cloud-toggle')
    expect(toggle).toHaveClass('border-dashed')
    expect(toggle).toHaveClass('bg-transparent')
  })

  it('animates max-height over 250ms', () => {
    mockContainerScrollHeight(200)
    const tags = createTags(20)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} />)

    const container = screen.getByTestId('tag-cloud-container')
    expect(container).toHaveStyle({ transitionDuration: '250ms' })
  })

  it('collapses container to maxRows height initially', () => {
    mockContainerScrollHeight(200)
    const tags = createTags(20)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} maxRows={3} />)

    const container = screen.getByTestId('tag-cloud-container')
    // maxRows=3, tagHeight=28, gap=8 → 3*28 + 2*8 = 100px
    expect(container).toHaveStyle({ maxHeight: '100px' })
  })

  it('expands container to scrollHeight when expanded', async () => {
    const user = userEvent.setup()
    mockContainerScrollHeight(200)
    const tags = createTags(20)
    render(<TagCloud tags={tags} selectedTagIds={new Set()} />)

    const toggle = screen.getByTestId('tag-cloud-toggle')
    await user.click(toggle)

    const container = screen.getByTestId('tag-cloud-container')
    expect(container).toHaveStyle({ maxHeight: '200px' })
  })
})
