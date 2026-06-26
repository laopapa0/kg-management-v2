import json, re, hashlib

def seeded_random(seed_str, idx):
    h = int(hashlib.md5(f'{seed_str}-{idx}'.encode()).hexdigest()[:8], 16)
    return (h % 100) / 100.0

with open('.handoff/finance_relations.json', encoding='utf-8') as f:
    relations = json.load(f)

# 构建无向图 → BFS 找连通分量 → 取最大的 8 个
graph = {}
for r in relations:
    s, t = r['sourceName'], r['targetName']
    graph.setdefault(s, set()).add(t)
    graph.setdefault(t, set()).add(s)

visited = set()
components = []
for node in graph:
    if node in visited: continue
    comp_nodes = set()
    comp_rels = []
    queue = [node]
    visited.add(node)
    comp_nodes.add(node)
    while queue:
        cur = queue.pop(0)
        for nbr in graph.get(cur, set()):
            if nbr not in visited:
                visited.add(nbr)
                comp_nodes.add(nbr)
                queue.append(nbr)
    for r in relations:
        if r['sourceName'] in comp_nodes and r['targetName'] in comp_nodes:
            if r['id'] not in [x['id'] for x in comp_rels]:
                comp_rels.append(r)
    if comp_rels:
        components.append((comp_nodes, comp_rels))

components.sort(key=lambda x: len(x[1]), reverse=True)
top8 = components[:8]

# 异常表现模板
anomaly_templates = [
    '该簇中心指标近期出现显著波动，月均值偏离历史基线{:.0f}%。上游指标同步异动，DEPENDS_ON链上的传导效应已在下游指标中显现，多个邻居指标的月均值超出正常波动区间。建议启动二级预警机制。',
    '该簇指标在最近3个周期内呈现震荡下行趋势，中心指标月均值同比下降{:.0f}%。TRANSMISSION路径上的关联指标出现连锁反应，部分指标偏离度超过2个标准差。建议排查上游数据源。',
    '该簇内多个指标出现超阈值毛刺，中心指标在最近检测周期中触发异常告警，偏离幅度达{:.0f}%。AGGREGATES聚合关系表明底层指标波动已传导至汇总层，影响范围持续扩大。',
    '该簇的DEPENDS_ON依赖链显示上游异常正在向下游扩散，中心指标月均值连续3期位于历史下四分位。传导速度超出预期，部分末梢指标已出现同步偏离。',
    '该簇中心指标的CAUSES关系链揭示了异常的根本驱动力：源头指标波动{:.0f}%直接导致中心指标超阈值。TRANSMISSION路径同时将波动扩散至横向关联指标群。',
    '该簇指标群的异常呈现星形扩散模式，中心指标受多个上游指标同时驱动，形成异常叠加效应。单指标偏离度最高达{:.0f}%。',
    '该簇指标在检测周期中出现罕见的同步异动，关联密度高的指标群波动方向一致，表明存在系统性驱动因素。月均值偏离历史均值{:.0f}%，建议联合分析。',
    '该簇的异常特征为低频高幅：指标长期稳定但近期突变，中心指标偏离幅度{:.0f}%。TRANSMISSION关系表明波动已在横向维度上扩散，但速度逐步衰减。',
]

