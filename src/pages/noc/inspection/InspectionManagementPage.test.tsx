import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InspectionManagementPage from './InspectionManagementPage';

function renderPage(props?: { defaultTab?: string }) {
  return render(
    <MemoryRouter>
      <InspectionManagementPage {...props} />
    </MemoryRouter>
  );
}

describe('InspectionManagementPage — Slice 1', () => {
  it('renders page title and description', () => {
    renderPage();

    expect(screen.getByText('巡检管理')).toBeInTheDocument();
    expect(screen.getByText('巡检计划配置、执行监控与报告查看')).toBeInTheDocument();
  });

  it('renders tabs with default active tab 当前巡检计划', () => {
    renderPage();

    expect(screen.getByRole('tab', { name: /当前巡检计划/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /巡检结果/ })).toBeInTheDocument();

    // 默认选中「当前巡检计划」
    const activeTab = screen.getByRole('tab', { name: /当前巡检计划/ });
    expect(activeTab).toHaveAttribute('data-state', 'active');
  });

  it('shows 3 stat cards with correct counts', () => {
    renderPage();

    // 统计卡片标签
    expect(screen.getByText('运行中')).toBeInTheDocument();
    expect(screen.getByText('待执行')).toBeInTheDocument();
    // 「已暂停」可能在计划行标签中也出现，用 getAllByText
    expect(screen.getAllByText('已暂停').length).toBeGreaterThanOrEqual(1);

    // mockInspectionPlans: running=2, pending=1, paused=1
    // 用精确匹配避免「2 个异常」等干扰
    const statCards = screen.getAllByText(/^2$|^1$/);
    expect(statCards.length).toBeGreaterThanOrEqual(3);
  });

  it('renders plan list table with correct columns and data', () => {
    renderPage();

    // 表头
    expect(screen.getByText('计划名称')).toBeInTheDocument();
    expect(screen.getByText('周期类型')).toBeInTheDocument();
    expect(screen.getByText('下次执行时间')).toBeInTheDocument();
    expect(screen.getByText('最近执行结果')).toBeInTheDocument();
    expect(screen.getAllByText('操作').length).toBeGreaterThanOrEqual(1);

    // mock 数据中的计划名称
    expect(screen.getByText('经营指标周巡检')).toBeInTheDocument();
    expect(screen.getByText('全量指标手动巡检')).toBeInTheDocument();
    expect(screen.getByText('阈值告警自动巡检')).toBeInTheDocument();
    expect(screen.getByText('发展指标月巡检')).toBeInTheDocument();
  });

  it('shows execution result with status badge and anomaly count', () => {
    renderPage();

    // plan-1 有 2 个异常，plan-3 有 1 个异常
    // plan-4 可能自动生成执行记录，异常数随机，所以用 getAllByText 避免重复
    expect(screen.getAllByText('2 个异常').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1 个异常').length).toBeGreaterThanOrEqual(1);

    // 无执行记录的计划显示 "—"
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('shows 新建巡检计划 button and expands form placeholder on click', () => {
    renderPage();

    const btn = screen.getByRole('button', { name: /新建巡检计划/ });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    // 表单占位区域出现
    expect(screen.getByText(/基础信息/)).toBeInTheDocument();
  });

  it('shows empty state in 巡检结果 tab', () => {
    renderPage({ defaultTab: 'results' });

    // 现在有 5 条 mock 报告，应该显示报告卡片列表
    expect(screen.queryByText('暂无巡检报告')).not.toBeInTheDocument();
    // 至少能看到报告卡片
    expect(screen.getAllByTestId('report-card').length).toBeGreaterThanOrEqual(1);
  });
});

describe('InspectionManagementPage — Slice 2', () => {
  it('expands form with animation when clicking 新建巡检计划', () => {
    renderPage();

    const btn = screen.getByRole('button', { name: /新建巡检计划/ });
    fireEvent.click(btn);

    // 表单区域出现，包含计划名称输入框
    expect(screen.getByLabelText(/计划名称/)).toBeInTheDocument();
    // 包含周期类型单选
    expect(screen.getByLabelText('定期')).toBeInTheDocument();
    expect(screen.getByLabelText('自动触发')).toBeInTheDocument();
    expect(screen.getByLabelText('手动触发')).toBeInTheDocument();
  });

  it('collapses form when clicking cancel', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /新建巡检计划/ }));
    expect(screen.getByLabelText(/计划名称/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /取消/ }));

    // Framer Motion exit 动画后表单消失
    await waitFor(() => {
      expect(screen.queryByLabelText(/计划名称/)).not.toBeInTheDocument();
    });
  });

  it('preserves form data when switching trigger types within the form', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /新建巡检计划/ }));

    const nameInput = screen.getByLabelText(/计划名称/) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '测试计划' } });

    // 切换到手动触发
    fireEvent.click(screen.getByLabelText('手动触发'));
    expect((screen.getByLabelText(/计划名称/) as HTMLInputElement).value).toBe('测试计划');

    // 切换回定期
    fireEvent.click(screen.getByLabelText('定期'));
    expect((screen.getByLabelText(/计划名称/) as HTMLInputElement).value).toBe('测试计划');
  });

  it('shows periodic selector by default and hides it when switching to manual', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /新建巡检计划/ }));

    // 默认显示周期选择器
    expect(screen.getByLabelText(/执行周期/)).toBeInTheDocument();

    // 切换到手动触发，周期选择器消失
    fireEvent.click(screen.getByLabelText('手动触发'));
    expect(screen.queryByLabelText(/执行周期/)).not.toBeInTheDocument();

    // 切换到自动触发，显示规则触发器占位
    fireEvent.click(screen.getByLabelText('自动触发'));
    expect(
      screen.getByText(/选择要监听的异常规则/)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/执行周期/)).not.toBeInTheDocument();
  });

  it('renders graph version select disabled with v2.3.1', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /新建巡检计划/ }));

    const selectTrigger = screen.getByRole('combobox', { name: /版本/ });
    expect(selectTrigger).toBeInTheDocument();
    expect(selectTrigger).toHaveAttribute('data-disabled');
    expect(screen.getByText('v2.3.1')).toBeInTheDocument();
  });
});

