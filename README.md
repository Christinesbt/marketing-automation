# Relay · Marketing Automation

**Live English demo:** [Relay Marketing Workspace](https://christinesbt.github.io/marketing-automation/). This static frontend uses fictional data and browser-only simulated execution.

以独立站 EDM 为首期主线的可点击营销工作台，采用虚构 **Vela Studio / K75 机械键盘**新品活动。活动配置、准备、人工审核、执行追踪、Blog 与商品上架预览使用同一份产品与优惠上下文。

**本仓库是前端原型和团队 BlogGenerator 的安全发布副本。** 主界面采用正式产品风格；通过右上角 **About this demo** 查看英文说明与能力边界。品牌、键盘规格、价格、库存、人群、预约、发送、限流和回执均为示例。本原型不连接后端、不调用模型、不发送邮件。静态网站范围与部署证据见 [deployment.md](docs/deployment.md) 和 [verification.md](docs/verification.md)。

## 本地启动

需要 Node.js 20 或以上；本次实际使用 Node.js 24.19.0。前端无第三方依赖，无需 `npm install`。

```powershell
cd marketing-console-prototype
npm start
```

打开 **http://127.0.0.1:4173**。服务器只监听本机回环；用 `Ctrl+C` 停止。文件通过 ES modules 加载，请使用本地服务器，不要直接双击 HTML。

端口被占用时：

```powershell
$env:PORT = 4174
npm start
```

网页数据保存在本浏览器的 `relay-tech300-keyboard-demo-v2` 键中。刷新保留活动、内容版本、审批与审计记录；准备或执行中的刷新会暂停，需点击 Resume 显式继续。模拟预约不会自动到期发送。`Reset demo` 只恢复本原型的三场初始活动。

## 约 3 分钟演示

1. 总览点击 **Explore the launch flow**，建立独立的 K75 引导活动。也可以 **New campaign**手动选择配色、目标、人群、优惠和 UTC 时间。
2. **Prepare campaign**查看库存、筛选、内容与事实检查。Moss 为缺货示例，可用于演示数据阻断与修正。
3. **Review content**查看键盘主视觉、邮件正文及来源。勾选产品事实和人群检查，**Approve version**。
4. 可试 **Edit content**：保存会增加版本并撤销旧批准及预约。**Return for revision**要求修改说明，并须保存新版本后重新审批。
5. **Reserve campaign → Start campaign run**。这是本地状态模拟，不是后台定时任务。
6. 执行会出现已确认、确定失败和待核对记录。**Retry failed batch**等待 3 秒模拟退避，仅重试确定失败；**Reconcile receipts**确认待核对结果，不重发。记录总数保持守恒。
7. 完成后查看审计事件，或 Duplicate 创建隔离的新活动；完成的执行不允许改写输入。

`Capabilities` 中提供 **Blog 文章与封面**、**商品上架卡与检查单**；它们服务于 EDM 的商品落地页和同一活动上下文。这里没有自动写文、发布文章、上架或购物交易。

## 目录

| 路径 | 内容 |
|---|---|
| [marketing-console-prototype/](marketing-console-prototype/) | 无依赖网页、状态机、本地预览服务器、原创键盘 SVG、状态测试 |
| [blog-generator/](blog-generator/) | 用户提供的 2 Blog + 4 EDM 生成代码的安全副本与配置示例；不自动运行 |
| [docs/product.md](docs/product.md) | 用户价值、首期范围、演示场景与产品取舍 |
| [docs/architecture.md](docs/architecture.md) | 当前前端结构和未来真实服务接口边界 |
| [docs/capabilities.md](docs/capabilities.md) | 原型、源 EDM 生产 MVP、源 v0.2 本地验证、未来平台的分层说明 |
| [docs/roadmap.md](docs/roadmap.md) | 以验收条件驱动的后续路线图 |
| [docs/verification.md](docs/verification.md) | 实际测试与截图证据、检查范围与限制 |
| [docs/publish-notes.md](docs/publish-notes.md) | 发布文件范围、脱敏处理和源文件指纹 |

## 检查

```powershell
cd marketing-console-prototype
npm run check
npm test
```

Python 副本只做语法/AST 静态检查，本次未安装模型依赖、未运行 Streamlit、未下载 embedding 模型、未连接 Ollama。之后要单独使用它，请先阅读 [BlogGenerator 使用说明](blog-generator/README.md)。

源 EDM 项目仅作为经授权的通用架构参考；未迁入其企业配置、客户数据、凭据、缓存或生产源码。视频及原始 ZIP 不进入 Git。仓库由用户设为公开，本次工作没有修改可见性。

## English UI Update

The frontend, accessibility labels, dialogs, validation, guided tour, audit events and generated sample content are in English. Console headings use title case; prose and actions use sentence case. Dates use British English, a four-digit year and UTC; prices explicitly use US dollars. Chinese documentation and the separate BlogGenerator's Chinese support remain available.

Legacy saved Chinese edits are never silently discarded. An English review screen offers an original workspace download and requires explicit confirmation before saving an exact backup and starting the English demo. The backup survives normal resets and remains downloadable from About This Demo.

Frontend validation includes 19 passing tests: the original 12 state tests, six language/storage/formatting tests and one static deployment-scope test.
