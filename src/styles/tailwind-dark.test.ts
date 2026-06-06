import { describe, it, expect } from 'vitest';

describe('tailwind.config.js dark theme extension', () => {
  it('扩展了 dark.* 命名空间并映射到 CSS 变量', async () => {
    const configModule = await import('../../tailwind.config.js');
    const config = configModule.default;
    const colors = config.theme.extend.colors;

    expect(colors.dark).toBeDefined();
    expect(colors.dark.page).toBe('var(--dark-bg-page)');
    expect(colors.dark.text).toBeDefined();
    expect(colors.dark.text.primary).toBe('var(--dark-text-primary)');
    expect(colors.dark.card).toBeDefined();
    expect(colors.dark.accent).toBeDefined();
    expect(colors.dark.border).toBeDefined();
    expect(colors.dark.status).toBeDefined();
    expect(colors.dark.conn).toBeDefined();
    expect(colors.dark.tree).toBeDefined();
  });
});
