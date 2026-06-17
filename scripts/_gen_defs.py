import pandas as pd, re, uuid

df = pd.read_excel(r'C:\Users\pan47\Desktop\Demo v2\docs\指标定义（原始）（去除无用指标编码）.xlsx', sheet_name='指标基础数据')

lines = []
lines.append('// Auto-generated from Excel')
lines.append('')
lines.append('export interface IndicatorDefinition {')
for fld in ['id','code','name','indicatorCode','indicatorDisplayName','indicatorShowName','indicatorType','level1','level2','granularity','frequency','unit','isBigScreen','department','businessCaliber','techCaliber']:
    lines.append(f'  {fld}: string')
lines.append('  tags: string[]')
lines.append('  treeParentId?: string')
lines.append('}')
lines.append('')
lines.append('export const indicatorDefinitions: IndicatorDefinition[] = [')

stats = {'named_l3': 0, 'dot': 0, 'default': 0}

for _, row in df.iterrows():
    code = str(row['指标编码'])
    name = str(row['指标名字'])
    l1 = str(row.get('一级', '')).strip()
    if l1 == '/': l1 = '未分类'
    l2 = str(row.get('二级', '')).strip()
    if l2 == '/': l2 = '未分类'
    dept = str(row['对接部门']).strip()
    freq = str(row.get('关注频率', '')).strip()
    gran = str(row.get('颗粒度', '')).strip()
    unit = str(row.get('指标值单位', '')).strip()
    screen = str(row.get('屏', '')).strip()

    if l1 == '未分类':
        tpid = f'dept-{dept}-pending'
        stats['default'] += 1
    elif l2 == '未分类':
        tpid = f'l3-{dept}-{l1}-.'
        stats['dot'] += 1
    else:
        tpid = f'l3-{dept}-{l1}-{l2}'
        stats['named_l3'] += 1

    eid = str(uuid.uuid4()).replace('-', '')
    lines.append('  {')
    lines.append(f'    id: "{eid}",')
    lines.append(f'    code: "{code}",')
    lines.append(f'    name: "{name}",')
    lines.append(f'    indicatorCode: "{code}",')
    lines.append(f'    indicatorDisplayName: "{name}",')
    lines.append(f'    indicatorShowName: "{name}",')
    lines.append(f'    indicatorType: "原子指标",')
    lines.append(f'    level1: "{l1}",')
    lines.append(f'    level2: "{l2}",')
    lines.append(f'    granularity: "{gran}",')
    lines.append(f'    frequency: "{freq}",')
    lines.append(f'    unit: "{unit}",')
    lines.append(f'    isBigScreen: {str(bool(screen)).lower()},')
    lines.append(f'    department: "{dept}",')
    lines.append(f'    businessCaliber: "",')
    lines.append(f'    techCaliber: "",')
    lines.append(f'    tags: [],')
    lines.append(f'    treeParentId: "{tpid}",')
    lines.append('  },')

lines.append(']')

with open(r'C:\Users\pan47\Desktop\Demo v2\src\data\indicatorDefinitions.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

total = sum(stats.values())
print(f'Total: {total}')
print(f'Named L3: {stats["named_l3"]}')
print(f'L3 ".": {stats["dot"]}')
print(f'Default L2: {stats["default"]}')
