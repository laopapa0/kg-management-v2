/**
 * 报告模板模型
 *
 * ReportTemplate 代表一个报告模板，包含：
 * - 基本信息（名称、描述）
 * - 板块列表（每个板块有标题+提示词）
 * - 使用统计与启用状态
 */

export interface ReportSection {
  id: string
  title: string
  prompt: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  styleGuide: string
  sections: ReportSection[]
  usageCount: number
  enabled: boolean
  createdAt: string
}

/** 提示词预选项 */
export const PROMPT_PRESETS = [
  '分析指标同比/环比变化',
  '检测异常值并标注',
  '汇总关键指标趋势',
  '对比各部门表现',
  '识别波动原因',
  '生成结论性摘要',
] as const

function generateId(): string {
  return `tmpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createReportTemplate(
  data: Omit<ReportTemplate, 'id' | 'createdAt' | 'usageCount'>,
): ReportTemplate {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    usageCount: 0,
    ...data,
    styleGuide: data.styleGuide ?? '',
  }
}

export function createReportSection(
  data: Partial<Omit<ReportSection, 'id'>> & Pick<ReportSection, 'title'>,
): ReportSection {
  return {
    id: generateId(),
    prompt: '',
    ...data,
  }
}

/** Mock 报告模板数据 */
export const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'tmpl-001',
    name: '月报标准模板',
    description: '月度经营分析报告的标准模板，含概览、异常、趋势、归因、预测和结论',
    styleGuide: '语气专业客观，多用数据说话。每个板块用标题 + 简要分析 + 关键数字摘要的结构。',
    sections: [
      { id: 'sec-001', title: '指标概览', prompt: '汇总关键指标趋势' },
      { id: 'sec-002', title: '异常检测', prompt: '检测异常值并标注' },
      { id: 'sec-003', title: '趋势分析', prompt: '分析指标同比/环比变化' },
      { id: 'sec-004', title: '归因分析', prompt: '识别波动原因' },
      { id: 'sec-005', title: '预测与建议', prompt: '生成结论性摘要' },
      { id: 'sec-006', title: '结论摘要', prompt: '生成结论性摘要' },
    ],
    usageCount: 42,
    enabled: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'tmpl-002',
    name: '周报速览模板',
    description: '周报速览模板，聚焦核心指标、异常和趋势',
    styleGuide: '用图表和数据支撑结论，突出异常和波动。篇幅控制在 1500 字以内。',
    sections: [
      { id: 'sec-007', title: '指标概览', prompt: '汇总关键指标趋势' },
      { id: 'sec-008', title: '异常检测', prompt: '检测异常值并标注' },
      { id: 'sec-009', title: '趋势分析', prompt: '分析指标同比/环比变化' },
      { id: 'sec-010', title: '归因分析', prompt: '识别波动原因' },
      { id: 'sec-011', title: '结论摘要', prompt: '生成结论性摘要' },
    ],
    usageCount: 12,
    enabled: true,
    createdAt: '2026-05-15T00:00:00.000Z',
  },
]
