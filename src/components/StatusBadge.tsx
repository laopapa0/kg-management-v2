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
  default: { bg: 'bg-[#f1f3f6]', text: 'text-[#4a5568]' },
  primary: { bg: 'bg-[#eef4ff]', text: 'text-[#3478f6]' },
  success: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
  warning: { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]' },
  error: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]' },
  info: { bg: 'bg-[#eff6ff]', text: 'text-[#3b82f6]' },
  noc: { bg: 'bg-[#f3f0ff]', text: 'text-[#7c5cfc]' },
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
