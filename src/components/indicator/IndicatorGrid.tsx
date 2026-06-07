import { LayoutGrid } from 'lucide-react'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import EmptyState from '@/components/empty-state/EmptyState'
import IndicatorCard, { type IndicatorCardProps } from './IndicatorCard'

export interface IndicatorGridProps {
  indicators: (IndicatorCardProps | IndicatorAttachment)[]
}

export default function IndicatorGrid({ indicators }: IndicatorGridProps) {
  if (indicators.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid className="size-6" />}
        title="暂无指标"
        description="当前没有符合条件的指标数据"
      />
    )
  }

  return (
    <div
      data-testid="indicator-grid"
      className="grid grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4"
    >
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.id} {...indicator} />
      ))}
    </div>
  )
}
