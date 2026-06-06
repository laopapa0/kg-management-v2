/**
 * 指标平表数据模型
 *
 * 对象类型 = 指标的属性字段定义（一级、二级、颗粒度、指标标识、指标值单位、屏、
 * 对接部门、指标业务口径概述、指标技术口径、关注频率）
 * 指标 = 多个对象类型实例的组合实体，代码中表现为平表
 *
 * @see ADR-003: 代码平表 + UI 分组
 */

/** 单个对象类型字段定义 */
export interface ObjectTypeFieldDef {
  /** 对应 Indicator 中的字段名 */
  key: keyof Indicator;
  /** 显示标签 */
  label: string;
  /** 字段类型 */
  type: 'enum' | 'text' | 'boolean';
  /** 枚举值列表（type='enum' 时必填） */
  options?: string[];
}

/** 对象类型分组（UI 展示用） */
export interface ObjectTypeGroup {
  id: string;
  name: string;
  fields: ObjectTypeFieldDef[];
}

/**
 * 指标平表实体
 *
 * 每个字段对应一个对象类型的实例值。
 * 与 Excel 源数据结构一致：一行 = 一个指标，列 = 对象类型属性。
 */
export interface Indicator {
  id: string;
  name: string;
  code: string;

  // ─── 指标标识（对象类型）───
  indicatorCode: string;
  indicatorDisplayName: string;
  indicatorShowName: string;
  indicatorType: string;

  // ─── 分类属性（对象类型）───
  level1: string;
  level2: string;
  granularity: string;
  frequency: string;

  // ─── 指标值单位（对象类型）───
  unit: string;

  // ─── 屏（对象类型）───
  isBigScreen: boolean;

  // ─── 对接部门（对象类型）───
  department: string;

  // ─── 指标业务口径概述（对象类型）───
  businessCaliber: string;

  // ─── 指标技术口径（对象类型）───
  techCaliber: string;

  // ─── 标签 ───
  tags: string[];

  // ─── 大屏来源 ───
  source?: string;
}

/* ─── 对象类型 Schema 定义 ─── */

export const OBJECT_TYPE_DEFINITIONS: ObjectTypeGroup[] = [
  {
    id: 'group-identifier',
    name: '指标标识',
    fields: [
      { key: 'indicatorCode', label: '指标编码', type: 'text' },
      { key: 'indicatorDisplayName', label: '指标显示名称', type: 'text' },
      { key: 'indicatorShowName', label: '指标展示名称', type: 'text' },
      { key: 'indicatorType', label: '指标类型', type: 'enum', options: ['基础指标', '衍生指标', '复合指标'] },
    ],
  },
  {
    id: 'group-category',
    name: '分类属性',
    fields: [
      { key: 'level1', label: '一级', type: 'enum', options: ['经营', '发展', '交付', '服务'] },
      { key: 'level2', label: '二级', type: 'enum', options: ['收入', '利润', '成本', '用户触达', '用户留存', '网络质量', '交付效率', '资源利用', '客户满意度', '服务效率', '投诉处理', '效益评估', '成本控制', '收入分析', '业务发展', '用户发展'] },
      { key: 'granularity', label: '颗粒度', type: 'enum', options: ['全局', '省分', '地市', '区县', '网格'] },
      { key: 'frequency', label: '关注频率', type: 'enum', options: ['实时', '日', '周', '月', '季', '年'] },
    ],
  },
  {
    id: 'group-unit',
    name: '指标值单位',
    fields: [
      { key: 'unit', label: '指标值展示单位', type: 'enum', options: ['元', '百分比', '户', '分', '次', '个', 'GB', 'Mbps'] },
    ],
  },
  {
    id: 'group-screen',
    name: '屏',
    fields: [
      { key: 'isBigScreen', label: '是否大屏使用', type: 'boolean' },
    ],
  },
  {
    id: 'group-department',
    name: '对接部门',
    fields: [
      { key: 'department', label: '指标考核部门/单位', type: 'enum', options: ['市场部', '网络部', '客服部', '政企部', '财务部', '数据中心'] },
    ],
  },
  {
    id: 'group-business-caliber',
    name: '指标业务口径概述',
    fields: [
      { key: 'businessCaliber', label: '指标业务口径详述', type: 'text' },
    ],
  },
  {
    id: 'group-tech-caliber',
    name: '指标技术口径',
    fields: [
      { key: 'techCaliber', label: '技术口径说明', type: 'text' },
    ],
  },
];

/** 获取所有对象类型字段的 key 列表 */
export function getObjectTypeFieldKeys(): (keyof Indicator)[] {
  return OBJECT_TYPE_DEFINITIONS.flatMap((g) => g.fields.map((f) => f.key));
}

/** 获取指定对象类型的枚举值列表 */
export function getObjectTypeOptions(fieldKey: string): string[] | undefined {
  for (const group of OBJECT_TYPE_DEFINITIONS) {
    const field = group.fields.find((f) => f.key === fieldKey);
    if (field) return field.options;
  }
  return undefined;
}
