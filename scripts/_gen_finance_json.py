import re, json

def extract_field(text, field):
    m = re.search(rf'{field}:\s*(true|false|"([^"]*)"|\d+)', text)
    if not m: return ''
    if m.group(2) is not None: return m.group(2)
    return m.group(1)

def parse_blocks(text):
    blocks = []
    in_block = False
    depth = 0
    buf = ''
    for ch in text:
        if ch == '{':
            depth += 1
            if not in_block:
                in_block = True
                buf = '{'
                continue
        if not in_block: continue
        buf += ch
        if ch == '}':
            depth -= 1
            if depth == 0:
                in_block = False
                blocks.append(buf)
                buf = ''
    return blocks

# indicatorDefinitions
with open('src/data/indicatorDefinitions.ts', encoding='utf-8') as f:
    blocks1 = parse_blocks(f.read())
info_map = {}
for b in blocks1:
    code = extract_field(b, 'code')
    if not code: continue
    info_map[code] = {
        'name': extract_field(b, 'name'),
        'level1': extract_field(b, 'level1'),
        'department': extract_field(b, 'department'),
    }
print(f'codes: {len(info_map)}')

# aiRecommendations
with open('src/data/aiRecommendations.ts', encoding='utf-8') as f:
    ai = f.read()
start = ai.find('export const mockAppliedConnections')
end = ai.find('];\n\nexport const mockAiRecommendations', start)
if end == -1: end = ai.find('];\n\n', start)
arr_text = ai[start:end + 2]
blocks2 = parse_blocks(arr_text)

lines = []
rel_idx = 0
for b in blocks2:
    src = extract_field(b, 'sourceId')
    tgt = extract_field(b, 'targetId')
    typ = extract_field(b, 'relationTypeId')
    if not src or not tgt: continue
    rel_idx += 1
    si = info_map.get(src, {})
    ti = info_map.get(tgt, {})
    if si.get('department','') != '财务部' or ti.get('department','') != '财务部': continue
    lines.append({
        'id': f'REL-{rel_idx:03d}',
        'sourceName': si.get('name', src),
        'sourceLevel1': si.get('level1', ''),
        'relationType': typ,
        'targetName': ti.get('name', tgt),
        'targetLevel1': ti.get('level1', ''),
    })

with open('.handoff/finance_relations.json', 'w', encoding='utf-8') as f:
    json.dump(lines, f, ensure_ascii=False, indent=2)
print(f'finance relations: {len(lines)}')
