import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InspectionPlanForm from './InspectionPlanForm';

describe('InspectionPlanForm — Slice 2', () => {
  it('renders plan name input field', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    expect(screen.getByLabelText(/计划名称/)).toBeInTheDocument();
  });

  it('renders three trigger type radio options', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    expect(screen.getByLabelText('定期')).toBeInTheDocument();
    expect(screen.getByLabelText('自动触发')).toBeInTheDocument();
    expect(screen.getByLabelText('手动触发')).toBeInTheDocument();
  });

  it('shows periodic config when 定期 is selected', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    // 默认选中「定期」，应显示周期选择器
    expect(screen.getByLabelText(/执行周期/)).toBeInTheDocument();
  });

  it('shows rule-based placeholder when 自动触发 is selected', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    fireEvent.click(screen.getByLabelText('自动触发'));

    expect(
      screen.getByText(/选择要监听的异常规则/)
    ).toBeInTheDocument();
  });

  it('shows no extra fields when 手动触发 is selected', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    fireEvent.click(screen.getByLabelText('手动触发'));

    // 手动触发时不应显示周期选择器和规则触发器占位
    expect(screen.queryByLabelText(/执行周期/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/选择要监听的异常规则/)
    ).not.toBeInTheDocument();
  });

  it('renders graph version select with v2.3.1 and disabled', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    // 通过 role 查询 disabled 的 Select trigger
    const selectTrigger = screen.getByRole('combobox', { name: /版本/ });
    expect(selectTrigger).toBeInTheDocument();
    expect(selectTrigger).toHaveAttribute('data-disabled');
    expect(screen.getByText('v2.3.1')).toBeInTheDocument();
  });

  it('calls onCancel when clicking cancel button', () => {
    const onCancel = vi.fn();
    render(<InspectionPlanForm onCancel={onCancel} onSave={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /取消/ }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('preserves plan name when switching trigger types', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    const nameInput = screen.getByLabelText(/计划名称/) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '我的巡检计划' } });

    // 切换到手动触发
    fireEvent.click(screen.getByLabelText('手动触发'));
    expect(nameInput.value).toBe('我的巡检计划');

    // 切换到自动触发
    fireEvent.click(screen.getByLabelText('自动触发'));
    expect((screen.getByLabelText(/计划名称/) as HTMLInputElement).value).toBe(
      '我的巡检计划'
    );
  });
});

describe('InspectionPlanForm — Slice 3', () => {
  it('renders indicator scope section title', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);
    expect(screen.getByText('指标范围')).toBeInTheDocument();
  });

  it('shows field tree with level1 node', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    expect(screen.getByText('指标体系')).toBeInTheDocument();
    expect(screen.getByText('一级')).toBeInTheDocument();
  });

  it('shows enum checkboxes after clicking level1 field', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    fireEvent.click(screen.getByText('一级'));

    const categories = ['经营', '发展', '交付', '服务'];
    for (const cat of categories) {
      const checkbox = screen.getByRole('checkbox', { name: cat });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    }
  });

  it('shows all indicators count when no filters selected', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    // 10 个指标全部，显示「已选择全部 10 个指标」
    expect(screen.getByText(/全部 10 个指标/)).toBeInTheDocument();
  });

  it('filters by level1 and updates count', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    fireEvent.click(screen.getByText('一级'));
    fireEvent.click(screen.getByRole('checkbox', { name: '经营' }));

    // 经营有 4 个指标
    expect(screen.getByText(/已选择 4 个指标/)).toBeInTheDocument();
  });

  it('filters by multiple level1 values', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    fireEvent.click(screen.getByText('一级'));
    fireEvent.click(screen.getByRole('checkbox', { name: '发展' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '交付' }));

    // 发展 4 个 + 交付 1 个 = 5 个（OR 逻辑）
    expect(screen.getByText(/已选择 5 个指标/)).toBeInTheDocument();
  });

  it('expands indicator list preview when clicking count', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    fireEvent.click(screen.getByText(/全部 10 个指标/));

    // 展开后应显示具体指标名称
    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument();
    expect(screen.getByText('移动业务收入')).toBeInTheDocument();
  });
});

describe('InspectionPlanForm — Slice 4', () => {
  it('renders rule filter panel', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    expect(screen.getByText('异常规则排除')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument();
  });

  it('shows validation error when saving with empty name', () => {
    render(<InspectionPlanForm onCancel={() => {}} onSave={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /保存/ }));

    expect(screen.getByText('计划名称不能为空')).toBeInTheDocument();
  });

  it('calls onSave with form data when validation passes', () => {
    const onSave = vi.fn();
    render(<InspectionPlanForm onCancel={() => {}} onSave={onSave} />);

    const nameInput = screen.getByLabelText(/计划名称/);
    fireEvent.change(nameInput, { target: { value: '测试巡检计划' } });

    fireEvent.click(screen.getByRole('button', { name: /保存/ }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedData = onSave.mock.calls[0][0];
    expect(savedData.name).toBe('测试巡检计划');
    expect(savedData.triggerType).toBe('periodic');
    expect(savedData.graphVersion).toBe('v2.3.1');
  });
});