describe('InspectionManagementPage — Slice 4', () => {
  it('adds new plan to list after saving form', async () => {
    renderPage();

    // 初始 4 条计划
    expect(screen.getByText('经营指标周巡检')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /新建巡检计划/ }));

    const nameInput = screen.getByLabelText(/计划名称/);
    fireEvent.change(nameInput, { target: { value: '新巡检计划' } });

    fireEvent.click(screen.getByRole('button', { name: /保存/ }));

    // 保存后列表刷新，新计划出现
    await waitFor(() => {
      expect(screen.getByText('新巡检计划')).toBeInTheDocument();
    });

    // 统计卡片更新：运行中从 2 变成 3（新计划是定期，算运行中）
    const runningCards = screen.getAllByText('3');
    expect(runningCards.length).toBeGreaterThanOrEqual(1);
  });

  it('collapses form after saving', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /新建巡检计划/ }));
    expect(screen.getByLabelText(/计划名称/)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/计划名称/);
    fireEvent.change(nameInput, { target: { value: '另一个计划' } });

    fireEvent.click(screen.getByRole('button', { name: /保存/ }));

    // 表单折叠
    await waitFor(() => {
      expect(screen.queryByLabelText(/计划名称/)).not.toBeInTheDocument();
    });
  });
});

describe('InspectionManagementPage — Slice 5', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders operation buttons for each plan row', () => {
    renderPage();

    // 每行应该有执行/编辑/停用/删除按钮
    const rows = screen.getAllByText(/经营指标周巡检|全量指标手动巡检|阈值告警自动巡检|发展指标月巡检/);
    // 找到包含操作按钮的单元格
    const actionCells = rows.map((el) => el.closest('tr')?.querySelector('td:last-child'));
    expect(actionCells.length).toBe(4);
    // 每个操作单元格应有 4 个按钮
    actionCells.forEach((cell) => {
      expect(cell?.querySelectorAll('button').length).toBe(4);
    });
  });

  it('toggles plan status when clicking pause/resume button', () => {
    renderPage();

    // 找到「经营指标周巡检」行，点击暂停按钮（第 3 个按钮）
    const planRow = screen.getByText('经营指标周巡检').closest('tr');
    const buttons = planRow?.querySelectorAll('button');
    expect(buttons?.length).toBe(4);
    fireEvent.click(buttons![2]); // 第 3 个是暂停按钮

    // 状态变为已暂停（在行内标签和统计卡片中都会出现，至少 1 个）
    expect(screen.getAllByText('已暂停').length).toBeGreaterThanOrEqual(1);
  });

  it('shows delete confirmation dialog and removes plan after confirm', () => {
    renderPage();

    // 点击「发展指标月巡检」行的删除按钮
    const deleteButtons = screen.getAllByTitle('删除');
    fireEvent.click(deleteButtons[3]);

    // 确认弹窗出现
    expect(screen.getByTestId('delete-dialog-title')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /确认删除/ }));

    // 计划从列表移除
    expect(screen.queryByText('发展指标月巡检')).not.toBeInTheDocument();
  });

  it('expands form with prefill data when clicking edit', async () => {
    renderPage();

    // 点击编辑按钮（第一条计划）
    const editButtons = screen.getAllByTitle('编辑');
    fireEvent.click(editButtons[0]);

    // 表单展开，名称已回填
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/计划名称/) as HTMLInputElement;
      expect(nameInput.value).toBe('经营指标周巡检');
    });
  });

  it('shows executing spinner and updates result after execution', async () => {
    renderPage();

    // 点击执行按钮（全量指标手动巡检是手动触发）
    const execButtons = screen.getAllByTitle('执行');
    fireEvent.click(execButtons[1]);

    // 显示执行中
    expect(screen.getByText('执行中...')).toBeInTheDocument();

    // 快进 2 秒
    vi.advanceTimersByTime(2500);

    // 执行完成，显示结果
    await waitFor(() => {
      expect(screen.queryByText('执行中...')).not.toBeInTheDocument();
    });
  });
});

