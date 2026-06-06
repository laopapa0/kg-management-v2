import { describe, it, expect } from 'vitest';
import { filterIndicators, type IndicatorFilters } from './indicatorFilter';
import type { Indicator } from '@/models/indicatorModel';

const mockIndicators: Indicator[] = [
  {
    id: 'IND-001', name: '营业收入', code: 'IND-2024-001',
    indicatorCode: 'REV-001', indicatorDisplayName: '营业收入', indicatorShowName: '营收', indicatorType: '基础指标',
    level1: '经营', level2: '收入', granularity: '全局', frequency: '月',
    unit: '元', isBigScreen: true, department: '财务部',
    businessCaliber: '企业全部收入总和', techCaliber: 'sum(revenue)',
    tags: ['核心指标', '集团考核'],
  },
  {
    id: 'IND-002', name: '5G用户渗透率', code: 'IND-2024-002',
    indicatorCode: '5G-001', indicatorDisplayName: '5G用户渗透率', indicatorShowName: '5G渗透', indicatorType: '衍生指标',
    level1: '发展', level2: '用户发展', granularity: '省分', frequency: '日',
    unit: '百分比', isBigScreen: true, department: '市场部',
    businessCaliber: '5G用户占总用户比例', techCaliber: '5G_users/total_users',
    tags: ['核心指标'],
  },
  {
    id: 'IND-003', name: '网络故障率', code: 'IND-2024-003',
    indicatorCode: 'NET-001', indicatorDisplayName: '网络故障率', indicatorShowName: '故障率', indicatorType: '基础指标',
    level1: '交付', level2: '网络质量', granularity: '地市', frequency: '实时',
    unit: '百分比', isBigScreen: false, department: '网络部',
    businessCaliber: '网络故障次数占总服务次数比例', techCaliber: 'fault_count/service_count',
    tags: ['黄金指标'],
  },
  {
    id: 'IND-004', name: '客户满意度', code: 'IND-2024-004',
    indicatorCode: 'SAT-001', indicatorDisplayName: '客户满意度', indicatorShowName: '满意度', indicatorType: '基础指标',
    level1: '服务', level2: '客户满意度', granularity: '省分', frequency: '月',
    unit: '分', isBigScreen: false, department: '客服部',
    businessCaliber: '客户满意度评分', techCaliber: 'avg(score)',
    tags: [],
  },
  {
    id: 'IND-005', name: '移动业务收入', code: 'IND-2024-005',
    indicatorCode: 'REV-002', indicatorDisplayName: '移动业务收入', indicatorShowName: '移网收入', indicatorType: '基础指标',
    level1: '经营', level2: '收入', granularity: '地市', frequency: '月',
    unit: '元', isBigScreen: true, department: '市场部',
    businessCaliber: '移动业务产生的收入', techCaliber: 'sum(mobile_revenue)',
    tags: ['核心指标'],
  },
];

describe('filterIndicators', () => {
  it('无筛选条件 → 返回全部指标', () => {
    const result = filterIndicators(mockIndicators, {});
    expect(result).toHaveLength(5);
    expect(result.map((i) => i.id)).toEqual(['IND-001', 'IND-002', 'IND-003', 'IND-004', 'IND-005']);
  });

  it('按单个属性筛选 → 返回匹配的指标', () => {
    const result = filterIndicators(mockIndicators, { level1: ['经营'] });
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.name)).toContain('营业收入');
    expect(result.map((i) => i.name)).toContain('移动业务收入');
  });

  it('按多个属性组合筛选 → AND 逻辑', () => {
    const filters: IndicatorFilters = { level1: ['经营'], granularity: ['全局'] };
    const result = filterIndicators(mockIndicators, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('营业收入');
  });

  it('多属性组合无交集 → 返回空数组', () => {
    const filters: IndicatorFilters = { level1: ['经营'], level2: ['用户发展'] };
    const result = filterIndicators(mockIndicators, filters);
    expect(result).toHaveLength(0);
  });

  it('按 search 搜索指标名称 → 返回匹配项', () => {
    const result = filterIndicators(mockIndicators, { search: '5G' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('5G用户渗透率');
  });

  it('按 search 搜索指标编码 → 返回匹配项', () => {
    const result = filterIndicators(mockIndicators, { search: 'IND-2024-003' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('网络故障率');
  });

  it('search + 属性筛选组合', () => {
    const filters: IndicatorFilters = { level1: ['经营'], search: '移动' };
    const result = filterIndicators(mockIndicators, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('移动业务收入');
  });

  it('search 无匹配 → 返回空数组', () => {
    const result = filterIndicators(mockIndicators, { search: '不存在' });
    expect(result).toHaveLength(0);
  });

  it('空指标列表 → 返回空数组', () => {
    const result = filterIndicators([], { level1: ['经营'] });
    expect(result).toHaveLength(0);
  });

  it('多值属性筛选 → OR 逻辑（同一属性多个值）', () => {
    const result = filterIndicators(mockIndicators, { level1: ['经营', '发展'] });
    expect(result).toHaveLength(3);
    expect(result.map((i) => i.name)).toContain('营业收入');
    expect(result.map((i) => i.name)).toContain('5G用户渗透率');
    expect(result.map((i) => i.name)).toContain('移动业务收入');
  });
});
