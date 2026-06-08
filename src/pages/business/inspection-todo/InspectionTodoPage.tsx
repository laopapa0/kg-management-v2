import { useMemo, useState } from 'react';
import type { BusinessReview } from '@/pages/noc/inspection/mockData';
import {
  mockInspectionReports,
  evaluateReportStatus,
  getAnomaliesByReportId,
  submitReportEvaluation,
} from '@/pages/noc/inspection/mockData';
import { useReviewDraft } from '@/pages/noc/inspection/useReviewDraft';
import { Search } from 'lucide-react';
import InspectionReviewDialog from './InspectionReviewDialog';

type StatusFilter = 'all' | BusinessReview['status'];
type TimeFilter = 'all' | 'thisWeek' | 'thisMonth';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待评价' },
  { value: 'saved', label: '已保存' },
  { value: 'submitted', label: '已提交' },
];

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: '全部时间' },
  { value: 'thisWeek', label: '本周' },
  { value: 'thisMonth', label: '本月' },
];

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // 1=Mon, 7=Sun
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
}

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function InspectionTodoPage() {
  const { load, save, clear } = useReviewDraft();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reports = useMemo(() => {
    return mockInspectionReports
      .filter((r) => r.overview.anomalyStats.total > 0)
      .map((report) => {
        const anomalies = getAnomaliesByReportId(report.id);
        const draft = load(report.id);
        // 已提交状态不可被草稿覆盖；否则用 draft 重新计算评价状态
        const review =
          report.businessReview?.status === 'submitted'
            ? report.businessReview
            : evaluateReportStatus(anomalies, draft);
        return { ...report, businessReview: review };
      })
      .filter((report) => {
        const reviewStatus = report.businessReview?.status ?? 'pending';
        if (statusFilter !== 'all' && reviewStatus !== statusFilter) return false;
        if (timeFilter === 'thisWeek' && !isThisWeek(report.createdAt)) return false;
        if (timeFilter === 'thisMonth' && !isThisMonth(report.createdAt)) return false;
        if (!searchKeyword.trim()) return true;
        const keyword = searchKeyword.toLowerCase();
        const period = report.overview.period.toLowerCase();
        // 将 2026-05-19 格式转换为 2026年5月19日，支持中文月份搜索
        const periodChinese = period.replace(/(\d{4})-0?(\d+)-0?(\d+)/g, '$1年$2月$3日');
        return (
          report.name.toLowerCase().includes(keyword) ||
          period.includes(keyword) ||
          periodChinese.includes(keyword)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [load, searchKeyword, statusFilter, timeFilter, refreshKey]);

const STATUS_BADGE_CONFIG: Record<string, { text: string; className: string }> = {
  pending: { text: '待评价', className: 'bg-dark-page text-dark-text-tertiary' },
  saved: { text: '已保存', className: 'bg-warning-500/10 text-warning-600' },
  submitted: { text: '已提交', className: 'bg-success-500/10 text-success-600' },
};

function getStatusBadge(status: string) {
  return STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.pending;
}

function FilterButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-dark-page rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-[13px] rounded-md font-medium transition-colors
            ${value === opt.value ? 'bg-dark-elevated text-dark-text-primary shadow-sm' : 'text-dark-text-secondary hover:text-dark-text-primary'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

  return (
    <div className="p-6">
      <h1 className="text-[20px] font-semibold text-dark-text-primary mb-6">巡检待办</h1>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterButtonGroup
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterButtonGroup
          options={TIME_OPTIONS}
          value={timeFilter}
          onChange={setTimeFilter}
        />
        <div className="relative max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="搜索报告名称或巡检周期"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-dark-border rounded-lg
                       focus:outline-none focus:ring-1 focus:ring-dark-accent-primary focus:border-dark-accent-primary
                       placeholder:text-dark-text-tertiary"
          />
        </div>
      </div>

      <div className="bg-dark-elevated rounded-lg border border-dark-border overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-dark-border bg-dark-page">
              <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">报告名称</th>
              <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">巡检周期</th>
              <th className="px-4 py-3 text-right font-medium text-dark-text-secondary">异常数</th>
              <th className="px-4 py-3 text-right font-medium text-dark-text-secondary">待评价数</th>
              <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">状态</th>
              <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">操作</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const reviewStatus = report.businessReview?.status ?? 'pending';
              const badge = getStatusBadge(reviewStatus);

              return (
                <tr key={report.id} className="border-b border-dark-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-dark-text-primary">{report.name}</td>
                  <td className="px-4 py-3 text-dark-text-secondary">{report.overview.period}</td>
                  <td className="px-4 py-3 text-right text-dark-text-primary">{report.overview.anomalyStats.total}</td>
                  <td className="px-4 py-3 text-right text-dark-text-primary">
                    {(report.businessReview?.totalCount ?? 0) - (report.businessReview?.evaluatedCount ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-1 rounded font-medium ${badge.className}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReportId(report.id)}
                        className="text-[12px] px-2.5 py-1 rounded border border-dark-border text-info-500
                                   hover:bg-dark-accent-primary/10 transition-colors"
                      >
                        查看详情
                      </button>
                      {reviewStatus === 'saved' && (
                        <button
                          onClick={() => {
                            const draft = load(report.id);
                            submitReportEvaluation(report.id, draft, { clearDraft: clear });
                            setRefreshKey((k) => k + 1);
                          }}
                          className="text-[12px] px-2.5 py-1 rounded bg-dark-accent-primary text-white
                                     hover:bg-dark-accent-primary transition-colors"
                        >
                          提交
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <InspectionReviewDialog
        report={reports.find((r) => r.id === selectedReportId) ?? null}
        anomalies={selectedReportId ? getAnomaliesByReportId(selectedReportId) : []}
        open={!!selectedReportId}
        onClose={() => setSelectedReportId(null)}
        onSave={(evaluations) => {
          if (selectedReportId) {
            save(selectedReportId, evaluations);
            setRefreshKey((k) => k + 1);
          }
        }}
      />
    </div>
  );
}