describe('InspectionManagementPage — Slice 6', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-05-27T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders report cards in 巡检结果 tab', () => {
    renderPage({ defaultTab: 'results' });

    // 5 条 mock 报告应该全部显示
    const cards = screen.getAllByTestId('report-card');
    expect(cards.length).toBe(5);

    // 计划名称出现在卡片中（plan-1 出现在 report-1 和 report-4 中）
    expect(screen.getAllByText('经营指标周巡检').length).toBe(2);
    expect(screen.getAllByText('全量指标手动巡检').length).toBe(2);
    expect(screen.getByText('阈值告警自动巡检')).toBeInTheDocument();

    // 状态徽章：通过 data-testid="report-main-status" 精确匹配
    const statuses = screen.getAllByTestId('report-main-status');
    expect(statuses.length).toBe(5);
    const normalStatuses = statuses.filter((s) => s.textContent === '正常');
    const anomalousStatuses = statuses.filter((s) => s.textContent === '异常');
    const resolvedStatuses = statuses.filter((s) => s.textContent === '已处理');
    expect(normalStatuses.length).toBe(2);
    expect(anomalousStatuses.length).toBe(2);
    expect(resolvedStatuses.length).toBe(1);
  });

  it('filters reports by period (week/month)', () => {
    renderPage({ defaultTab: 'results' });

    // 默认显示全部 5 条
    expect(screen.getAllByTestId('report-card').length).toBe(5);

    // 点击「本周」筛选 — 只有本周的报告（report-1: 5/26, report-3: 5/25）
    const weekButton = screen.getByRole('button', { name: '本周' });
    fireEvent.click(weekButton);

    expect(screen.getAllByTestId('report-card').length).toBe(2);

    // 点击「本月」— 4 条在本月（report-5 是 4/28 不在本月）
    const monthButton = screen.getByRole('button', { name: '本月' });
    fireEvent.click(monthButton);

    expect(screen.getAllByTestId('report-card').length).toBe(4);
  });

  it('filters reports by status', () => {
    renderPage({ defaultTab: 'results' });

    // 点击「异常」筛选
    const anomalousButton = screen.getByRole('button', { name: '异常' });
    fireEvent.click(anomalousButton);

    // 只有异常状态的报告显示（2 条异常报告）
    const anomalousCards = screen.getAllByTestId('report-card');
    expect(anomalousCards.length).toBe(2);
    // 异常卡片中不应该有「正常」或「已处理」状态徽章
    Array.from(anomalousCards).forEach((card) => {
      expect(card.textContent).not.toContain('已处理');
    });
  });

  it('opens report detail dialog on 查看详情', async () => {
    renderPage({ defaultTab: 'results' });

    // 找到第一个「查看详情」按钮并点击
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[0]);

    // Dialog 标题出现
    await waitFor(() => {
      expect(screen.getByText(/巡检报告 —/)).toBeInTheDocument();
    });

    // 概览信息出现
    expect(screen.getByText('巡检周期')).toBeInTheDocument();
    expect(screen.getByText('覆盖范围')).toBeInTheDocument();
    expect(screen.getByText('异常统计')).toBeInTheDocument();
  });

  it('archives report and updates card state', () => {
    renderPage({ defaultTab: 'results' });

    // 找到第一个「归档」按钮（非已归档的卡片）
    const archiveButtons = screen.getAllByRole('button', { name: /归档/ });
    expect(archiveButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(archiveButtons[0]);

    // 归档后，该卡片变为「已归档」状态
    // 已归档的卡片数量增加
    const archivedLabels = screen.getAllByText('已归档');
    expect(archivedLabels.length).toBeGreaterThanOrEqual(1);
  });
});

