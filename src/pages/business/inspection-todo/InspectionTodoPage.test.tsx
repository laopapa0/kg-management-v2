import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InspectionTodoPage from './InspectionTodoPage';
import {
  mockInspectionReports,
  mockAnomalyItems,
} from '@/pages/noc/inspection/mockData';

describe('InspectionTodoPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    // Restore mock data mutated by submit tests
    mockAnomalyItems[0].evaluation = undefined;
    mockAnomalyItems[1].evaluation = undefined;
    mockAnomalyItems[2].evaluation = undefined;
    mockAnomalyItems[3].evaluation = { isFalsePositive: false, comment: '季节性波动，非真实异常' };
    mockInspectionReports[0].businessReview = { status: 'pending', evaluatedCount: 0, totalCount: 2 };
    mockInspectionReports[0].score = { effectiveAnomalies: 2, detectionScore: 0.4, falsePositiveRate: 0, overall: 64 };
    mockInspectionReports[2].businessReview = { status: 'pending', evaluatedCount: 0, totalCount: 1 };
    mockInspectionReports[2].score = { effectiveAnomalies: 1, detectionScore: 0.2, falsePositiveRate: 0, overall: 52 };
  });
  it('renders report list with anomaly reports', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    expect(screen.getByText('巡检待办')).toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260526-001')).toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260525-003')).toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260428-005')).toBeInTheDocument();
  });

  it('shows business review status badges', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Status badges are in table cells, filter buttons are role=button
    const badgePending = screen.getAllByText('待评价').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(badgePending.length).toBe(2);
    const badgeSubmitted = screen.getAllByText('已提交').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(badgeSubmitted.length).toBe(1);
  });

  it('sorts reports by createdAt desc', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    const rows = screen.getAllByRole('row');
    // Skip header row, check data rows
    const dataRows = rows.slice(1);
    expect(dataRows[0].textContent).toContain('巡检报告-20260526-001');
    expect(dataRows[1].textContent).toContain('巡检报告-20260525-003');
    expect(dataRows[2].textContent).toContain('巡检报告-20260428-005');
  });

  it('filters reports by search keyword in name', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('搜索报告名称或巡检周期');
    fireEvent.change(searchInput, { target: { value: '20260526' } });

    expect(screen.getByText('巡检报告-20260526-001')).toBeInTheDocument();
    expect(screen.queryByText('巡检报告-20260525-003')).not.toBeInTheDocument();
    expect(screen.queryByText('巡检报告-20260428-005')).not.toBeInTheDocument();
  });

  it('filters reports by search keyword in period', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('搜索报告名称或巡检周期');
    fireEvent.change(searchInput, { target: { value: '5月' } });

    expect(screen.getByText('巡检报告-20260526-001')).toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260525-003')).toBeInTheDocument();
    expect(screen.queryByText('巡检报告-20260428-005')).not.toBeInTheDocument();
  });

  it('filters reports by status', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Default shows all (2 pending + 1 submitted)
    expect(screen.getAllByRole('row').length - 1).toBe(3);

    // Click "待评价"
    fireEvent.click(screen.getByRole('button', { name: '待评价' }));
    expect(screen.getAllByRole('row').length - 1).toBe(2);
    expect(screen.getByText('巡检报告-20260526-001')).toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260525-003')).toBeInTheDocument();
    expect(screen.queryByText('巡检报告-20260428-005')).not.toBeInTheDocument();

    // Click "已提交"
    fireEvent.click(screen.getByRole('button', { name: '已提交' }));
    expect(screen.getAllByRole('row').length - 1).toBe(1);
    expect(screen.queryByText('巡检报告-20260526-001')).not.toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260428-005')).toBeInTheDocument();

    // Click "全部" resets
    fireEvent.click(screen.getByRole('button', { name: '全部' }));
    expect(screen.getAllByRole('row').length - 1).toBe(3);
  });

  it('filters reports by time range', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Default shows all 3 reports
    expect(screen.getAllByRole('row').length - 1).toBe(3);

    // Click "本周" — report-1 (05-26) and report-3 (05-25) are this week
    fireEvent.click(screen.getByRole('button', { name: '本周' }));
    expect(screen.getAllByRole('row').length - 1).toBe(2);
    expect(screen.getByText('巡检报告-20260526-001')).toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260525-003')).toBeInTheDocument();

    // Click "本月" — report-1 and report-3 are in May 2026
    fireEvent.click(screen.getByRole('button', { name: '本月' }));
    expect(screen.getAllByRole('row').length - 1).toBe(2);
    expect(screen.getByText('巡检报告-20260526-001')).toBeInTheDocument();
    expect(screen.getByText('巡检报告-20260525-003')).toBeInTheDocument();

    // Click "全部时间" resets
    fireEvent.click(screen.getByRole('button', { name: '全部时间' }));
    expect(screen.getAllByRole('row').length - 1).toBe(3);
  });

  it('shows pending evaluation count column', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Verify column header exists
    expect(screen.getByText('待评价数')).toBeInTheDocument();

    // report-1: total=2, evaluated=0 → pending=2
    // report-3: total=1, evaluated=0 → pending=1
    // report-5: total=3, evaluated=3 → pending=0
    const rows = screen.getAllByRole('row').slice(1);
    const cells1 = rows[0].querySelectorAll('td');
    const cells3 = rows[1].querySelectorAll('td');
    const cells5 = rows[2].querySelectorAll('td');
    // Column index: 0=name, 1=period, 2=anomalyCount, 3=pendingCount, 4=status
    expect(cells1[3]?.textContent?.trim()).toBe('2');
    expect(cells3[3]?.textContent?.trim()).toBe('1');
    expect(cells5[3]?.textContent?.trim()).toBe('0');
  });

  it('shows action buttons based on status', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    const rows = screen.getAllByRole('row').slice(1);

    // report-1: pending → only "查看详情"
    const row1Buttons = rows[0].querySelectorAll('button');
    expect(row1Buttons.length).toBe(1);
    expect(row1Buttons[0]?.textContent?.trim()).toBe('查看详情');

    // report-3: pending → only "查看详情"
    const row3Buttons = rows[1].querySelectorAll('button');
    expect(row3Buttons.length).toBe(1);
    expect(row3Buttons[0]?.textContent?.trim()).toBe('查看详情');

    // report-5: submitted → only "查看详情"
    const row5Buttons = rows[2].querySelectorAll('button');
    expect(row5Buttons.length).toBe(1);
    expect(row5Buttons[0]?.textContent?.trim()).toBe('查看详情');
  });

  it('shows submit button for saved status reports', () => {
    // Pre-populate localStorage so report-1 evaluates to 'saved'
    localStorage.setItem('inspection-review-report-1', JSON.stringify({
      'anom-1': { isFalsePositive: true },
      'anom-2': { isFalsePositive: false },
    }));

    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    const rows = screen.getAllByRole('row').slice(1);
    // report-1 should now be "saved" status with both "查看详情" and "提交"
    const row1Buttons = rows[0].querySelectorAll('button');
    const buttonTexts = Array.from(row1Buttons).map((b) => b.textContent?.trim());
    expect(buttonTexts).toContain('查看详情');
    expect(buttonTexts).toContain('提交');

    // Clean up
    localStorage.removeItem('inspection-review-report-1');
  });

  it('combines search + status + time filters', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Start with all 3 reports
    expect(screen.getAllByRole('row').length - 1).toBe(3);

    // Apply status "待评价" → 2 reports (report-1, report-3)
    fireEvent.click(screen.getByRole('button', { name: '待评价' }));
    expect(screen.getAllByRole('row').length - 1).toBe(2);

    // Apply time "本周" → 1 report (report-1, since report-3 is 05-25 also this week... wait)
    // Actually both report-1 and report-3 are this week, so still 2
    fireEvent.click(screen.getByRole('button', { name: '本周' }));
    expect(screen.getAllByRole('row').length - 1).toBe(2);

    // Apply search "003" → only report-3 matches
    const searchInput = screen.getByPlaceholderText('搜索报告名称或巡检周期');
    fireEvent.change(searchInput, { target: { value: '003' } });
    expect(screen.getAllByRole('row').length - 1).toBe(1);
    expect(screen.getByText('巡检报告-20260525-003')).toBeInTheDocument();
    expect(screen.queryByText('巡检报告-20260526-001')).not.toBeInTheDocument();
  });

  it('opens review dialog when clicking 查看详情', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Before click, anomaly names should not be in the document
    expect(screen.queryByText('5G用户渗透率')).not.toBeInTheDocument();

    const detailButtons = screen.getAllByRole('button', { name: '查看详情' });
    fireEvent.click(detailButtons[0]);

    // After click, dialog should show anomaly items (now in both report and evaluation tables)
    expect(screen.getAllByText('5G用户渗透率').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('网络故障率').length).toBeGreaterThanOrEqual(1);
  });

  it('shows NOC-style overview cards in dialog', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    // Use within to scope to the dialog content area
    const overview = screen.getByTestId('noc-overview-cards');
    const overviewScope = within(overview);

    // NOC 侧概览卡片：巡检周期、覆盖范围、覆盖指标数、质量评分
    expect(overviewScope.getByText('巡检周期')).toBeInTheDocument();
    expect(overviewScope.getByText('覆盖范围')).toBeInTheDocument();
    expect(overviewScope.getByText('覆盖指标数')).toBeInTheDocument();
    expect(overviewScope.getByText('质量评分')).toBeInTheDocument();

    // 具体值
    expect(overviewScope.getByText('2026-05-19 ~ 2026-05-26')).toBeInTheDocument();
    expect(overviewScope.getByText('经营类指标（4 个指标）')).toBeInTheDocument();
    expect(overviewScope.getByText('12 个')).toBeInTheDocument();
  });

  it('shows report status badge and created time in dialog header', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    // report-1 status is 'anomalous' → should show "异常" badge
    expect(screen.getByText('异常')).toBeInTheDocument();
    // Created time
    expect(screen.getByText(/生成时间：/)).toBeInTheDocument();
  });

  it('shows quality score detail section with formula', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const scoreDetail = screen.getByTestId('quality-score-detail');
    const scope = within(scoreDetail);

    expect(scope.getByText('巡检质量评分')).toBeInTheDocument();
    expect(scope.getByText('有效异常数')).toBeInTheDocument();
    expect(scope.getByText('检测得分')).toBeInTheDocument();
    expect(scope.getByText('误报率')).toBeInTheDocument();
    expect(scope.getByText('综合评分')).toBeInTheDocument();

    // 公式说明
    expect(scope.getByText(/有效异常数 = 异常项数/)).toBeInTheDocument();
    expect(scope.getByText(/检测得分 = min\(有效异常数, 目标值\) \/ 目标值/)).toBeInTheDocument();
    expect(scope.getByText(/综合评分 = 0.6 × 检测得分 \+ 0.4 × \(1 − 误报率\)/)).toBeInTheDocument();
  });

  it('shows quality score in overview cards', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const overview = screen.getByTestId('noc-overview-cards');
    const overviewScope = within(overview);

    // report-1 score overall is 64
    expect(overviewScope.getByText('64.0 分')).toBeInTheDocument();
    expect(overviewScope.getByText('质量评分')).toBeInTheDocument();
  });

  it('shows anomaly statistics section with count highlight', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const statsSection = screen.getByTestId('anomaly-stats-section');
    const scope = within(statsSection);

    expect(scope.getByText('异常统计')).toBeInTheDocument();
    expect(scope.getByText('共 2 个异常')).toBeInTheDocument();
    expect(scope.getByText('本次巡检共发现 2 个异常指标，详见下方明细。')).toBeInTheDocument();
  });

  it('shows report anomaly detail table without evaluation column', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const reportTable = screen.getByTestId('report-anomaly-table');
    const scope = within(reportTable);

    // 5 列纯展示表格：指标名称、编码、当前值、偏离度、命中规则
    expect(scope.getByText('指标名称')).toBeInTheDocument();
    expect(scope.getByText('编码')).toBeInTheDocument();
    expect(scope.getByText('当前值')).toBeInTheDocument();
    expect(scope.getByText('偏离度')).toBeInTheDocument();
    expect(scope.getByText('命中规则')).toBeInTheDocument();

    // 不应该有"评价"列（这是下方评价表格的列）
    expect(scope.queryByText('评价')).not.toBeInTheDocument();

    // 数据正确展示
    expect(scope.getByText('5G用户渗透率')).toBeInTheDocument();
    expect(scope.getByText('IND-2024-0056')).toBeInTheDocument();
    expect(scope.getByText('网络故障率')).toBeInTheDocument();
    expect(scope.getByText('IND-2024-0034')).toBeInTheDocument();
  });

  it('shows hit rules column in evaluation table', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const evalTable = screen.getByTestId('evaluation-table');
    const scope = within(evalTable);

    // Table header
    expect(scope.getByText('命中规则')).toBeInTheDocument();
    // anom-1: 阈值上下限
    expect(scope.getByText('阈值上下限')).toBeInTheDocument();
    // anom-2: 波动算法
    expect(scope.getByText('波动算法')).toBeInTheDocument();
  });

  it('shows disposal suggestions with knowledge bases', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const suggestionSection = screen.getByTestId('disposal-suggestions');
    const scope = within(suggestionSection);

    expect(scope.getByText('处置建议')).toBeInTheDocument();

    // anom-1 suggestion
    expect(scope.getByText('5G用户渗透率')).toBeInTheDocument();
    expect(scope.getByText('5G业务发展规范 v2.3')).toBeInTheDocument();
    expect(scope.getByText(/检查数据源是否准确/)).toBeInTheDocument();

    // anom-2 suggestion
    expect(scope.getByText('网络故障率')).toBeInTheDocument();
    expect(scope.getByText(/排查近期网络割接/)).toBeInTheDocument();
  });

  it('shows lineage impact canvas with nodes', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const lineageSection = screen.getByTestId('lineage-impact');
    const scope = within(lineageSection);

    expect(scope.getByText('血缘影响面')).toBeInTheDocument();
    // anom-1 lineage nodes should be rendered
    expect(scope.getByText('基站覆盖数')).toBeInTheDocument();
    expect(scope.getByText('5G用户渗透率')).toBeInTheDocument();
  });

  it('shows trend comparison chart with tab switching', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const trendSection = screen.getByTestId('trend-comparison');
    const scope = within(trendSection);

    expect(scope.getByText('趋势对比')).toBeInTheDocument();

    // Tab buttons for each anomaly indicator
    expect(scope.getByRole('button', { name: '5G用户渗透率' })).toBeInTheDocument();
    expect(scope.getByRole('button', { name: '网络故障率' })).toBeInTheDocument();

    // Chart container
    expect(scope.getByTestId('trend-chart')).toBeInTheDocument();

    // Click second tab
    fireEvent.click(scope.getByRole('button', { name: '网络故障率' }));
    expect(scope.getByTestId('trend-chart')).toBeInTheDocument();
  });

  it('shows evaluation table with buttons', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const evalTable = screen.getByTestId('evaluation-table');
    const scope = within(evalTable);

    // Table headers (unique to evaluation table)
    expect(scope.getByText('指标名称')).toBeInTheDocument();
    expect(scope.getByText('编码')).toBeInTheDocument();
    expect(scope.getByText('当前值')).toBeInTheDocument();
    expect(scope.getByText('偏离度')).toBeInTheDocument();
    expect(scope.getByText('评价')).toBeInTheDocument();

    // Anomaly data
    expect(scope.getByText('IND-2024-0056')).toBeInTheDocument();
    expect(scope.getByText('IND-2024-0034')).toBeInTheDocument();

    // Evaluation buttons for each anomaly
    const falsePositiveButtons = scope.getAllByRole('button', { name: '是误报' });
    const trueAnomalyButtons = scope.getAllByRole('button', { name: '非误报' });
    expect(falsePositiveButtons.length).toBe(2);
    expect(trueAnomalyButtons.length).toBe(2);
  });

  it('allows selecting false positive or true anomaly for each item', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const fpButtons = screen.getAllByRole('button', { name: '是误报' });
    const taButtons = screen.getAllByRole('button', { name: '非误报' });

    // Click "是误报" for first anomaly
    fireEvent.click(fpButtons[0]);
    expect(fpButtons[0]).toHaveClass('bg-warning-50');
    expect(fpButtons[0]).toHaveClass('text-warning-600');

    // Click "非误报" for first anomaly — should switch
    fireEvent.click(taButtons[0]);
    expect(taButtons[0]).toHaveClass('bg-success-500/10');
    expect(taButtons[0]).toHaveClass('text-success-600');
    expect(fpButtons[0]).not.toHaveClass('bg-warning-50');
  });

  it('shows comment input for each anomaly', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const commentInputs = screen.getAllByPlaceholderText('请输入备注（可选）');
    expect(commentInputs.length).toBe(2);
  });

  it('enables save button only when all anomalies are evaluated', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    const saveButton = screen.getByRole('button', { name: '保存' });
    expect(saveButton).toBeDisabled();

    // Evaluate first anomaly
    const fpButtons = screen.getAllByRole('button', { name: '是误报' });
    fireEvent.click(fpButtons[0]);
    expect(saveButton).toBeDisabled();

    // Evaluate second anomaly
    fireEvent.click(fpButtons[1]);
    expect(saveButton).toBeEnabled();
  });

  it('saves evaluations to localStorage and updates list status', () => {
    // Clean up any existing draft
    localStorage.removeItem('inspection-review-report-1');

    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // report-1 should be "待评价" initially
    const pendingBadgesBefore = screen.getAllByText('待评价').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(pendingBadgesBefore.length).toBe(2);

    // Open dialog for report-1
    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    // Evaluate both anomalies
    const fpButtons = screen.getAllByRole('button', { name: '是误报' });
    fireEvent.click(fpButtons[0]);
    fireEvent.click(fpButtons[1]);

    // Click save
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    // Dialog should close
    expect(screen.queryByText('5G用户渗透率')).not.toBeInTheDocument();

    // localStorage should have the draft
    const saved = localStorage.getItem('inspection-review-report-1');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed['anom-1']).toEqual({ isFalsePositive: true });
    expect(parsed['anom-2']).toEqual({ isFalsePositive: true });

    // List should show "已保存" for report-1
    const savedBadges = screen.getAllByText('已保存').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(savedBadges.length).toBe(1);

    // Clean up
    localStorage.removeItem('inspection-review-report-1');
  });

  it('disables evaluation for submitted reports and shows results', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Open dialog for report-5 (submitted status, 3 anomalies)
    // report-5 is the last row
    const detailButtons = screen.getAllByRole('button', { name: '查看详情' });
    fireEvent.click(detailButtons[detailButtons.length - 1]);

    // Should show evaluated result (anom-4 is non-false-positive)
    const taButton = screen.getByRole('button', { name: '非误报' });
    expect(taButton).toBeDisabled();
    expect(taButton).toHaveClass('bg-success-500/10');

    const fpButton = screen.getByRole('button', { name: '是误报' });
    expect(fpButton).toBeDisabled();

    // Should show comment
    expect(screen.getByText('季节性波动，非真实异常')).toBeInTheDocument();

    // Save button should not exist
    expect(screen.queryByRole('button', { name: '保存' })).not.toBeInTheDocument();
  });

  it('submits saved report: status changes to submitted, draft cleared', () => {
    // Pre-populate localStorage so report-1 is 'saved'
    localStorage.setItem('inspection-review-report-1', JSON.stringify({
      'anom-1': { isFalsePositive: true, comment: '假异常' },
      'anom-2': { isFalsePositive: false, comment: '确认异常' },
    }));

    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // report-1 should show "已保存" badge and "提交" button
    const savedBadgesBefore = screen.getAllByText('已保存').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(savedBadgesBefore.length).toBe(1);

    const submitButtons = screen.getAllByRole('button', { name: '提交' });
    expect(submitButtons.length).toBe(1);

    // Click submit
    fireEvent.click(submitButtons[0]);

    // Status should change to "已提交"
    const submittedBadges = screen.getAllByText('已提交').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(submittedBadges.length).toBe(2); // report-1 + report-5

    // Submit button should disappear
    expect(screen.queryByRole('button', { name: '提交' })).not.toBeInTheDocument();

    // localStorage draft should be cleared
    expect(localStorage.getItem('inspection-review-report-1')).toBeNull();
  });

  it('updates anomaly evaluations and report score after submit', () => {
    localStorage.setItem('inspection-review-report-1', JSON.stringify({
      'anom-1': { isFalsePositive: true },
      'anom-2': { isFalsePositive: false },
    }));

    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '提交' }));

    // Anomaly evaluations should be set in memory
    expect(mockAnomalyItems[0].evaluation).toEqual({ isFalsePositive: true });
    expect(mockAnomalyItems[1].evaluation).toEqual({ isFalsePositive: false });

    // Report score should be updated (1 false positive out of 2 = 0.5 rate)
    expect(mockInspectionReports[0].score?.falsePositiveRate).toBe(0.5);
    expect(mockInspectionReports[0].businessReview?.status).toBe('submitted');
  });

  it('opens dialog after submit and shows read-only evaluations', () => {
    localStorage.setItem('inspection-review-report-1', JSON.stringify({
      'anom-1': { isFalsePositive: true, comment: '测试备注1' },
      'anom-2': { isFalsePositive: false, comment: '测试备注2' },
    }));

    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Submit
    fireEvent.click(screen.getByRole('button', { name: '提交' }));

    // Open dialog
    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    // Buttons should be disabled
    const fpButton = screen.getAllByRole('button', { name: '是误报' })[0];
    expect(fpButton).toBeDisabled();

    // Comments should be displayed
    expect(screen.getByText('测试备注1')).toBeInTheDocument();
    expect(screen.getByText('测试备注2')).toBeInTheDocument();

    // Save button should not exist
    expect(screen.queryByRole('button', { name: '保存' })).not.toBeInTheDocument();
  });

  it('integration: full save-then-submit flow updates all data', () => {
    render(
      <BrowserRouter>
        <InspectionTodoPage />
      </BrowserRouter>
    );

    // Step 1: Open report-1 detail (first row)
    fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]);

    // Step 2: Evaluate both anomalies
    const fpButtons = screen.getAllByRole('button', { name: '是误报' });
    fireEvent.click(fpButtons[0]);
    fireEvent.click(fpButtons[1]);

    // Step 3: Add comments
    const commentInputs = screen.getAllByPlaceholderText('请输入备注（可选）');
    fireEvent.change(commentInputs[0], { target: { value: '确认误报' } });
    fireEvent.change(commentInputs[1], { target: { value: '真实异常' } });

    // Step 4: Save
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(screen.queryByText('5G用户渗透率')).not.toBeInTheDocument();

    // Step 5: Verify list shows "已保存" and submit button
    const savedBadges = screen.getAllByText('已保存').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(savedBadges.length).toBe(1);
    expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument();

    // Step 6: Submit
    fireEvent.click(screen.getByRole('button', { name: '提交' }));

    // Step 7: Verify list shows "已提交", submit button gone
    const submittedBadges = screen.getAllByText('已提交').filter(
      (el) => el.tagName.toLowerCase() === 'span'
    );
    expect(submittedBadges.length).toBe(2); // report-1 + report-5
    expect(screen.queryByRole('button', { name: '提交' })).not.toBeInTheDocument();

    // Step 8: Verify mock data updated (NOC side will see this)
    expect(mockAnomalyItems[0].evaluation).toEqual({
      isFalsePositive: true,
      comment: '确认误报',
    });
    expect(mockAnomalyItems[1].evaluation).toEqual({
      isFalsePositive: true,
      comment: '真实异常',
    });
    expect(mockInspectionReports[0].businessReview?.status).toBe('submitted');
    expect(mockInspectionReports[0].score?.falsePositiveRate).toBe(1); // 2/2 are false positive

    // Step 9: localStorage cleared
    expect(localStorage.getItem('inspection-review-report-1')).toBeNull();
  });
});
