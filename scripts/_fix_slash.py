import re

path = r'C:\Users\pan47\Desktop\Demo v2\src\data\indicatorDefinitions.ts'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed = 0
for line in lines:
    s = line.rstrip()
    if 'treeParentId' in s and 'l3-' in s:
        # Find the treeParentId value regardless of broken formatting
        # Format we want:   treeParentId: "l3-dept-l1-l2-.",
        m = re.search(r'(l3-[^",]*)', s)
        if m:
            val = m.group(1).rstrip('/') + '.'
            new_line = f'    treeParentId: "{val}",'
            new_lines.append(new_line + '\n')
            fixed += 1
            continue
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Fixed {fixed} lines')

# Verify
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
t = re.findall(r'treeParentId:\s*"(l3-[^"]+)"', c)
print(f'Samples: {t[:3]}')
ends_with_dot = sum(1 for x in t if x.endswith('.'))
print(f'l3-*-.: {ends_with_dot}')
broken = re.findall(r'treeParentId: "[^"]*\n', c)
print(f'Broken (no closing quote): {len(broken)}')
