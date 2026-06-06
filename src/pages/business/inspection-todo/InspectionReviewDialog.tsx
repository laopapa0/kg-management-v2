import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { InspectionReport, AnomalyItem, EvaluationMap } from '@/pages/noc/inspection/mockData';
import { getDeviationColor, getDeviationBg, formatReportStatus, getExecutionById } from '@/pages/noc/inspection/mockData';
import LineageMiniCanvas from '@/pages/noc/inspection/LineageMiniCanvas';

interface InspectionReviewDialogProps {
  report: InspectionReport | null;
  anomalies: AnomalyItem[];
  open: boolean;
  onClose: () => void;
  onSave?: (evaluations: EvaluationMap) => void;
}

export default function InspectionReviewDialog({
  report,
  anomalies,
  open,
  onClose,
  onSave,
}: InspectionReviewDialogProps) {
  const [evaluations, setEvaluations] = useState<EvaluationMap>({});
  const [selectedTrendIndex, setSelectedTrendIndex] = useState(0);

  const trends = useMemo(() => {
    return anomalies
      .filter((a) => a.trendData)
      .map((a) => ({
        indicatorId: a.indicatorId,
        indicatorName: a.indicatorName,
        unit: a.trendData!.unit,
        data: a.trendData!.data,
      }));
  }, [anomalies]);

  // Reset evaluations when dialog opens with new report
  useEffect(() => {
    if (!open || !report) return;
    const initial: EvaluationMap = {};
    for (const a of anomalies) {
      if (a.evaluation) {
        initial[a.id] = { isFalsePositive: a.evaluation.isFalsePositive, comment: a.evaluation.comment };
      }
    }
    setEvaluations(initial);
    setSelectedTrendIndex(0);
  }, [open, report?.id]);

  if (!report) return null;

  const totalCount = anomalies.length;
  const evaluatedCount = anomalies.filter((a) => evaluations[a.id] !== undefined).length;
  const pendingCount = totalCount - evaluatedCount;
  const isReadOnly = report.businessReview?.status === 'submitted';
  const statusInfo = formatReportStatus(report);
  const score = report.score;
  const execution = getExecutionById(report.executionId);

  const statusClass: Record<string, string> = {
    success: 'bg-[#ecfdf5] text-[#059669]',
    error: 'bg-[#fef2f2] text-[#dc2626]',
    primary: 'bg-[#eef4ff] text-[#3478f6]',
  };

  const handleSelect = (anomalyId: string, isFalsePositive: boolean) => {
    if (isReadOnly) return;
    setEvaluations((prev) => ({
      ...prev,
      [anomalyId]: { isFalsePositive, comment: prev[anomalyId]?.comment },
    }));
  };

  const handleCommentChange = (anomalyId: string, comment: string) => {
    if (isReadOnly) return;
    setEvaluations((prev) => {
      if (!prev[anomalyId]) return prev;
      return { ...prev, [anomalyId]: { ...prev[anomalyId], comment } };
    });
  };

  const handleSave = () => {
    onSave?.(evaluations);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[720px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-[#f1f3f6]">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-[16px] font-semibold text-[#1a202c]">
              {report.name}
            </DialogTitle>
            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${statusClass[statusInfo.badge]}`}>
              {statusInfo.text}
            </span>
          </div>
          <DialogDescription asChild>
            <div className="text-[13px] text-[#9ba4b3] mt-1 space-y-0.5">
              <div>
                生成时间：
                {new Date(report.createdAt).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div>巡检周期：{report.overview.period}</div>
              <div>覆盖范围：{report.overview.scope}</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* 概览卡片 */}
        <div className="px-5 py-4 grid grid-cols-4 gap-3" data-testid="noc-overview-cards">
          <div className="bg-[#f8f9fb] rounded-lg p-3">
            <div className="text-[11px] text-[#9ba4b3] mb-1">巡检周期</div>
            <div className="text-[13px] font-medium text-[#1a202c]">{report.overview.period}</div>
          </div>
          <div className="bg-[#f8f9fb] rounded-lg p-3">
            <div className="text-[11px] text-[#9ba4b3] mb-1">覆盖范围</div>
            <div className="text-[13px] font-medium text-[#1a202c]">{report.overview.scope}</div>
          </div>
          <div className="bg-[#f8f9fb] rounded-lg p-3">
            <div className="text-[11px] text-[#9ba4b3] mb-1">覆盖指标数</div>
            <div className="text-[13px] font-medium text-[#1a202c]">{execution?.indicatorCount ?? 0} 个</div>
          </div>
          <div className="bg-[#f8f9fb] rounded-lg p-3">
            <div className="text-[11px] text-[#9ba4b3] mb-1">质量评分</div>
            <div className="text-[13px] font-medium text-[#3478f6]">{score ? `${score.overall.toFixed(1)} 分` : '—'}</div>
          </div>
        </div>

        {/* 质量评分详情 */}
        {score && (
          <div className="px-5 pb-4" data-testid="quality-score-detail">
            <div className="bg-white rounded-lg border border-[#e8ecf1] p-4">
              <div className="text-[14px] font-medium text-[#1a202c] mb-3">巡检质量评分</div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[#6b7789]">有效异常数</span>
                    <span className="text-[12px] font-medium text-[#1a202c]">{score.effectiveAnomalies.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-transparent rounded-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[#6b7789]">检测得分</span>
                    <span className="text-[12px] font-medium text-[#1a202c]">{(score.detectionScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[#f1f3f6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3478f6] rounded-full" style={{ width: `${score.detectionScore * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[#6b7789]">误报率</span>
                    <span className="text-[12px] font-medium text-[#1a202c]">{(score.falsePositiveRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[#f1f3f6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${score.falsePositiveRate * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[#6b7789]">综合评分</span>
                    <span className="text-[12px] font-medium text-[#3478f6]">{score.overall.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-[#f1f3f6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${score.overall}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-[#9ba4b3] space-y-0.5">
                <div>有效异常数 = 异常项数 × (1 − 误报率)</div>
                <div>检测得分 = min(有效异常数, 目标值) / 目标值</div>
                <div>综合评分 = 0.6 × 检测得分 + 0.4 × (1 − 误报率)</div>
              </div>
            </div>
          </div>
        )}

        {/* 异常统计 */}
        <div className="px-5 pb-4" data-testid="anomaly-stats-section">
          <div className="bg-white rounded-lg border border-[#e8ecf1] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[14px] font-medium text-[#1a202c]">异常统计</div>
              {report.overview.anomalyStats.total > 0 ? (
                <span className="text-[13px] text-[#dc2626] font-medium">
                  共 {report.overview.anomalyStats.total} 个异常
                </span>
              ) : (
                <span className="text-[13px] text-[#059669] font-medium">无异常</span>
              )}
            </div>
            {report.overview.anomalyStats.total > 0 && (
              <div className="text-[13px] text-[#6b7789]">
                本次巡检共发现 {report.overview.anomalyStats.total} 个异常指标，详见下方明细。
              </div>
            )}
          </div>
        </div>

        {/* 异常指标明细（纯展示） */}
        <div className="px-5 pb-4" data-testid="report-anomaly-table">
          <div className="text-[14px] font-medium text-[#1a202c] mb-3">异常指标明细</div>
          {anomalies.length === 0 ? (
            <div className="bg-[#f8f9fb] rounded-lg p-6 text-center">
              <div className="text-[13px] text-[#6b7789]">本次巡检未发现异常指标</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e8ecf1] overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#e8ecf1] bg-[#f8f9fb]">
                    <th className="px-3 py-2.5 text-left font-medium text-[#6b7789]">指标名称</th>
                    <th className="px-3 py-2.5 text-left font-medium text-[#6b7789]">编码</th>
                    <th className="px-3 py-2.5 text-right font-medium text-[#6b7789]">当前值</th>
                    <th className="px-3 py-2.5 text-right font-medium text-[#6b7789]">偏离度</th>
                    <th className="px-3 py-2.5 text-left font-medium text-[#6b7789]">命中规则</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((anom) => (
                    <tr key={anom.id} className="border-b border-[#f1f3f6] last:border-b-0">
                      <td className="px-3 py-2.5 font-medium text-[#1a202c]">{anom.indicatorName}</td>
                      <td className="px-3 py-2.5 text-[#6b7789]">{anom.indicatorCode}</td>
                      <td className="px-3 py-2.5 text-right text-[#1a202c]">{anom.currentValue}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${getDeviationColor(anom.deviation)} ${getDeviationBg(anom.deviation)}`}
                        >
                          {anom.deviation > 0 ? '+' : ''}{anom.deviation}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {anom.hitRules.map((rule) => (
                            <span
                              key={rule.ruleId}
                              className="px-1.5 py-0.5 rounded bg-[#eef4ff] text-[#3478f6] text-[11px]"
                            >
                              {rule.ruleName}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 趋势对比 */}
        {trends.length > 0 && (
          <div className="px-5 pb-4" data-testid="trend-comparison">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[14px] font-medium text-[#1a202c]">趋势对比</div>
              {trends.length > 1 && (
                <div className="flex gap-1.5">
                  {trends.map((t, i) => (
                    <button
                      key={t.indicatorId}
                      onClick={() => setSelectedTrendIndex(i)}
                      className={`px-2.5 py-1 rounded text-[12px] transition-colors ${
                        i === selectedTrendIndex
                          ? 'bg-[#3478f6] text-white'
                          : 'bg-[#f8f9fb] text-[#4a5568] hover:bg-[#eef4ff]'
                      }`}
                    >
                      {t.indicatorName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {trends[selectedTrendIndex] && (
              <div className="bg-white rounded-lg border border-[#e8ecf1] p-3" data-testid="trend-chart">
                <div className="text-[12px] text-[#9ba4b3] mb-2">
                  {trends[selectedTrendIndex].indicatorName}（单位：{trends[selectedTrendIndex].unit}）
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trends[selectedTrendIndex].data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7789' }} axisLine={{ stroke: '#e8ecf1' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7789' }} axisLine={{ stroke: '#e8ecf1' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e8ecf1' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="current" name="当前周期" stroke="#3478f6" strokeWidth={2} dot={{ r: 3, fill: '#3478f6' }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="previous" name="上一周期" stroke="#9ba4b3" strokeWidth={2} dot={{ r: 3, fill: '#9ba4b3' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* 血缘影响面 */}
        <div className="px-5 pb-4" data-testid="lineage-impact">
          <div className="text-[14px] font-medium text-[#1a202c] mb-3">血缘影响面</div>
          {anomalies.some((a) => a.lineage) ? (
            <div className="space-y-3">
              {anomalies.map((anom) =>
                anom.lineage ? (
                  <div key={anom.id}>
                    <div className="text-[12px] text-[#6b7789] mb-1">{anom.indicatorName}</div>
                    <LineageMiniCanvas nodes={anom.lineage.nodes} edges={anom.lineage.edges} />
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <div className="bg-[#f8f9fb] rounded-lg p-8 text-center">
              <div className="text-[13px] text-[#6b7789]">暂无血缘数据</div>
            </div>
          )}
        </div>

        {/* 处置建议 */}
        {anomalies.some((a) => a.suggestion) && (
          <div className="px-5 pb-4" data-testid="disposal-suggestions">
            <div className="text-[14px] font-medium text-[#1a202c] mb-3">处置建议</div>
            <div className="space-y-3">
              {anomalies.map((anom) => {
                if (!anom.suggestion) return null;
                return (
                  <div key={anom.id} className="bg-white rounded-lg border border-[#e8ecf1] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px] font-medium text-[#1a202c]">{anom.indicatorName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          anom.suggestion.source === 'llm'
                            ? 'bg-[#f3f0ff] text-[#7c5cfc]'
                            : 'bg-[#eef4ff] text-[#3478f6]'
                        }`}
                      >
                        {anom.suggestion.source === 'llm' ? 'AI 生成' : '知识库'}
                      </span>
                    </div>
                    {anom.suggestion.knowledgeBases.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[11px] text-[#9ba4b3] mb-1">相关知识库</div>
                        <div className="flex flex-wrap gap-1.5">
                          {anom.suggestion.knowledgeBases.map((kb, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded bg-[#f8f9fb] text-[#6b7789] border border-[#e8ecf1]"
                            >
                              {kb}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-[12px] text-[#4a5568] leading-relaxed bg-[#f8f9fb] rounded p-2.5">
                      {anom.suggestion.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 异常项表格 */}
        <div className="px-5 pb-5" data-testid="evaluation-table">
          <div className="text-[14px] font-medium text-[#1a202c] mb-3">异常项评价</div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e8ecf1] bg-[#f8f9fb]">
                <th className="px-3 py-2 text-left font-medium text-[#6b7789]">指标名称</th>
                <th className="px-3 py-2 text-left font-medium text-[#6b7789]">编码</th>
                <th className="px-3 py-2 text-right font-medium text-[#6b7789]">当前值</th>
                <th className="px-3 py-2 text-right font-medium text-[#6b7789]">偏离度</th>
                <th className="px-3 py-2 text-left font-medium text-[#6b7789]">命中规则</th>
                <th className="px-3 py-2 text-left font-medium text-[#6b7789]">评价</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((anomaly) => {
                const evaluation = evaluations[anomaly.id];
                return (
                  <tr key={anomaly.id} className="border-b border-[#f1f3f6] last:border-b-0">
                    <td className="px-3 py-2.5 font-medium text-[#1a202c]">{anomaly.indicatorName}</td>
                    <td className="px-3 py-2.5 text-[#6b7789]">{anomaly.indicatorCode}</td>
                    <td className="px-3 py-2.5 text-right text-[#1a202c]">{anomaly.currentValue}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${getDeviationColor(anomaly.deviation)}`}>
                      {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}%
                    </td>
                    <td className="px-3 py-2.5 text-[#6b7789]">
                      {anomaly.hitRules.map((r) => r.ruleName).join('、') || '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <EvalButton
                          label="是误报"
                          selected={evaluation?.isFalsePositive === true}
                          activeClass="bg-[#fff7ed] border-[#fdba74] text-[#ea580c]"
                          inactiveClass="border-[#e8ecf1] text-[#6b7789] hover:border-[#d1d5db]"
                          disabled={isReadOnly}
                          onClick={() => handleSelect(anomaly.id, true)}
                        />
                        <EvalButton
                          label="非误报"
                          selected={evaluation?.isFalsePositive === false}
                          activeClass="bg-[#ecfdf5] border-[#6ee7b7] text-[#059669]"
                          inactiveClass="border-[#e8ecf1] text-[#6b7789] hover:border-[#d1d5db]"
                          disabled={isReadOnly}
                          onClick={() => handleSelect(anomaly.id, false)}
                        />
                      </div>
                      {!isReadOnly && (
                        <textarea
                          placeholder="请输入备注（可选）"
                          rows={2}
                          value={evaluation?.comment ?? ''}
                          onChange={(e) => handleCommentChange(anomaly.id, e.target.value)}
                          className="w-full mt-1.5 px-2 py-1 text-[12px] border border-[#e8ecf1] rounded
                                     resize-none focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]
                                     placeholder:text-[#9ba4b3]"
                        />
                      )}
                      {isReadOnly && evaluation?.comment && (
                        <div className="mt-1.5 text-[12px] text-[#6b7789]">{evaluation.comment}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-[#f1f3f6]">
          {!isReadOnly && (
            <button
              disabled={evaluatedCount < totalCount}
              onClick={handleSave}
              className={`px-4 py-2 text-[13px] rounded-lg font-medium transition-colors
                ${evaluatedCount < totalCount
                  ? 'bg-[#f1f5f9] text-[#9ba4b3] cursor-not-allowed'
                  : 'bg-[#3b82f6] text-white hover:bg-[#2563eb] cursor-pointer'
                }`}
            >
              保存
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  testId,
  valueClass,
  suffix,
}: {
  label: string;
  value: number;
  testId?: string;
  valueClass?: string;
  suffix?: string;
}) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg p-3 text-center" data-testid={testId}>
      <div className={`text-[20px] font-semibold ${valueClass || 'text-[#1a202c]'}`}>
        {value}{suffix ?? ''}
      </div>
      <div className="text-[12px] text-[#6b7789] mt-0.5">{label}</div>
    </div>
  );
}

function EvalButton({
  label,
  selected,
  activeClass,
  inactiveClass,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  activeClass: string;
  inactiveClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`text-[11px] px-2 py-1 rounded border transition-colors
        ${selected ? activeClass : inactiveClass}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {label}
    </button>
  );
}
