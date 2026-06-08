import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsCardGrid from './StatsCardGrid'

describe('StatsCardGrid', () => {
  const cards = [
    { title: '5G用户数', value: '1,234万', unit: '户' },
    { title: '宽带渗透率', value: '85.6', unit: '%' },
    { title: 'ARPU', value: '58.3', unit: '元' },
  ]

  it('renders all card titles and values', () => {
    render(<StatsCardGrid cards={cards} />)
    for (const c of cards) {
      expect(screen.getByText(c.title)).toBeInTheDocument()
      expect(screen.getByText(c.value)).toBeInTheDocument()
      expect(screen.getByText(c.unit)).toBeInTheDocument()
    }
  })

  it('uses stat-card class on each card', () => {
    const { container } = render(<StatsCardGrid cards={cards} />)
    const statCards = container.querySelectorAll('.stat-card')
    expect(statCards).toHaveLength(cards.length)
  })
})
