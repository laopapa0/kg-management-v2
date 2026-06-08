import json

with open(r'C:\Users\pan47\.codewhale\sessions\e52e502f-f16d-4751-9f47-f01a65ac2953\artifacts\art_call_00_yhoAppFlnaf2NJWygbbU6023.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

issues = json.loads(data['content'][0]['text'])

# Group by label
buckets = {}
for i in issues:
    labels = [l['name'] for l in i.get('labels', [])]
    state = i['state']
    for label in labels:
        buckets.setdefault(label, []).append(i)
    if not labels:
        buckets.setdefault('(no label)', []).append(i)

# Print grouped summary
important_labels = ['needs-triage', 'ready-for-agent', 'ready-for-human', 'needs-info']
for label in important_labels:
    items = buckets.get(label, [])
    if items:
        print(f'\n## {label} ({len(items)})')
        for item in items[:5]:
            print(f'  #{item["number"]:>3}  {item["title"][:100]}')

print('\n--- all issues ---')
for i in issues:
    labels = [l['name'] for l in i.get('labels', [])]
    print(f'#{i["number"]:>3}  [{",".join(labels) if labels else "no-label":>25}]  {i["title"][:90]}')
