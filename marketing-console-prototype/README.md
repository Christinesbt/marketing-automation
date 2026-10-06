# Relay · Vela K75 marketing workspace

独立站 EDM 主线的本地可点击原型。虚构 Vela K75 键盘包含 Graphite / Cloud / Moss 三种配色、商品图片、邮件主视觉、Blog 文章和商品上架预览。所有图片都是原创 SVG 概念插图。

## 启动

Node.js 20+，无第三方依赖，无需安装包。

```powershell
cd E:\tech300\marketing-console-prototype
npm start
```

打开 http://127.0.0.1:4173。Ctrl+C 停止。不能直接双击 HTML；本地服务加载 ES modules。端口占用可先设置 `$env:PORT = 4174`。

## 演示

首页点 **Explore the launch flow**。依次准备、人工审核、批准、预约、开始执行、失败重试、核对未知回执。改稿清除旧批准，未批准不能开始；Moss 的缺货状态展示数据校验拦截。

所有产品、价格、库存、人群、预约和执行结果都是虚构的本地演示。右上角 **About this demo / 关于此演示** 集中说明边界。没有后端、模型、真实平台或邮件调用。预约不会触发后台发送。

浏览器本地保存活动、内容版本和审计。刷新准备/执行会暂停并允许显式 Resume；Reset demo 恢复三个初始样例，只有此原型的存储受到影响。每场活动独立保存。

## 检查

```powershell
npm run check
npm test
```

仓库内的 `docs/verification.md` 保存实际验证结果和截图。BlogGenerator 是独立程序，不由此网页启动。
