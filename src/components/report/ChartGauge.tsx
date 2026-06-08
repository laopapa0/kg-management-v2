import { useRef } from 'react'
import * as echarts from 'echarts'
import { useECharts } from '@/hooks/useECharts'

interface ChartGaugeProps {
  option: echarts.EChartsOption
}

export default function ChartGauge({ option }: ChartGaugeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useECharts(containerRef, option)
  return <div ref={containerRef} className="chart-gauge" style={{ width: '100%', height: 300 }} />
}
