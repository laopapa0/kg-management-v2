import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChartNote from './ChartNote'

describe('ChartNote', () => {
  it('renders note text and source', () => {
    render(<ChartNote text="本图表反映5G用户增长趋势" source="口径：5G在网用户数/移动在网用户总数" />)
    expect(screen.getByText('本图表反映5G用户增长趋势')).toBeInTheDocument()
    expect(screen.getByText('口径：5G在网用户数/移动在网用户总数')).toBeInTheDocument()
  })

  it('has chart-note class', () => {
    const { container } = render(<ChartNote text="t" source="s" />)
    expect(container.firstChild).toHaveClass('chart-note')
  })
})
