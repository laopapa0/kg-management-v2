import { motion } from 'framer-motion'
import { DURATION, EASING } from '@/components/motion/motion.tokens'

export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      data-testid="empty-state-wrapper"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.normal, ease: EASING.enter }}
    >
      <div
        data-testid="empty-state-icon"
        className="flex size-12 items-center justify-center rounded-xl bg-dark-card-l2 text-dark-text-secondary"
      >
        {icon}
      </div>

      <div className="flex max-w-[240px] flex-col gap-1">
        <h4 className="text-body font-medium text-dark-text-primary">{title}</h4>
        <p className="text-small text-dark-text-secondary">{description}</p>
      </div>

      {action ? (
        <div className="mt-1">{action}</div>
      ) : (
        <span className="text-caption text-dark-text-tertiary">暂无操作</span>
      )}
    </motion.div>
  )
}
