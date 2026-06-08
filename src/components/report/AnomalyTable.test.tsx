import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnomalyTable from './AnomalyTable'

describe('AnomalyTable', () => {
  const rows = [
    { id: '1', indicator: '5G用户渗透率', date: '2026-05-01', value: '45.2%', change: '+2.3%', verdict: '真异常' as const },
    { id: '2', indicator: '宽带故障率', date: '2026-05-02', value: '0.8%', change: '-0.1%', verdict: '月末效应' as const },
  ]

  it('renders header columns', () => {
    render(<AnomalyTable rows={rows} />)
    expect(screen.getByText('序号')).toBeInTheDocument()
    expect(screen.getByText('指标名')).toBeInTheDocument()
    expect(screen.getByText('异常日期')).toBeInTheDocument()
    expect(screen.getByText('异常值')).toBeInTheDocument()
    expect(screen.getByText('日变化')).toBeInTheDocument()
    expect(screen.getByText('审核判定')).toBeInTheDocument()
  })

  it('renders row data', () => {
    render(<AnomalyTable rows={rows} />)
    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument()
    expect(screen.getByText('45.2%')).toBeInTheDocument()
    expect(screen.getByText('+2.3%')).toBeInTheDocument()
    expect(screen.getByText('真异常')).toBeInTheDocument()
  })

  it('renders verdict tags with correct variants', () => {
    render(<AnomalyTable rows={rows} />)
    const tags = screen.getAllByTestId('report-tag')
    expect(tags[0]).toHaveClass('report-tag-danger')
    expect(tags[1]).toHaveClass('report-tag-warning')
  })
})
