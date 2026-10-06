# BlogGenerator · 团队源码安全副本

来自用户提供、团队共同开发的 `IS6620_GroupAssignment_Group21.py`。原始文件保持原样，此目录保存可发布副本 `app.py`。不是雇主 EDM 项目的源码迁移；不包含视频、ZIP、模型、向量库、虚拟环境、个人配置或凭据。

## 原有功能

- 2 种 Blog：产品介绍、主题分享。
- 4 种 EDM：产品推广、黑五、圣诞、折扣。
- 中文/英文输入与输出，键盘术语表优先替换，必要时通过 Ollama 翻译。
- Chroma + SentenceTransformer 检索 25 条内置营销风格示例。
- Ollama 流式生成初稿；Critic 返回审核 JSON 和修正文案，解析失败重试最多三次。
- 禁用词/竞品词规则和额外的竞品词检查；文本导出。

内置示例中的公开竞品名称用于格式/语气参考；提示要求不要把这些品牌输出到用户商品文案。示例不是公司客户资料，也不代表对竞品资产的使用授权。

## 本次副本的改动

原默认远端 HTTP 地址和示例占位地址替换为本机回环；模型名称、可选 token、embedding 模型与向量库目录改为环境变量。解析失败不再打印原始模型输出。业务提示、内容类型和审核流程保持。

本次只做语法/AST 和安全静态检查，**未运行模型、未启动 Streamlit、未安装依赖或下载 embedding 模型**。该程序的 AI Critic 不是持久的人类批准系统，也没有发送邮件/自动发布功能。模型判断及修正文案仍需人工审阅。

## 之后单独启动

Python 代码使用 `dict[str, ...]`，需 Python 3.9 或以上；实际安装的库可能要求更高版本。建议按所选依赖的要求准备 Python 3.11+ 环境。依赖未锁定，本次没有声称任意最新版本组合已完成运行验收。

```powershell
cd blog-generator
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:OLLAMA_BASE_URL = "http://127.0.0.1:11434"
$env:OLLAMA_MODEL = "qwen2.5:7b"
$env:CHROMA_PATH = ".\.local\chroma"
.\.venv\Scripts\python.exe -m streamlit run app.py
```

需要已单独安装和准备好的 Ollama 服务及模型；`OLLAMA_MODEL` 只是示例，填写本机实际模型名。本地 Ollama 不要求 API Key；如以后使用明确获准的远端服务，可自行通过 `OLLAMA_API_KEY` 配置 token，勿写入源码或提交 Git。

`.env.example` 只是配置参考，程序读取进程环境变量，不自动加载此文件。首次初始化 SentenceTransformer 可能下载 embedding 模型，之后使用缓存；可通过 `EMBEDDING_MODEL` 指定已准备的本地模型路径。这些动作属于之后用户单独运行，本次没有执行。

| 变量 | 默认值 / 用途 |
|---|---|
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434`，仅本机默认 |
| `OLLAMA_MODEL` | `qwen2.5:7b` 示例；需本机已具备 |
| `OLLAMA_API_KEY` | 空；可选，仅从环境读取 |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5`，或本地模型路径 |
| `CHROMA_PATH` | `./.local/chroma`，已由 Git 忽略 |

## 静态检查

以下不导入 Streamlit、不初始化向量库、不调用模型：

```powershell
python -c "import ast,pathlib; ast.parse(pathlib.Path('app.py').read_text(encoding='utf-8')); print('AST OK')"
```

团队源码未提供开源许可证，本仓库不擅自替团队赋予新的开源授权。使用与进一步分享遵守团队实际权属及约定。
