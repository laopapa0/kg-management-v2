import json
with open('.handoff/finance_relations.json', encoding='utf-8') as f:
    rels = json.load(f)
ids = set(r['id'] for r in rels)
cluster_ids = ['REL-059','REL-093','REL-105','REL-013','REL-101','REL-088','REL-078','REL-102','REL-109','REL-057','REL-096','REL-070','REL-072','REL-091','REL-094','REL-112','REL-121','REL-119','REL-113','REL-106','REL-066','REL-048','REL-087','REL-071','REL-069','REL-114','REL-117','REL-122','REL-118','REL-108','REL-090','REL-097','REL-098','REL-099','REL-120','REL-043','REL-100','REL-107','REL-103','REL-115','REL-111','REL-116']
missing = [cid for cid in cluster_ids if cid not in ids]
print(f'missing: {missing}')
# print all 67 IDs
all_ids = sorted(ids)
print(f'total IDs in JSON: {len(all_ids)}')
print(f'IDs: {all_ids[:10]}...')