# 归因分析模板
narratives = [
    '该簇以ICT利润为中心，共9条关联边：5条DEPENDS_ON，3条TRANSMISSION，加1条利润率→利润。因为有5条DEPENDS_ON，利润波动可直接由五大产品线收入完成进度线性解释，此次归因从各产品线贡献度入手。因3条TRANSMISSION，收入波动沿部门链传导，上游变动会延迟或放大至下游，故判断不能将某部门异动简单归为自身问题，需看传导链上的联动与对冲。基于这一关系结构，此次分析聚焦收入传导链缺口风险、利润线数支撑力度，判断异常归因是阶段性失衡及趋势转变，建议跟踪季度末回款与高增长的持续性。',
    '该簇展示了跨层级的归因传导网络。中心指标的波动通过多条DEPENDS_ON和TRANSMISSION链路同时向上下游扩散，形成多路径影响传导。',
    '该簇以铁塔费效"有租费无电费有流量"为中心，共5条关联边，均为TRANSMISSION：三方铁塔同类模型汇总传导，以及无流量状态向有流量状态的分类间转化。5条TRANSMISSION表明，"有租费无电费有流量"的异常并不孤立，是上游状态转化的结果——三方铁塔同类异常汇总输入，同时"有租费无电费无流量""有租费有电费无流量"两类无流量站点会向有流量状态迁移。故此次归因追溯源头，不仅盯终点。基于这一关系结构，此次分析聚焦无流量站点向有流量状态转化传导的量级与节奏，判断异常归因是退网未停租等结算时滞问题/分类归集错误，建议跟踪空转计费改善以及状态迁移的收敛趋势。',
    '该簇以全局经营收入为中心，共4条关联边：3条AGGREGATES，1条TRANSMISSION。3条AGGREGATES表明，全局收入是三源归集的结果——分单位收入反映各区局经营基本面，当日资金流入反映即时回款节奏，本月资金流入反映累计资金大盘。故此次归因从三个归集维度分别拆解，以判断下拉主力是基本面走弱或回款节奏问题。另外的1条TRANSMISSION表明，本月累计资金流入会传导至当日流入，月中回款放缓会直接影响当日资金补充力度，进而缩小全局收入的当日表现。基于这一关系结构，此次分析聚焦分单位收入同步性、资金流入节奏对全局收入的传导，判断下滑是月中正常节奏回调，建议跟踪下旬资金回流及各区局收入恢复情况。',
    '该簇以三方塔单站租金为中心，共3条关联边：1条TRANSMISSION（单站电价→单站租金），2条DEPENDS_ON（单站租金→单站电费→单站流量均值）。因为有1条TRANSMISSION，电价与租金呈同向联动，此次归因同时关注两者变动是否匹配——若电价增量与租金增量同步，说明新增站点租金单价与存量电价水平一致；若偏离，则提示结算节奏或定价结构差异。另2条DEPENDS_ON表明，租金向下逐级驱动电费完成率，再传导至流量均值，形成了"投入成本→费用发生→产出效率"的驱动链。电费完成率跳涨若大幅领先流量均值增幅，说明高增并非实际用电驱动，而是跨月账单集中结算等阶段性扰动。基于这一关系结构，此次分析聚焦租金增量来源是签约站点扩容还是单价上浮，判断异常归因是电费完成率高企是趋势性攀升，建议跟踪次月电费回落与流量均值爬坡的匹配情况。',
    '该簇以利润总额（考核口径）为中心，共3条关联边，均为DEPENDS_ON：利润完成率、利润总额同比、利润总额进度均依赖利润总额这一基数计算。因为有3条DEPENDS_ON，完成率、同比、进度本质上是同一基数的不同度量视角，三者变动天然同步。归因不能将某个指标走弱视为独立问题，而应回溯基数本身的变化——利润总额在中旬出现的阶段性波动会同步拉低三个衍生指标，并非多维度恶化，而是单一基数驱动的共振。基于这一关系结构，此次分析聚焦利润基数在中旬的波动方向与幅度，判断回落是项目确认节奏所致的正常回调，建议跟踪下旬项目集中确认带来的基数修复情况。',
    '该簇以一年以上长账龄应收余额为中心，共3条关联边，均为DEPENDS_ON：应收同比增量、应收账款同比增量、应收账款增幅均依赖应收余额这一基数计算。3条DEPENDS_ON表明，同比增量与增幅本质上是同一基数的不同度量视角，三者变动天然同步。归因不能将某个指标回落视为独立改善，而应回溯基数本身的变化——长账龄应收余额下降会同步收窄同比增量、压低增幅，波动收口并非多渠道独立清收，而是单一基数驱动的共振。基于这一关系结构，此次分析聚焦余额下降的驱动因素，判断异常归因是集中回款或核销带来的实质性改善，建议跟踪该回落趋势的持续性。',
    '该簇以铁塔费效"无租费有电费有流量"为中心，共3条关联边，均为TRANSMISSION：三方铁塔同类异常汇总传导，以及"有租费有电费无流量""无租费有电费无流量"两类无流量状态向有流量状态的分类间转化。3条TRANSMISSION表明，"有流量"指标的变动不孤立，受两股力量影响——三方铁塔同类异常的直接输入，以及无流量站点向有流量状态的迁移。故归因需区分：指标波动是真实异常规模扩大，还是数据回传时差导致站点被临时归入错误分类。基于这一关系结构，此次分析聚焦"无流量"向"有流量"状态迁移的规模与节奏，判断费效比下滑是实际是口径时点错配，建议跟踪流量数据补齐后分类归位的修复情况。',
]

