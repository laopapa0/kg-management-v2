import sys
with open('public/report.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace(
    "chart.setOption({",
    "chart.setOption({\n        backgroundColor: '#1A2030',"
)

with open('public/report.html', 'w', encoding='utf-8') as f:
    f.write(html)

# verify
count = html.count("backgroundColor: '#1A2030'")
print(f"patched {count} chart(s)")
