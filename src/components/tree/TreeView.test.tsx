import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

    const nodes = screen.getAllByTestId('tree-node-content')
    const byId = Object.fromEntries(nodes.map((n) => [n.getAttribute('data-node-id'), n]))

    expect(byId['root-1']).toHaveStyle({ paddingLeft: '0px' })
    expect(byId['child-1-1']).toHaveStyle({ paddingLeft: '20px' })
    expect(byId['child-1-2']).toHaveStyle({ paddingLeft: '20px' })
    expect(byId['grandchild-1-2-1']).toHaveStyle({ paddingLeft: '40px' })
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
})
