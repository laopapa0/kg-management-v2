import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

function renderWithRouter(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Sidebar collapsed={false} onToggle={() => {}} />
    </MemoryRouter>
  );
}

describe('Sidebar 手风琴三分组', () => {
  beforeEach(() => {
    // 清除 localStorage 避免遗留状态
    localStorage.clear();
  });

  /* ─── 探路测试：首页 + 分组标题渲染 ─── */
  it('首页独立在顶部，不在任何分组内', () => {
    renderWithRouter();

    const homeLink = screen.getByText('首页').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');

    // 首页不在分组内：分组标题之后才出现子项，首页在前
    const allAnchors = screen.getAllByRole('link');
    expect(allAnchors[0]).toHaveTextContent('首页');
  });

  it('渲染三个分组标题：指标图谱、报告管理、基础维护', () => {
    renderWithRouter();

    expect(screen.getByTestId('sidebar-group-title-指标图谱')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-group-title-报告管理')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-group-title-基础维护')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-group-title-指标图谱')).toHaveTextContent('指标图谱');
    expect(screen.getByTestId('sidebar-group-title-报告管理')).toHaveTextContent('报告管理');
    expect(screen.getByTestId('sidebar-group-title-基础维护')).toHaveTextContent('基础维护');
  });

  /* ─── 分组子项 + 默认展开 ─── */
  it('指标图谱下包含指标管理和血缘画布，默认展开可见', () => {
    renderWithRouter();

    const indicatorLink = screen.getByText('指标管理').closest('a');
    const lineageLink = screen.getByText('血缘画布').closest('a');
    expect(indicatorLink).toBeVisible();
    expect(lineageLink).toBeVisible();
  });

  it('报告管理分组下包含报告管理子项', () => {
    renderWithRouter();

    const links = screen.getAllByText('报告管理');
    // 第一个是分组标题 span，第二个是 NavLink 内的 span
    const reportLink = links.find((el) => el.closest('a'))?.closest('a');
    expect(reportLink).toHaveAttribute('href', '/reports');
    expect(reportLink).toBeVisible();
  });

  it('基础维护下包含规则管理、关联关系管理', () => {
    renderWithRouter();

    expect(screen.getByText('规则管理').closest('a')).toBeVisible();
    expect(screen.getByText('关联关系管理').closest('a')).toBeVisible();
  });

  /* ─── 手风琴折叠/展开 ─── */
  it('点击分组标题折叠子项，再次点击展开', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // 默认展开：子项可见
    expect(screen.getByText('指标管理').closest('a')).toBeVisible();

    // 点击"指标图谱"标题折叠
    await user.click(screen.getByTestId('sidebar-group-title-指标图谱'));

    // 子项退出动画后从 DOM 中移除
    await waitFor(() => {
      expect(screen.queryByText('指标管理')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('血缘画布')).not.toBeInTheDocument();

    // 再次点击展开
    await user.click(screen.getByTestId('sidebar-group-title-指标图谱'));

    // 子项恢复可见
    await waitFor(() => {
      expect(screen.getByText('指标管理').closest('a')).toBeVisible();
    });
    expect(screen.getByText('血缘画布').closest('a')).toBeVisible();
  });

  /* ─── 链接指向 ─── */
  it('菜单项 href 正确', () => {
    renderWithRouter();

    expect(screen.getByText('指标管理').closest('a')).toHaveAttribute('href', '/indicator-management');
    expect(screen.getByText('血缘画布').closest('a')).toHaveAttribute('href', '/lineage');
    expect(screen.getByText('规则管理').closest('a')).toHaveAttribute('href', '/noc/rule');
    expect(screen.getByText('关联关系管理').closest('a')).toHaveAttribute('href', '/link-relation');
  });

  /* ─── 路由高亮 ─── */
  it('当路由为 /indicator-management 时，指标管理高亮', () => {
    renderWithRouter(['/indicator-management']);

    const link = screen.getByText('指标管理').closest('a');
    expect(link).toHaveClass('bg-dark-accent-primary/10');
  });

  it('隐藏路由不在菜单中', () => {
    renderWithRouter();

    expect(screen.queryByText('报告模板')).not.toBeInTheDocument();
    expect(screen.queryByText('历史报告')).not.toBeInTheDocument();
  });

  it('知识库管理菜单项已隐藏', () => {
    renderWithRouter();
    expect(screen.queryByText('知识库管理')).not.toBeInTheDocument();
  });
});
