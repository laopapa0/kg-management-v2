import type { Indicator } from '@/models/indicatorModel';

const APP_KEY = 'kg-indicator-applications';

export interface IndicatorApplication {
  id: string;
  name: string;
  code: string;
  source: string;
  status: 'editing' | 'pending' | 'approved' | 'rejected';
  uploader: string;
  submitTime: string;
  indicatorData: Indicator;
}

/** 预置 mock 初始数据 */
function getInitialMockData(): IndicatorApplication[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'app-001',
      name: '营业收入',
      code: 'IND-2024-001',
      source: '统一数据门户',
      status: 'approved',
      uploader: '小张',
      submitTime: '2026-05-20T10:00:00.000Z',
      indicatorData: {
        id: 'IND-001',
        name: '营业收入',
        code: 'IND-2024-001',
        indicatorCode: 'REV-001',
        indicatorDisplayName: '营业收入',
        indicatorShowName: '营收',
        indicatorType: '基础指标',
        level1: '经营',
        level2: '收入',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: true,
        department: '财务部',
        businessCaliber: '企业全部收入总和',
        techCaliber: 'sum(revenue)',
        tags: ['核心指标', '集团考核'],
        source: '统一数据门户',
      },
    },
    {
      id: 'app-002',
      name: '5G用户渗透率',
      code: 'IND-2024-002',
      source: '经营管理大屏',
      status: 'pending',
      uploader: '小李',
      submitTime: '2026-05-25T14:30:00.000Z',
      indicatorData: {
        id: 'IND-002',
        name: '5G用户渗透率',
        code: 'IND-2024-002',
        indicatorCode: '5G-001',
        indicatorDisplayName: '5G用户渗透率',
        indicatorShowName: '5G渗透',
        indicatorType: '衍生指标',
        level1: '发展',
        level2: '用户发展',
        granularity: '省分',
        frequency: '日',
        unit: '百分比',
        isBigScreen: true,
        department: '市场部',
        businessCaliber: '5G用户占总用户比例',
        techCaliber: '5G_users/total_users',
        tags: ['核心指标'],
        source: '经营管理大屏',
      },
    },
    {
      id: 'app-003',
      name: '网络故障率',
      code: 'IND-2024-003',
      source: '网络运营大屏',
      status: 'rejected',
      uploader: '小王',
      submitTime: '2026-05-28T09:00:00.000Z',
      indicatorData: {
        id: 'IND-003',
        name: '网络故障率',
        code: 'IND-2024-003',
        indicatorCode: 'NET-001',
        indicatorDisplayName: '网络故障率',
        indicatorShowName: '故障率',
        indicatorType: '基础指标',
        level1: '交付',
        level2: '网络质量',
        granularity: '地市',
        frequency: '实时',
        unit: '百分比',
        isBigScreen: false,
        department: '网络部',
        businessCaliber: '网络故障次数占总服务次数比例',
        techCaliber: 'fault_count/service_count',
        tags: ['黄金指标'],
        source: '网络运营大屏',
      },
    },
    {
      id: 'app-004',
      name: '客户满意度',
      code: 'IND-2024-004',
      source: '客户服务大屏',
      status: 'editing',
      uploader: '小陈',
      submitTime: now,
      indicatorData: {
        id: 'IND-004',
        name: '客户满意度',
        code: 'IND-2024-004',
        indicatorCode: 'SAT-001',
        indicatorDisplayName: '客户满意度',
        indicatorShowName: '满意度',
        indicatorType: '基础指标',
        level1: '服务',
        level2: '客户满意度',
        granularity: '省分',
        frequency: '月',
        unit: '分',
        isBigScreen: false,
        department: '客服部',
        businessCaliber: '客户满意度评分',
        techCaliber: 'avg(score)',
        tags: [],
        source: '客户服务大屏',
      },
    },
  ];
}

function saveApplications(apps: IndicatorApplication[]): void {
  localStorage.setItem(APP_KEY, JSON.stringify(apps));
}

/** 读取全部指标申请记录（首次访问自动初始化 mock 数据） */
export function getIndicatorApplications(): IndicatorApplication[] {
  try {
    const raw = localStorage.getItem(APP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // JSON parse 失败，回退到重新初始化
  }

  const initial = getInitialMockData();
  saveApplications(initial);
  return initial;
}

/** 通过 ID 查找指标申请 */
export function getIndicatorApplicationById(id: string): IndicatorApplication | undefined {
  return getIndicatorApplications().find((a) => a.id === id);
}

/** 创建指标申请记录 */
export function createIndicatorApplication(
  data: Omit<IndicatorApplication, 'id' | 'submitTime'>,
): IndicatorApplication {
  const newApp: IndicatorApplication = {
    ...data,
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    submitTime: new Date().toISOString(),
  };

  const apps = getIndicatorApplications();
  apps.push(newApp);
  saveApplications(apps);
  return newApp;
}

/** 更新指标申请记录 */
export function updateIndicatorApplication(
  id: string,
  updates: Partial<IndicatorApplication>,
): IndicatorApplication {
  const apps = getIndicatorApplications();
  const index = apps.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error('指标申请不存在');
  }

  apps[index] = { ...apps[index], ...updates };
  saveApplications(apps);
  return apps[index];
}
