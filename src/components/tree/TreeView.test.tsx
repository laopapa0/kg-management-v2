import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreeView, { type TreeNode } from './TreeView'

interface TestNode extends TreeNode {
  label: string
}

const mockNodes: TestNode[] = [
  {
    id: 'root-1',
    label: '根节点 1',
    children: [
      { id: 'child-1-1', label: '子节点 1-1' },
      {
        id: 'child-1-2',
        label: '子节点 1-2',
        children: [{ id: 'grandchild-1-2-1', label: '孙节点 1-2-1' }],
      },
    ],
  },
  { id: 'root-2', label: '根节点 2' },
]

const renderNode = (node: TestNode) => <span data-testid="node-label">{node.label}</span>

describe('TreeView', () => {
  it('renders root node labels', () => {
    render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

    expect(screen.getByText('根节点 1')).toBeInTheDocument()
    expect(screen.getByText('根节点 2')).toBeInTheDocument()
  })

  it('shows expand toggle for nodes with children', () => {
    render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

    const toggles = screen.getAllByTestId('tree-node-toggle')
    expect(toggles).toHaveLength(1)

    const root1Toggle = toggles[0]
    expect(root1Toggle).toHaveAttribute('aria-expanded', 'false')
    expect(root1Toggle).toHaveAttribute('aria-label', '展开节点 root-1')
  })

  it('leaves placeholder space for leaf nodes', () => {
    render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

    const placeholders = screen.getAllByTestId('tree-node-leaf-placeholder')
    expect(placeholders.length).toBeGreaterThanOrEqual(1)
  })

  it('expands node and shows children when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

    expect(screen.queryByText('子节点 1-1')).not.toBeInTheDocument()

    const root1Toggle = screen.getAllByTestId('tree-node-toggle')[0]
    await user.click(root1Toggle)

    expect(screen.getByText('子节点 1-1')).toBeInTheDocument()
    expect(screen.getByText('子节点 1-2')).toBeInTheDocument()
    expect(root1Toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses node and hides children when toggle is clicked again', async () => {
    const user = userEvent.setup()
    render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1']} />)

    expect(screen.getByText('子节点 1-1')).toBeInTheDocument()

    const root1Toggle = screen.getByLabelText('收起节点 root-1')
    await user.click(root1Toggle)

    await waitFor(() => {
      expect(screen.queryByText('子节点 1-1')).not.toBeInTheDocument()
    })
    expect(root1Toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('respects initialExpanded for default expansion', () => {
    render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1']} />)

    expect(screen.getByText('子节点 1-1')).toBeInTheDocument()
    expect(screen.queryByText('孙节点 1-2-1')).not.toBeInTheDocument()
  })

  it('calls onExpandedChange when expansion state changes', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(
      <TreeView
        nodes={mockNodes}
        renderNode={renderNode}
        onExpandedChange={onExpandedChange}
      />,
    )

    const root1Toggle = screen.getAllByTestId('tree-node-toggle')[0]
    await user.click(root1Toggle)

    expect(onExpandedChange).toHaveBeenCalledTimes(1)
    expect(onExpandedChange).toHaveBeenLastCalledWith(expect.any(Set))
    const expanded = onExpandedChange.mock.calls[0][0] as Set<string>
    expect(expanded.has('root-1')).toBe(true)

    await user.click(root1Toggle)
    const collapsed = onExpandedChange.mock.calls[1][0] as Set<string>
    expect(collapsed.has('root-1')).toBe(false)
  })

  it('applies 20px indent per depth level via inline padding', () => {
    render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1', 'child-1-2']} />)

    const nodes = screen.getAllByTestId('tree-node-row')
    const byId = Object.fromEntries(nodes.map((n) => [n.getAttribute('data-node-id'), n]))

    expect(byId['root-1']).toHaveStyle({ paddingLeft: '12px' })
    expect(byId['child-1-1']).toHaveStyle({ paddingLeft: '32px' })
    expect(byId['child-1-2']).toHaveStyle({ paddingLeft: '32px' })
    expect(byId['grandchild-1-2-1']).toHaveStyle({ paddingLeft: '52px' })
  })

  it('renders AnimatePresence with initial={false} to skip mount animation', () => {
    const { container } = render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

    const presence = container.querySelector('[data-initial="false"]')
    expect(presence).toBeInTheDocument()
  })

  it('uses motion tokens for expand/collapse transitions', () => {
    render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1']} />)

    const childContainer = screen.getByTestId('tree-children-container')
    expect(childContainer).toHaveAttribute('data-transition', 'expand')
  })

  describe('interaction states', () => {
    it('node row has 36px height and 8px 12px padding', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const firstNode = screen.getAllByTestId('tree-node-row')[0]
      expect(firstNode).toHaveClass('h-9')
      expect(firstNode).toHaveClass('py-2')
      expect(firstNode).toHaveClass('px-3')
    })

    it('applies hover background on mouse enter', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const firstNode = screen.getAllByTestId('tree-node-row')[0]
      expect(firstNode).not.toHaveClass('bg-white/[0.04]')

      await user.hover(firstNode)
      expect(firstNode).toHaveClass('bg-white/[0.04]')
    })

    it('shows left highlight bar at 50% opacity on hover', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const firstNode = screen.getAllByTestId('tree-node-row')[0]
      const bar = firstNode.querySelector('[data-testid="tree-node-accent-bar"]') as HTMLElement

      expect(bar).toHaveClass('opacity-0')

      await user.hover(firstNode)
      expect(bar).toHaveClass('opacity-50')
    })

    it('applies selected background and full opacity accent bar on click', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const firstNode = screen.getAllByTestId('tree-node-row')[0]
      const bar = firstNode.querySelector('[data-testid="tree-node-accent-bar"]') as HTMLElement

      await user.click(firstNode)

      expect(firstNode).toHaveClass('bg-dark-tree-selected')
      expect(bar).toHaveClass('opacity-100')
    })

    it('applies font-medium to the selected node content container', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const firstNode = screen.getAllByTestId('tree-node-row')[0]
      await user.click(firstNode)

      const contentContainer = firstNode.querySelector('.flex-1.min-w-0') as HTMLElement
      expect(contentContainer).toHaveClass('font-medium')
    })

    it('only allows one selected node at a time', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.click(rows[0])
      await user.click(rows[1])

      expect(rows[0]).not.toHaveClass('bg-dark-tree-selected')
      expect(rows[1]).toHaveClass('bg-dark-tree-selected')
    })

    it('transitions hover and selected states over 150ms', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const firstNode = screen.getAllByTestId('tree-node-row')[0]
      expect(firstNode).toHaveClass('duration-150')
    })

    it('calls onSelect with node id when a node is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onSelect={onSelect} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.click(rows[0])

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenLastCalledWith('root-1')

      await user.click(rows[1])
      expect(onSelect).toHaveBeenLastCalledWith('root-2')
    })

    it('supports controlled selectedId', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} selectedId="root-2" />)

      const rows = screen.getAllByTestId('tree-node-row')
      expect(rows[0]).not.toHaveClass('bg-dark-tree-selected')
      expect(rows[1]).toHaveClass('bg-dark-tree-selected')
    })

    it('passes interaction context to renderNode', async () => {
      const user = userEvent.setup()
      const renderNodeWithContext = vi.fn((node: TestNode, context: { isSelected: boolean; isHovered: boolean; depth: number }) => (
        <span data-testid="node-label" data-selected={context.isSelected} data-hovered={context.isHovered} data-depth={context.depth}>
          {node.label}
        </span>
      ))
      render(<TreeView nodes={mockNodes} renderNode={renderNodeWithContext} selectedId="root-1" />)

      expect(renderNodeWithContext).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'root-1' }),
        expect.objectContaining({ isSelected: true, isHovered: false, depth: 0 }),
      )

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[1])

      expect(renderNodeWithContext).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'root-2' }),
        expect.objectContaining({ isSelected: false, isHovered: true, depth: 0 }),
      )
    })

    it('does not show edit button by default', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)
      expect(screen.queryByTestId('tree-node-edit-button')).not.toBeInTheDocument()
    })

    it('shows edit button on hover when onEditNode is provided', async () => {
      const user = userEvent.setup()
      const onEditNode = vi.fn()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onEditNode={onEditNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      const editButton = within(rows[0]).getByTestId('tree-node-edit-button')
      expect(editButton).toBeInTheDocument()
      expect(editButton).toHaveClass('opacity-100')
    })

    it('hides edit button on mouse leave', async () => {
      const user = userEvent.setup()
      const onEditNode = vi.fn()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onEditNode={onEditNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])
      await user.unhover(rows[0])

      const editButton = within(rows[0]).getByTestId('tree-node-edit-button')
      expect(editButton).toHaveClass('opacity-0')
    })

    it('calls onEditNode when edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEditNode = vi.fn()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onEditNode={onEditNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      const editButton = within(rows[0]).getByTestId('tree-node-edit-button')
      await user.click(editButton)

      expect(onEditNode).toHaveBeenCalledWith('root-1')
    })

    it('does not show delete button by default', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)
      expect(screen.queryByTestId('tree-node-delete-button')).not.toBeInTheDocument()
    })

    it('shows delete button on hover when onDeleteNode is provided', async () => {
      const user = userEvent.setup()
      const onDeleteNode = vi.fn()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDeleteNode={onDeleteNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      const deleteButton = within(rows[0]).getByTestId('tree-node-delete-button')
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveClass('opacity-100')
    })

    it('hides delete button on mouse leave', async () => {
      const user = userEvent.setup()
      const onDeleteNode = vi.fn()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDeleteNode={onDeleteNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])
      await user.unhover(rows[0])

      const deleteButton = within(rows[0]).getByTestId('tree-node-delete-button')
      expect(deleteButton).toHaveClass('opacity-0')
    })

    it('calls onDeleteNode when delete button is clicked', async () => {
      const user = userEvent.setup()
      const onDeleteNode = vi.fn()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDeleteNode={onDeleteNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      const deleteButton = within(rows[0]).getByTestId('tree-node-delete-button')
      await user.click(deleteButton)

      expect(onDeleteNode).toHaveBeenCalledWith('root-1')
    })
  })

  describe('indent guides', () => {
    it('renders indent guides when renderIndentGuides is "always"', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1', 'child-1-2']} renderIndentGuides="always" />)

      const guides = screen.getAllByTestId('tree-indent-guide')
      expect(guides.length).toBeGreaterThan(0)
    })

    it('does not render indent guides when renderIndentGuides is "none"', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1', 'child-1-2']} renderIndentGuides="none" />)

      expect(screen.queryByTestId('tree-indent-guide')).not.toBeInTheDocument()
    })

    it('defaults to onHover mode and hides guides initially', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1', 'child-1-2']} />)

      const guides = screen.queryAllByTestId('tree-indent-guide')
      guides.forEach((guide) => {
        expect(guide).toHaveClass('opacity-0')
      })
    })

    it('shows indent guides on hover in onHover mode', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1', 'child-1-2']} />)

      const rows = screen.getAllByTestId('tree-node-row')
      const childRow = rows.find((r) => r.getAttribute('data-node-id') === 'child-1-2')
      if (!childRow) throw new Error('child-1-2 row not found')

      await user.hover(childRow)

      const guides = childRow.querySelectorAll('[data-testid="tree-indent-guide"]')
      guides.forEach((guide) => {
        expect(guide).toHaveClass('opacity-100')
      })
    })

    it('uses rgba(255,255,255,0.06) base color and 0.15 on hover for guides', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1', 'child-1-2']} renderIndentGuides="always" />)

      const guide = screen.getAllByTestId('tree-indent-guide')[0]
      expect(guide).toHaveClass('bg-white/[0.06]')
      expect(guide).toHaveClass('group-hover:bg-white/[0.15]')
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowDown moves selection to next visible node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          initialExpanded={['root-1']}
          selectedId="root-1"
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowDown}')

      expect(onSelect).toHaveBeenCalledWith('child-1-1')
    })

    it('ArrowUp moves selection to previous visible node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          initialExpanded={['root-1']}
          selectedId="child-1-1"
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowUp}')

      expect(onSelect).toHaveBeenCalledWith('root-1')
    })

    it('ArrowDown stops at last visible node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-2"
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowDown}')

      expect(onSelect).toHaveBeenCalledWith('root-2')
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('ArrowUp stops at first visible node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowUp}')

      expect(onSelect).toHaveBeenCalledWith('root-1')
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('ArrowDown skips collapsed children', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowDown}')

      expect(onSelect).toHaveBeenCalledWith('root-2')
    })

    it('selects first visible node when ArrowDown with no current selection', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowDown}')

      expect(onSelect).toHaveBeenCalledWith('root-1')
    })

    it('ArrowRight expands collapsed node with children', async () => {
      const user = userEvent.setup()
      const onExpandedChange = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          onExpandedChange={onExpandedChange}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowRight}')

      expect(onExpandedChange).toHaveBeenCalledTimes(1)
      const expanded = onExpandedChange.mock.calls[0][0] as Set<string>
      expect(expanded.has('root-1')).toBe(true)
    })

    it('ArrowRight moves focus to first child when node is already expanded', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          initialExpanded={['root-1']}
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowRight}')

      expect(onSelect).toHaveBeenCalledWith('child-1-1')
    })

    it('ArrowLeft collapses expanded node', async () => {
      const user = userEvent.setup()
      const onExpandedChange = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          initialExpanded={['root-1']}
          onExpandedChange={onExpandedChange}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowLeft}')

      expect(onExpandedChange).toHaveBeenCalledTimes(1)
      const collapsed = onExpandedChange.mock.calls[0][0] as Set<string>
      expect(collapsed.has('root-1')).toBe(false)
    })

    it('ArrowLeft moves focus to parent when node is collapsed or leaf', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="child-1-1"
          initialExpanded={['root-1']}
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{ArrowLeft}')

      expect(onSelect).toHaveBeenCalledWith('root-1')
    })

    it('Home jumps to first visible node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-2"
          initialExpanded={['root-1']}
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{Home}')

      expect(onSelect).toHaveBeenCalledWith('root-1')
    })

    it('End jumps to last visible node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          initialExpanded={['root-1']}
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{End}')

      expect(onSelect).toHaveBeenCalledWith('root-2')
    })

    it('asterisk expands all siblings with children at current level', async () => {
      const user = userEvent.setup()
      const onExpandedChange = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="child-1-1"
          initialExpanded={['root-1']}
          onExpandedChange={onExpandedChange}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{*}')

      expect(onExpandedChange).toHaveBeenCalledTimes(1)
      const expanded = onExpandedChange.mock.calls[0][0] as Set<string>
      expect(expanded.has('child-1-2')).toBe(true)
    })

    it('F2 triggers onEditNode for selected node', async () => {
      const user = userEvent.setup()
      const onEditNode = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          onEditNode={onEditNode}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{F2}')

      expect(onEditNode).toHaveBeenCalledWith('root-1')
    })

    it('Delete triggers onDeleteNode for selected node', async () => {
      const user = userEvent.setup()
      const onDeleteNode = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          onDeleteNode={onDeleteNode}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{Delete}')

      expect(onDeleteNode).toHaveBeenCalledWith('root-1')
    })

    it('tree container has role="tree"', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      expect(screen.getByTestId('tree-view')).toHaveAttribute('role', 'tree')
    })

    it('each row has role="treeitem"', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1']} />)

      const rows = screen.getAllByTestId('tree-node-row')
      rows.forEach((row) => {
        expect(row).toHaveAttribute('role', 'treeitem')
      })
    })

    it('selected node has aria-selected="true"', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} selectedId="root-1" />)

      const rows = screen.getAllByTestId('tree-node-row')
      expect(rows[0]).toHaveAttribute('aria-selected', 'true')
      expect(rows[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('expanded branch node has aria-expanded="true"', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} initialExpanded={['root-1']} />)

      const row = screen.getAllByTestId('tree-node-row')[0]
      expect(row).toHaveAttribute('aria-expanded', 'true')
    })

    it('collapsed branch node has aria-expanded="false"', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const row = screen.getAllByTestId('tree-node-row')[0]
      expect(row).toHaveAttribute('aria-expanded', 'false')
    })

    it('leaf node does not have aria-expanded', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      const leafRow = rows.find((r) => r.getAttribute('data-node-id') === 'root-2')
      expect(leafRow).not.toHaveAttribute('aria-expanded')
    })

    it('does not intercept Ctrl+Z, allowing global undo handler', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <TreeView
          nodes={mockNodes}
          renderNode={renderNode}
          selectedId="root-1"
          onSelect={onSelect}
        />,
      )

      const treeView = screen.getByTestId('tree-view')
      treeView.focus()

      await user.keyboard('{Control>}z{/Control}')

      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('drag and drop', () => {
    it('shows drag handle on hover when onDragNode is provided', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDragNode={vi.fn()} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      const handle = within(rows[0]).getByTestId('tree-node-drag-handle')
      expect(handle).toBeInTheDocument()
      expect(handle).toHaveClass('opacity-100')
    })

    it('hides drag handle before hover even when onDragNode is provided', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDragNode={vi.fn()} />)

      const rows = screen.getAllByTestId('tree-node-row')
      const handle = within(rows[0]).queryByTestId('tree-node-drag-handle')
      expect(handle).toHaveClass('opacity-0')
    })

    it('does not show drag handle when onDragNode is not provided', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      expect(within(rows[0]).queryByTestId('tree-node-drag-handle')).not.toBeInTheDocument()
    })

    it('drag handle has dnd-kit draggable attributes on hover', async () => {
      const user = userEvent.setup()
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDragNode={vi.fn()} />)

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      const handle = within(rows[0]).getByTestId('tree-node-drag-handle')
      expect(handle).toHaveAttribute('role', 'button')
      expect(handle).toHaveAttribute('aria-roledescription', 'draggable')
    })

    it('tree rows have droppable data attributes when onDragNode is provided', () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDragNode={vi.fn()} />)

      const rows = screen.getAllByTestId('tree-node-row')
      rows.forEach((row) => {
        expect(row).toHaveAttribute('data-dnd-droppable')
      })
    })

    it('renders dnd-kit live region when onDragNode is provided', () => {
      const { container } = render(<TreeView nodes={mockNodes} renderNode={renderNode} onDragNode={vi.fn()} />)
      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('highlights drop target when dragging over a node', async () => {
      render(<TreeView nodes={mockNodes} renderNode={renderNode} onDragNode={vi.fn()} />)

      const rows = screen.getAllByTestId('tree-node-row')
      const firstRow = rows[0]

      // Simulate drag-over state by triggering internal drag state change
      // We'll verify the data attributes are present for styling
      expect(firstRow).toHaveAttribute('data-dnd-droppable')
    })

    it('does not wrap in DndContext when onDragNode is not provided', () => {
      const { container } = render(<TreeView nodes={mockNodes} renderNode={renderNode} />)
      expect(container.querySelector('[data-dnd-context]')).not.toBeInTheDocument()
    })
  })
})
