"""Close issues #83-#91"""
import sys
sys.path.insert(0, '.')
from scripts.github_issues_api import GitHubAPI, get_repo_info

api = GitHubAPI(*get_repo_info())

for num in range(83, 92):
    try:
        api.update_issue(num, state='closed')
        api.add_comment(num, '已完成并合并到 main。')
        print(f'Closed #{num}')
    except Exception as e:
        print(f'#{num} error: {e}')

print('Done!')
