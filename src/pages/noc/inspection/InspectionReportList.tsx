import { useState, useMemo } from 'react';
import { Eye, Download, Archive, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import {
  type InspectionReport,
  type InspectionExecution,
  type InspectionPlan,
  formatReportStatus,
  getExecutionById,
  getPlanNameById,
  isThisWeek,
  isThisMonth,
  isInDateRange,
  type BusinessReview,
} from './mockData';

interface InspectionReportListProps {
  reports: InspectionReport[];
  executions: InspectionExecution[];
  plans: InspectionPlan[];
  onViewDetail: (reportId: string) => void;
  onArchive: (reportId: string) => void;
}

type PeriodFilter = 'all' | 'week' | 'month' | 'custom';
type StatusFilter = 'all' | 'normal' | 'anomalous' | 'resolved';
type ViewFilter = 'all' | 'current' | 'archived';

function BusinessReviewBadge({ review }: { review: BusinessReview }) {
  const config: Record<string, { text: string; className: string }> = {
    pending: { text: '待评价', className: 'bg-[#f8f9fb] text-[#9ba4b3]' },
    saved: { text: '评价中', className: 'bg-[#fffbeb] text-[#d97706]' },
    submitted: { text: '已反馈', className: 'bg-[#eef4ff] text-[#3478f6]' },
  };
  const { text, className } = config[review.status] || config.pending;
  return (
    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${className}`}>
      {text}
    </span>
  );
}

export default function InspectionReportList({
  reports,
  executions,
  plans,
  onViewDetail,
  onArchive,
}: InspectionReportListProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // 视图筛选
      let viewMatch = true;
      if (viewFilter === 'current') {
        viewMatch = report.status !== 'resolved';
      } else if (viewFilter === 'archived') {
        viewMatch = report.status === 'resolved';
      }

      // 周期筛选
      let periodMatch = true;
      if (periodFilter === 'week') {
        periodMatch = isThisWeek(report.createdAt);
      } else if (periodFilter === 'month') {
        periodMatch = isThisMonth(report.createdAt);
      } else if (periodFilter === 'custom') {
        if (customStart && customEnd) {
          periodMatch = isInDateRange(report.createdAt, customStart, customEnd);
        } else {
          periodMatch = true;
        }
      }

      // 状态筛选
      let statusMatch = true;
      if (statusFilter !== 'all') {
        statusMatch = report.status === statusFilter;
      }

      return viewMatch && periodMatch && statusMatch;
    });
  }, [reports, viewFilter, periodFilter, statusFilter, customStart, customEnd]);

  const periodButtons: { value: PeriodFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'custom', label: '自定义' },
  ];

  const statusButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'normal', label: '正常' },
    { value: 'anomalous', label: '异常' },
    { value: 'resolved', label: '已处理' },
  ];

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 space-y-3">
        {/* 视图筛选 */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#f1f3f6]">
          <span className="text-[13px] text-[#6b7789] shrink-0">报告视图：</span>
          <div className="flex gap-1.5">
            {[
              { value: 'all' as ViewFilter, label: '全部报告' },
              { value: 'current' as ViewFilter, label: '当前报告' },
              { value: 'archived' as ViewFilter, label: '历史归档' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setViewFilter(btn.value)}
                className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                  viewFilter === btn.value
                    ? 'bg-[#3478f6] text-white'
                    : 'bg-[#f8f9fb] text-[#4a5568] hover:bg-[#eef4ff]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* 周期筛选 */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#6b7789] shrink-0">巡检周期：</span>
          <div className="flex gap-1.5">
            {periodButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setPeriodFilter(btn.value)}
                className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                  periodFilter === btn.value
                    ? 'bg-[#3478f6] text-white'
                    : 'bg-[#f8f9fb] text-[#4a5568] hover:bg-[#eef4ff]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* 自定义日期范围 */}
        {periodFilter === 'custom' && (
          <div className="flex items-center gap-3 pl-[76px]">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="text-[13px] border border-[#e8ecf1] rounded px-2 py-1.5 text-[#4a5568] focus:outline-none focus:border-[#3478f6]"
            />
            <span className="text-[13px] text-[#9ba4b3]">至</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="text-[13px] border border-[#e8ecf1] rounded px-2 py-1.5 text-[#4a5568] focus:outline-none focus:border-[#3478f6]"
            />
          </div>
        )}

        {/* 状态筛选 */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#6b7789] shrink-0">报告状态：</span>
          <div className="flex gap-1.5">
            {statusButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                  statusFilter === btn.value
                    ? 'bg-[#3478f6] text-white'
                    : 'bg-[#f8f9fb] text-[#4a5568] hover:bg-[#eef4ff]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 报告卡片列表 */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-10 text-center">
          <FileText size={32} className="mx-auto text-[#9ba4b3] mb-3" />
          <div className="text-[15px] text-[#6b7789] mb-1">未找到匹配的报告</div>
          <div className="text-[13px] text-[#9ba4b3]">请调整筛选条件后重试</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const execution = getExecutionById(report.executionId, executions);
            const planName = getPlanNameById(report.planId, plans) || '未知计划';
            const statusInfo = formatReportStatus(report);
            const isArchived = report.status === 'resolved';

            return (
              <div
                key={report.id}
                data-testid="report-card"
                className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 flex flex-col"
              >
                {/* 头部：计划名称 + 状态 */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[14px] font-medium text-[#1a202c] leading-tight pr-2">
                    {planName}
                  </h3>
                  <div className="flex flex-col items-end gap-1" data-testid="report-status">
                    <span data-testid="report-main-status">
                      <StatusBadge text={statusInfo.text} type={statusInfo.badge} />
                    </span>
                    {report.businessReview && (
                      <BusinessReviewBadge review={report.businessReview} />
                    )}
                  </div>
                </div>

                {/* 巡检时间 */}
                <div className="text-[12px] text-[#9ba4b3] mb-3">
                  {new Date(report.createdAt).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                {/* 指标数 + 异常数 + 评价进度 */}
                <div className="flex gap-4 mb-4">
                  <div>
                    <div className="text-[11px] text-[#9ba4b3]">覆盖指标</div>
                    <div className="text-[18px] font-semibold text-[#1a202c]">
                      {execution?.indicatorCount ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#9ba4b3]">异常数</div>
                    <div
                      className={`text-[18px] font-semibold ${
                        (execution?.anomalyCount ?? 0) > 0
                          ? 'text-[#dc2626]'
                          : 'text-[#1a202c]'
                      }`}
                    >
                      {execution?.anomalyCount ?? 0}
                    </div>
                  </div>
                  {report.businessReview && (
                    <div>
                      <div className="text-[11px] text-[#9ba4b3]">评价进度</div>
                      <div className="text-[18px] font-semibold text-[#1a202c]">
                        {report.businessReview.evaluatedCount}/{report.businessReview.totalCount}
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作栏 */}
                <div className="mt-auto pt-3 border-t border-[#f1f3f6] flex items-center gap-2">
                  {isArchived && (
                    <span className="text-[12px] text-[#9ba4b3] px-2 py-1 bg-[#f8f9fb] rounded">
                      已归档
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[12px] h-7 px-2 border-[#e8ecf1] text-[#3478f6] hover:bg-[#eef4ff]"
                    onClick={() => onViewDetail(report.id)}
                  >
                    <Eye size={13} className="mr-1" />
                    查看详情
                  </Button>
                  {!isArchived && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[12px] h-7 px-2 border-[#e8ecf1] text-[#6b7789] hover:bg-[#f8f9fb]"
                        disabled
                      >
                        <Download size={13} className="mr-1" />
                        下载
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[12px] h-7 px-2 border-[#e8ecf1] text-[#6b7789] hover:text-[#f59e0b] hover:bg-[#fffbeb]"
                        onClick={() => onArchive(report.id)}
                      >
                        <Archive size={13} className="mr-1" />
                        归档
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
