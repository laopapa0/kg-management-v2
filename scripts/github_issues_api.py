#!/usr/bin/env python3
"""
GitHub Issues REST API — 降级方案（可复用模块）。

首选方案是使用 GitHub MCP 工具（github_create_issue 等），更快且更安全。
当 GitHub MCP server 不可用时，用此模块通过 REST API 操作 GitHub Issues。
所有请求自动处理 UTF-8 编码，避免中文乱码。

依赖：Python 3.8+（标准库，无需额外安装）

使用方式：
    import github_issues_api as gh

    # 自动从 git remote 推断 owner/repo
    owner, repo = gh.get_repo_info()

    # 或手动指定
    api = gh.GitHubAPI("laopapa0", "kg-management-v2")

    # 创建 issue
    issue = api.create_issue("标题", "正文", labels=["ready-for-agent"])

    # 更新 issue
    api.update_issue(56, title="新标题", body="新正文")

    # 列表查询
    issues = api.list_issues(state="open", labels=["needs-triage"])
"""

import json
import os
import re
import subprocess
import urllib.request
import urllib.error
from typing import Optional, Any


def get_token() -> str:
    """从环境变量获取 GitHub token。"""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GITHUB_PERSONAL_ACCESS_TOKEN")
    if not token:
        raise RuntimeError(
            "GITHUB_TOKEN 或 GITHUB_PERSONAL_ACCESS_TOKEN 环境变量未设置。"
        )
    return token


def get_repo_info(cwd: Optional[str] = None) -> tuple[str, str]:
    """从 git remote -v 解析 owner 和 repo。

    Returns:
        (owner, repo) 如 ("laopapa0", "kg-management-v2")
    """
    try:
        output = subprocess.check_output(
            ["git", "remote", "-v"],
            cwd=cwd,
            stderr=subprocess.DEVNULL,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        raise RuntimeError("无法执行 git remote -v，请确保在 git 仓库中运行。")

    match = re.search(r"github\.com[:/]([^/]+)/([^/\s]+?)(?:\.git)?(?:\s|$)", output)
    if not match:
        raise RuntimeError(f"无法从 git remote 解析 owner/repo：\n{output}")
    return match.group(1), match.group(2)


class GitHubAPI:
    """GitHub Issues REST API 客户端。"""

    BASE = "https://api.github.com/repos"

    def __init__(self, owner: str, repo: str, token: Optional[str] = None):
        self.owner = owner
        self.repo = repo
        self.token = token or get_token()
        self._base = f"{self.BASE}/{self.owner}/{self.repo}"

    def _request(
        self,
        method: str,
        path: str,
        data: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """发送 HTTP 请求，自动处理认证、编码、错误。"""
        url = f"{self._base}{path}"
        body: Optional[bytes] = None
        if data is not None:
            body = json.dumps(data, ensure_ascii=False).encode("utf-8")

        req = urllib.request.Request(url, data=body, method=method)
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Content-Type", "application/json; charset=utf-8")
        req.add_header("User-Agent", "opencode-skill/1.0")

        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"GitHub API {method} {path} 失败 ({e.code}): {error_body[:500]}"
            ) from e

    # ── Issues CRUD ──

    def list_issues(
        self,
        state: str = "open",
        labels: Optional[list[str]] = None,
        sort: str = "created",
        direction: str = "desc",
        per_page: int = 30,
    ) -> list[dict[str, Any]]:
        """列出 issues。"""
        params = f"?state={state}&sort={sort}&direction={direction}&per_page={per_page}"
        if labels:
            params += "&labels=" + ",".join(labels)
        return self._request("GET", f"/issues{params}")  # type: ignore[return-value]

    def get_issue(self, number: int) -> dict[str, Any]:
        """获取单个 issue。"""
        return self._request("GET", f"/issues/{number}")  # type: ignore[return-value]

    def create_issue(
        self,
        title: str,
        body: str = "",
        labels: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """创建 issue。"""
        data: dict[str, Any] = {"title": title, "body": body}
        if labels:
            data["labels"] = labels
        return self._request("POST", "/issues", data)  # type: ignore[return-value]

    def update_issue(
        self,
        number: int,
        title: Optional[str] = None,
        body: Optional[str] = None,
        state: Optional[str] = None,
        labels: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """更新 issue。"""
        data: dict[str, Any] = {}
        if title is not None:
            data["title"] = title
        if body is not None:
            data["body"] = body
        if state is not None:
            data["state"] = state
        if labels is not None:
            data["labels"] = labels
        return self._request("PATCH", f"/issues/{number}", data)  # type: ignore[return-value]

    def add_comment(self, number: int, body: str) -> dict[str, Any]:
        """为 issue 添加评论。"""
        return self._request("POST", f"/issues/{number}/comments", {"body": body})  # type: ignore[return-value]

    def search_issues(self, q: str, per_page: int = 30) -> dict[str, Any]:
        """搜索 issues（全局搜索，不限当前 repo）。"""
        params = f"?q={urllib.parse.quote(q)}&per_page={per_page}"
        url = f"https://api.github.com/search/issues{params}"
        req = urllib.request.Request(url, method="GET")
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("User-Agent", "opencode-skill/1.0")
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))  # type: ignore[return-value]


# ── CLI 入口 ──

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("用法: python github_issues_api.py <command> [args...]")
        print()
        print("命令:")
        print("  list   [state] [labels]       列出 open issues")
        print("  get    <number>               获取单个 issue")
        print("  create <title> [body] [labels] 创建 issue")
        print("  update <number> <title> <body> 更新 issue")
        print("  comment <number> <body>        添加评论")
        sys.exit(1)

    cmd = sys.argv[1]
    api = GitHubAPI(*get_repo_info())

    try:
        if cmd == "list":
            state = sys.argv[2] if len(sys.argv) > 2 else "open"
            labels = sys.argv[3].split(",") if len(sys.argv) > 3 else None
            for issue in api.list_issues(state=state, labels=labels):
                print(f"#{issue['number']:>4} [{issue['state']:>6}] {issue['title']}")

        elif cmd == "get":
            issue = api.get_issue(int(sys.argv[2]))
            print(f"#{issue['number']} {issue['title']}")
            print(f"状态: {issue['state']} 标签: {[l['name'] for l in issue.get('labels', [])]}")
            print(f"\n{issue.get('body', '')}")

        elif cmd == "create":
            title = sys.argv[2]
            body = sys.argv[3] if len(sys.argv) > 3 else ""
            labels = sys.argv[4].split(",") if len(sys.argv) > 4 else None
            issue = api.create_issue(title, body, labels)
            print(f"创建成功: {issue['html_url']}")

        elif cmd == "update":
            issue = api.update_issue(int(sys.argv[2]), title=sys.argv[3], body=sys.argv[4])
            print(f"更新成功: {issue['html_url']}")

        elif cmd == "comment":
            comment = api.add_comment(int(sys.argv[2]), sys.argv[3])
            print(f"评论成功: {comment['html_url']}")

        else:
            print(f"未知命令: {cmd}")
            sys.exit(1)

    except RuntimeError as e:
        print(f"错误: {e}", file=sys.stderr)
        sys.exit(1)
