import re

path = r'C:\Users\pan47\Desktop\Demo v2\src\data\indicatorDefinitions.ts'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 解析每个 entry 片段: { ... },
entries = []
current = {}
in_entry = False
for line in c.split('\n'):
    s = line.strip()
    if s == '{': in_entry = True; current = {}
    elif s == '},':
        in_entry = False
        current['_end'] = True
        entries.append(dict(current))
    elif in_entry:
        m = re.match(r'(\w+):\s*(.+?)[,]?\s*$', s)
        if m:
            k = m.group(1)
            v = m.group(2).strip().strip('"').strip("'")
            current[k] = v

# 根据 level1/level2 重新分配 treeParentId
changes = {'default': 0, 'l3': 0}
for e in entries:
    dept = e.get('department', '')
    l1 = e.get('level1', '')
    l2 = e.get('level2', '')

    if not dept or not l1:
        continue

    if l2 == '未分类' or l1 == '未分类':
        e['_tpid'] = f'dept-{dept}-pending'
        changes['default'] += 1
    else:
        # 层级: L1(部门) → L2(level1=效能/经营) → L3(level2=一利五率/应收/.)
        e['_tpid'] = f'l3-{dept}-{l1}-{l2}'
        changes['l3'] += 1

print(f'→ L3 named: {changes["l3"]}')
print(f'→ default: {changes["default"]}')

# 写回, 只更新 treeParentId 行
lines = c.split('\n')
new_lines = []
entry_idx = -1
in_entry = False
for line in lines:
    s = line.strip()
    if s == '{': in_entry = True; entry_idx += 1
    elif s == '},': in_entry = False
    elif in_entry and 'treeParentId' in s:
        if entry_idx < len(entries):
            tpid = entries[entry_idx].get('_tpid')
            if tpid:
                # 重建整行
                indent = ' ' * (len(line) - len(line.lstrip()))
                new_lines.append(f'{indent}treeParentId: "{tpid}",')
                continue
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print('Done')