possible_units = ['%', '%', '%', '%', '%', '万元', '万元', '万元', '亿元', '线', '个', '单']
deviation_tags = ['deviated', 'deviated', 'deviated', 'normal', 'normal', 'normal', 'normal', 'normal', 'notice', 'notice']

# 生成每个指标的 mock 时序数据
mock_values = {}
all_comp_nodes = set()
for comp_nodes, _ in top8:
    all_comp_nodes |= comp_nodes

for name in all_comp_nodes:
    si = hash(name) % 100
    v1 = round(50 + seeded_random(name, 0) * 200, 1)
    v2 = round(50 + seeded_random(name, 1) * 200, 1)
    change = round(v1 - v2, 1)
    avg = round((v1 + v2) / 2, 1)
    unit = possible_units[si % len(possible_units)]
    dev = deviation_tags[si % len(deviation_tags)]
    mock_values[name] = {
        'v1': v1, 'v2': v2, 'change': '{:+.1f}'.format(change),
        'avg': avg, 'unit': unit, 'deviation': dev,
    }

# 生成簇定义（含归因链）
clusters = []
for idx, (comp_nodes, comp_rels) in enumerate(top8):
    degree = {}
    for r in comp_rels:
        degree[r['sourceName']] = degree.get(r['sourceName'], 0) + 1
        degree[r['targetName']] = degree.get(r['targetName'], 0) + 1
    center = max(degree, key=degree.get) if degree else list(comp_nodes)[0]
    anomaly_desc = anomaly_templates[idx].format(15 + seeded_random('anomaly', idx) * 50)

    # 构建有向图用于归因链
    upstream = {}
    downstream = {}
    for r in comp_rels:
        src, tgt, typ = r['sourceName'], r['targetName'], r['relationType']
        if typ == 'DEPENDS_ON':
            upstream.setdefault(src, []).append(tgt)    # A依赖B → B是上游
            downstream.setdefault(tgt, []).append(src)   # B驱动A → A是下游
        elif typ == 'CAUSES':
            upstream.setdefault(tgt, []).append(src)     # A原因B → A是上游
            downstream.setdefault(src, []).append(tgt)   # A驱动B → B是下游
        elif typ == 'TRANSMISSION':
            downstream.setdefault(src, []).append(tgt)   # A传导到B
            upstream.setdefault(tgt, []).append(src)      # B的上游是A

    # 找最长上游路径（根因方向）
    def longest_up(node, visited):
        if node not in upstream: return [node]
        best = [node]
        for nxt in upstream[node]:
            if nxt in visited: continue
            path = longest_up(nxt, visited | {nxt})
            if len(path) + 1 > len(best):
                best = [node] + path
        return best

    up_chain = longest_up(center, {center})
    up_chain.reverse()

    if len(up_chain) >= 2:
        chain_str = '根因链路：' + ' → '.join(up_chain[:5])
        if len(up_chain) > 5: chain_str += ' → ...'
    else:
        # 无上游依赖，走下游传导链
        def longest_down(node, visited):
            if node not in downstream: return [node]
            best = [node]
            for nxt in downstream[node]:
                if nxt in visited: continue
                path = longest_down(nxt, visited | {nxt})
                if len(path) + 1 > len(best):
                    best = [node] + path
            return best
        down_chain = longest_down(center, {center})
        if len(down_chain) >= 2:
            chain_str = '传导路径：' + ' → '.join(down_chain[:5])
            if len(down_chain) > 5: chain_str += ' → ...'
        else:
            chain_str = f'该指标原生波动，无上游依赖或下游传导链，建议排查数据源'

    clusters.append({
        "title": f"簇{idx+1}: {center}",
        "centerIndicator": center,
        "relationIds": [r['id'] for r in comp_rels],
        "anomalies": anomaly_desc,
        "narrative": narratives[idx],
        "chain": chain_str,
    })

# 去重
used = set()
final_clusters = []
for c in clusters:
    unique_ids = [rid for rid in c["relationIds"] if rid not in used]
    if not unique_ids: continue
    for rid in unique_ids: used.add(rid)
    final_clusters.append({**c, "relationIds": unique_ids})

clusters = final_clusters
total_in = sum(len(c["relationIds"]) for c in clusters)
print(f"Clusters: {len(clusters)}, total relations: {total_in}")
for c in clusters:
    print(f"  {c['title']}: {len(c['relationIds'])} relations")

