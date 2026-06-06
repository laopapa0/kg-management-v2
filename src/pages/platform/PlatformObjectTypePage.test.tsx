import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PlatformObjectTypePage from './PlatformObjectTypePage';

describe('PlatformObjectTypePage', () => {
  beforeEach(() => {
    render(<PlatformObjectTypePage />);
  });

  it('renders field definition tree based on OBJECT_TYPE_DEFINITIONS', () => {
    expect(screen.getByText('指标体系')).toBeInTheDocument();
    expect(screen.getByText('指标标识')).toBeInTheDocument();
    expect(screen.getByText('分类属性')).toBeInTheDocument();
    expect(screen.getByText('指标值单位')).toBeInTheDocument();
  });

  it('expands group to show field nodes', () => {
    const categoryGroup = screen.getByText('分类属性');
    fireEvent.click(categoryGroup);
    expect(screen.getAllByText('一级')[0]).toBeInTheDocument();
    expect(screen.getAllByText('二级')[0]).toBeInTheDocument();
    expect(screen.getAllByText('颗粒度')[0]).toBeInTheDocument();
    expect(screen.getAllByText('关注频率')[0]).toBeInTheDocument();
  });

  it('clicking a field node shows enum value management panel', () => {
    fireEvent.click(screen.getByText('分类属性'));
    fireEvent.click(screen.getAllByText('一级')[0]);
    expect(screen.getByText('枚举值管理')).toBeInTheDocument();
    // "经营"同时出现在枚举值表格和指标平表level1列，用 getAllByText 确认至少存在
    expect(screen.getAllByText('经营').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('发展').length).toBeGreaterThanOrEqual(1);
  });

  it('clicking a group node shows only indicator flat table', () => {
    fireEvent.click(screen.getByText('指标标识'));
    expect(screen.queryByText('枚举值管理')).not.toBeInTheDocument();
    expect(screen.getByText('指标列表')).toBeInTheDocument();
  });

  it('can search indicators in flat table', () => {
    fireEvent.click(screen.getByText('指标标识'));
    const searchInput = screen.getByPlaceholderText('搜索指标名称或编码');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: '5G' } });
    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument();
    expect(screen.queryByText('宽带用户数')).not.toBeInTheDocument();
  });

  it('can add a new enum value', () => {
    fireEvent.click(screen.getByText('分类属性'));
    fireEvent.click(screen.getAllByText('一级')[0]);
    const addBtn = screen.getByRole('button', { name: /添加枚举值/ });
    fireEvent.click(addBtn);
    // 弹窗标题用 heading role 区分
    expect(screen.getByRole('heading', { name: '添加枚举值' })).toBeInTheDocument();
    const codeInput = screen.getByPlaceholderText('如 ENUM-001');
    const valueInput = screen.getAllByPlaceholderText('如 经营')[0];
    fireEvent.change(codeInput, { target: { value: 'L1-TEST' } });
    fireEvent.change(valueInput, { target: { value: '测试值' } });
    const saveBtn = screen.getAllByRole('button', { name: '保存' }).find(
      (b) => b.className.includes('bg-[#7c5cfc]')
    );
    expect(saveBtn).toBeDefined();
    fireEvent.click(saveBtn!);
    expect(screen.getByText('测试值')).toBeInTheDocument();
  });

  it('shows non-enum field info without enum management', () => {
    fireEvent.click(screen.getByText('指标标识'));
    fireEvent.click(screen.getAllByText('指标编码')[0]);
    expect(screen.queryByText('枚举值管理')).not.toBeInTheDocument();
    // 用更精确的正则匹配字段类型标签
    expect(screen.getByText(/字段类型：文本/)).toBeInTheDocument();
  });
});
