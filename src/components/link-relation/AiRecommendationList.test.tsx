import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AiRecommendationList from './AiRecommendationList'
import type { AiRecommendation } from '@/models/linkRelationModel'

const mockRecommendations: AiRecommendation[] = [
  { id: 'r1', sourceIndicatorId: 's1', sourceIndicatorName: '5G渗透率', targetIndicatorId: 't1', targetIndicatorName: '用户总数', relationTypeId: 'LKT-001', relationTypeName: '依赖关系', confidence: 0.95, reason: '强关联' },
  { id: 'r2', sourceIndicatorId: 's2', sourceIndicatorName: '营收完成率', targetIndicatorId: 't2', targetIndicatorName: 'ARPU值', relationTypeId: 'LKT-002', relationTypeName: '聚合关系', confidence: 0.78, reason: '中等关联' },
  { id: 'r3', sourceIndicatorId: 's3', sourceIndicatorName: '数据流量', targetIndicatorId: 't3', targetIndicatorName: '下载速率', relationTypeId: 'LKT-003', relationTypeName: '相关关系', confidence: 0.45, reason: '弱关联' },
  { id: 'r4', sourceIndicatorId: 's4', sourceIndicatorName: '呼叫成功率', targetIndicatorId: 't4', targetIndicatorName: '无线接通率', relationTypeId: 'LKT-004', relationTypeName: '依赖关系', confidence: 0.96 },
]

function generateMany(count: number): AiRecommendation[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `r${i}`,
    sourceIndicatorId: `s${i}`,
    sourceIndicatorName: `来源指标${i}`,
    targetIndicatorId: `t${i}`,
    targetIndicatorName: `目标指标${i}`,
    relationTypeId: 'LKT-001',
    relationTypeName: '依赖关系',
    confidence: Math.random() * 0.5 + 0.3,
  }))
}

