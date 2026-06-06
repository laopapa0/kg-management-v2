export const DURATION = {
  instant: 0,
  fast: 0.15,
  normal: 0.2,
  medium: 0.25,
  slow: 0.3,
} as const;

export const EASING = {
  default: [0.16, 1, 0.3, 1] as const,
  enter: [0.16, 1, 0.3, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  symmetric: [0.4, 0, 0.2, 1] as const,
} as const;

export const SPRING = {
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 1 },
  gentle: { type: 'spring' as const, stiffness: 120, damping: 20, mass: 1 },
  dragRelease: { type: 'spring' as const, stiffness: 300, damping: 25, mass: 1 },
} as const;

export type TransitionName =
  | 'hover'
  | 'expand'
  | 'collapse'
  | 'appear'
  | 'exit'
  | 'connection'
  | 'flyOut'
  | 'pulse';

export function getTransition(name: TransitionName) {
  switch (name) {
    case 'hover':
      return { duration: DURATION.fast, ease: EASING.default };
    case 'expand':
      return { duration: DURATION.medium, ease: EASING.enter };
    case 'collapse':
      return { duration: DURATION.normal, ease: EASING.exit };
    case 'appear':
      return { duration: DURATION.normal, ease: EASING.enter };
    case 'exit':
      return { duration: DURATION.fast, ease: EASING.exit };
    case 'connection':
      return { duration: DURATION.slow, ease: EASING.default };
    case 'flyOut':
      return { duration: DURATION.slow, ease: EASING.enter };
    case 'pulse':
      return { duration: 0.4, ease: EASING.symmetric };
    default:
      return { duration: DURATION.normal, ease: EASING.default };
  }
}
