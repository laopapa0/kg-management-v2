import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import LineageMiniCanvas from './LineageMiniCanvas';
import { generateSuggestion, type SuggestionResult } from '@/services/llmService';
import {
  type InspectionReport,
  type InspectionExecution,
  type InspectionPlan,
  type AnomalyItem,
  type IndicatorTrend,
  type LineageNode,
  type LineageEdge,
  formatReportStatus,
  getDeviationColor,
  getDeviationBg,
  getKnowledgeDocsForIndicator,
} from './mockData';

interface InspectionReportDetailProps {
  report: InspectionReport | null;
  execution: InspectionExecution | null;
  plan: InspectionPlan | null;
  anomalies: AnomalyItem[];
  trends: IndicatorTrend[];
  lineage: { nodes: LineageNode[]; edges: LineageEdge[] } | null;
  open: boolean;
  onClose: () => void;
}

export default function InspectionReportDetail({
  report,
  execution,
  plan,
  anomalies,
  trends,
  lineage,
  open,
  onClose,
}: InspectionReportDetailProps) {
  const [selectedTrendIndex, setSelectedTrendIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Record<string, SuggestionResult>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pushSent, setPushSent] = useState(false);

  // 异步加载处置建议
  useEffect(() => {
    if (!anomalies.length) {
      setSuggestions({});
      return;
    }
    setLoadingSuggestions(true);
    setPushSent(false);

    const load = async () => {
      const results: Record<string, SuggestionResult> = {};
      for (const anom of anomalies) {
        const docs = getKnowledgeDocsForIndicator(anom.indicatorName);
        const result = await generateSuggestion(
          anom.indicatorName,
          anom.hitRules.map((r) => r.ruleName),
          docs
        );
        results[anom.id] = result;
      }
      setSuggestions(results);
      setLoadingSuggestions(false);
    };

    load();
  }, [anomalies]);

  if (!report) return null;

  const statusInfo = formatReportStatus(report);
  const planName = plan?.name || '未知计划';
  const currentTrend = trends[selectedTrendIndex];
  const score = report.score;

  const handlePush = () => {
    setPushSent(true);
    setTimeout(() => setPushSent(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[720px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-[#f1f3f6]">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-[16px] font-semibold text-[#1a202c]">
              巡检报告 — {planName}
            </DialogTitle>
            <StatusBadge text={statusInfo.text} type={statusInfo.badge} />
          </div>
          <DialogDescription className="text-[13px] text-[#9ba4b3] mt-1">
            巡检时间：{new Date(report.createdAt).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </DialogDescription>
        </DialogHeader>

        {/* 内容区域 */}
        <div className="px-5 py-4 space-y-0">
          {/* 概览区域 */}
          <div className="grid grid-cols-4 gap-3">
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
              <div className="text-[13px] font-medium text-[#1a202c]">
                {execution?.indicatorCount ?? 0} 个
              </div>
            </div>
            <div className="bg-[#f8f9fb] rounded-lg p-3">
              <div className="text-[11px] text-[#9ba4b3] mb-1">质量评分</div>
              <div className="text-[13px] font-medium text-[#3478f6]">
                {score ? `${score.overall.toFixed(1)} 分` : '—'}
              </div>
            </div>
          </div>

          {/* 质量评分详情 */}
          {score && (
            <div className="bg-white rounded-lg border border-[#e8ecf1] p-4 mt-4">
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
                    <div
                      className="h-full bg-[#3478f6] rounded-full"
                      style={{ width: `${score.detectionScore * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[#6b7789]">误报率</span>
                    <span className="text-[12px] font-medium text-[#1a202c]">{(score.falsePositiveRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[#f1f3f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f59e0b] rounded-full"
                      style={{ width: `${score.falsePositiveRate * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[#6b7789]">综合评分</span>
                    <span className="text-[12px] font-medium text-[#3478f6]">{score.overall.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-[#f1f3f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10b981] rounded-full"
                      style={{ width: `${score.overall}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-[#9ba4b3] space-y-0.5">
                <div>有效异常数 = 异常项数 × (1 − 误报率)</div>
                <div>检测得分 = min(有效异常数, 目标值) / 目标值</div>
                <div>综合评分 = 0.6 × 检测得分 + 0.4 × (1 − 误报率)</div>
              </div>
            </div>
          )}

          {/* 异常统计 */}
          <div className="bg-white rounded-lg border border-[#e8ecf1] p-4 mt-4">
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

          {/* 异常指标明细 */}
          <div className="border-t border-[#f1f3f6] pt-4 mt-4">
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

          {/* 趋势对比图 */}
          {trends.length > 0 && (
            <div className="border-t border-[#f1f3f6] pt-4 mt-4">
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
              {currentTrend && (
                <div className="bg-white rounded-lg border border-[#e8ecf1] p-3" data-testid="trend-chart">
                  <div className="text-[12px] text-[#9ba4b3] mb-2">
                    {currentTrend.indicatorName}（单位：{currentTrend.unit}）
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={currentTrend.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f6" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7789' }} axisLine={{ stroke: '#e8ecf1' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7789' }} axisLine={{ stroke: '#e8ecf1' }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e8ecf1' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="current"
                        name="当前周期"
                        stroke="#3478f6"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#3478f6' }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="previous"
                        name="上一周期"
                        stroke="#9ba4b3"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#9ba4b3' }}
                      />

                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* 血缘影响面 */}
          <div className="border-t border-[#f1f3f6] pt-4 mt-4">
            <div className="text-[14px] font-medium text-[#1a202c] mb-3">血缘影响面</div>
            {lineage ? (
              <LineageMiniCanvas nodes={lineage.nodes} edges={lineage.edges} />
            ) : (
              <div className="bg-[#f8f9fb] rounded-lg p-8 text-center">
                <div className="text-[13px] text-[#6b7789]">暂无血缘数据</div>
              </div>
            )}
          </div>

          {/* 处置建议 */}
          {anomalies.length > 0 && (
            <div className="border-t border-[#f1f3f6] pt-4 mt-4">
              <div className="text-[14px] font-medium text-[#1a202c] mb-3">处置建议</div>
              {loadingSuggestions ? (
                <div className="bg-[#f8f9fb] rounded-lg p-6 text-center">
                  <div className="text-[13px] text-[#6b7789]">正在生成处置建议...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {anomalies.map((anom) => {
                    const suggestion = suggestions[anom.id];
                    const docs = getKnowledgeDocsForIndicator(anom.indicatorName);
                    return (
                      <div key={anom.id} className="bg-white rounded-lg border border-[#e8ecf1] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[13px] font-medium text-[#1a202c]">{anom.indicatorName}</span>
                          {suggestion && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                suggestion.source === 'llm'
                                  ? 'bg-[#f3f0ff] text-[#7c5cfc]'
                                  : 'bg-[#eef4ff] text-[#3478f6]'
                              }`}
                            >
                              {suggestion.source === 'llm' ? 'AI 生成' : '知识库'}
                            </span>
                          )}
                        </div>

                        {/* 知识库匹配 */}
                        {docs.length > 0 && (
                          <div className="mb-2">
                            <div className="text-[11px] text-[#9ba4b3] mb-1">相关知识库</div>
                            <div className="flex flex-wrap gap-1.5">
                              {docs.map((doc) => (
                                <span
                                  key={doc.id}
                                  className="text-[11px] px-2 py-0.5 rounded bg-[#f8f9fb] text-[#6b7789] border border-[#e8ecf1]"
                                >
                                  {doc.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 建议内容 */}
                        {suggestion && (
                          <div className="text-[12px] text-[#4a5568] leading-relaxed bg-[#f8f9fb] rounded p-2.5">
                            {suggestion.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 业务部门反馈 */}
          {anomalies.length > 0 && (
            <div className="border-t border-[#f1f3f6] pt-4 mt-4">
              <div className="text-[14px] font-medium text-[#1a202c] mb-3">业务部门反馈</div>
              {anomalies.some((a) => a.evaluation) ? (
                <div className="bg-white rounded-lg border border-[#e8ecf1] overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e8ecf1] bg-[#f8f9fb]">
                        <th className="px-3 py-2.5 text-left font-medium text-[#6b7789]">指标名称</th>
                        <th className="px-3 py-2.5 text-left font-medium text-[#6b7789]">编码</th>
                        <th className="px-3 py-2.5 text-left font-medium text-[#6b7789]">评价结果</th>
                        <th className="px-3 py-2.5 text-left font-medium text-[#6b7789]">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.map((anom) => (
                        anom.evaluation && (
                          <tr key={anom.id} className="border-b border-[#f1f3f6] last:border-b-0">
                            <td className="px-3 py-2.5 font-medium text-[#1a202c]">{anom.indicatorName}</td>
                            <td className="px-3 py-2.5 text-[#6b7789]">{anom.indicatorCode}</td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                                  anom.evaluation.isFalsePositive
                                    ? 'bg-[#fffbeb] text-[#d97706]'
                                    : 'bg-[#ecfdf5] text-[#059669]'
                                }`}
                              >
                                {anom.evaluation.isFalsePositive ? '误报' : '非误报'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-[#6b7789]">{anom.evaluation.comment || '—'}</td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-[#f8f9fb] rounded-lg p-6 text-center">
                  <div className="text-[13px] text-[#9ba4b3]">等待业务部门反馈</div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-[#f1f3f6] flex items-center justify-between">
          <div>
            {pushSent && (
              <span className="text-[13px] text-[#059669]">✓ 已成功推送报告至业务部门</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePush}
              className="text-[13px] border-[#e8ecf1] text-[#3478f6] hover:bg-[#eef4ff]"
            >
              推送报告至业务部门
            </Button>
            <Button
              onClick={onClose}
              className="text-[13px] bg-[#3478f6] hover:bg-[#2563eb] text-white"
            >
              关闭
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
