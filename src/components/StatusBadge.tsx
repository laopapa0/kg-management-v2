import { cn } from '@/lib/utils';

export type StatusType =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'noc';

interface StatusBadgeProps {
  text: string;
  type?: StatusType;
  className?: string;
}

const typeStyles: Record<StatusType, { bg: string; text: string }> = {
  default: { bg: 'bg-dark-card-l2', text: 'text-dark-text-secondary' },
  primary: { bg: 'bg-dark-accent-primary/10', text: 'text-dark-accent-primary' },
  success: { bg: 'bg-success-500/10', text: 'text-success-600' },
  warning: { bg: 'bg-warning-500/10', text: 'text-warning-600' },
  error: { bg: 'bg-error-500/10', text: 'text-error-600' },
  info: { bg: 'bg-info-500/10', text: 'text-info-500' },
  noc: { bg: 'bg-[var(--accent-noc)]/10', text: 'text-[var(--accent-noc)]' },
};

export default function StatusBadge({ text, type = 'default', className }: StatusBadgeProps) {
  const styles = typeStyles[type];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-5',
        styles.bg,
        styles.text,
        className
      )}
    >
      {text}
    </span>
  );
}
