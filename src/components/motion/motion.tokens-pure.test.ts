import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('motion.tokens.ts is pure TypeScript', () => {
  it('文件不包含任何 React 或框架依赖导入', () => {
    const filePath = path.resolve(__dirname, 'motion.tokens.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).not.toMatch(/from\s+['"]react['"]/);
    expect(content).not.toMatch(/from\s+['"]react-dom['"]/);
    expect(content).not.toMatch(/from\s+['"]framer-motion['"]/);
    expect(content).not.toMatch(/require\s*\(\s*['"]react['"]\s*\)/);
  });
});
