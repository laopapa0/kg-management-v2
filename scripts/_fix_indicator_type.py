import re

path = r'C:\Users\pan47\Desktop\Demo v2\src\data\indicatorDefinitions.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Simpler approach: extract all id: and treeParentId: patterns
all_ids = set(re.findall(r'^\s+id:\s*"([^"]+)"', content, re.MULTILINE))
parent_ids = set(re.findall(r'^\s+treeParentId:\s*"([^"]+)"', content, re.MULTILINE))

print(f'All IDs: {len(all_ids)}')
print(f'Parent IDs: {len(parent_ids)}')

# Nodes with children = IDs that appear as someone's treeParentId
# Also include l1-* and l2-* as virtual groups
has_children = all_ids & parent_ids
l1_l2 = {i for i in all_ids if i.startswith('l1-') or i.startswith('l2-')}
virtual_ids = has_children | l1_l2

print(f'Has children (treeParentId refs): {len(has_children)}')
print(f'L1/L2 virtual: {len(l1_l2)}')
print(f'Total virtual: {len(virtual_ids)}')
print(f'Leaf: {len(all_ids) - len(virtual_ids)}')

# Now replace indicatorType
lines = content.split('\n')
new_lines = []
current_id = None
count = 0

for line in lines:
    s = line.strip()
    
    # Track current entry id
    m_id = re.match(r'^\s+id:\s*"([^"]+)"', line)
    if m_id:
        current_id = m_id.group(1)
    
    # Replace indicatorType
    if 'indicatorType:' in line and current_id:
        if current_id in virtual_ids:
            new_lines.append(line.replace('原子指标', '虚拟分组').replace('普通指标', '虚拟分组'))
        else:
            new_lines.append(line.replace('原子指标', '普通指标').replace('虚拟分组', '普通指标'))
        count += 1
        continue
    
    # Reset id on closing }
    if s == '},':
        current_id = None
    
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print(f'Replaced {count} entries')
