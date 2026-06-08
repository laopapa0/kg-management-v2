import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

export interface MotionProviderProps {
  children: ReactNode
}

/**
 * Framer Motion 全局配置提供者。
 *
 * `reducedMotion="user"` 自动响应系统 `prefers-reduced-motion` 设置，
 * 在用户选择减少动画时降级或禁用 Framer Motion 动画。
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
