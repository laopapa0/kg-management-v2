import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { IndicatorAttachment, Rule, TagNode } from '@/models/indicatorAttachmentModel';

/** 部门 */
export interface Department {
  id: string;
  name: string;
}

/** 存储层内部使用的 indicator（附加 departmentId 用于索引查询） */
type StoredIndicator = IndicatorAttachment & { departmentId: string };

/** IndexedDB Schema 定义 */
interface AttachmentDBSchema extends DBSchema {
  departments: {
    key: string;
    value: Department;
  };
  indicators: {
    key: string;
    value: StoredIndicator;
    indexes: { byDepartmentId: string };
  };
  tagNodes: {
    key: string;
    value: { departmentId: string; nodes: TagNode[] };
  };
  rules: {
    key: string;
    value: Rule;
    indexes: { byParent: string };
  };
}

type DB = IDBPDatabase<AttachmentDBSchema>;

const DEFAULT_DB_NAME = 'kg-management-v2';
const DB_VERSION = 3;

/** 对外的 DB 接口 */
export interface AttachmentDB {
  getDepartments(): Promise<Department[]>;
  setDepartments(data: Department[]): Promise<void>;
  getIndicators(departmentId: string): Promise<IndicatorAttachment[]>;
  setIndicators(departmentId: string, data: IndicatorAttachment[]): Promise<void>;
  getTagNodes(departmentId: string): Promise<TagNode[]>;
  setTagNodes(departmentId: string, data: TagNode[]): Promise<void>;
  getRules(): Promise<Rule[]>;
  setRules(data: Rule[]): Promise<void>;
}

// ─── Mock 初始数据 ───

function getInitialMockDepartments(): Department[] {
  return [
    { id: 'dept-finance', name: '财务部' },
    { id: 'dept-market', name: '市场部' },
    { id: 'dept-network', name: '网络部' },
    { id: 'dept-service', name: '客服部' },
  ];
}

function getInitialMockIndicators(departmentId: string): IndicatorAttachment[] {
  const byDept: Record<string, IndicatorAttachment[]> = {
    'dept-finance': [
      {
        id: 'IND-FIN-001',
        name: '营业收入',
        code: 'REV-001',
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
        tags: ['核心指标'],
        tagIds: [],
        ruleIds: [],
      },
      {
        id: 'IND-FIN-002',
        name: '净利润',
        code: 'NET-001',
        indicatorCode: 'NET-001',
        indicatorDisplayName: '净利润',
        indicatorShowName: '净利',
        indicatorType: '衍生指标',
        level1: '经营',
        level2: '利润',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: false,
        department: '财务部',
        businessCaliber: '总收入减去总成本',
        techCaliber: 'revenue - cost',
        tags: [],
        tagIds: [],
        ruleIds: [],
      },
    ],
    'dept-market': [
      {
        id: 'IND-MKT-001',
        name: '5G用户渗透率',
        code: '5G-001',
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
        tagIds: [],
        ruleIds: [],
      },
    ],
    'dept-network': [
      {
        id: 'IND-NET-001',
        name: '网络故障率',
        code: 'FLT-001',
        indicatorCode: 'FLT-001',
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
        tags: [],
        tagIds: [],
        ruleIds: [],
      },
    ],
    'dept-service': [
      {
        id: 'IND-SER-001',
        name: '客户满意度',
        code: 'SAT-001',
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
        tagIds: [],
        ruleIds: [],
      },
    ],
  };

  return byDept[departmentId] ?? [];
}

function getInitialMockTagNodes(departmentId: string): TagNode[] {
  const byDept: Record<string, TagNode[]> = {
    'dept-finance': [
      { id: 'TAG-FIN-ROOT', name: '财务标签' },
      { id: 'TAG-FIN-PROFIT', name: '利润', parentId: 'TAG-FIN-ROOT', color: '#3B82F6' },
      { id: 'TAG-FIN-COST', name: '成本', parentId: 'TAG-FIN-ROOT', color: '#EF4444' },
    ],
    'dept-market': [
      { id: 'TAG-MKT-ROOT', name: '市场标签' },
      { id: 'TAG-MKT-USER', name: '用户', parentId: 'TAG-MKT-ROOT', color: '#22C55E' },
    ],
    'dept-network': [
      { id: 'TAG-NET-ROOT', name: '网络标签' },
      { id: 'TAG-NET-QUALITY', name: '质量', parentId: 'TAG-NET-ROOT', color: '#F59E0B' },
    ],
    'dept-service': [
      { id: 'TAG-SER-ROOT', name: '服务标签' },
      { id: 'TAG-SER-SAT', name: '满意度', parentId: 'TAG-SER-ROOT', color: '#8B5CF6' },
    ],
  };

  return byDept[departmentId] ?? [];
}

function getInitialMockRules(): Rule[] {
  return [
    { id: 'RULE-ROOT-001', name: '基础设施监控', type: 'threshold' },
    { id: 'RULE-CHILD-001', name: '营收波动检测', type: 'fluctuation', parentId: 'RULE-ROOT-001' },
    { id: 'RULE-CHILD-002', name: 'TopN 分析', type: 'topn', parentId: 'RULE-ROOT-001' },
  ];
}

// ─── 打开/升级数据库 ───

async function openAttachmentDB(dbName: string): Promise<DB> {
  return openDB<AttachmentDBSchema>(dbName, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      void oldVersion;
      void newVersion;
      void transaction;

      if (!db.objectStoreNames.contains('departments')) {
        db.createObjectStore('departments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('indicators')) {
        const store = db.createObjectStore('indicators', { keyPath: 'id' });
        store.createIndex('byDepartmentId', 'departmentId');
      }
      if (!db.objectStoreNames.contains('tagNodes')) {
        db.createObjectStore('tagNodes', { keyPath: 'departmentId' });
      }
      if (!db.objectStoreNames.contains('rules')) {
        const store = db.createObjectStore('rules', { keyPath: 'id' });
        store.createIndex('byParent', 'parentId');
      }
    },
  });
}

