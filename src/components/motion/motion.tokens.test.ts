import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('motion.tokens.ts', () => {
  const tokensPath = path.resolve(__dirname, 'motion.tokens.ts');

  it('存在 src/components/motion/motion.tokens.ts 文件', () => {
    expect(fs.existsSync(tokensPath)).toBe(true);
  });

  it('导出 DURATION、EASING、SPRING 和 getTransition', async () => {
    const tokens = await import('./motion.tokens.ts');

    expect(tokens.DURATION).toBeDefined();
    expect(tokens.EASING).toBeDefined();
    expect(tokens.SPRING).toBeDefined();
    expect(typeof tokens.getTransition).toBe('function');
  });
});
