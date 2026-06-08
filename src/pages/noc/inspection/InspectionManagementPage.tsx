import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pencil, Pause, Trash2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import InspectionPlanForm, { type PlanFormData } from './InspectionPlanForm';
import InspectionReportList from './InspectionReportList';
import InspectionReportDetail from './InspectionReportDetail';
import {
  mockInspectionPlans,
  mockInspectionExecutions,
  mockInspectionReports,
  mockAnomalyItems,
  mockIndicatorTrends,
  mockLineageSnapshots,
  getPlanStatusCounts,
  formatTriggerType,
  getLastExecution,
  formatExecutionStatus,
  generateMockExecution,
  getExecutionById,
  getAnomaliesByReportId,
  getTrendsByIndicatorIds,
  getLineageByIndicatorId,
  type InspectionExecution,
  type InspectionPlan,
  type InspectionReport,
} from './mockData';

interface InspectionManagementPageProps {
  defaultTab?: string;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
      <div className="text-[13px] text-dark-text-secondary mb-1">{label}</div>
      <div className={`text-[28px] font-semibold ${color}`}>{value}</div>
    </div>
  );
}

export default function InspectionManagementPage({ defaultTab = 'plans' }: InspectionManagementPageProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showForm, setShowForm] = useState(false);
  const [plans, setPlans] = useState<InspectionPlan[]>(mockInspectionPlans);
  const [executions, setExecutions] = useState<InspectionExecution[]>(mockInspectionExecutions);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reports, setReports] = useState<InspectionReport[]>(mockInspectionReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const stats = getPlanStatusCounts(plans);

  const selectedReport = selectedReportId
    ? reports.find((r) => r.id === selectedReportId) || null
    : null;
  const selectedReportExecution = selectedReport
    ? getExecutionById(selectedReport.executionId, executions) ?? null
    : null;
  const selectedReportPlan = selectedReport
    ? plans.find((p) => p.id === selectedReport.planId) || null
    : null;

  const selectedAnomalies = selectedReportId
    ? getAnomaliesByReportId(selectedReportId, reports, mockAnomalyItems)
    : [];
  const selectedTrends = selectedAnomalies.length > 0
    ? getTrendsByIndicatorIds(
        selectedAnomalies.map((a) => a.indicatorId),
        mockIndicatorTrends
      )
    : [];
  const selectedLineage = selectedAnomalies.length > 0
    ? getLineageByIndicatorId(selectedAnomalies[0].indicatorId, mockLineageSnapshots)
    : null;

  // 页面加载时自动模拟定期计划的执行记录（仅给无记录的计划）
  useEffect(() => {
    const periodicPlans = plans.filter((p) => p.triggerType === 'periodic');
    const plansWithoutExec = periodicPlans.filter(
      (p) => !executions.some((e) => e.planId === p.id)
    );
    if (plansWithoutExec.length === 0) return;
    const newExecutions = plansWithoutExec.map((p) => generateMockExecution(p.id));
    setExecutions((prev) => [...prev, ...newExecutions]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEditingFormData = useCallback((): PlanFormData | undefined => {
    if (!editingPlanId) return undefined;
    const plan = plans.find((p) => p.id === editingPlanId);
    if (!plan) return undefined;
    return {
      name: plan.name,
      triggerType: plan.triggerType,
      cronExpression: plan.cronExpression ?? weeklyOptions[0].value,
      graphVersion: plan.graphVersion,
      indicatorScope: {
        byObjectType: plan.indicatorScope.byObjectType ?? [],
        byTags: plan.indicatorScope.byTags ?? [],
      },
      excludedRuleIds: plan.excludedRuleIds,
    };
  }, [editingPlanId, plans]);

  const handleSave = (formData: PlanFormData) => {
    if (editingPlanId) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlanId
            ? {
                ...p,
                name: formData.name,
                triggerType: formData.triggerType,
                cronExpression: formData.cronExpression,
                graphVersion: formData.graphVersion,
                indicatorScope: {
                  byObjectType: formData.indicatorScope.byObjectType,
                  byTags: formData.indicatorScope.byTags,
                },
                excludedRuleIds: formData.excludedRuleIds,
              }
            : p
        )
      );
      setEditingPlanId(null);
    } else {
      const newPlan: InspectionPlan = {
        id: `plan-${Date.now()}`,
        name: formData.name,
        triggerType: formData.triggerType,
        cronExpression: formData.cronExpression,
        graphVersion: formData.graphVersion,
        indicatorScope: {
          byObjectType: formData.indicatorScope.byObjectType,
          byTags: formData.indicatorScope.byTags,
        },
        excludedRuleIds: formData.excludedRuleIds,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setPlans((prev) => [...prev, newPlan]);
    }
    setShowForm(false);
  };

  const handleEdit = (plan: InspectionPlan) => {
    setEditingPlanId(plan.id);
    setShowForm(true);
  };

  const handleToggleStatus = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p
      )
    );
  };

  const handleDelete = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setDeleteConfirmId(null);
  };

  const handleExecute = (planId: string) => {
    setExecutingIds((prev) => new Set(prev).add(planId));
    setTimeout(() => {
      const newExecution = generateMockExecution(planId);
      setExecutions((prev) => [...prev, newExecution]);
      setExecutingIds((prev) => {
        const next = new Set(prev);
        next.delete(planId);
        return next;
      });
    }, 2000);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlanId(null);
  };

  const handleNewPlan = () => {
    setEditingPlanId(null);
    setShowForm(true);
  };

  const handleViewDetail = (reportId: string) => {
    setSelectedReportId(reportId);
  };

  const handleCloseDetail = () => {
    setSelectedReportId(null);
  };

  const handleArchive = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' as const } : r))
    );
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <h1 className="text-display">巡检管理</h1>
          <p className="text-small text-dark-text-secondary mt-1">巡检计划配置、执行监控与报告查看</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-dark-elevated border border-dark-border">
          <TabsTrigger
            value="plans"
            className="data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary"
          >
            当前巡检计划
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary"
          >
            巡检结果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {/* 新建按钮 */}
          <div className="flex justify-end">
            <Button
              onClick={handleNewPlan}
              className="bg-dark-accent-primary hover:bg-dark-accent-primary text-white"
            >
              新建巡检计划
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="运行中" value={stats.running} color="text-dark-accent-primary" />
            <StatCard label="待执行" value={stats.pending} color="text-warning-500" />
            <StatCard label="已暂停" value={stats.paused} color="text-dark-text-tertiary" />
          </div>

          {/* 计划列表表格 */}
          <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-dark-border bg-dark-page">
                  <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">计划名称</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">周期类型</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">下次执行时间</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">最近执行结果</th>
                  <th className="px-4 py-3 text-left font-medium text-dark-text-secondary">操作</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const lastExec = getLastExecution(plan.id, executions);
                  const execStatus = formatExecutionStatus(lastExec);
                  const isExecuting = executingIds.has(plan.id);
                  return (
                    <tr key={plan.id} className="border-b border-dark-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {plan.name}
                          {plan.status === 'paused' && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-dark-card-l2 text-dark-text-tertiary">
                              已暂停
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{formatTriggerType(plan.triggerType)}</td>
                      <td className="px-4 py-3 text-dark-text-secondary">
                        {plan.triggerType === 'manual' ? '手动触发' : plan.cronExpression || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isExecuting ? (
                          <div className="flex items-center gap-2 text-dark-accent-primary">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-[13px]">执行中...</span>
                          </div>
                        ) : lastExec ? (
                          <div className="flex items-center gap-2">
                            <span className="text-dark-text-secondary">
                              {new Date(lastExec.executedAt).toLocaleString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <StatusBadge
                              text={execStatus.text}
                              type={execStatus.badge === 'success' ? 'success' : execStatus.badge === 'error' ? 'error' : 'default'}
                              className="text-[11px]"
                            />
                            {lastExec.anomalyCount > 0 && (
                              <span className="text-error-600">{lastExec.anomalyCount} 个异常</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-dark-text-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExecute(plan.id)}
                            disabled={isExecuting || plan.status === 'paused'}
                            className="text-dark-accent-primary hover:text-dark-accent-primary disabled:text-dark-text-tertiary disabled:cursor-not-allowed"
                            title="执行"
                          >
                            <Play size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(plan)}
                            className="text-dark-text-secondary hover:text-dark-accent-primary"
                            title="编辑"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(plan.id)}
                            className="text-dark-text-secondary hover:text-warning-500"
                            title={plan.status === 'active' ? '停用' : '启用'}
                          >
                            <Pause size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(plan.id)}
                            className="text-dark-text-secondary hover:text-error-600"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 删除确认弹窗 */}
          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-lg p-5 w-[360px]">
                <h3 className="text-[15px] font-semibold text-dark-text-primary mb-2" data-testid="delete-dialog-title">删除巡检计划</h3>
                <p className="text-[13px] text-dark-text-secondary mb-4">
                  确定要删除该巡检计划吗？删除后历史报告仍将保留。
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmId(null)}
                    className="text-[13px] border-dark-border"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="text-[13px] bg-error-600 hover:bg-error-700 text-white"
                  >
                    确认删除
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 新建/编辑巡检计划表单 */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
                data-testid="plan-form-wrapper"
              >
                <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
                  <InspectionPlanForm
                    initialData={getEditingFormData()}
                    onCancel={handleCancelForm}
                    onSave={handleSave}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="results">
          <InspectionReportList
            reports={reports}
            executions={executions}
            plans={plans}
            onViewDetail={handleViewDetail}
            onArchive={handleArchive}
          />
        </TabsContent>
      </Tabs>

      {/* 报告详情 Dialog */}
      <InspectionReportDetail
        report={selectedReport}
        execution={selectedReportExecution}
        plan={selectedReportPlan}
        anomalies={selectedAnomalies}
        trends={selectedTrends}
        lineage={selectedLineage}
        open={!!selectedReportId}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

const weeklyOptions = [
  { value: '0 9 * * 1', label: '每周一 09:00' },
  { value: '0 9 * * 2', label: '每周二 09:00' },
  { value: '0 9 * * 3', label: '每周三 09:00' },
  { value: '0 9 * * 4', label: '每周四 09:00' },
  { value: '0 9 * * 5', label: '每周五 09:00' },
  { value: '0 9 * * 6', label: '每周六 09:00' },
  { value: '0 9 * * 0', label: '每周日 09:00' },
];
