# 产品方向与首期范围

## 产品要解决的问题

独立站营销活动通常跨越商品信息、人群筛选、文案/图片、人工决定和执行结果。Relay 把这些工作放在同一场活动里：每份内容说明来自哪里，每次批准对应哪个版本，每个异常说明该如何恢复。

长期方向是跨平台 AI 营销；首期以 **独立站 EDM 工作流**为主线。团队已有 EDM 自动化实践，因此产品不从单独的 Blog 生成器起步。

## 演示案例：Vela K75 新品发布

- 虚构品牌 Vela Studio，面向桌搭与机械键盘用户。
- 同款 K75 的 Graphite、Cloud、Moss 三款配色；示例规格为 75% 布局、热插拔轴体、USB-C 有线连接。
- 示例价格 $129，Graphite/Cloud 有库存，Moss 为缺货阻断案例。
- 目标为新品发现，示例优惠为 15%，优惠码 K75LAUNCH。
- 人群只使用聚合计数，不包含邮箱、姓名或逐客户行为。
- 原创本地 SVG 贯穿总览、配置、邮件主视觉、Blog 封面与商品卡；没有真实商品照片或品牌授权暗示。

这些内容用于产品表达，不能作为商品真实性能或营销效果依据。所有边界集中在“关于此演示”，避免重复提示干扰主流程。

## 首期核心闭环

| 环节 | 用户动作 | 需要看见的结果 |
|---|---|---|
| 活动总览 | 找到待准备、待审核或待处理的活动 | 状态、有效人群、下一步 |
| 活动简报 | 配置商品、目标、人群、优惠、时间 | 明确输入与人群排除原因 |
| 自动准备 | 启动或暂停 | 数据校验、人群筛选、内容结果与解释 |
| 人工审核 | 修改、批准或退回 | 内容版本、来源、事实与人群确认 |
| 预约/执行 | 预约、取消或开始 | 当前批准版本、运行身份与批次结果 |
| 异常恢复 | 重试已知失败或核对未知结果 | 不重复执行、保留审计事件 |

本原型是一人审核的简化流程；真实产品可沿用源 v0.2 的“人群/优惠确认 + 内容批准”两个人工决定。不会把前端勾选框直接当作服务端授权。

## Blog 和商品上架的作用

Blog 展示同一键盘的产品故事、配色与活动优惠，作为 EDM 的未来内容落地页。商品上架卡检查商品名、SKU、价格、库存和优惠一致性，作为未来独立站连接器入口。二者都有可看的具体输出，但本原型不发布文章或修改真实商品。

Amazon/TikTok 属于后续渠道适配。必须先确认平台权限、内容规范与业务流程，再实现对应连接器。

## 成功标准

本阶段验收的是用户能否顺畅走完活动、理解准备结果、发现审批版本变化、处理失败和未知结果，并能重复演示。它不证明真实邮件送达、商业转化率或跨平台接入成功。

## Tech300 Business Context

The Tech300 venture is a cross-border AI consulting and solutions business. This marketing automation console is one project within that broader offering. Its EDM-first scope demonstrates a specific operational workflow; it does not represent the entire company or its full consulting service. The current frontend remains focused on marketing operations.
