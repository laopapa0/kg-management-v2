/** 可被筛选的指标最小接口 */
interface FilterableIndicator {
  level1: string;
  level2: string;
  granularity: string;
  frequency: string;
  department: string;
  unit: string;
  tags: string[];
  name: string;
  code: string;
}

/** 指标筛选条件 */
export interface IndicatorFilters {
  /** 一级对象类型 */
  level1?: string[];
  /** 二级对象类型 */
  level2?: string[];
  /** 颗粒度 */
  granularity?: string[];
  /** 关注频率 */
  frequency?: string[];
  /** 对接部门 */
  department?: string[];
  /** 指标值单位 */
  unit?: string[];
  /** 标签 */
  tags?: string[];
  /** 搜索词（匹配指标名称或编码） */
  search?: string;
}

/**
 * 多属性组合筛选引擎
 *
 * 规则：
 * - 所有指定了值的属性条件之间是 AND 关系
 * - 同一属性的多个值之间是 OR 关系
 * - search 对 name 和 code 做包含匹配（不区分大小写）
 * - 所有条件为空时返回全部
 */
export function filterIndicators<T extends FilterableIndicator>(
  indicators: T[],
  filters: IndicatorFilters
): T[] {
  const {
    level1,
    level2,
    granularity,
    frequency,
    department,
    unit,
    tags,
    search,
  } = filters;

  const searchLower = search?.trim().toLowerCase();

  return indicators.filter((ind) => {
    // ─── 属性筛选（AND 逻辑）───
    if (level1 && level1.length > 0 && !level1.includes(ind.level1)) {
      return false;
    }
    if (level2 && level2.length > 0 && !level2.includes(ind.level2)) {
      return false;
    }
    if (granularity && granularity.length > 0 && !granularity.includes(ind.granularity)) {
      return false;
    }
    if (frequency && frequency.length > 0 && !frequency.includes(ind.frequency)) {
      return false;
    }
    if (department && department.length > 0 && !department.includes(ind.department)) {
      return false;
    }
    if (unit && unit.length > 0 && !unit.includes(ind.unit)) {
      return false;
    }
    if (tags && tags.length > 0 && !tags.some((t) => ind.tags.includes(t))) {
      return false;
    }

    // ─── 搜索（OR：名称 或 编码）───
    if (searchLower) {
      const nameMatch = ind.name.toLowerCase().includes(searchLower);
      const codeMatch = ind.code.toLowerCase().includes(searchLower);
      if (!nameMatch && !codeMatch) {
        return false;
      }
    }

    return true;
  });
}