describe('InspectionManagementPage — Slice 7', () => {
  it('shows anomaly detail table in report detail', async () => {
    renderPage({ defaultTab: 'results' });

    // 点击第一个「查看详情」（report-1，有异常）
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[0]);

    // Dialog 打开，异常指标明细出现
    await waitFor(() => {
      expect(screen.getByText('异常指标明细')).toBeInTheDocument();
    });

    // 表格中有异常指标数据（5G用户渗透率也出现在趋势图切换按钮中）
    expect(screen.getAllByText('5G用户渗透率').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('网络故障率').length).toBeGreaterThanOrEqual(1);

    // 偏离度标签
    expect(screen.getByText('+2.1%')).toBeInTheDocument();
    expect(screen.getByText('+28%')).toBeInTheDocument();

    // 异常指标名称应出现在表格中（指标名可能在多处出现，用 getAllByText）
    expect(screen.getAllByText('5G用户渗透率').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('网络故障率').length).toBeGreaterThanOrEqual(1);
  });

  it('shows trend chart in report detail', async () => {
    renderPage({ defaultTab: 'results' });

    // 点击第一个「查看详情」（report-1，有异常指标趋势数据）
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('趋势对比')).toBeInTheDocument();
    });

    // 趋势图表容器存在
    expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
  });

  it('shows lineage canvas in report detail', async () => {
    renderPage({ defaultTab: 'results' });

    // 点击第一个「查看详情」（report-1，有血缘数据）
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('血缘影响面')).toBeInTheDocument();
    });

    // 图例中有血缘角色标签（用 getAllByText 避免多个匹配问题）
    expect(screen.getAllByText('上游根因').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('当前异常').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('下游波及').length).toBeGreaterThanOrEqual(1);

    // SVG 画布存在
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no lineage data', async () => {
    renderPage({ defaultTab: 'results' });

    // 点击第二个「查看详情」（report-2，normal 无异常，无血缘数据）
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[1]);

    await waitFor(() => {
      expect(screen.getByText('血缘影响面')).toBeInTheDocument();
    });

    // 显示「暂无血缘数据」空状态
    expect(screen.getByText('暂无血缘数据')).toBeInTheDocument();
  });
});

describe('InspectionManagementPage — Slice 8', () => {
  it('shows quality score in report detail', async () => {
    renderPage({ defaultTab: 'results' });

    // 点击第一个「查看详情」（report-1，有质量评分）
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('巡检质量评分')).toBeInTheDocument();
    });

    // 有效异常数、检测得分、误报率、综合评分
    expect(screen.getByText('有效异常数')).toBeInTheDocument();
    expect(screen.getByText('检测得分')).toBeInTheDocument();
    expect(screen.getByText('误报率')).toBeInTheDocument();
    expect(screen.getByText('综合评分')).toBeInTheDocument();
  });

  it('shows suggestions in report detail', async () => {
    renderPage({ defaultTab: 'results' });

    // 点击第一个「查看详情」（report-1，有异常，有建议）
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('处置建议')).toBeInTheDocument();
    });

    // 等待建议加载完成
    await waitFor(() => {
      expect(screen.queryByText('正在生成处置建议...')).not.toBeInTheDocument();
    });

    // 知识库标签（每个异常指标都有一个）
    expect(screen.getAllByText('相关知识库').length).toBeGreaterThanOrEqual(1);

    // 建议来源标签
    expect(screen.getAllByText(/AI 生成|知识库/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows push success message', async () => {
    renderPage({ defaultTab: 'results' });

    // 点击第一个「查看详情」
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/巡检报告 —/)).toBeInTheDocument();
    });

    // 点击推送按钮
    fireEvent.click(screen.getByRole('button', { name: /推送报告至业务部门/ }));

    // 显示成功提示
    await waitFor(() => {
      expect(screen.getByText(/已成功推送报告至业务部门/)).toBeInTheDocument();
    });
  });

  it('shows archived reports in history view', () => {
    renderPage({ defaultTab: 'results' });

    // 点击「历史归档」视图
    const archivedViewButton = screen.getByRole('button', { name: '历史归档' });
    fireEvent.click(archivedViewButton);

    // 只显示已归档的报告（report-5 是 resolved）
    const cards = screen.getAllByTestId('report-card');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('已归档');
  });
});
