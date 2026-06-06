import { describe, it, expect } from 'vitest';
import { DURATION, EASING, SPRING, getTransition } from './motion.tokens';

describe('motion.tokens values', () => {
  it('DURATION 包含全部 5 个级别', () => {
    expect(DURATION).toHaveProperty('instant', 0);
    expect(DURATION).toHaveProperty('fast', 0.15);
    expect(DURATION).toHaveProperty('normal', 0.2);
    expect(DURATION).toHaveProperty('medium', 0.25);
    expect(DURATION).toHaveProperty('slow', 0.3);
  });

  it('EASING.default 为 [0.16, 1, 0.3, 1]', () => {
    expect(EASING.default).toEqual([0.16, 1, 0.3, 1]);
  });

  it('EASING 包含全部 5 种 easing', () => {
    expect(EASING).toHaveProperty('default');
    expect(EASING).toHaveProperty('enter');
    expect(EASING).toHaveProperty('exit');
    expect(EASING).toHaveProperty('bounce');
    expect(EASING).toHaveProperty('symmetric');

    for (const key of Object.keys(EASING)) {
      const value = EASING[key as keyof typeof EASING];
      expect(Array.isArray(value)).toBe(true);
      expect(value).toHaveLength(4);
    }
  });

  it('SPRING 包含全部 3 种 spring 配置', () => {
    expect(SPRING).toHaveProperty('snappy');
    expect(SPRING).toHaveProperty('gentle');
    expect(SPRING).toHaveProperty('dragRelease');

    for (const key of Object.keys(SPRING)) {
      const value = SPRING[key as keyof typeof SPRING];
      expect(value).toHaveProperty('type', 'spring');
      expect(value).toHaveProperty('stiffness');
      expect(value).toHaveProperty('damping');
      expect(value).toHaveProperty('mass');
    }
  });

  it('getTransition 返回 Framer Motion 兼容的 transition 对象', () => {
    const transition = getTransition('hover');

    expect(transition).toHaveProperty('duration');
    expect(transition).toHaveProperty('ease');
    expect(transition.duration).toBe(DURATION.fast);
    expect(transition.ease).toBe(EASING.default);
  });

  it('getTransition("expand") 使用 medium 时长和 enter easing', () => {
    const transition = getTransition('expand');

    expect(transition.duration).toBe(DURATION.medium);
    expect(transition.ease).toBe(EASING.enter);
  });

  it('getTransition("connection") 使用 slow 时长', () => {
    const transition = getTransition('connection');

    expect(transition.duration).toBe(DURATION.slow);
  });

  it('getTransition("pulse") 使用 400ms 和 symmetric easing', () => {
    const transition = getTransition('pulse');

    expect(transition.duration).toBe(0.4);
    expect(transition.ease).toBe(EASING.symmetric);
  });
});
