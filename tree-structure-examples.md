# 树状管理结构示例

## 方案 A：对象类型字段定义树（推荐）

**概念**：左侧树管理的是「对象类型字段定义」本身（元数据），右侧管理字段的枚举值。

```
┌──────────────────────────────┬────────────────────────────────────────┐
│  对象类型管理                  │  详情面板                               │
│                              │                                        │
│  ▼ 指标体系                   │  【一级】对象类型定义                     │
│    ▼ 指标标识                 │                                        │
│      ├─ 指标编码        ✓     │  字段类型：枚举                           │
│      ├─ 指标显示名称          │  枚举值：                               │
│      ├─ 指标展示名称          │    ├─ 经营     [编辑] [删除]            │
│      └─ 指标类型              │    ├─ 发展     [编辑] [删除]            │
│    ▼ 分类属性        ◀───┐   │    ├─ 交付     [编辑] [删除]            │
│      ├─ 一级      ✓ 当前 │   │    └─ 服务     [编辑] [删除]            │
│      ├─ 二级              │   │                                        │
│      ├─ 颗粒度            │   │  [+ 添加枚举值]                        │
│      └─ 关注频率          │   │                                        │
│    ▼ 指标值单位             │   └─────────────────────────────────────┘
│      └─ 指标值展示单位      │
│    ▼ 屏                     │
│      └─ 是否大屏使用        │
│    ▼ 对接部门               │
│      └─ 指标考核部门        │
│    ▼ 指标业务口径概述       │
│      └─ 业务口径详述        │
│    ▼ 指标技术口径           │
│      └─ 技术口径说明        │
└──────────────────────────────┴────────────────────────────────────────┘
```

**树节点数据结构**：
```typescript
interface ObjectTypeFieldNode {
  id: string;
  name: string;
  nodeType: 'group' | 'field';
  children?: ObjectTypeFieldNode[];
  // field 节点额外信息
  fieldKey?: keyof Indicator;
  fieldType?: 'enum' | 'text' | 'boolean';
}

const objectTypeFieldTree: ObjectTypeFieldNode[] = [
  {
    id: 'group-identifier', name: '指标标识', nodeType: 'group',
    children: [
      { id: 'field-code', name: '指标编码', nodeType: 'field', fieldKey: 'indicatorCode', fieldType: 'text' },
      { id: 'field-display', name: '指标显示名称', nodeType: 'field', fieldKey: 'indicatorDisplayName', fieldType: 'text' },
      { id: 'field-show', name: '指标展示名称', nodeType: 'field', fieldKey: 'indicatorShowName', fieldType: 'text' },
      { id: 'field-type', name: '指标类型', nodeType: 'field', fieldKey: 'indicatorType', fieldType: 'enum' },
    ]
  },
  {
    id: 'group-category', name: '分类属性', nodeType: 'group',
    children: [
      { id: 'field-l1', name: '一级', nodeType: 'field', fieldKey: 'level1', fieldType: 'enum' },
      { id: 'field-l2', name: '二级', nodeType: 'field', fieldKey: 'level2', fieldType: 'enum' },
      { id: 'field-granularity', name: '颗粒度', nodeType: 'field', fieldKey: 'granularity', fieldType: 'enum' },
      { id: 'field-frequency', name: '关注频率', nodeType: 'field', fieldKey: 'frequency', fieldType: 'enum' },
    ]
  },
  // ... 其他分组
];
```

**适用场景**：NOC 管理员需要维护「对象类型字段」的定义和枚举值。点击"一级"节点，右侧展示"一级"的所有枚举值（经营/发展/交付/服务），可以增删改。

---

## 方案 B：指标实例树（数据管理）

**概念**：左侧树按对象类型值层级组织「指标实例」。

```
┌──────────────────────────────┬────────────────────────────────────────┐
│  指标体系                      │  指标详情                               │
│                              │                                        │
│  ▼ 经营                       │  【营业收入】                            │
│    ▼ 收入                    │                                        │
│      ├─ 营业收入        ✓     │  编码：IND-2024-001                     │
│      ├─ 移动业务收入          │  一级：经营                             │
│      ├─ 政企收入              │  二级：收入                             │
│      └─ 家庭收入              │  颗粒度：全局                           │
│    ▼ 利润                    │  关注频率：月                           │
│      ├─ 净利润                │  单位：元                               │
│      └─ ...                   │  部门：财务部                           │
│    ▼ 成本                    │                                        │
│      └─ ...                   │  [编辑] [删除]                          │
│  ▼ 发展                       │                                        │
│    ▼ 用户发展                │                                        │
│      ├─ 5G用户渗透率          │                                        │
│      └─ ...                   │                                        │
│  ▼ 交付                       │                                        │
│  ▼ 服务                       │                                        │
└──────────────────────────────┴────────────────────────────────────────┘
```

