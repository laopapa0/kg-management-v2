import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyIndicatorList from './MyIndicatorList';
import type { IndicatorApplication } from '@/utils/indicatorStorage';

const mockIndicators: IndicatorApplication[] = [
  {
    id: 'app-001',
    name: '营业收入',
    code: 'IND-2024-001',
    source: '统一数据门户',
    status: 'approved',
    uploader: '小张',
    submitTime: '2026-05-20T10:00:00.000Z',
    indicatorData: {} as IndicatorApplication['indicatorData'],
  },
  {
    id: 'app-002',
    name: '5G用户渗透率',
    code: 'IND-2024-002',
    source: '经营管理大屏',
    status: 'pending',
    uploader: '小李',
    submitTime: '2026-05-25T14:30:00.000Z',
    indicatorData: {} as IndicatorApplication['indicatorData'],
  },
];

function renderList(props: Partial<Parameters<typeof MyIndicatorList>[0]> = {}) {
  return render(
    <MyIndicatorList
      indicators={mockIndicators}
      onSelect={vi.fn()}
      onChange={vi.fn()}
      {...props}
    />
  );
}

describe('MyIndicatorList', () => {
  it('渲染表格，展示指标名称、来源、状态和变更按钮', () => {
    renderList();

    // 表头
    expect(screen.getByText('指标名称')).toBeInTheDocument();
    expect(screen.getByText('大屏来源')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();

    // 数据行
    expect(screen.getByText('营业收入')).toBeInTheDocument();
    expect(screen.getByText('IND-2024-001')).toBeInTheDocument();
    expect(screen.getByText('统一数据门户')).toBeInTheDocument();
    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument();
    expect(screen.getByText('IND-2024-002')).toBeInTheDocument();
    expect(screen.getByText('经营管理大屏')).toBeInTheDocument();

    // 变更按钮
    expect(screen.getAllByText('变更')).toHaveLength(2);
  });

  it('状态徽章颜色和文本正确', () => {
    const fullMock: IndicatorApplication[] = [
      { ...mockIndicators[0], status: 'editing' },
      { ...mockIndicators[0], status: 'pending' },
      { ...mockIndicators[0], status: 'approved' },
      { ...mockIndicators[0], status: 'rejected' },
    ];
    renderList({ indicators: fullMock });

    expect(screen.getByText('编辑中')).toBeInTheDocument();
    expect(screen.getByText('待审核')).toBeInTheDocument();
    expect(screen.getByText('已通过')).toBeInTheDocument();
    expect(screen.getByText('被驳回')).toBeInTheDocument();
  });

  it('点击行触发 onSelect 并高亮选中', () => {
    const onSelect = vi.fn();
    renderList({ onSelect, selectedId: 'app-002' });

    const row = screen.getByText('5G用户渗透率').closest('tr');
    expect(row).toHaveClass('bg-dark-accent-primary/10');

    fireEvent.click(row!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'app-002' }));
  });

  it('点击【变更】按钮触发 onChange，不触发 onSelect', () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    renderList({ onSelect, onChange });

    const changeBtn = screen.getAllByText('变更')[0];
    fireEvent.click(changeBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'app-001' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('空状态时显示占位提示', () => {
    renderList({ indicators: [] });

    expect(screen.getByText('暂无指标申请')).toBeInTheDocument();
    expect(screen.getByText('请添加数据或调整筛选条件')).toBeInTheDocument();
  });
});
