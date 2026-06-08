export interface StatCardItem {
  title: string
  value: string
  unit: string
}

interface StatsCardGridProps {
  cards: StatCardItem[]
}

export default function StatsCardGrid({ cards }: StatsCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="stat-card flex flex-col rounded-lg border border-dark-border bg-dark-card-l1 p-4"
        >
          <span className="text-xs text-dark-text-secondary">{card.title}</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-dark-text-primary">{card.value}</span>
            <span className="text-xs text-dark-text-tertiary">{card.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
