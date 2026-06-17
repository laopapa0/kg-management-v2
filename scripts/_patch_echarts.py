# 修复 report.html 中 echarts 图表的渲染问题
with open('public/report.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. edgeSymbol: ['none', 'arrow'] → ['circle', 'arrow']
html = html.replace(
    "edgeSymbol: ['none', 'arrow']",
    "edgeSymbol: ['circle', 'arrow'], lineStyle: { color: '#5B8DEF', width: 2, opacity: 0.8 }"
)

# 2. 添加 backgroundColor
html = html.replace(
    "chart.setOption({",
    "chart.setOption({\n        backgroundColor: '#0F141F',"
)

# 3. edgeSymbolSize: 8 → 10
html = html.replace("edgeSymbolSize: 8", "edgeSymbolSize: 10")

count_bg = html.count("backgroundColor: '#0F141F'")
count_edge = html.count("lineStyle: { color: '#5B8DEF'")
print(f'Patched: {count_bg} backgrounds, {count_edge} edge styles')

with open('public/report.html', 'w', encoding='utf-8') as f:
    f.write(html)
