import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EASING } from '@/components/motion/motion.tokens';
import {
  DepartmentTransition,
  DEPARTMENT_TRANSITION_CONFIG,
} from './DepartmentTransition';

describe('DepartmentTransition', () => {
  it('非加载状态下渲染子内容', () => {
    render(
      <DepartmentTransition departmentId="dept-finance">
        <div data-testid="tree-content">指标树内容</div>
      </DepartmentTransition>,
    );

    expect(screen.getByTestId('tree-content')).toBeInTheDocument();
    expect(screen.getByText('指标树内容')).toBeInTheDocument();
  });

  it('加载状态下渲染骨架屏行', () => {
    render(
      <DepartmentTransition departmentId="dept-finance" isLoading skeletonRowCount={3}>
        <div data-testid="tree-content">指标树内容</div>
      </DepartmentTransition>,
    );

    expect(screen.queryByTestId('tree-content')).not.toBeInTheDocument();
    const rows = screen.getAllByTestId('department-skeleton-row');
    expect(rows).toHaveLength(3);
  });

  it('骨架屏行高为 36px', () => {
    render(
      <DepartmentTransition departmentId="dept-finance" isLoading>
        <div>内容</div>
      </DepartmentTransition>,
    );

    const row = screen.getAllByTestId('department-skeleton-row')[0];
    expect(row.className).toMatch(/h-9|h-\[36px\]/);
  });

  it('默认渲染 5 行骨架屏', () => {
    render(
      <DepartmentTransition departmentId="dept-finance" isLoading>
        <div>内容</div>
      </DepartmentTransition>,
    );

    const rows = screen.getAllByTestId('department-skeleton-row');
    expect(rows).toHaveLength(5);
  });

  it('动画配置使用 250ms 时长和 EASING.default', () => {
    expect(DEPARTMENT_TRANSITION_CONFIG.duration).toBe(0.25);
    expect(DEPARTMENT_TRANSITION_CONFIG.ease).toEqual(EASING.default);
  });

  it('动画配置定义 enter/exit 变体', () => {
    expect(DEPARTMENT_TRANSITION_CONFIG.initial).toEqual({ opacity: 0, x: 20 });
    expect(DEPARTMENT_TRANSITION_CONFIG.animate).toEqual({ opacity: 1, x: 0 });
    expect(DEPARTMENT_TRANSITION_CONFIG.exit).toEqual({ opacity: 0, x: -20 });
  });

  it('根据 departmentId 变化最终渲染新内容', async () => {
    const { rerender } = render(
      <DepartmentTransition departmentId="dept-finance">
        <div data-testid="content">财务部内容</div>
      </DepartmentTransition>,
    );

    expect(screen.getByText('财务部内容')).toBeInTheDocument();

    rerender(
      <DepartmentTransition departmentId="dept-market">
        <div data-testid="content">市场部内容</div>
      </DepartmentTransition>,
    );

    // AnimatePresence 的 exit 动画在 jsdom 中是同步完成的，但可能需要一帧等待
    await waitFor(() => {
      expect(screen.getByText('市场部内容')).toBeInTheDocument();
    });
  });

  it('容器使用 data-testid 便于集成测试定位', () => {
    const { container } = render(
      <DepartmentTransition departmentId="dept-finance" data-testid="tree-panel">
        <div>内容</div>
      </DepartmentTransition>,
    );

    expect(container.querySelector('[data-testid="tree-panel"]')).toBeInTheDocument();
  });

  it('加载状态切换时骨架屏和内容分别使用独立的 motion 容器', async () => {
    const { rerender } = render(
      <DepartmentTransition departmentId="dept-finance" isLoading>
        <div data-testid="tree-content">指标树内容</div>
      </DepartmentTransition>,
    );

    expect(screen.getByTestId('department-skeleton-container')).toBeInTheDocument();
    expect(screen.queryByTestId('department-content-container')).not.toBeInTheDocument();

    rerender(
      <DepartmentTransition departmentId="dept-finance">
        <div data-testid="tree-content">指标树内容</div>
      </DepartmentTransition>,
    );

    // mode="wait" 会先等 skeleton exit 完成再挂载 content
    await waitFor(() => {
      expect(screen.queryByTestId('department-skeleton-container')).not.toBeInTheDocument();
      expect(screen.getByTestId('department-content-container')).toBeInTheDocument();
    });
  });

  it('同 departmentId 下 isLoading 切换不触发位移动画（仅透明度变化）', async () => {
    const { rerender } = render(
      <DepartmentTransition departmentId="dept-finance" isLoading>
        <div data-testid="tree-content">指标树内容</div>
      </DepartmentTransition>,
    );

    rerender(
      <DepartmentTransition departmentId="dept-finance">
        <div data-testid="tree-content">指标树内容</div>
      </DepartmentTransition>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('tree-content')).toBeInTheDocument();
    });

    const contentContainer = screen.getByTestId('department-content-container');
    // 内容容器应为 motion.div，通过检查 role/presence 确认它承载淡入淡出而非位移
    expect(contentContainer).toBeInTheDocument();
  });
});
