import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, act, waitFor } from '@testing-library/react'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore } from '@/stores/attachmentStore'
import TagSetPanel from './TagSetPanel'
import { buildTagTree } from '@/models/indicatorAttachmentModel'

describe('TagSetPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
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

    const row = within(groupEl).getByTestId('tag-list-row')
    expect(row).toHaveClass('flex')
    expect(row).toHaveClass('flex-wrap')
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
})
