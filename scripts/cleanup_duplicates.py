"""
Clean up duplicate issues #65-#70 and fix blocking references.
"""
import sys
sys.path.insert(0, '.')
from scripts.github_issues_api import GitHubAPI, get_repo_info

api = GitHubAPI(*get_repo_info())

# 1. Close duplicates with note pointing to original
DUP_MAP = {
    65: 59,   # #1 旧模块路由清单
    66: 60,   # #2 路由注释
    67: 61,   # #3 Dashboard
    68: 62,   # #4 知识库审核
    69: 63,   # #5 NOC审核
    70: 64,   # #6 报告Shell
}

for dup, orig in DUP_MAP.items():
    api.update_issue(dup, state='closed')
    api.add_comment(dup, f"重复 issue，请使用 #{orig}")
    print(f"Closed #{dup} (duplicate -> #{orig})")

# 2. Fix blocking references in dependent issues
FIX_MAP = {
    # old_num -> new_num
    66: 60,   # App.tsx + Sidebar
    68: 62,   # 知识库审核
    70: 64,   # 报告Shell
    75: 75,   # no change, self-reference
    76: 76,   # no change
}

# Issues that need their blocking comments fixed
COMMENT_FIXES = {
    71: ("#64", "#70"),   # 筛选器 depends on 报告Shell: #70 -> #64
    72: ("#64", "#70"),
    82: None,  # depends on #15 = #81, check
    84: ("#62", "#68"),   # 知识库 depends on 审核: #68 -> #62
    87: ("#64", "#70"),   # 自动化 depends on 报告Shell
    88: ("#64", "#70"),   # store depends on 报告Shell
    89: ("#60", "#66"),   # 导航 depends on 路由注释: #66 -> #60
}

for issue_num, fix in COMMENT_FIXES.items():
    if fix:
        new_ref, old_ref = fix
        issue = api.get_issue(issue_num)
        body = issue.get('body', '')
        if old_ref in body:
            new_body = body.replace(f'#{old_ref}', f'#{new_ref}')
            # Also fix internal references like "#66" -> "#60"
            api.update_issue(issue_num, body=new_body)
            print(f"Fixed #{issue_num} body: #{old_ref} -> #{new_ref}")

# Also fix the blocking comments
for issue_num, fix in COMMENT_FIXES.items():
    if fix:
        new_ref, old_ref = fix
        # Add a new comment clarifying
        api.add_comment(issue_num, f"> 阻塞于 #{new_ref}（原引用 #{old_ref} 已清理）")
        print(f"Fixed #{issue_num} comment: #{old_ref} -> #{new_ref}")

print("\nDone!")
