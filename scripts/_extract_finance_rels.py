import re
import json

def extract_field(obj, field):
    m = re.search(rf'{field}:\s*"([^"]*)"', obj)
    return m.group(1) if m else ''

# 读取 indicatorDefinitions.ts
with open('src/data/indicatorDefinitions.ts', 'r', encoding='utf-8') as f:
    ind = f.read()

# 分割为单个对象
blocks = re.findall(r'\{[^}]+\}', ind)

info_map = {}
for b in blocks:
    code = extract_field(b, 'code')
    if not code:
        continue
    info_map[code] = {
        'name': extract_field(b, 'name'),
        'level1': extract_field(b, 'level1'),
        'department': extract_field(b, 'department'),
    }

# 读取 aiRecommendations.ts
with open('src/data/aiRecommendations.ts', 'r', encoding='utf-8') as f:
    ai = f.read()

# 查找 mockAppliedConnections 数组
start = ai.find('export const mockAppliedConnections')
end = ai.find('];', start)
arr = ai[start:end + 2]

conn_blocks = re.findall(r'\{[^}]+\}', arr)

lines = []
for b in conn_blocks:
    src = extract_field(b, 'sourceId')
    tgt = extract_field(b, 'targetId')
    typ = extract_field(b, 'relationTypeId')
    if not src or not tgt:
        continue
    si = info_map.get(src, {})
    ti = info_map.get(tgt, {})
    if si.get('department') == '财务部' and ti.get('department') == '财务部':
        lines.append({
            'no': len(lines) + 1,
            'sourceCode': src,
            'sourceName': si.get('name', src),
            'sourceLevel1': si.get('level1', ''),
            'relationType': typ,
            'targetCode': tgt,
            'targetName': ti.get('name', tgt),
            'targetLevel1': ti.get('level1', ''),
        })

# 写文件
with open('.handoff/finance-relations.md', 'w', encoding='utf-8') as f:
    f.write(f'# 财务部血缘关系（{len(lines)} 条）\n\n')
    f.write('| # | source | sourceLevel1 | relationType | target | targetLevel1 |\n')
    f.write('|---|--------|-------------|-------------|--------|-------------|\n')
    for r in lines:
        f.write(
            f"| {r['no']} | {r['sourceName']} | {r['sourceLevel1']} | {r['relationType']} | {r['targetName']} | {r['targetLevel1']} |\n"
        )

    f.write('\n---\n\n')
    f.write('## 关系类型分布\n\n')
    from collections import Counter
    type_counts = Counter(r['relationType'] for r in lines)
    for t, c in type_counts.most_common():
        f.write(f'- **{t}**: {c} 条\n')

    f.write('\n## sourceCode -> targetCode 原始数据\n\n')
    f.write('```\n')
    for r in lines:
        f.write(
            f'{r["no"]:3d}. sourceId: "{r["sourceCode"]}", relationTypeId: "{r["relationType"]}", targetId: "{r["targetCode"]}"\n'
        )
    f.write('```\n')

print(f'写入 .handoff/finance-relations.md：{len(lines)} 条财务部关系')

