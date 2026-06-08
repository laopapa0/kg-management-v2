import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import ParameterFields, { type ParameterFieldsRef } from './ParameterFields'
import type { RuleType } from '@/models/indicatorAttachmentModel'

describe('ParameterFields', () => {
  const thresholdDefaults = {
    upperLimit: 120,
    lowerLimit: 80,
    unit: '%',
    level: 'P1' as const,
  }

  const fluctuationDefaults = {
    algorithm: '同比',
    window: '5min',
  }

  const topnDefaults = {
    n: 10,
    dimension: 'QPS',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('threshold type', () => {
    it('renders upper limit and lower limit inputs', () => {
      render(<ParameterFields ruleType="threshold" onSubmit={vi.fn()} />)
      expect(screen.getByTestId('input-upperLimit')).toBeInTheDocument()
      expect(screen.getByTestId('input-lowerLimit')).toBeInTheDocument()
    })

    it('renders unit segmented buttons', () => {
      render(<ParameterFields ruleType="threshold" onSubmit={vi.fn()} />)
      expect(screen.getByTestId('unit-segmented')).toBeInTheDocument()
    })

    it('renders level pill options P1-P4', () => {
      render(<ParameterFields ruleType="threshold" onSubmit={vi.fn()} />)
      expect(screen.getByTestId('level-pill-P1')).toBeInTheDocument()
      expect(screen.getByTestId('level-pill-P2')).toBeInTheDocument()
      expect(screen.getByTestId('level-pill-P3')).toBeInTheDocument()
      expect(screen.getByTestId('level-pill-P4')).toBeInTheDocument()
    })

    it('populates default values', () => {
      render(
        <ParameterFields
          ruleType="threshold"
          defaultValues={thresholdDefaults}
          onSubmit={vi.fn()}
        />,
      )
      expect(screen.getByTestId('input-upperLimit')).toHaveValue(120)
      expect(screen.getByTestId('input-lowerLimit')).toHaveValue(80)
      expect(screen.getByTestId('level-pill-P1')).toHaveAttribute('data-selected', 'true')
    })

    it('shows range validation error when upper <= lower on blur', async () => {
      const user = userEvent.setup()
      render(<ParameterFields ruleType="threshold" onSubmit={vi.fn()} />)

      const upper = screen.getByTestId('input-upperLimit')
      const lower = screen.getByTestId('input-lowerLimit')

      await user.type(upper, '50')
      await user.type(lower, '60')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByTestId('error-upperLimit')).toHaveTextContent('上限值必须大于下限值')
      })
    })

    it('submits valid threshold data', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      const ref = createRef<ParameterFieldsRef>()
      render(
        <ParameterFields
          ref={ref}
          ruleType="threshold"
          defaultValues={thresholdDefaults}
          onSubmit={onSubmit}
        />,
      )

      const upper = screen.getByTestId('input-upperLimit')
      fireEvent.change(upper, { target: { value: '150' } })

      ref.current?.submit()

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })

      const submitted = onSubmit.mock.calls[0][0]
      expect(submitted.upperLimit).toBe(150)
      expect(submitted.lowerLimit).toBe(80)
      expect(submitted.unit).toBe('%')
      expect(submitted.level).toBe('P1')
    })
  })

  describe('fluctuation type', () => {
    it('renders algorithm select and window input', () => {
      render(<ParameterFields ruleType="fluctuation" onSubmit={vi.fn()} />)
      expect(screen.getByTestId('select-algorithm')).toBeInTheDocument()
      expect(screen.getByTestId('input-window')).toBeInTheDocument()
    })

    it('populates default values', () => {
      render(
        <ParameterFields
          ruleType="fluctuation"
          defaultValues={fluctuationDefaults}
          onSubmit={vi.fn()}
        />,
      )
      expect(screen.getByTestId('input-window')).toHaveValue('5min')
    })

    it('submits valid fluctuation data', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      const ref = createRef<ParameterFieldsRef>()
      render(
        <ParameterFields
          ref={ref}
          ruleType="fluctuation"
          defaultValues={fluctuationDefaults}
          onSubmit={onSubmit}
        />,
      )

      const windowInput = screen.getByTestId('input-window')
      fireEvent.change(windowInput, { target: { value: '10min' } })

      ref.current?.submit()

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })

      const submitted = onSubmit.mock.calls[0][0]
      expect(submitted.window).toBe('10min')
    })
  })

  describe('topn type', () => {
    it('renders n input and dimension select', () => {
      render(<ParameterFields ruleType="topn" onSubmit={vi.fn()} />)
      expect(screen.getByTestId('input-n')).toBeInTheDocument()
      expect(screen.getByTestId('select-dimension')).toBeInTheDocument()
    })

    it('populates default values', () => {
      render(
        <ParameterFields ruleType="topn" defaultValues={topnDefaults} onSubmit={vi.fn()} />,
      )
      expect(screen.getByTestId('input-n')).toHaveValue(10)
    })

    it('submits valid topn data', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      const ref = createRef<ParameterFieldsRef>()
      render(
        <ParameterFields ref={ref} ruleType="topn" defaultValues={topnDefaults} onSubmit={onSubmit} />,
      )

      const nInput = screen.getByTestId('input-n')
      fireEvent.change(nInput, { target: { value: '20' } })

      ref.current?.submit()

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })

      const submitted = onSubmit.mock.calls[0][0]
      expect(submitted.n).toBe(20)
    })
  })

  it('does not submit when validation fails', async () => {
    const onSubmit = vi.fn()
    const ref = createRef<ParameterFieldsRef>()
    render(<ParameterFields ref={ref} ruleType="threshold" onSubmit={onSubmit} />)

    const upper = screen.getByTestId('input-upperLimit')
    const lower = screen.getByTestId('input-lowerLimit')

    await userEvent.clear(upper)
    await userEvent.type(upper, '10')
    await userEvent.clear(lower)
    await userEvent.type(lower, '20')
    await userEvent.tab()

    ref.current?.submit()

    await waitFor(() => {
      expect(screen.getByTestId('error-upperLimit')).toBeInTheDocument()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