describe('AiRecommendationList', () => {
  describe('基础渲染', () => {
    it('按置信度降序排列', () => {
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      const rows = screen.getAllByTestId('ai-rec-row')
      expect(rows).toHaveLength(4)
      // 第一条应是最高的 r4 (0.96), 最后一条应是最低的 r3 (0.45)
      const firstRow = rows[0]
      const lastRow = rows[3]
      expect(firstRow).toHaveTextContent('呼叫成功率')
      expect(lastRow).toHaveTextContent('数据流量')
    })

    it('置信度 badge 按阈值着色', () => {
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      // r1: 0.95 → >80% → 绿色
      const highBadge = screen.getByTestId('ai-confidence-r1')
      expect(highBadge).toHaveClass('bg-green-500')
      // r2: 0.78 → 50-80% → 黄色
      const midBadge = screen.getByTestId('ai-confidence-r2')
      expect(midBadge).toHaveClass('bg-yellow-500')
      // r3: 0.45 → <50% → 灰色
      const lowBadge = screen.getByTestId('ai-confidence-r3')
      expect(lowBadge).toHaveClass('bg-slate-500')
    })

    it('显示关系类型名称和推荐理由', () => {
      render(<AiRecommendationList recommendations={[mockRecommendations[0]]} />)

      expect(screen.getByText('依赖关系')).toBeInTheDocument()
      expect(screen.getByText('强关联')).toBeInTheDocument()
    })

    it('空状态：无推荐时显示提示', () => {
      render(<AiRecommendationList recommendations={[]} />)

      expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
      expect(screen.getByText('暂无AI推荐')).toBeInTheDocument()
    })
  })

  describe('置信度筛选', () => {
    it('默认显示全部推荐', () => {
      render(<AiRecommendationList recommendations={mockRecommendations} />)
      expect(screen.getAllByTestId('ai-rec-row')).toHaveLength(4)
    })

    it('筛选 >80% 只显示高置信度', async () => {
      const user = userEvent.setup()
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      // 打开下拉
      await user.click(screen.getByTestId('ai-confidence-filter'))
      // 点击 >80% 选项
      await user.click(screen.getByText('>80%'))

      const rows = screen.getAllByTestId('ai-rec-row')
      expect(rows).toHaveLength(2) // r1(0.95) + r4(0.96)
    })

    it('筛选 50-80% 只显示中等置信度', async () => {
      const user = userEvent.setup()
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      // 打开下拉
      await user.click(screen.getByTestId('ai-confidence-filter'))
      // 点击 50-80% 选项
      await user.click(screen.getByText('50-80%'))

      const rows = screen.getAllByTestId('ai-rec-row')
      expect(rows).toHaveLength(1) // r2(0.78)
    })
  })

  describe('分页', () => {
    it('每页显示 20 条，超过时出现分页导航', () => {
      const items = generateMany(35)
      render(<AiRecommendationList recommendations={items} />)

      const rows = screen.getAllByTestId('ai-rec-row')
      expect(rows).toHaveLength(20) // 第一页 20 条
      expect(screen.getByTestId('ai-pagination')).toBeInTheDocument()
    })

    it('翻页后显示剩余条目', async () => {
      const user = userEvent.setup()
      const items = generateMany(35)
      render(<AiRecommendationList recommendations={items} />)

      // 点击第 2 页
      await user.click(screen.getByTestId('ai-page-2'))

      const rows = screen.getAllByTestId('ai-rec-row')
      expect(rows).toHaveLength(15) // 第二页 15 条
    })
  })

  describe('勾选与批量应用', () => {
    it('每行有复选框，表头有全选复选框', () => {
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      const checkboxes = screen.getAllByTestId('ai-check-item')
      expect(checkboxes).toHaveLength(4)
      expect(screen.getByTestId('ai-check-all')).toBeInTheDocument()
    })

    it('勾选后出现操作栏', async () => {
      const user = userEvent.setup()
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      // 操作栏初始不可见
      expect(screen.queryByTestId('ai-action-bar')).not.toBeInTheDocument()

      // 勾选第一条
      await user.click(screen.getAllByTestId('ai-check-item')[0])

      expect(screen.getByTestId('ai-action-bar')).toBeInTheDocument()
      expect(screen.getByTestId('ai-selected-count')).toHaveTextContent('1')
    })

    it('全选勾选所有当前页条目', async () => {
      const user = userEvent.setup()
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      await user.click(screen.getByTestId('ai-check-all'))

      const checked = screen.getAllByTestId('ai-check-item') as HTMLInputElement[]
      expect(checked.every((c) => c.checked)).toBe(true)
    })

    it('点击应用弹出确认弹窗', async () => {
      const user = userEvent.setup()
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      await user.click(screen.getAllByTestId('ai-check-item')[0])
      await user.click(screen.getByTestId('ai-apply-button'))

      expect(screen.getByText('确定要应用这 1 条推荐到血缘画布？')).toBeInTheDocument()
    })

    it('确认后触发 onApply 回调', async () => {
      const user = userEvent.setup()
      const onApply = vi.fn()
      render(<AiRecommendationList recommendations={mockRecommendations} onApply={onApply} />)

      await user.click(screen.getAllByTestId('ai-check-item')[0])
      await user.click(screen.getByTestId('ai-apply-button'))
      // 点击弹窗确定按钮
      await user.click(screen.getByTestId('ai-apply-confirm'))

      expect(onApply).toHaveBeenCalledWith(['r4'])
    })

    it('取消勾选后操作栏隐藏', async () => {
      const user = userEvent.setup()
      render(<AiRecommendationList recommendations={mockRecommendations} />)

      await user.click(screen.getAllByTestId('ai-check-item')[0])
      expect(screen.getByTestId('ai-action-bar')).toBeInTheDocument()

      // 再次点击取消勾选
      await user.click(screen.getAllByTestId('ai-check-item')[0])

      expect(screen.queryByTestId('ai-action-bar')).not.toBeInTheDocument()
    })
  })
})
