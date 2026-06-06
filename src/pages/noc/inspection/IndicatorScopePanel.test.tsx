import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IndicatorScopePanel from './IndicatorScopePanel';

describe('IndicatorScopePanel', () => {
  const defaultProps = {
    selectedCategories: [] as string[],
    selectedTags: [] as string[],
    onChange: vi.fn(),
  };

  /* ─── Slice 1: 字段树渲染 ─── */

  it('渲染左侧字段树，包含"指标体系"根节点', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    expect(screen.getByText('指标体系')).toBeInTheDocument();
  });

  it('字段树包含具体的对象类型字段节点（如"一级"、"二级"）', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    expect(screen.getByText('一级')).toBeInTheDocument();
    expect(screen.getByText('二级')).toBeInTheDocument();
    expect(screen.getByText('颗粒度')).toBeInTheDocument();
  });

  /* ─── Slice 2: 点击字段展示枚举值 ─── */

  it('点击"一级"字段节点 → 右侧展示该字段的枚举值复选框', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('一级'));
    expect(screen.getByText('经营')).toBeInTheDocument();
    expect(screen.getByText('发展')).toBeInTheDocument();
    expect(screen.getByText('交付')).toBeInTheDocument();
    expect(screen.getByText('服务')).toBeInTheDocument();
  });

  it('点击"颗粒度"字段节点 → 右侧展示该字段的枚举值复选框', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('颗粒度'));
    expect(screen.getByText('全局')).toBeInTheDocument();
    expect(screen.getByText('省分')).toBeInTheDocument();
    expect(screen.getByText('地市')).toBeInTheDocument();
  });

  /* ─── Slice 3: 勾选枚举值筛选指标 ─── */

  it('勾选"一级=经营" → 右侧只展示 level1=经营 的指标', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('一级'));
    // 勾选"经营"
    const checkbox = screen.getByLabelText('经营');
    fireEvent.click(checkbox);
    // 右侧应只展示经营类指标
    expect(screen.getByText('全网约收入')).toBeInTheDocument();
    expect(screen.getByText('移动业务收入')).toBeInTheDocument();
    expect(screen.queryByText('5G用户渗透率')).not.toBeInTheDocument();
  });

  it('勾选"颗粒度=全局" → 右侧只展示 granularity=全局 的指标', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('颗粒度'));
    const checkbox = screen.getByLabelText('全局');
    fireEvent.click(checkbox);
    // 全局指标：营业收入、宽带用户数、全网约收入
    expect(screen.getByText('全网约收入')).toBeInTheDocument();
    expect(screen.getByText('宽带用户数')).toBeInTheDocument();
    expect(screen.queryByText('5G用户渗透率')).not.toBeInTheDocument();
  });

  /* ─── Slice 4: 多字段组合筛选(AND) ─── */

  it('勾选"一级=经营"+"二级=收入" → 右侧只展示同时匹配的指标', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    // 先勾选一级=经营
    fireEvent.click(screen.getByText('一级'));
    fireEvent.click(screen.getByLabelText('经营'));
    // 再勾选二级=收入
    fireEvent.click(screen.getByText('二级'));
    fireEvent.click(screen.getByLabelText('收入'));
    // 同时匹配经营+收入的指标：全网约收入、移动业务收入
    expect(screen.getByText('全网约收入')).toBeInTheDocument();
    expect(screen.getByText('移动业务收入')).toBeInTheDocument();
    expect(screen.queryByText('用户ARPU')).not.toBeInTheDocument(); // 经营+效益评估
  });

  /* ─── Slice 5: 数量统计 + onChange ─── */

  it('无筛选时显示"已选择全部 X 个指标"', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    expect(screen.getByText(/已选择全部/)).toBeInTheDocument();
  });

  it('勾选后数量统计正确', () => {
    render(<IndicatorScopePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('一级'));
    fireEvent.click(screen.getByLabelText('经营'));
    // 经营类指标有 4 个：全网约收入、移动业务收入、用户ARPU、政企收入
    expect(screen.getByText(/已选择 4 个指标/)).toBeInTheDocument();
  });

  it('勾选一级枚举值触发 onChange，输出一级值', () => {
    const onChange = vi.fn();
    render(<IndicatorScopePanel {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('一级'));
    fireEvent.click(screen.getByLabelText('经营'));
    expect(onChange).toHaveBeenCalledWith(['经营'], []);
  });

  it('取消勾选触发 onChange，移除对应一级值', () => {
    const onChange = vi.fn();
    render(
      <IndicatorScopePanel
        {...defaultProps}
        selectedCategories={['经营']}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByText('一级'));
    fireEvent.click(screen.getByLabelText('经营'));
    expect(onChange).toHaveBeenCalledWith([], []);
  });
});
