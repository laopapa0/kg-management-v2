import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import IndicatorCard, { type IndicatorCardProps } from './IndicatorCard'

export interface IndicatorGridProps {
  indicators: (IndicatorCardProps | IndicatorAttachment)[]
}

export default function IndicatorGrid({ indicators }: IndicatorGridProps) {
  if (indicators.length === 0) {
    return (
      <div
        data-testid="indicator-grid-empty"
        className="flex flex-1 items-center justify-center text-dark-text-secondary"
      >
        暂无指标
      </div>
    )
  }

  return (
    <div
      data-testid="indicator-grid"
      className="grid grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      }}
    >
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.id} {...indicator} />
      ))}
    </div>
  )
}
