# 提交范围与来源

目标是用户指定的已有仓库 [Christinesbt/marketing-automation](https://github.com/Christinesbt/marketing-automation)。首次提交时核对为空仓库、私有可见性、具有 push 权限。后续用户自行设为公开，并明确授权发布英文静态前端。只正常推送 `main`，不 force，不改变可见性。网站采用官方 GitHub Pages 工作流，范围见 [deployment.md](deployment.md)。

## 文件范围

- `marketing-console-prototype/`：独立纯前端、本机静态服务器、19 项离线测试、原创键盘 SVG 和生成脚本。
- `blog-generator/`：团队提供的 Blog + EDM Python 程序的最小安全整理版本，说明、依赖列表和空白环境变量示例。
- `docs/`：重新整理的产品、架构、能力分层、路线图、真实检查记录和仅有虚构数据的截图。
- `README.md` / `.gitignore`：启动方式、范围与排除规则。

不提交源视频、ZIP、企业 EDM 源码、数据库、虚拟环境、模型缓存、客户/平台标识、生产日志、内部地址或凭据。原有 Python/视频/EDM 工作区不变。源 EDM 文档只读用于提炼通用设计，最新本地验收边界没有被新仓库宣称完成。

## BlogGenerator 安全整理

原始 `E:\tech300\IS6620_GroupAssignment_Group21.py` 为用户提供的团队代码；只生成安全副本，不改原文件。原文件核对 SHA-256：

```text
9c4d713852d7088047db53083d71e60c3a8305d40712052128cba46ce5e4f559
```

副本保留 2 Blog + 4 EDM 的生成、术语处理、检索、Critic 修正和文本导出结构。原模型服务地址、个人路径与硬编码认证默认值已替换：使用进程环境变量、本机回环示例、空 token 密码输入、示例模型、相对本地 Chroma 目录。原 Critic 原始 JSON 调试展示改为固定状态提示，避免直接展示生成内容与诊断字段。

`.env.example` 只作配置参考，不自动加载，不能填写真实秘密后提交。`.gitignore` 排除实际 `.env`、本地 Chroma/缓存、视频和 ZIP。没有擅自增加原团队代码许可证或暗示新的商用授权。

## 发布核对

首次提交前执行语法、12 项状态测试、Python AST、文本/文件清单扫描、相对文档链接和源文件指纹检查。英文修订后的本地测试为 19 项。扫描关注高可信凭据格式、非本机 IP/模型地址、个人绝对路径、禁止的二进制/缓存文件及硬编码认证值；扫描通过不代替人工逐类审阅。Git 只暂存本交付的明确路径，检查 staged 清单与 diff。新增 GitHub Actions 工作流会先检查和测试，再仅发布 12 个允许的静态文件；实际 CI、部署 URL 和提交版本由验收记录提供，不把本地测试或单纯 push 称为部署成功。
