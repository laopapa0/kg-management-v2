import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentSwitcher } from './DepartmentSwitcher';

const MOCK_DEPARTMENTS = [
  { id: 'dept-finance', name: '财务部' },
  { id: 'dept-market', name: '市场部' },
  { id: 'dept-network', name: '网络部' },
];

describe('DepartmentSwitcher', () => {
  it('默认显示"财务部"', () => {
    render(<DepartmentSwitcher departments={MOCK_DEPARTMENTS} />);
    expect(screen.getByText('财务部')).toBeInTheDocument();
  });

  it('点击触发按钮后显示部门下拉列表', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<DepartmentSwitcher departments={MOCK_DEPARTMENTS} />);

    await user.click(screen.getByRole('button', { name: /财务部/i }));

    const items = Array.from(baseElement.querySelectorAll('[role="menuitem"]'));
    const itemNames = items.map((el) => el.textContent?.replace('✓', '').trim());
    expect(itemNames).toContain('财务部');
    expect(itemNames).toContain('市场部');
    expect(itemNames).toContain('网络部');
  });

  it('传入 defaultDepartmentId 时默认显示对应部门', () => {
    render(
      <DepartmentSwitcher
        departments={MOCK_DEPARTMENTS}
        defaultDepartmentId="dept-market"
      />,
    );

    expect(screen.getByText('市场部')).toBeInTheDocument();
  });

  it('选中部门后触发 onChange 并更新显示', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { baseElement } = render(
      <DepartmentSwitcher
        departments={MOCK_DEPARTMENTS}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /财务部/i }));

    const networkItem = Array.from(baseElement.querySelectorAll('[role="menuitem"]')).find(
      (el) => el.textContent?.includes('网络部'),
    );
    expect(networkItem).toBeTruthy();
    await user.click(networkItem!);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ id: 'dept-network', name: '网络部' });
    expect(screen.getByText('网络部')).toBeInTheDocument();
  });

  it('渲染触发按钮并带 data-testid', () => {
    const { container } = render(<DepartmentSwitcher departments={MOCK_DEPARTMENTS} />);
    const trigger = container.querySelector('[data-testid="department-switcher-trigger"]');
    expect(trigger).toBeInTheDocument();
  });
});
