import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore } from '@/stores/attachmentStore'
import TagSetPanel from './TagSetPanel'
import { buildTagTree } from '@/models/indicatorAttachmentModel'

describe('TagSetPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
    global.ResizeObserver = class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    } as unknown as typeof ResizeObserver
  })

  it('renders tag groups from store tagNodes', () => {
    initializeAttachmentStore()
    render(<TagSetPanel />)

    const state = useAttachmentStore.getState()
    const tagTree = state.tagNodes
    expect(tagTree.length).toBeGreaterThan(0)

    for (const root of tagTree.filter((t) => !t.parentId)) {
      expect(screen.getByText(root.name)).toBeInTheDocument()
    }
  })

  it('renders child tags in a flex-wrap row under each group', () => {
    initializeAttachmentStore()
    render(<TagSetPanel />)

    const state = useAttachmentStore.getState()
    const tagTree = buildTagTree(state.tagNodes)
    const groupWithChildren = tagTree.find((t) => t.children && t.children.length > 0)
    expect(groupWithChildren).toBeDefined()

    const groupEl = screen.getByTestId(`tag-group-${groupWithChildren!.id}`)
    const childNames = groupWithChildren!.children!.map((c) => c.name)

    for (const name of childNames) {
      expect(within(groupEl).getByText(name)).toBeInTheDocument()
    }

    const cloud = within(groupEl).getByTestId('tag-cloud-container')
    expect(cloud).toHaveClass('flex')
    expect(cloud).toHaveClass('flex-wrap')
  })

  it('shows selected state for tags referenced by any indicator', () => {
    initializeAttachmentStore()
    const state = useAttachmentStore.getState()
    const firstLeaf = state.tagNodes.find((t) => t.parentId)
    expect(firstLeaf).toBeDefined()

    act(() => {
      state.setIndicators(
        state.indicators.map((i, idx) => (idx === 0 ? { ...i, tagIds: [firstLeaf!.id] } : i)),
      )
    })

    render(<TagSetPanel />)

    const pill = screen.getByTestId(`tag-pill-${firstLeaf!.id}`)
    expect(pill).toHaveAttribute('data-selected', 'true')
  })

  it('shows unselected state for tags not referenced by any indicator', () => {
    initializeAttachmentStore()
    render(<TagSetPanel />)

    const state = useAttachmentStore.getState()
    const firstLeaf = state.tagNodes.find((t) => t.parentId)
    expect(firstLeaf).toBeDefined()

    const pill = screen.getByTestId(`tag-pill-${firstLeaf!.id}`)
    expect(pill).toHaveAttribute('data-selected', 'false')
  })

  it('displays tag color when set on the tag node', () => {
    initializeAttachmentStore()
    render(<TagSetPanel />)

    const state = useAttachmentStore.getState()
    const tagTree = buildTagTree(state.tagNodes)
    const coloredLeaf = tagTree.find((t) => t.color && !t.children)
    expect(coloredLeaf).toBeDefined()

    const pill = screen.getByTestId(`tag-pill-${coloredLeaf!.id}`)
    expect(pill).toHaveStyle({ borderColor: coloredLeaf!.color })
  })

  it('updates tags when department is switched', async () => {
    initializeAttachmentStore()
    render(<TagSetPanel />)

    const state = useAttachmentStore.getState()
    const secondDept = state.departments[1]
    expect(secondDept).toBeDefined()

    const firstTagName = state.tagNodes.find((t) => !t.parentId)!.name
    expect(screen.getByText(firstTagName)).toBeInTheDocument()

    act(() => {
      state.setCurrentDepartmentId(secondDept.id)
    })

    await waitFor(() => {
      const nextTags = useAttachmentStore.getState().tagNodes
      expect(nextTags.length).toBeGreaterThan(0)
      expect(screen.getByText(nextTags.find((t) => !t.parentId)!.name)).toBeInTheDocument()
    })
  })

  it('renders EmptyState when tagNodes is empty', () => {
    initializeAttachmentStore()
    useAttachmentStore.setState({ tagNodes: [] })

    render(<TagSetPanel />)

    expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
    expect(screen.getByText('暂无标签')).toBeInTheDocument()
  })

  describe('cascading selection', () => {
    it('selects a child tag when clicked', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const firstLeaf = state.tagNodes.find((t) => t.parentId)
      expect(firstLeaf).toBeDefined()

      const pill = screen.getByTestId(`tag-pill-${firstLeaf!.id}`)
      expect(pill).toHaveAttribute('data-selected', 'false')

      await user.click(pill)
      expect(pill).toHaveAttribute('data-selected', 'true')
    })

    it('marks parent as partial when a child is selected', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const tagTree = buildTagTree(state.tagNodes)
      const groupWithChildren = tagTree.find((t) => t.children && t.children.length > 0)!
      const firstChild = groupWithChildren.children![0]

      const childPill = screen.getByTestId(`tag-pill-${firstChild.id}`)
      await user.click(childPill)

      const parentPill = screen.getByTestId(`tag-pill-${groupWithChildren.id}`)
      expect(parentPill).toHaveAttribute('data-partial', 'true')
      expect(parentPill).toHaveAttribute('data-selected', 'false')
    })

    it('marks parent as selected when all children are selected', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const tagTree = buildTagTree(state.tagNodes)
      const groupWithChildren = tagTree.find((t) => t.children && t.children.length > 0)!

      for (const child of groupWithChildren.children!) {
        await user.click(screen.getByTestId(`tag-pill-${child.id}`))
      }

      const parentPill = screen.getByTestId(`tag-pill-${groupWithChildren.id}`)
      expect(parentPill).toHaveAttribute('data-selected', 'true')
      expect(parentPill).toHaveAttribute('data-partial', 'false')
    })

    it('selects all descendants when parent is selected', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const tagTree = buildTagTree(state.tagNodes)
      const groupWithChildren = tagTree.find((t) => t.children && t.children.length > 0)!

      const parentPill = screen.getByTestId(`tag-pill-${groupWithChildren.id}`)
      await user.click(parentPill)

      expect(parentPill).toHaveAttribute('data-selected', 'true')
      for (const child of groupWithChildren.children!) {
        expect(screen.getByTestId(`tag-pill-${child.id}`)).toHaveAttribute('data-selected', 'true')
      }
    })

    it('unselects all descendants when parent is toggled off', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const tagTree = buildTagTree(state.tagNodes)
      const groupWithChildren = tagTree.find((t) => t.children && t.children.length > 0)!

      const parentPill = screen.getByTestId(`tag-pill-${groupWithChildren.id}`)
      await user.click(parentPill)
      await user.click(parentPill)

      expect(parentPill).toHaveAttribute('data-selected', 'false')
      for (const child of groupWithChildren.children!) {
        expect(screen.getByTestId(`tag-pill-${child.id}`)).toHaveAttribute('data-selected', 'false')
      }
    })
  })

  describe('search and filtering', () => {
    it('renders search input, selected count, and clear button', () => {
      initializeAttachmentStore()
      render(<TagSetPanel />)

      expect(screen.getByTestId('tree-search-input')).toBeInTheDocument()
      expect(screen.getByTestId('tag-selected-count')).toBeInTheDocument()
      expect(screen.getByTestId('tag-clear-button')).toBeInTheDocument()
    })

    it('shows selected count from indicator tagIds', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const firstLeaf = state.tagNodes.find((t) => t.parentId)
      expect(firstLeaf).toBeDefined()

      act(() => {
        state.setIndicators(
          state.indicators.map((i, idx) => (idx === 0 ? { ...i, tagIds: [firstLeaf!.id] } : i)),
        )
      })

      render(<TagSetPanel />)
      expect(screen.getByTestId('tag-selected-count')).toHaveTextContent('1')
    })

    it('clears all selections when clear button clicked', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const firstLeaf = state.tagNodes.find((t) => t.parentId)!

      await user.click(screen.getByTestId(`tag-pill-${firstLeaf.id}`))
      expect(screen.getByTestId(`tag-pill-${firstLeaf.id}`)).toHaveAttribute('data-selected', 'true')

      await user.click(screen.getByTestId('tag-clear-button'))
      expect(screen.getByTestId(`tag-pill-${firstLeaf.id}`)).toHaveAttribute('data-selected', 'false')
    })

    it('debounces search input by 150ms', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '月度', { delay: null })

      expect(screen.queryByTestId('tag-pill-highlight')).not.toBeInTheDocument()

      act(() => vi.advanceTimersByTime(150))

      expect(screen.getByTestId('tag-pill-highlight')).toHaveTextContent('月度')

      vi.useRealTimers()
    })

    it('auto expands parent of matched child and dims unmatched tags', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const coreRootId = 'tag-finance-core'
      const childId = 'tag-finance-core-monthly'

      // 先收起核心指标组
      const toggle = screen.getByLabelText(`收起节点 ${coreRootId}`)
      await user.click(toggle)
      await waitFor(() => {
        expect(screen.queryByTestId(`tag-pill-${childId}`)).not.toBeInTheDocument()
      })

      // 搜索“月度”
      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '月度')
      await waitFor(() => {
        expect(screen.getByTestId(`tag-pill-${childId}`)).toBeInTheDocument()
      })

      // 未匹配节点应暗淡
      const costPill = screen.getByTestId('tag-pill-tag-finance-cost')
      expect(costPill).toHaveAttribute('data-dimmed', 'true')
    })

    it('shows match count badge on parent', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '月度', { delay: null })
      act(() => vi.advanceTimersByTime(150))

      const badge = screen.getByTestId('tag-match-count-tag-finance-core')
      expect(badge).toHaveTextContent('1')

      vi.useRealTimers()
    })

    it('highlights matched text in tag pills', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '月度', { delay: null })
      act(() => vi.advanceTimersByTime(150))

      const highlight = screen.getByTestId('tag-pill-highlight')
      expect(highlight).toHaveTextContent('月度')
      expect(highlight).toHaveClass('bg-[#B8860B]/20')
      expect(highlight).toHaveClass('text-[#FFD700]')
      expect(highlight).toHaveClass('font-bold')

      vi.useRealTimers()
    })
  })
})
