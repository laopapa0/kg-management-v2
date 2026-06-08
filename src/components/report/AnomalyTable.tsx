import ReportTag from './ReportTag'

export type AnomalyVerdict = '真异常' | '月末效应' | '数据质量' | '边界'

interface AnomalyRow {
  id: string
  indicator: string
  date: string
  value: string
  change: string
  verdict: AnomalyVerdict
}

interface AnomalyTableProps {
  rows: AnomalyRow[]
}

const VERDICT_VARIANTS: Record<AnomalyVerdict, 'danger' | 'warning' | 'info' | 'purple'> = {
  '真异常': 'danger',
  '月末效应': 'warning',
  '数据质量': 'info',
  '边界': 'purple',
}

export default function AnomalyTable({ rows }: AnomalyTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-dark-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-border bg-dark-card-l2">
            <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">序号</th>
            <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">指标名</th>
            <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">异常日期</th>
            <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">异常值</th>
            <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">日变化</th>
            <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">审核判定</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id}
              className="border-b border-dark-border last:border-0 hover:bg-dark-card-l2/50"
            >
              <td className="px-4 py-3 text-dark-text-secondary">{idx + 1}</td>
              <td className="px-4 py-3 text-dark-text-primary">{row.indicator}</td>
              <td className="px-4 py-3 text-dark-text-secondary">{row.date}</td>
              <td className="px-4 py-3 text-dark-text-primary">{row.value}</td>
              <td className="px-4 py-3 text-dark-text-secondary">{row.change}</td>
              <td className="px-4 py-3">
                <ReportTag variant={VERDICT_VARIANTS[row.verdict]}>{row.verdict}</ReportTag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
