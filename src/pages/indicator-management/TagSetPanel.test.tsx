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
    // find a colored leaf: has color + has parentId + no child nodes reference it
    const childIds = new Set(state.tagNodes.filter(t => t.parentId).map(t => t.parentId))
    const coloredLeaf = state.tagNodes.find(t => t.color && t.parentId && !childIds.has(t.id))
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
      await user.type(input, '核心', { delay: null })

      expect(screen.queryByTestId('tag-pill-highlight')).not.toBeInTheDocument()

      act(() => vi.advanceTimersByTime(150))

      expect(screen.getByTestId('tag-pill-highlight')).toHaveTextContent('核心')

      vi.useRealTimers()
    })

    it('auto expands parent of matched child and dims unmatched tags', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const coreRootId = 'tag-root-mgmt'
      const childId = 'tag-core'

      // 先收起管理属性组
      const toggle = screen.getByLabelText(`收起节点 ${coreRootId}`)
      await user.click(toggle)
      await waitFor(() => {
        expect(screen.queryByTestId(`tag-pill-${childId}`)).not.toBeInTheDocument()
      })

      // 搜索"核心"
      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '核心')
      await waitFor(() => {
        expect(screen.getByTestId(`tag-pill-${childId}`)).toBeInTheDocument()
      })

      // 未匹配节点应暗淡
      const otherPill = screen.getByTestId('tag-pill-tag-key-monitor')
      expect(otherPill).toHaveAttribute('data-dimmed', 'true')
    })

    it('shows match count badge on parent', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '核心', { delay: null })
      act(() => vi.advanceTimersByTime(150))

      const badge = screen.getByTestId('tag-match-count-tag-root-mgmt')
      expect(badge).toHaveTextContent('1')

      vi.useRealTimers()
    })

    it('highlights matched text in tag pills', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '核心', { delay: null })
      act(() => vi.advanceTimersByTime(150))

      const highlight = screen.getByTestId('tag-pill-highlight')
      expect(highlight).toHaveTextContent('核心')
      expect(highlight).toHaveClass('bg-[var(--dark-accent-gold)]/20')
      expect(highlight).toHaveClass('text-[var(--dark-accent-gold)]')
      expect(highlight).toHaveClass('font-bold')

      vi.useRealTimers()
    })

    it('applies scale and pointer-events-none to dimmed unmatched tags in highlight mode', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '核心', { delay: null })
      act(() => vi.advanceTimersByTime(150))

      const dimmedPill = screen.getByTestId('tag-pill-tag-key-monitor')
      expect(dimmedPill).toHaveAttribute('data-dimmed', 'true')

      const wrapper = dimmedPill.parentElement
      expect(wrapper).toHaveClass('opacity-[0.35]')
      expect(wrapper).toHaveClass('scale-[0.98]')
      expect(wrapper).toHaveClass('pointer-events-none')

      vi.useRealTimers()
    })

    it('hides unmatched nodes when switched to filter mode', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '核心')

      // 等待 debounce 和文本高亮出现
      await waitFor(() => {
        expect(screen.getByTestId('tag-pill-highlight')).toBeInTheDocument()
      })

      // 切换过滤模式
      await user.click(screen.getByTestId('search-mode-filter'))

      // 等待 DOM 更新
      await waitFor(() => {
        expect(screen.queryByTestId('tag-pill-tag-key-monitor')).not.toBeInTheDocument()
      })

      // 匹配的子标签应仍存在
      expect(screen.getByTestId('tag-pill-tag-core')).toBeInTheDocument()
      // 未匹配的根节点应被隐藏
      expect(screen.queryByTestId('tag-group-tag-root-tech')).not.toBeInTheDocument()
    })

    it('shows contextual empty state when no tags match in filter mode', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const input = screen.getByTestId('tree-search-input')
      await user.type(input, '绝对不存在的标签')

      // 等待 debounce（高亮模式下不显示空状态，只是 dim 所有节点）
      await waitFor(() => {
        expect(screen.getByTestId('tag-pill-tag-core')).toHaveAttribute('data-dimmed', 'true')
      })

      // 切换到过滤模式才显示空状态
      await user.click(screen.getByTestId('search-mode-filter'))

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
      })
      expect(screen.getByText('未找到匹配标签')).toBeInTheDocument()
    })
  })

  describe('tag color editing', () => {
    it('renders color picker trigger for each tag', () => {
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const firstLeaf = state.tagNodes.find((t) => t.parentId)!
      expect(screen.getByTestId(`tag-pill-color-trigger-${firstLeaf.id}`)).toBeInTheDocument()
    })

    it('changes tag color via preset and persists to store', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const firstLeaf = state.tagNodes.find((t) => t.parentId)!

      await user.click(screen.getByTestId(`tag-pill-color-trigger-${firstLeaf.id}`))
      await user.click(screen.getByTestId('tag-color-preset-#EB2F96'))

      await waitFor(() => {
        expect(useAttachmentStore.getState().tagNodes.find((n) => n.id === firstLeaf.id)?.color).toBe('#EB2F96')
      })
    })

    it('changes tag color via hex input and persists to store', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const firstLeaf = state.tagNodes.find((t) => t.parentId)!

      await user.click(screen.getByTestId(`tag-pill-color-trigger-${firstLeaf.id}`))

      const input = screen.getByTestId('tag-color-hex-input')
      await user.clear(input)
      await user.type(input, 'FF5733')
      await user.click(screen.getByTestId('tag-color-hex-apply'))

      await waitFor(() => {
        expect(useAttachmentStore.getState().tagNodes.find((n) => n.id === firstLeaf.id)?.color).toBe('#FF5733')
      })
    })

    it('applies 10% tag color background on unselected tag', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const coloredRoot = state.tagNodes.find((t) => t.color && !t.parentId)!

      render(<TagSetPanel />)

      const pill = screen.getByTestId(`tag-pill-${coloredRoot.id}`)
      expect(pill).toHaveStyle({ backgroundColor: `${coloredRoot.color}1A` })
    })

    it('uses unified highlight background on selected tag regardless of color', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<TagSetPanel />)

      const state = useAttachmentStore.getState()
      const coloredRoot = state.tagNodes.find((t) => t.color && !t.parentId)!

      await user.click(screen.getByTestId(`tag-pill-${coloredRoot.id}`))

      const pill = screen.getByTestId(`tag-pill-${coloredRoot.id}`)
      expect(pill).toHaveClass('bg-dark-card-l1')
      expect(pill).not.toHaveStyle({ backgroundColor: `${coloredRoot.color}1A` })
    })
  })
})