**树节点数据结构**：
```typescript
interface IndicatorTreeNode {
  id: string;
  name: string;
  nodeType: 'level1' | 'level2' | 'indicator';
  children?: IndicatorTreeNode[];
  // indicator 节点额外信息
  indicatorId?: string;
}

const indicatorTree: IndicatorTreeNode[] = [
  {
    id: 'l1-经营', name: '经营', nodeType: 'level1',
    children: [
      {
        id: 'l2-收入', name: '收入', nodeType: 'level2',
        children: [
          { id: 'ind-001', name: '营业收入', nodeType: 'indicator', indicatorId: 'IND-001' },
          { id: 'ind-005', name: '移动业务收入', nodeType: 'indicator', indicatorId: 'IND-005' },
        ]
      },
      { id: 'l2-利润', name: '利润', nodeType: 'level2', children: [...] },
    ]
  },
  // ... 发展、交付、服务
];
```

**问题**：这种树把 level1/level2 当成了父子层级，与 ADR-003 的平表模型冲突。level1 和 level2 在 Excel 中是平行列，不是父子关系。

**适用场景**：如果业务上确实需要按"一级 → 二级 → 指标"的层级浏览指标，可以用这种树作为**视图层**，但底层数据模型仍保持平表。

---

## 方案 C：混合模式（字段树 + 指标平表）

**概念**：左侧树只展示「对象类型字段」的分组，右侧永远是**指标平表列表**，按选中字段筛选。

```
┌──────────────────────────────┬────────────────────────────────────────┐
│  对象类型字段                  │  指标列表（平表）                        │
│                              │                                        │
│  ▼ 指标标识                   │  ┌──────┬─────────┬────┬─────┬─────┐  │
│      ├─ 指标编码              │  │ 编码  │ 指标名称 │ 一级 │ 二级 │ 颗粒度│  │
│      ├─ 指标显示名称          │  ├──────┼─────────┼────┼─────┼─────┤  │
│      └─ 指标类型         ✓    │  │001   │ 营业收入 │ 经营 │ 收入 │ 全局 │  │
│    ▼ 分类属性        ◀───┐   │  │005   │ 移动业务 │ 经营 │ 收入 │ 地市 │  │
│      ├─ 一级              │   │  │002   │ 5G渗透率 │ 发展 │ 用户 │ 省分 │  │
│      ├─ 二级         ✓ 当前│   │  └──────┴─────────┴────┴─────┴─────┘  │
│      ├─ 颗粒度            │   │                                        │
│      └─ 关注频率          │   │  筛选：一级=经营 ✕  二级=收入 ✕          │
│    ▼ 指标值单位             │   │                                        │
│    ▼ 屏                     │   │  [分页] [共 5 条]                      │
│    ▼ 对接部门               │   │                                        │
└──────────────────────────────┴────────────────────────────────────────┘
```

**行为**：
- 点击"指标类型" → 右侧表格增加列"指标类型"
- 点击"一级" → 右侧表格按"一级"列排序
- 点击"二级" → 右侧表格按"二级"列排序

**问题**：左侧树变成了「表格列选择器」，不是真正的树状管理。

---

## 方案对比

| 方案 | 左侧树节点 | 右侧内容 | 与平表模型兼容性 | 适用场景 |
|------|-----------|---------|----------------|---------|
| A | 对象类型字段定义 | 字段枚举值管理 | ✅ 完全兼容 | 维护对象类型字段定义 |
| B | 一级→二级→指标 | 指标详情 | ⚠️ 视图层树，底层平表 | 按层级浏览指标 |
| C | 对象类型字段 | 指标平表列表 | ✅ 完全兼容 | 字段作为表格列操作 |

**推荐**：方案 A（字段定义树）最符合"对象类型管理"的定位，且与平表数据模型不冲突。

---

请选择你想要的方案，或描述你期望的树状结构。
