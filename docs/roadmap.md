# 后续路线图

以明确验收条件推进，不用演示状态代替实际接入。优先级围绕独立站 EDM，Blog 和上架支持同一活动，跨平台后置。

| 阶段 | 要交付的内容 | 进入下一阶段的条件 |
|---|---|---|
| **0 · 可点击产品验证（当前）** | K75 完整案例；活动、准备、审核、执行和异常恢复；Blog/上架预览 | 重复流程与窄屏可用；用户确认信息结构与操作顺序 |
| **1 · 独立站只读数据接入** | 一个店铺的商品、优惠、人群同意/抑制；服务端权限与环境隔离 | 在授权测试店铺证明数据来源、完整分页、错误和额度处理；不复制生产 PII 到 demo |
| **2 · 内容与审批服务** | 重用可授权的生成实践；冻结商品事实、品牌与素材；独立审核和人工决定 | 真实模型/图片合同验证；版本撤审、旧回执隔离、超时恢复与拒绝路径可复现 |
| **3 · 受控 EDM 执行** | 服务端预约、持久任务、provider 提交、幂等、限流、对账与审计 | 授权测试收件人实收；受理/送达分开；未知不重发；重启与取消竞争验证 |
| **4 · Blog / 商品上架扩展** | 从同一活动上下文生成文章和商品页草稿；独立审核后发布 | 获得店铺内容权限；草稿/发布分开；写入可审计且能确认结果 |
| **5 · Amazon / TikTok** | 按渠道调整素材、内容与商品工作流 | 官方接口、账号范围、商家授权、平台规则与审核流程明确，先验证单一渠道 |

## 贯穿各阶段的原则

产品事实与优惠由可信来源提供；模型输出不自证正确。批准绑定版本和批准范围，内容/事实改变使旧批准失效。每个外部请求持久保存身份和状态，UNKNOWN 只查原请求，受理不当作送达。

从一个真实连接器的小闭环起步，避免同时做所有渠道。先复用已有 EDM 的状态机、幂等和恢复经验；源项目专用配置与代码复用需另行确认授权，不能直接整仓迁入。

后续可补营销指标与人工复盘，但没有真实观察窗口时不展示 ROI/转化率成果。本原型的聚合数字不是业务基线，也不构成产品效果承诺。

## Venture and Project Scope

The roadmap above describes the marketing automation project. The Tech300 application is for the broader cross-border AI consulting and solutions business; consulting delivery and other solution projects are separate from this console's roadmap. This revision does not add a consulting workflow to the frontend.
