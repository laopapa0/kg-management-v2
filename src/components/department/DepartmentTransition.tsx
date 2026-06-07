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

const LOADING_TRANSITION_CONFIG = {
  duration: 0.2,
  ease: EASING.default,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
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
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={LOADING_TRANSITION_CONFIG.initial}
                animate={LOADING_TRANSITION_CONFIG.animate}
                exit={LOADING_TRANSITION_CONFIG.exit}
                transition={{
                  duration: LOADING_TRANSITION_CONFIG.duration,
                  ease: LOADING_TRANSITION_CONFIG.ease,
                }}
                className="flex flex-col gap-2 p-2"
                data-testid="department-skeleton-container"
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={LOADING_TRANSITION_CONFIG.initial}
                animate={LOADING_TRANSITION_CONFIG.animate}
                exit={LOADING_TRANSITION_CONFIG.exit}
                transition={{
                  duration: LOADING_TRANSITION_CONFIG.duration,
                  ease: LOADING_TRANSITION_CONFIG.ease,
                }}
                className="h-full"
                data-testid="department-content-container"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
