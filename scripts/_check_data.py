import pandas as pd
df = pd.read_excel(r'C:\Users\pan47\Desktop\Demo v2\docs\指标定义（原始）（去除无用指标编码）.xlsx', sheet_name='指标基础数据')
matches = df[df['指标名字'].str.contains('利润', na=False)]
for _, r in matches.iterrows():
    print(f"{r['指标编码']} | {r['指标名字']} | L1={r['一级']} | L2={r['二级']} | dept={r['对接部门']}")

print()
# Also check 效能 indicators' 二级 values
eff = df[df['一级'] == '效能']
l2_counts = eff['二级'].value_counts()
print('效能 二级 分布:')
for v, c in l2_counts.items():
    print(f'  {v}: {c}')
