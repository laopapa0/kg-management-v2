import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTreeKeyboard } from './useTreeKeyboard'
import type { TreeNode } from './TreeView'

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

function createKeyEvent(key: string, ctrlKey = false, shiftKey = false): React.KeyboardEvent {
  return {
    key,
    ctrlKey,
    shiftKey,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as React.KeyboardEvent
}

describe('useTreeKeyboard', () => {
  it('ArrowDown selects next visible node', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'root-1',
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    result.current.handleKeyDown(createKeyEvent('ArrowDown'))

    expect(onSelect).toHaveBeenCalledWith('child-1-1')
  })

  it('ArrowUp selects previous visible node', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'child-1-1',
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    result.current.handleKeyDown(createKeyEvent('ArrowUp'))

    expect(onSelect).toHaveBeenCalledWith('root-1')
  })

  it('ArrowRight expands collapsed node', () => {
    const onToggle = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(),
        selectedId: 'root-1',
        onSelect: vi.fn(),
        onToggle,
      }),
    )

    result.current.handleKeyDown(createKeyEvent('ArrowRight'))

    expect(onToggle).toHaveBeenCalledWith('root-1')
  })

  it('ArrowRight moves to first child when already expanded', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'root-1',
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    result.current.handleKeyDown(createKeyEvent('ArrowRight'))

    expect(onSelect).toHaveBeenCalledWith('child-1-1')
  })

  it('ArrowLeft collapses expanded node', () => {
    const onToggle = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'root-1',
        onSelect: vi.fn(),
        onToggle,
      }),
    )

    result.current.handleKeyDown(createKeyEvent('ArrowLeft'))

    expect(onToggle).toHaveBeenCalledWith('root-1')
  })

  it('ArrowLeft moves to parent when collapsed', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'child-1-1',
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    result.current.handleKeyDown(createKeyEvent('ArrowLeft'))

    expect(onSelect).toHaveBeenCalledWith('root-1')
  })

  it('Home jumps to first visible node', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'root-2',
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    result.current.handleKeyDown(createKeyEvent('Home'))

    expect(onSelect).toHaveBeenCalledWith('root-1')
  })

  it('End jumps to last visible node', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'root-1',
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    result.current.handleKeyDown(createKeyEvent('End'))

    expect(onSelect).toHaveBeenCalledWith('root-2')
  })

  it('asterisk expands all siblings with children', () => {
    const onExpandedChange = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(['root-1']),
        selectedId: 'child-1-1',
        onSelect: vi.fn(),
        onToggle: vi.fn(),
        onExpandedChange,
      }),
    )

    result.current.handleKeyDown(createKeyEvent('*'))

    expect(onExpandedChange).toHaveBeenCalledTimes(1)
    const expanded = onExpandedChange.mock.calls[0][0] as Set<string>
    expect(expanded.has('child-1-2')).toBe(true)
  })

  it('F2 calls onEditNode with selected id', () => {
    const onEditNode = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(),
        selectedId: 'root-1',
        onSelect: vi.fn(),
        onToggle: vi.fn(),
        onEditNode,
      }),
    )

    result.current.handleKeyDown(createKeyEvent('F2'))

    expect(onEditNode).toHaveBeenCalledWith('root-1')
  })

  it('Delete calls onDeleteNode with selected id', () => {
    const onDeleteNode = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(),
        selectedId: 'root-1',
        onSelect: vi.fn(),
        onToggle: vi.fn(),
        onDeleteNode,
      }),
    )

    result.current.handleKeyDown(createKeyEvent('Delete'))

    expect(onDeleteNode).toHaveBeenCalledWith('root-1')
  })

  it('ignores F2 when onEditNode is not provided', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: mockNodes,
        expanded: new Set(),
        selectedId: 'root-1',
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    const event = createKeyEvent('F2')
    result.current.handleKeyDown(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does nothing when tree is empty', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useTreeKeyboard({
        nodes: [],
        expanded: new Set(),
        selectedId: null,
        onSelect,
        onToggle: vi.fn(),
      }),
    )

    result.current.handleKeyDown(createKeyEvent('ArrowDown'))

    expect(onSelect).not.toHaveBeenCalled()
  })
})
