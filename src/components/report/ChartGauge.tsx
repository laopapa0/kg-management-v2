import * as echarts from 'echarts'
import ChartContainer from './ChartContainer'

interface ChartGaugeProps {
  option: echarts.EChartsOption
}

export default function ChartGauge({ option }: ChartGaugeProps) {
  return <ChartContainer option={option} className="chart-gauge" />
}
