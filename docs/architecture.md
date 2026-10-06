# 产品架构与接口边界

## 当前实现

当前运行结构为：**浏览器控制台 → 本地状态机 → 浏览器存储**。Node 服务器仅提供静态文件，明确的静态文件白名单与 `connect-src 'none'` 限制外部连接；没有业务 API、数据库、模型或邮件队列。

| 模块 | 当前职责 |
|---|---|
| `app.js` | 页面、活动切换、对话框、引导流程、审核交互、模拟时钟 |
| `state.js` | 纯状态转移、简报校验、版本审批、记录守恒、防重复与恢复 |
| `styles.css` / `keyboard-styles.css` | 控制台层级、响应式布局与键盘产品视觉 |
| `assets/` | 三款原创键盘 SVG；生成脚本便于维护配色和构图 |
| `server.mjs` | 本机回环静态预览；不接收业务写入 |
| `tests/state.test.mjs` | 工作流约束和隔离的离线验证 |

`blog-generator` 是独立的 Python 程序，不由控制台加载，不与前端状态互通。使用它需要用户另行启动并配置本地模型环境。

## 活动状态与版本

主流程为 `draft → preparing → review → approved → scheduled/running → needs_attention → completed`。

- 准备可进入 `prep_error` 或 `prep_paused`；执行刷新进入 `delivery_paused`。
- 内容保存生成新 `revision`，清除 `approvedRevision` 与预约。
- 批准要求完成准备、未处于退回状态、事实与人群确认。
- 发送要求批准版本等于当前版本；版本不一致时拒绝。
- 执行开始后锁定简报和内容；改动通过 Duplicate 建立新活动。
- 每场活动独立保存内容、状态、批次与审计，避免跨活动污染。

这些校验在浏览器内支持演示，不能替代真实服务的权限、锁与不可变版本存储。当前存储不是多用户一致性系统。

## 未来真实服务的结构

建议小步建立 **控制台 → 受保护的活动 API → 活动事实/任务存储 → worker → 连接器**。业务规则与渠道适配分离，先接一个独立站和一个 EDM 供应商。

| 服务职责 | 要冻结的事实 | 核心约束 |
|---|---|---|
| Campaign | 商品、目标、人群规则、优惠、时间与版本 | `expectedRevision`，活动锁，明确环境 |
| Audience | 分页游标、资格理由、完整扫描来源 | 同意/抑制、频次、稳定身份、完整分页 |
| Content | 文案、图片、商品事实、输入 hash、生成请求 | 不可变版本；旧回执不能覆盖新稿 |
| Approval | 操作人、决定、内容版本、时间 | 服务端授权；改稿/改事实使旧批准失效 |
| Schedule | 原时间、时区、UTC、安排版本、due | 改期/取消使旧安排失效；禁止内存定时器当事实 |
| Delivery | `runId`、`sendItemId`、attempt、提交/受理/送达 | 稳定身份，真实回执分层，未知结果不重投 |
| Recovery | 原请求、backoff、恢复 due、终局证据 | 仅重试确定失败；未知沿原请求查回 |
| Observability | 状态变更、脱敏原因、相关 ID、指标窗口 | 审计可解释；受理不等于送达；无 PII/秘密日志 |

外部网络与模型等待放在数据库事务外；任务认领和事实提交保持事务一致。worker 使用持久 lease/due，单轮公平调度并在停机时收口在途任务。对账与汇总回写可以独立恢复，不能为了补写而再次发送。

## 接口草案：尚未实现

以下用于后续对接讨论，本仓库没有这些接口。

| 请求 | 输入摘要 | 返回/门禁 |
|---|---|---|
| `POST /campaigns` | Brief | 活动 ID、revision |
| `PATCH /campaigns/:id` | Brief + expectedRevision | 冲突拒绝，撤销旧批准/安排 |
| `POST /campaigns/:id/prepare` | expectedRevision + requestKey | 任务 ID，不把异步完成伪装为成功 |
| `POST /campaigns/:id/content/:version/approve` | 明确决定 + expectedRevision | 操作身份与内容快照绑定 |
| `POST /campaigns/:id/schedule` | contentVersion + 安排时间/时区 | 不存在/歧义当地时间拒绝，冻结 UTC |
| `POST /campaigns/:id/execute` | 安排/版本 + idempotencyKey | 只有认领胜者可调用连接器 |
| `POST /runs/:id/reconcile` | 原请求/批次身份 | accepted/failed/unknown + 可解释证据 |
| `GET /campaigns/:id/events` | cursor | 脱敏审计，结果有覆盖范围与时间 |

界面状态来自服务端事实读回。禁止通过请求体声明“已批准/已成功/已送达”；权限与 provider 凭据仅在服务端。所有变更有预期版本，重放沿用原幂等键，晚到回执核对环境、活动、版本、请求和 attempt。

## 连接器边界

Store 读取商品和优惠；Audience 读取同意及抑制；Content 调用生成/审核并返回版本证据；Email 提交与查询回执；Asset 维护图片来源、指纹与可用性。构造连接器不自动发请求，未配置的真实能力保持关闭。

真实退避应遵守供应商 `Retry-After` 和持久共享限流；本原型的 3 秒固定等待只是演示。浏览器保存与手工恢复也不等同于服务器重启恢复。

这些通用设计参考源 EDM 项目最新本地文档，具体能力分层及证据限制见 [capabilities.md](capabilities.md)。不复制源项目专用入口、配置、数据结构标识或企业源码。
