import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

function renderWithRouter(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Sidebar collapsed={false} onToggle={() => {}} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  describe('业务部门菜单', () => {
    it('应显示「指标管理」菜单项，不显示「新增指标」和「变更指标」', () => {
      renderWithRouter();

      expect(screen.getByText('指标管理')).toBeInTheDocument();
      expect(screen.queryByText('新增指标')).not.toBeInTheDocument();
      expect(screen.queryByText('变更指标')).not.toBeInTheDocument();
    });

    it('「指标管理」的链接指向 /indicator-management', () => {
      renderWithRouter();

      const link = screen.getByText('指标管理').closest('a');
      expect(link).toHaveAttribute('href', '/indicator-management');
    });

    it('当路由为 /indicator-management 时，「指标管理」项高亮', () => {
      renderWithRouter(['/indicator-management']);

      const link = screen.getByText('指标管理').closest('a');
      expect(link).toHaveClass('active');
      // 业务部门的 active 样式包含 bg-dark-accent-primary/10
      expect(link).toHaveClass('bg-dark-accent-primary/10');
    });

    it('当路由为旧路径 /indicator/create 时，没有业务部门菜单项被错误高亮', () => {
      renderWithRouter(['/indicator/create']);

      const businessLinks = screen
        .getAllByRole('link')
        .filter((el) => el.closest('div')?.textContent?.includes('业务部门'));

      // 更直接：检查业务部门下的所有链接都不带 active 背景色
      const indicatorLink = screen.getByText('指标管理').closest('a');
      expect(indicatorLink).not.toHaveClass('active');
      expect(indicatorLink).not.toHaveClass('bg-dark-accent-primary/10');
    });

    it('当路由为旧路径 /indicator/edit/1 时，没有业务部门菜单项被错误高亮', () => {
      renderWithRouter(['/indicator/edit/1']);

      const indicatorLink = screen.getByText('指标管理').closest('a');
      expect(indicatorLink).not.toHaveClass('active');
      expect(indicatorLink).not.toHaveClass('bg-dark-accent-primary/10');
    });
  });
});
