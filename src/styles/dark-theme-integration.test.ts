import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('dark-theme integration', () => {
  it('src/index.css 导入 dark-theme.css', () => {
    const indexCssPath = path.resolve(__dirname, '../index.css');
    const content = fs.readFileSync(indexCssPath, 'utf-8');

    expect(content).toMatch(/@import\s+['"]\.\/styles\/dark-theme\.css['"]/);
  });
});