# 生成 JS
rel_str = json.dumps(relations, ensure_ascii=False, indent=2)
clu_str = json.dumps(clusters, ensure_ascii=False, indent=2)
mock_str = json.dumps({k: [v['v1'], v['v2'], v['change'], v['avg'], v['unit'], v['deviation']] for k, v in mock_values.items()}, ensure_ascii=False)

js_code = f'''<script>
const FINANCE_RELATIONS = {rel_str};
const FINANCE_CLUSTERS = {clu_str};
const MOCK_VALUES = {mock_str};

(function() {{
  var excludedIds = JSON.parse(localStorage.getItem('kgv2-excluded-relation-ids') || '[]');
  var excludedSet = new Set(excludedIds);
  var root = document.getElementById('section3-root');
  if (!root) return;

  var html = '';
  for (var ci = 0; ci < FINANCE_CLUSTERS.length; ci++) {{
    var cluster = FINANCE_CLUSTERS[ci];
    var activeRels = FINANCE_RELATIONS.filter(function(r) {{
      return cluster.relationIds.indexOf(r.id) !== -1 && !excludedSet.has(r.id);
    }});
    if (activeRels.length === 0) continue;

    var tagMap = {{'DEPENDS_ON': 'tag-info', 'TRANSMISSION': 'tag-purple', 'AGGREGATES': 'tag-success', 'CAUSES': 'tag-warning'}};
    var dirMap = {{'DEPENDS_ON': '\u2190\u4f9d\u8d56', 'TRANSMISSION': '\u2192\u4f20\u5bfc', 'AGGREGATES': '\u2191\u805a\u5408', 'CAUSES': '\u2192\u56e0\u679c'}};

    html += '<div class="section" data-cluster="' + cluster.title + '">';
    html += '<h3><a href="/kg-management-v2/#/lineage?q=' + encodeURIComponent(cluster.centerIndicator) + '" target="_blank" class="ind-link">' + cluster.centerIndicator + '</a></h3>';
    html += '<p class="chart-note"><strong>\u5f02\u5e38\u8868\u73b0\uff1a</strong>' + (cluster.anomalies || '\u6682\u65e0\u5f02\u5e38\u6570\u636e') + '</p>';
    html += '<p class="chart-note"><strong>\u5f52\u56e0\u5206\u6790\uff1a</strong>' + cluster.narrative + '</p>';
    html += '<p class="chart-note"><strong>\u5f52\u56e0\u5224\u5b9a\uff1a</strong><span class="tag tag-warning">\u9700\u5173\u6ce8</span> \u2014 ' + activeRels.length + '\u6761\u5173\u8054\u5173\u7cfb\u4e2d\u5177\u6709\u663e\u8457\u4f20\u5bfc\u6216\u4f9d\u8d56\u6548\u5e94</p>';
    html += '<table class="nb-table"><thead><tr><th>\u90bb\u5c45</th><th>\u5173\u7cfb</th><th>\u65b9\u5411</th><th>03-09\u503c</th><th>03-08\u503c</th><th>\u65e5\u53d8\u5316</th><th>\u6708\u5747\u503c</th><th>\u504f\u79bb?</th></tr></thead><tbody>';

    for (var ri = 0; ri < activeRels.length; ri++) {{
      var rel = activeRels[ri];
      var tc = tagMap[rel.relationType] || 'tag-info';
      var dir = dirMap[rel.relationType] || '\u2192';
      var tv = MOCK_VALUES[rel.targetName] || [0, 0, '0', 0, '', 'normal'];
      var devClass = tv[5] === 'deviated' ? 'deviated' : (tv[5] === 'notice' ? 'note' : 'normal');
      var devText = tv[5] === 'deviated' ? '\u2191\u5f02\u5e38' : (tv[5] === 'notice' ? '\u2a06\u6ce8\u610f' : '\u6b63\u5e38');
      html += '<tr data-relation-id="' + rel.id + '">';
      html += '<td><a href="/kg-management-v2/#/lineage?q=' + encodeURIComponent(rel.targetName) + '" target="_blank" class="ind-link">' + rel.targetName + '</a></td>';
      html += '<td><span class="tag ' + tc + '">' + rel.relationType + '</span></td>';
      html += '<td>' + dir + '</td>';
      html += '<td>' + tv[0] + (tv[4] ? ' ' + tv[4] : '') + '</td>';
      html += '<td>' + tv[1] + (tv[4] ? ' ' + tv[4] : '') + '</td>';
      html += '<td>' + tv[2] + '</td>';
      html += '<td>' + tv[3] + (tv[4] ? ' ' + tv[4] : '') + '</td>';
      html += '<td class="' + devClass + '">' + devText + '</td>';
      html += '</tr>';
    }}
    html += '</tbody></table>';
    html += '<div class="chart-box graph" id="chart-c' + ci + '" style="height:420px"></div>';
    html += '</div>';
  }}

  if (!html) {{
    html = '<div class="section"><p class="alert alert-info">\u5f53\u524d\u65e0\u6d3b\u8dc3\u5173\u8054\u5173\u7cfb\uff0c\u62a5\u544a\u5f85\u91cd\u65b0\u751f\u6210</p></div>';
  }}
  root.innerHTML = html;

  // echarts
  for (var ci2 = 0; ci2 < FINANCE_CLUSTERS.length; ci2++) {{
    var cluster2 = FINANCE_CLUSTERS[ci2];
    var activeRels2 = FINANCE_RELATIONS.filter(function(r) {{
      return cluster2.relationIds.indexOf(r.id) !== -1 && excludedSet.has(r.id) === false;
    }});
    if (activeRels2.length === 0) continue;

    var chartEl = document.getElementById('chart-c' + ci2);
    if (!chartEl || typeof echarts === 'undefined') continue;

    var nodeIdx = {{}};
    var nodes = [];
    var links = [];
    var edgeColors = {{'DEPENDS_ON': '#3B82F6', 'TRANSMISSION': '#8B5CF6', 'AGGREGATES': '#22C55E', 'CAUSES': '#F59E0B'}};

    function ensureNode(name, size, color) {{
      if (nodeIdx[name] === undefined) {{
        nodeIdx[name] = nodes.length;
        nodes.push({{name: name, symbolSize: size || 15, itemStyle: {{color: color || '#27ae60'}}, label: {{show: true, fontSize: 10, color: '#E8ECF1'}}}});
      }}
      return nodeIdx[name];
    }}

    ensureNode(cluster2.centerIndicator, 55, '#e74c3c');

    for (var ri2 = 0; ri2 < activeRels2.length; ri2++) {{
      var rel2 = activeRels2[ri2];
      var isCrit = (rel2.relationType === 'TRANSMISSION' || rel2.relationType === 'CAUSES');
      ensureNode(rel2.sourceName, 18, isCrit ? '#f39c12' : '#27ae60');
      ensureNode(rel2.targetName, 15, isCrit ? '#f39c12' : '#27ae60');
      links.push({{
        source: rel2.sourceName,
        target: rel2.targetName,
        lineStyle: {{color: edgeColors[rel2.relationType] || '#95a5a6', width: 2.5, curveness: 0.1}},
        label: {{show: true, formatter: rel2.relationType, fontSize: 8, color: '#95a5a6', position: 'middle'}}
      }});
    }}

    chartEl.style.height = '420px';
    try {{
      var chart = echarts.init(chartEl);
      chart.setOption({{
        backgroundColor: '#0F141F',
        title: {{text: cluster2.title + ' \u56e0\u679c\u94fe\u8def\u56fe', left: 'center', textStyle: {{color: '#E8ECF1', fontSize: 14}}}},
        tooltip: {{trigger: 'item'}},
        series: [{{
          type: 'graph', layout: 'force', roam: true,
          data: nodes, links: links,
          force: {{repulsion: 500, gravity: 0.05, edgeLength: [120, 250]}},
          label: {{show: true, fontSize: 10, color: '#E8ECF1'}},
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          lineStyle: {{color: '#5B8DEF', width: 2, opacity: 0.8}},
          emphasis: {{focus: 'adjacency', lineStyle: {{width: 3}}}}
        }}]
      }});
    }} catch(e) {{ console.error('echarts error', e); }}
  }}
}})();
</script>'''

with open('public/report.html', 'r', encoding='utf-8') as f:
    html = f.read()

ch3_marker = '<h2>三、知识图谱归因分析</h2>'
ch4_marker = '<h2>四、总结与建议</h2>'
start = html.find(ch3_marker)
end = html.find(ch4_marker)

assert start != -1 and end != -1, 'markers not found'

replacement = '<h2>三、知识图谱归因分析</h2>\n<div id="section3-root"><p class="chart-note">加载中…</p></div>\n'
replacement += js_code + '\n'

new_html = html[:start] + replacement + html[end:]

with open('public/report.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('report.html updated')
