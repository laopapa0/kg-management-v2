import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RuleFilterPanel from './RuleFilterPanel';

describe('RuleFilterPanel — Slice 4', () => {
  it('renders rule tree with L1 nodes', () => {
    render(<RuleFilterPanel selectedRuleIds={[]} onChange={() => {}} />);

    expect(screen.getByText('异常规则')).toBeInTheDocument();
  });

  it('expands tree to show L2 and L3 nodes', () => {
    render(<RuleFilterPanel selectedRuleIds={[]} onChange={() => {}} />);

    // L1 默认展开，L2 折叠。找到所有展开按钮，点击第一个（L2「指标预警」前面的）
    const expandButtons = screen.getAllByRole('button', { name: '展开' });
    // 第一个展开按钮是 L2「指标预警」前面的（L1 已展开）
    fireEvent.click(expandButtons[0]);

    expect(screen.getByText('阈值上下限')).toBeInTheDocument();
    expect(screen.getByText('TOPN 监控')).toBeInTheDocument();
  });

  it('checks leaf node and shows it in selected list', () => {
    const onChange = vi.fn();
    render(<RuleFilterPanel selectedRuleIds={[]} onChange={onChange} />);

    // 展开 L2「指标预警」
    const expandButtons = screen.getAllByRole('button', { name: '展开' });
    fireEvent.click(expandButtons[0]);

    const checkbox = screen.getByRole('checkbox', { name: '阈值上下限' });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(['threshold']);
  });

  it('bulk selects all children when checking parent node', () => {
    const onChange = vi.fn();
    render(<RuleFilterPanel selectedRuleIds={[]} onChange={onChange} />);

    // 勾选 L2「指标预警」（无需展开，L2 checkbox 始终可见）
    const checkbox = screen.getByRole('checkbox', { name: '指标预警' });
    fireEvent.click(checkbox);

    // 应该选中其下所有 L3：threshold, topn
    const call = onChange.mock.calls[0][0];
    expect(call).toContain('threshold');
    expect(call).toContain('topn');
    expect(call).toHaveLength(2);
  });

  it('shows selected rules with path in right panel', () => {
    render(
      <RuleFilterPanel selectedRuleIds={['threshold', 'fluctuation']} onChange={() => {}} />
    );

    expect(screen.getByText(/异常规则 > 指标预警 > 阈值上下限/)).toBeInTheDocument();
    expect(screen.getByText(/异常规则 > 异常算法 > 波动算法/)).toBeInTheDocument();
  });

  it('removes individual rule from selected list', () => {
    const onChange = vi.fn();
    render(
      <RuleFilterPanel selectedRuleIds={['threshold', 'fluctuation']} onChange={onChange} />
    );

    const removeButtons = screen.getAllByRole('button', { name: /移除/ });
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['fluctuation']);
  });

  it('clears all selected rules with clear button', () => {
    const onChange = vi.fn();
    render(
      <RuleFilterPanel selectedRuleIds={['threshold', 'fluctuation']} onChange={onChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: /一键清空/ }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('filters tree by search query', () => {
    render(<RuleFilterPanel selectedRuleIds={[]} onChange={() => {}} />);

    const searchInput = screen.getByPlaceholderText(/搜索规则/);
    fireEvent.change(searchInput, { target: { value: '阈值' } });

    // 阈值上下限应该显示
    expect(screen.getByText('阈值上下限')).toBeInTheDocument();
    // TOPN 监控不应该显示
    expect(screen.queryByText('TOPN 监控')).not.toBeInTheDocument();
  });
});
