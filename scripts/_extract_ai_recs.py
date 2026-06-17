import pandas as pd, re, json, random

base = r'C:\Users\pan47\Desktop\0616 mock数据add'

# 1. 收集所有 AI 推荐
rows = []

# Excel 三重
for fname in ['日指标_关联三元组.xlsx', '月指标_关联三元组.xlsx', '日-月指标_关联三元组.xlsx']:
    sn = pd.ExcelFile(f'{base}/{fname}').sheet_names[0]
    df = pd.read_excel(f'{base}/{fname}', sheet_name=sn)
    for _, row in df.iterrows():
        rows.append({
            'sourceCode': str(row.get('头实体编码', row.get('头实体编码(日)', ''))),
            'targetCode': str(row.get('尾实体编码', row.get('尾实体编码(月)', ''))),
            'relation': str(row['关系']),
        })

# Cypher 04
with open(f'{base}/neo4j_export/04_indicator_rels.cypher', 'r', encoding='utf-8') as f:
    cypher = f.read()
for m in re.finditer(r"指标编码.*?'([^']+)'.*?指标编码.*?'([^']+)'[^}]*?`([^`]+)`", cypher):
    rows.append({
        'sourceCode': m.group(1),
        'targetCode': m.group(2),
        'relation': m.group(3),
    })

print(f'Total raw: {len(rows)}')

# 2. 映射关系类型
MAP = {
    '时间聚合(aggregatedTo)': 'AGGREGATES',
    '层级聚合(subIndicatorOf)': 'AGGREGATES',
    '计算衍生(derivedFrom)': 'DEPENDS_ON',
    '语义相关(relatedTo)': 'TRANSMISSION',
    '因果驱动(drives)': 'CAUSES',
    '业务流程上下游(upstreamOf)': 'TRANSMISSION',
    '计算衍生': 'DEPENDS_ON',
    '语义相关': 'TRANSMISSION',
    '因果驱动': 'CAUSES',
    '业务流程上下游': 'TRANSMISSION',
}

mapped = []
for r in rows:
    rt = MAP.get(r['relation'])
    if rt:
        mapped.append({**r, 'type': rt})

print(f'Mapped: {len(mapped)}')

# 3. 去重
seen = set()
unique = []
for r in mapped:
    key = (r['sourceCode'], r['targetCode'], r['type'])
    if key not in seen:
        seen.add(key)
        unique.append(r)

print(f'Unique: {len(unique)}')

# 4. 拆分: 25 未应用, 其余已应用
random.seed(42)
random.shuffle(unique)
unapplied = unique[:25]
applied = unique[25:]

print(f'Applied (canvas): {len(applied)}')
print(f'Unapplied (AI tab): {len(unapplied)}')

# 5. 生成 TS 文件
def gen_ts(arr, var_name):
    lines = [f'export const {var_name} = [']
    for i, r in enumerate(arr):
        comma = ',' if i < len(arr) - 1 else ''
        # 从指标编码推导 sourceName/targetName（简化为编码）
        src = r['sourceCode']
        tgt = r['targetCode']
        lines.append(f'  {{ sourceId: "{src}", targetId: "{tgt}", relationTypeId: "{r["type"]}" }}{comma}')
    lines.append('];')
    return '\n'.join(lines)

def gen_ai_ts(arr):
    lines = ['export const mockAiRecommendations = [']
    for i, r in enumerate(arr):
        comma = ',' if i < len(arr) - 1 else ''
        conf = round(random.uniform(0.55, 0.95), 2)
        lines.append(f'  {{ sourceId: "{r["sourceCode"]}", targetId: "{r["targetCode"]}", relationTypeId: "{r["type"]}", confidence: {conf}, reason: "" }}{comma}')
    lines.append('];')
    return '\n'.join(lines)

out = f'''// Auto-generated AI recommendation data
// Generated from Excel triplets + Cypher 04_indicator_rels

export interface MockConnection {{
  sourceId: string
  targetId: string
  relationTypeId: string
}}

export interface MockAiRecommendation {{
  sourceId: string
  targetId: string
  relationTypeId: string
  confidence: number
  reason: string
}}

{gen_ts(applied, 'mockAppliedConnections')}

{gen_ai_ts(unapplied)}
'''

out_path = r'C:\Users\pan47\Desktop\Demo v2\src\data\aiRecommendations.ts'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(out)

print(f'\nWritten to: {out_path}')
print(f'mockAppliedConnections: {len(applied)} items')
print(f'mockAiRecommendations: {len(unapplied)} items')
