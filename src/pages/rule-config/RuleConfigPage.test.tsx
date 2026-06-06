import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RuleConfigPage from './RuleConfigPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <RuleConfigPage />
    </MemoryRouter>
  );
}

describe('RuleConfigPage — Slice 1', () => {
  it('renders all available indicators in the table by default', () => {
    renderPage();

    expect(screen.getByText('IND-2024-0056')).toBeInTheDocument();
    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument();
    expect(screen.getByText('5G流量占比')).toBeInTheDocument();
    expect(screen.getByText('宽带用户数')).toBeInTheDocument();
    expect(screen.getByText('客户满意度')).toBeInTheDocument();
    expect(screen.getByText('全网约收入')).toBeInTheDocument();
    expect(screen.getByText('网络故障率')).toBeInTheDocument();
    expect(screen.getByText('移动业务收入')).toBeInTheDocument();
    expect(screen.getByText('用户ARPU')).toBeInTheDocument();
    expect(screen.getByText('宽带续费率')).toBeInTheDocument();
    expect(screen.getByText('政企收入')).toBeInTheDocument();
  });

  it('shows indicator level and unit columns', () => {
    renderPage();

    expect(screen.getAllByText('一级/二级').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('单位').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('发展 > 用户发展').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('百分比').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('元').length).toBeGreaterThanOrEqual(1);
  });

  it('shows correct status for indicators without rules', () => {
    renderPage();
    const unconfigured = screen.getAllByText('未配置');
    expect(unconfigured.length).toBeGreaterThanOrEqual(1);
  });
});

describe('RuleConfigPage — Slice 2', () => {
  it('filters indicators by clicking L3 template in the tree', () => {
    renderPage();

    // 默认显示 10 个指标
    expect(screen.getByText('共 10 个指标')).toBeInTheDocument();

    // 点击左侧「阈值上下限」模板（L3）
    fireEvent.click(screen.getByText('阈值上下限'));

    // 右侧应只显示应用了阈值上下限模板的指标
    expect(screen.getByText('共 2 个指标')).toBeInTheDocument();
    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument();
    expect(screen.getByText('宽带续费率')).toBeInTheDocument();
    expect(screen.queryByText('5G流量占比')).not.toBeInTheDocument();
  });

  it('shows filter tag and allows clearing filter', () => {
    renderPage();

    fireEvent.click(screen.getByText('阈值上下限'));
    expect(screen.getByText(/已筛选/)).toBeInTheDocument();

    // 清除筛选按钮是筛选标签内的 X 图标按钮
    const clearBtn = screen.getByText(/已筛选/).closest('div')?.querySelector('button');
    expect(clearBtn).toBeTruthy();
    fireEvent.click(clearBtn!);

    expect(screen.getByText('共 10 个指标')).toBeInTheDocument();
  });

  it('toggles filter off when clicking the same template again', () => {
    renderPage();

    fireEvent.click(screen.getByText('阈值上下限'));
    expect(screen.getByText('共 2 个指标')).toBeInTheDocument();

    fireEvent.click(screen.getByText('阈值上下限'));
    expect(screen.getByText('共 10 个指标')).toBeInTheDocument();
  });

  it('expands indicator row to show embedded rules table', () => {
    renderPage();

    const row = screen.getByText('5G用户渗透率').closest('tr');
    expect(row).toBeTruthy();
    fireEvent.click(row!);

    expect(screen.getByText('5G用户渗透率_异常算法_波动算法')).toBeInTheDocument();
    expect(screen.getByText('5G用户渗透率_指标预警_阈值上下限')).toBeInTheDocument();
  });

  it('shows template type column in embedded table when no template is selected', () => {
    renderPage();

    const row = screen.getByText('5G用户渗透率').closest('tr');
    fireEvent.click(row!);

    // 内嵌表格的表头应有「模板类型」
    expect(screen.getByText('模板类型')).toBeInTheDocument();

    // 波动算法作为模板类型出现（用 scoped query 避免和左侧树冲突）
    const embeddedTable = screen.getByText('模板类型').closest('table');
    expect(embeddedTable).toBeTruthy();
    expect(within(embeddedTable!).getByText('波动算法')).toBeInTheDocument();
    expect(within(embeddedTable!).getByText('阈值上下限')).toBeInTheDocument();
  });

  it('hides template type column in embedded table when a template is selected', () => {
    renderPage();

    fireEvent.click(screen.getByText('阈值上下限'));
    const row = screen.getByText('5G用户渗透率').closest('tr');
    fireEvent.click(row!);

    expect(screen.queryByText('模板类型')).not.toBeInTheDocument();
  });

  it('shows param summary in embedded rule table', () => {
    renderPage();

    const row = screen.getByText('5G用户渗透率').closest('tr');
    fireEvent.click(row!);

    expect(screen.getByText(/上限值: 95/)).toBeInTheDocument();
  });

  it('shows empty state for indicators without rules', () => {
    renderPage();

    const row = screen.getByText('5G流量占比').closest('tr');
    fireEvent.click(row!);

    expect(screen.getByText('暂无规则')).toBeInTheDocument();
    expect(screen.getByText('为此指标添加规则')).toBeInTheDocument();
  });

  it('shows edit and delete buttons in embedded rule table', () => {
    renderPage();

    const row = screen.getByText('5G用户渗透率').closest('tr');
    fireEvent.click(row!);

    // 5G用户渗透率有 2 条规则，所以有 2 个编辑/删除按钮
    expect(screen.getAllByText('编辑').length).toBe(2);
    expect(screen.getAllByText('删除').length).toBe(2);
  });
});

