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
  pending: { text: '待评价', className: 'bg-[#f8f9fb] text-[#9ba4b3]' },
  saved: { text: '已保存', className: 'bg-[#fffbeb] text-[#d97706]' },
  submitted: { text: '已提交', className: 'bg-[#ecfdf5] text-[#059669]' },
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
    <div className="flex items-center gap-1 bg-[#f8f9fb] rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-[13px] rounded-md font-medium transition-colors
            ${value === opt.value ? 'bg-white text-[#1a202c] shadow-sm' : 'text-[#6b7789] hover:text-[#1a202c]'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

  return (
    <div className="p-6">
      <h1 className="text-[20px] font-semibold text-[#1a202c] mb-6">巡检待办</h1>

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ba4b3]" size={16} />
          <input
            type="text"
            placeholder="搜索报告名称或巡检周期"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#e8ecf1] rounded-lg
                       focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]
                       placeholder:text-[#9ba4b3]"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e8ecf1] overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#e8ecf1] bg-[#f8f9fb]">
              <th className="px-4 py-3 text-left font-medium text-[#6b7789]">报告名称</th>
              <th className="px-4 py-3 text-left font-medium text-[#6b7789]">巡检周期</th>
              <th className="px-4 py-3 text-right font-medium text-[#6b7789]">异常数</th>
              <th className="px-4 py-3 text-right font-medium text-[#6b7789]">待评价数</th>
              <th className="px-4 py-3 text-left font-medium text-[#6b7789]">状态</th>
              <th className="px-4 py-3 text-left font-medium text-[#6b7789]">操作</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const reviewStatus = report.businessReview?.status ?? 'pending';
              const badge = getStatusBadge(reviewStatus);

              return (
                <tr key={report.id} className="border-b border-[#f1f3f6] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-[#1a202c]">{report.name}</td>
                  <td className="px-4 py-3 text-[#6b7789]">{report.overview.period}</td>
                  <td className="px-4 py-3 text-right text-[#1a202c]">{report.overview.anomalyStats.total}</td>
                  <td className="px-4 py-3 text-right text-[#1a202c]">
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
                        className="text-[12px] px-2.5 py-1 rounded border border-[#e8ecf1] text-[#3b82f6]
                                   hover:bg-[#f0f7ff] transition-colors"
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
                          className="text-[12px] px-2.5 py-1 rounded bg-[#3b82f6] text-white
                                     hover:bg-[#2563eb] transition-colors"
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
