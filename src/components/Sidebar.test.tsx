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
  describe('精简后菜单结构', () => {
    it('只显示 5 项核心菜单：首页、指标管理、血缘画布、报告管理、知识库管理', () => {
      renderWithRouter();

      const expectedItems = ['首页', '指标管理', '血缘画布', '报告管理', '知识库管理'];
      for (const label of expectedItems) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    });

    it('不显示 NOC 管理和平台维护分组', () => {
      renderWithRouter();

      expect(screen.queryByText('NOC 管理')).not.toBeInTheDocument();
      expect(screen.queryByText('平台维护')).not.toBeInTheDocument();
    });

    it('不显示旧菜单项（配置标签、配置规则、巡检待办、知识上传、审核待办、巡检管理等）', () => {
      renderWithRouter();

      const legacyItems = [
        '配置标签',
        '配置规则',
        '巡检待办',
        '知识上传',
        '审核待办',
        '巡检管理',
        '对象类型',
        '链接关系',
        '属性管理',
        '标签管理',
      ];
      for (const label of legacyItems) {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      }
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
      expect(link).toHaveClass('bg-dark-accent-primary/10');
    });
  });
});