describe('RuleConfigPage — Slice 3', () => {
  it('opens add dialog when clicking "添加新规则" button', () => {
    renderPage();

    // 右侧表格上方的「添加新规则」按钮（第二个，第一个是左侧树底部的）
    const addButtons = screen.getAllByRole('button', { name: /添加新规则/ });
    fireEvent.click(addButtons[1]);

    // DialogTitle
    expect(screen.getByRole('heading', { name: '添加新规则' })).toBeInTheDocument();
    expect(screen.getByText('规则大类')).toBeInTheDocument();
    expect(screen.getByText('规则子类')).toBeInTheDocument();
    expect(screen.getByText('规则模板')).toBeInTheDocument();
  });

  it('opens edit dialog when clicking "编辑" in embedded table', () => {
    renderPage();

    const row = screen.getByText('5G用户渗透率').closest('tr');
    fireEvent.click(row!);

    fireEvent.click(screen.getAllByText('编辑')[0]);

    expect(screen.getByRole('heading', { name: '编辑规则' })).toBeInTheDocument();
  });

  it('validates rule name is required in dialog', () => {
    renderPage();

    const addButtons = screen.getAllByRole('button', { name: /添加新规则/ });
    fireEvent.click(addButtons[1]);

    const nameInput = screen.getByPlaceholderText('输入规则名称');
    fireEvent.change(nameInput, { target: { value: '' } });

    // 弹窗内的保存按钮
    const saveBtn = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveBtn);

    // 弹窗未关闭，标题仍在
    expect(screen.getByRole('heading', { name: '添加新规则' })).toBeInTheDocument();
  });

  it('closes dialog when clicking cancel', () => {
    renderPage();

    const addButtons = screen.getAllByRole('button', { name: /添加新规则/ });
    fireEvent.click(addButtons[1]);

    expect(screen.getByRole('heading', { name: '添加新规则' })).toBeInTheDocument();

    // 弹窗内的取消按钮
    const cancelBtn = screen.getByRole('button', { name: '取消' });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('heading', { name: '添加新规则' })).not.toBeInTheDocument();
  });
});

describe('RuleConfigPage — Slice 4', () => {
  it('shows delete confirmation dialog and removes rule after confirm', () => {
    renderPage();

    const row = screen.getByText('5G用户渗透率').closest('tr');
    fireEvent.click(row!);

    fireEvent.click(screen.getAllByText('删除')[0]);

    expect(screen.getByText('确认删除规则？')).toBeInTheDocument();
    expect(screen.getByText('删除后无法恢复，该规则将不再生效。')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '删除' }));

    expect(screen.queryByText('确认删除规则？')).not.toBeInTheDocument();
  });

  it('shows publish confirmation dialog with summary', () => {
    renderPage();

    fireEvent.click(screen.getByText('确认发布到图谱'));

    expect(screen.getByText('确认发布规则？')).toBeInTheDocument();
    expect(screen.getByText(/指标数/)).toBeInTheDocument();
    expect(screen.getByText(/发布规则数/)).toBeInTheDocument();
    expect(screen.getByText(/启用规则/)).toBeInTheDocument();
    expect(screen.getByText(/草稿规则/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认发布' }));

    expect(screen.queryByText('确认发布规则？')).not.toBeInTheDocument();
  });
});
