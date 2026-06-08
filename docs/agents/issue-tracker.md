# Issue Tracker 配置

本仓库使用 **GitHub Issues** 作为 issue tracker。

## 工作模式

- **代码和 issues 同仓库**：代码与 issues、PRDs 存放在同一个 GitHub 仓库中
- 创建 issue 时默认应用 `needs-triage` 标签

### 操作优先级

对 GitHub Issues 的读写操作按以下优先级选择工具：

1. **首选：`scripts/github_issues_api.py`**  
   使用 REST API 执行 create / update / list / comment / search。  
   自动从 `git remote` 推断 owner/repo，从 `GITHUB_TOKEN` 环境变量获取认证（不硬编码）。  
   - `python scripts/github_issues_api.py list` — 列出 open issues  
   - `python scripts/github_issues_api.py get <N>` — 获取单个 issue  
   - `python scripts/github_issues_api.py create "<title>" "<body>" "label1,label2"`  
   - `python scripts/github_issues_api.py update <N> "<title>" "<body>"`  
   - `python scripts/github_issues_api.py comment <N> "<body>"`  

2. **备选：GitHub MCP 工具** (`github_create_issue`、`github_update_issue` 等)  
   当 `.py` 脚本不可用或返回失败时使用。

3. **手动 fallback**：`curl` 或 `Invoke-RestMethod` 直接调用 `https://api.github.com/repos/` 端点，Header 传入 `Authorization: Bearer $env:GITHUB_TOKEN`。

### 认证

GITHUB_TOKEN 通过环境变量传入，不在代码或配置文件中硬编码。  
脚本内使用 `os.environ.get("GITHUB_TOKEN")` 读取。

## Issue 规范

- 标题应简明描述问题或需求
- 描述中应包含上下文、期望行为和验收标准
- Bug 类 issue 应包含复现步骤
- 使用 labels 标记类型（`bug`、`feature`、`docs` 等）和状态（`needs-triage`、`ready-for-agent` 等）

## PRD 存放

产品需求文档（PRD）通过 `to-prd` skill 生成，以 issue 形式存放到 GitHub Issues 中，标题前缀为 `[PRD]`。

---

## 已知陷阱：PowerShell 管道中文编码损坏

### 问题

在 Windows 上通过 PowerShell 的 here-string `@"..."@ | python` 向 Python stdin 发送中文时，中文会在管道中损坏（变成乱码）。  
这是因为 PowerShell 的管道编码默认使用系统代码页（如 Windows-1252），而非 UTF-8。

### 错误示例

```powershell
# ❌ 以下做法会导致中文乱码：
@"body = '中文内容'"@ | python
```

### 解决方案（按推荐度排序）

**方案 A：写入 `.py` 文件后直接执行（推荐，最可靠）**
```powershell
# 将 Python 代码写入文件，然后直接执行
New-Item -Path "scripts/update_batch.py" -Force
# ... 写入内容，确保 .py 文件以 UTF-8 保存 ...
python scripts/update_batch.py
```
Write 工具默认使用 UTF-8，不经过 PowerShell 管道，编码安全。

**方案 B：设置 PowerShell 输出编码为 UTF-8**
```powershell
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$OutputEncoding = [Text.UTF8Encoding]::new()
@"body = '中文'"@ | python
```
缺点：影响当前终端的所有后续管道输出；需要在每次新会话中重新设置。

**方案 C：设置 Python 的 stdin 编码 + PowerShell 代码页**
```powershell
chcp 65001
$env:PYTHONIOENCODING = 'utf-8'
@"body = '中文'"@ | python
```
缺点：`chcp 65001` 可能导致部分控制台程序输出异常。

**方案 D：使用 Python 的 `-c` 参数 + 编码声明**
```powershell
python -X utf8 -c "print('中文')"
```
缺点：`-X utf8` 仅在 Python 3.7+ 可用，且对多行 here-string 不直接适用。

### 结论

在 opencode 的 Windows + PowerShell 环境下，**始终使用方案 A**（写 `.py` 文件后 `python` 直接执行）传递中文内容。  
GitHub API 的 Python 脚本内部已正确处理 UTF-8（`ensure_ascii=False` + `Content-Type: application/json; charset=utf-8`），问题仅出在 PowerShell→Python 的管道传输环节。
