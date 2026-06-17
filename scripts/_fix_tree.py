import re

path = r'C:\Users\pan47\Desktop\Demo v2\src\data\indicatorDefinitions.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: 分析所有 entry 并标记需要修改的 treeParentId
entries_raw = []
current = {}
in_entry = False
id_to_idx = {}
for line in content.split('\n'):
    s = line.strip()
    if s == '{':
        in_entry = True; current = {}
    elif s == '},':
        in_entry = False
        entries_raw.append(current)
    elif in_entry:
        m = re.match(r'(\w+):\s*"([^"]*)"', s)
        if m:
            current[m.group(1)] = m.group(2)

normal_changes = 0
weifenlei_changes = 0

for e in entries_raw:
    dept = e.get('department', '')
    l1 = e.get('level1', '')
    l2 = e.get('level2', '')
    tpid = e.get('treeParentId', '')
    if not tpid:
        continue
    if l2 == '未分类' or l1 == '未分类':
        e['_new_tpid'] = f'ui-pending-{dept}'
        weifenlei_changes += 1
    elif tpid.startswith('l2-'):
        rest = tpid[3:]
        e['_new_tpid'] = f'l3-{rest}-/'
        normal_changes += 1

print(f'Normal changes (→ l3-...-/): {normal_changes}')
print(f'未分类 → default: {weifenlei_changes}')

# Step 2: 写回，用 id 匹配 entry
old_to_new = {}
for e in entries_raw:
    eid = e.get('id', '')
    new_tpid = e.get('_new_tpid')
    if eid and new_tpid:
        old_to_new[e.get('treeParentId', '')] = new_tpid

print(f'ID → new treeParentId entries: {len(old_to_new)}')

# Step 3: 逐行处理
new_lines = []
current_tpid = None
in_entry = False

for line in content.split('\n'):
    s = line.strip()
    if s == '{':
        in_entry = True; current_tpid = None
        new_lines.append(line)
    elif s == '},':
        in_entry = False
        current_tpid = None
        new_lines.append(line)
    elif in_entry and 'treeParentId' in s:
        # Extract current treeParentId
        m = re.match(r'\s*treeParentId:\s*"([^"]*)"', line)
        if m:
            old_tpid = m.group(1)
            if old_tpid in old_to_new:
                new_line = line.replace(f'"{old_tpid}"', f'"{old_to_new[old_tpid]}"')
                new_lines.append(new_line)
                current_tpid = None
                continue
        new_lines.append(line)
    else:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print('Done!')