// ─── 初始化 mock 数据 ───

async function seedMockData(db: DB): Promise<void> {
  const departments = getInitialMockDepartments();
  const tx = db.transaction(
    ['departments', 'indicators', 'tagNodes', 'rules'],
    'readwrite',
  );

  const deptCount = await tx.objectStore('departments').count();
  if (deptCount === 0) {
    for (const dept of departments) {
      await tx.objectStore('departments').put(dept);
    }
    for (const dept of departments) {
      for (const indicator of getInitialMockIndicators(dept.id)) {
        const stored: StoredIndicator = { ...indicator, departmentId: dept.id };
        await tx.objectStore('indicators').put(stored);
      }
      await tx.objectStore('tagNodes').put({
        departmentId: dept.id,
        nodes: getInitialMockTagNodes(dept.id),
      });
    }
    for (const rule of getInitialMockRules()) {
      await tx.objectStore('rules').put(rule);
    }
  }

  await tx.done;
}

// ─── 内存降级实现 ───

function createMemoryAttachmentDB(): AttachmentDB {
  const memory: {
    departments: Department[];
    indicators: Map<string, IndicatorAttachment[]>;
    tagNodes: Map<string, TagNode[]>;
    rules: Rule[];
  } = {
    departments: getInitialMockDepartments(),
    indicators: new Map(),
    tagNodes: new Map(),
    rules: getInitialMockRules(),
  };

  // 初始化内存中的 indicators / tagNodes
  for (const dept of memory.departments) {
    memory.indicators.set(dept.id, getInitialMockIndicators(dept.id));
    memory.tagNodes.set(dept.id, getInitialMockTagNodes(dept.id));
  }

  return {
    async getDepartments() {
      return memory.departments;
    },
    async setDepartments(data) {
      memory.departments = data;
    },
    async getIndicators(departmentId) {
      return memory.indicators.get(departmentId) ?? [];
    },
    async setIndicators(departmentId, data) {
      memory.indicators.set(departmentId, data);
    },
    async getTagNodes(departmentId) {
      return memory.tagNodes.get(departmentId) ?? [];
    },
    async setTagNodes(departmentId, data) {
      memory.tagNodes.set(departmentId, data);
    },
    async getRules() {
      return memory.rules;
    },
    async setRules(data) {
      memory.rules = data;
    },
  };
}

// ─── 工厂函数 ───

export interface CreateAttachmentDBOptions {
  dbName?: string;
}

export function createAttachmentDB(options: CreateAttachmentDBOptions = {}): AttachmentDB {
  const dbName = options.dbName ?? DEFAULT_DB_NAME;

  try {
    if (typeof indexedDB === 'undefined') {
      return createMemoryAttachmentDB();
    }
  } catch {
    return createMemoryAttachmentDB();
  }

  let dbPromise: Promise<DB> | null = null;

  function getDB(): Promise<DB> {
    if (!dbPromise) {
      dbPromise = openAttachmentDB(dbName).then(async (db) => {
        await seedMockData(db);
        return db;
      });
    }
    return dbPromise;
  }

  function stripDepartmentId(item: StoredIndicator): IndicatorAttachment {
    const { departmentId: _, ...rest } = item;
    void _;
    return rest;
  }

  return {
    async getDepartments() {
      try {
        const db = await getDB();
        return db.getAll('departments');
      } catch {
        return createMemoryAttachmentDB().getDepartments();
      }
    },
    async setDepartments(data) {
      try {
        const db = await getDB();
        const tx = db.transaction('departments', 'readwrite');
        await tx.store.clear();
        for (const item of data) {
          await tx.store.put(item);
        }
        await tx.done;
      } catch {
        // 降级到内存无法在这个接口直接反馈，后续读取会走内存
      }
    },
    async getIndicators(departmentId) {
      try {
        const db = await getDB();
        const tx = db.transaction('indicators', 'readonly');
        const index = tx.store.index('byDepartmentId');
        const stored = await index.getAll(departmentId);
        return stored.map(stripDepartmentId);
      } catch {
        return createMemoryAttachmentDB().getIndicators(departmentId);
      }
    },
    async setIndicators(departmentId, data) {
      try {
        const db = await getDB();
        const tx = db.transaction('indicators', 'readwrite');
        const index = tx.store.index('byDepartmentId');
        const keys = await index.getAllKeys(departmentId);
        for (const key of keys) {
          await tx.store.delete(key);
        }
        for (const item of data) {
          const stored: StoredIndicator = { ...item, departmentId };
          await tx.store.put(stored);
        }
        await tx.done;
      } catch {
        // silent fallback
      }
    },
    async getTagNodes(departmentId) {
      try {
        const db = await getDB();
        const wrapped = await db.get('tagNodes', departmentId);
        return wrapped?.nodes ?? [];
      } catch {
        return createMemoryAttachmentDB().getTagNodes(departmentId);
      }
    },
    async setTagNodes(departmentId, data) {
      try {
        const db = await getDB();
        await db.put('tagNodes', { departmentId, nodes: data });
      } catch {
        // silent fallback
      }
    },
    async getRules() {
      try {
        const db = await getDB();
        return db.getAll('rules');
      } catch {
        return createMemoryAttachmentDB().getRules();
      }
    },
    async setRules(data) {
      try {
        const db = await getDB();
        const tx = db.transaction('rules', 'readwrite');
        await tx.store.clear();
        for (const item of data) {
          await tx.store.put(item);
        }
        await tx.done;
      } catch {
        // silent fallback
      }
    },
  };
}
