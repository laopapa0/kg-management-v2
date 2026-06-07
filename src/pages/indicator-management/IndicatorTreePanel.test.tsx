import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore } from '@/stores/attachmentStore'
import IndicatorTreePanel from './IndicatorTreePanel'

describe('IndicatorTreePanel', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
  })

  it('renders tree view with indicator names', () => {
    initializeAttachmentStore()
    render(<IndicatorTreePanel />)

    expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    const firstDept = useAttachmentStore.getState().departments[0]
    const indicators = useAttachmentStore.getState().indicators
    expect(screen.getByText(indicators[0].name)).toBeInTheDocument()
  })

  it('builds nested tree based on treeParentId', () => {
    initializeAttachmentStore()
    const state = useAttachmentStore.getState()
    const parent = state.indicators[0]
    const child = state.indicators[1]

    state.setIndicators(
      state.indicators.map((i) => (i.id === child.id ? { ...i, treeParentId: parent.id } : i)),
    )

    render(<IndicatorTreePanel />)

    const toggle = screen.getByLabelText(`收起节点 ${parent.id}`)
    expect(toggle).toBeInTheDocument()
  })

  it('shows indicator code as caption when renderNode provides it', () => {
    initializeAttachmentStore()
    render(<IndicatorTreePanel />)

    const indicators = useAttachmentStore.getState().indicators
    expect(screen.getByText(indicators[0].code)).toBeInTheDocument()
  })
})
