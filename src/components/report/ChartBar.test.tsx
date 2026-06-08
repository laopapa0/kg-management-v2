import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import ChartBar from './ChartBar'

const { mockInit, mockSetOption, mockDispose, mockInstance } = vi.hoisted(() => {
  const mockSetOption = vi.fn()
  const mockDispose = vi.fn()
  const mockInstance = { setOption: mockSetOption, resize: vi.fn(), dispose: mockDispose }
  const mockInit = vi.fn(() => mockInstance)
  return { mockInit, mockSetOption, mockDispose, mockInstance }
})

vi.mock('echarts', () => ({
  init: mockInit,
}))

describe('ChartBar', () => {
  beforeEach(() => {
    mockInit.mockClear()
    mockSetOption.mockClear()
    mockDispose.mockClear()
  })

  const mockOption = {
    xAxis: { type: 'category' as const, data: ['A', 'B'] },
    yAxis: { type: 'value' as const },
    series: [{ type: 'bar' as const, data: [1, 2] }],
  }

  it('renders chart container and calls echarts.init with dark theme', () => {
    render(<ChartBar option={mockOption} />)
    expect(mockInit).toHaveBeenCalledTimes(1)
    const callArg = mockInit.mock.calls[0][0]
    expect(callArg).toBeInstanceOf(HTMLDivElement)
    expect(mockInit.mock.calls[0][1]).toBe('dark')
  })

  it('calls setOption with the provided option', () => {
    render(<ChartBar option={mockOption} />)
    expect(mockSetOption).toHaveBeenCalledWith(mockOption)
  })

  it('disposes echarts instance on unmount', () => {
    const { unmount } = render(<ChartBar option={mockOption} />)
    unmount()
    expect(mockDispose).toHaveBeenCalled()
  })

  it('observes container resize via ResizeObserver', () => {
    const observeSpy = vi.spyOn(global.ResizeObserver.prototype, 'observe')
    const { container } = render(<ChartBar option={mockOption} />)
    expect(observeSpy).toHaveBeenCalledTimes(1)
    const observedEl = observeSpy.mock.calls[0][0]
    expect(observedEl).toBe(container.querySelector('.chart-bar'))
    observeSpy.mockRestore()
  })
})
