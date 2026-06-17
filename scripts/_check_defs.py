import re
path = r'C:\Users\pan47\Desktop\Demo v2\src\data\indicatorDefinitions.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
tpids = sorted(set(re.findall(r"treeParentId:\s*\"([^\"]+)\"", c)))
for t in tpids[:10]:
    print(t)
l3 = [t for t in tpids if t.startswith("l3-")]
dept_p = [t for t in tpids if t.startswith("dept-")]
print(f"\nl3-* unique: {len(l3)}")
print(f"dept-*-pending unique: {len(dept_p)}")
for t in l3[:3]:
    parts = t.split("-")
    print(f"  {t} -> dept={parts[1]}, L2={parts[2]}, L3={parts[3]}")
