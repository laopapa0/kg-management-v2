import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EASING } from '@/components/motion/motion.tokens';

export const DEPARTMENT_TRANSITION_CONFIG = {
  duration: 0.25,
  ease: EASING.default,
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
} as const;

export interface DepartmentTransitionProps {
  departmentId: string;
  isLoading?: boolean;
  skeletonRowCount?: number;
  children: React.ReactNode;
  'data-testid'?: string;
}

export function DepartmentTransition({
  departmentId,
  isLoading = false,
  skeletonRowCount = 5,
  children,
  'data-testid': testId,
}: DepartmentTransitionProps) {
  return (
    <div data-testid={testId} className="relative h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={departmentId}
          initial={DEPARTMENT_TRANSITION_CONFIG.initial}
          animate={DEPARTMENT_TRANSITION_CONFIG.animate}
          exit={DEPARTMENT_TRANSITION_CONFIG.exit}
          transition={{
            duration: DEPARTMENT_TRANSITION_CONFIG.duration,
            ease: DEPARTMENT_TRANSITION_CONFIG.ease,
          }}
          className="h-full"
        >
          {isLoading ? (
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: skeletonRowCount }).map((_, index) => (
                <Skeleton
                  key={index}
                  data-testid="department-skeleton-row"
                  className={cn(
                    'h-9 w-full rounded-md',
                    'bg-[var(--dark-card-l2)]',
                  )}
                />
              ))}
            </div>
          ) : (
            children
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
