import { useMemo, forwardRef } from 'react'
import { VirtuosoGrid } from 'react-virtuoso'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import EmptyState from '@/components/empty-state/EmptyState'
import IndicatorCard, { type IndicatorCardProps } from './IndicatorCard'
import { LayoutGrid } from 'lucide-react'

export interface IndicatorGridProps {
  indicators: (IndicatorCardProps | IndicatorAttachment)[]
  searchQuery?: string
  forceDisableVirtualization?: boolean
}

const GRID_CLASSES =
  'grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4'

const GridList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props} className={GRID_CLASSES}>
      {children}
    </div>
  ),
)
GridList.displayName = 'GridList'

function GridItem({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} style={{ ...props.style, display: 'flex' }}>
      {children}
    </div>
  )
}

function filterIndicators(
  indicators: IndicatorGridProps['indicators'],
  query: string,
): IndicatorGridProps['indicators'] {
  const q = query.trim().toLowerCase()
  if (!q) return indicators
  return indicators.filter((i) => {
    const text = `${i.name} ${i.code} ${i.level1} ${i.level2}`.toLowerCase()
    return text.includes(q)
  })
}

export default function IndicatorGrid({
  indicators,
  searchQuery,
  forceDisableVirtualization,
}: IndicatorGridProps) {
  const filtered = useMemo(
    () => (searchQuery ? filterIndicators(indicators, searchQuery) : indicators),
    [indicators, searchQuery],
  )

  const useVirtual = !forceDisableVirtualization && filtered.length >= 100

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid className="size-6" />}
        title="暂无指标"
        description="当前没有符合条件的指标数据"
      />
    )
  }

  if (!useVirtual) {
    return (
      <div data-testid="indicator-grid" className={GRID_CLASSES}>
        {filtered.map((indicator) => (
          <IndicatorCard key={indicator.id} {...(indicator as IndicatorCardProps)} />
        ))}
      </div>
    )
  }

  return (
    <VirtuosoGrid
      data-testid="indicator-grid"
      totalCount={filtered.length}
      components={{
        List: GridList,
        Item: GridItem,
      }}
      itemContent={(index) => (
        <IndicatorCard {...(filtered[index] as IndicatorCardProps)} />
      )}
    />
  )
}
