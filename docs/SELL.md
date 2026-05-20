# Cashlens · 传播素材

> 这是个"工具人朋友"传播文案库 · 复制即用 · 给老板 / 同行 / 客户 / 朋友圈

🔗 **唯一地址:** https://cashlens-hk-audit.vercel.app

---

## 微信群短文案(50 字)

> 香港小公司做账师朋友 · 银行月结单整月手工录入太累?Cashlens 拖一下 PDF 1 分钟出统计流水 + Excel,免费试 → cashlens-hk-audit.vercel.app

---

## 朋友圈中文案(100 字)

> 给做香港小公司账的朋友 · 银行月结单"统计流水"那一步,以前手工录 2-4 小时一家,Cashlens 拖 PDF 进去 1 分钟出报告 + 5 张 Excel sheet · WorldFirst / Payoneer / PingPong 提现自动识别为客户货款 · 利息 / 内部转账自动剔除 · 数据不出浏览器 · 免费 · 链接: cashlens-hk-audit.vercel.app

---

## 知乎 / 长版本(300 字)

> **手工对银行月结单做"统计流水",一家公司 2-4 小时。我写了个工具压到 1 分钟。**
>
> 香港 SME 做账常见痛点:客户每月发一堆 BEA / 汇丰 / 花旗 / 渣打的月结单 PDF · 一笔笔录入 / 分类(有效进账 / 利息 / 内部转账 / 关联方 / 银行费用)/ 加总 / 按月汇总 / 套统计流水模版.xlsx 出表。
>
> Cashlens 是个纯前端工具 · Gemini 3.5 Flash 驱动 · 拖入 PDF 直出报告:
> - 📁 自动识别材料类型(月结单 / 审计报告 / 合同 等)· 不强行套模板
> - 🏦 香港实务规则内建(HSBC `CR TO` 出账识别 / 跨境收款平台白名单 13 个 / 多币种 HKMA 折算)
> - 📊 5 张 Excel sheet + 4 视觉主题(紫色 / 极简 / 蓝白 / 月度分 sheet)
> - 🔒 0 后端 · 数据全程在浏览器 · API Key 也只存 localStorage
> - 🆓 免费 · MIT · 自己拿钥匙(Google AI Studio · 每月免费额度够小事务所用)
>
> 实测 11 个银行月结单 130 秒出完整报告 · 实际业务收入 HKD 288 万。
>
> 链接:cashlens-hk-audit.vercel.app · 大陆需 VPN(Gemini API 被墙 · 仓库内附 Cloudflare Worker 反代方案)。

---

## 推特 / X 英文版(280 字符内)

> Built a single-HTML tool for HK SME accountants:
> drag bank statements (BEA / HSBC / Citi / SCB / DBS) → Gemini 3.5 Flash → full "statement of receipts" + 5 Excel sheets in 60s.
>
> WorldFirst / PingPong / Stripe / Payoneer payouts auto-classified as customer payments. No backend, data never leaves your browser.
>
> https://cashlens-hk-audit.vercel.app

---

## 卖给老板 / 客户(1 句 elevator pitch)

> 把香港小公司做账"统计流水"那一步从手工 2-4 小时压缩到 1 分钟 · 拖 PDF 进浏览器就出报告 + Excel · 0 后端 · 数据不离开本机。

---

## FAQ 模板(应付反复问的人)

**Q: 它能替我做账吗?**
A: 不能。只做"统计流水"这一步(银行月结单 → 分类汇总 → Excel)。做账分录 / 总账 / 税务由你下游另做。

**Q: 数据安全吗?**
A: 0 后端服务器。PDF 和 API Key 都在你浏览器里,直接发给 Google Gemini · 一对一。

**Q: 要钱吗?**
A: 工具免费(MIT)。Gemini API 用量自付(Google AI Studio · 个人每月有免费额度 · 小事务所够用)。每跑一份 ~$0.01–0.05 USD。

**Q: 大陆能用吗?**
A: 当前需 VPN(Gemini API 被墙)。仓库内有 Cloudflare Worker 反代方案,可半解决,真要完全免 VPN 得自建国内 LLM 通路(后续可能加 DeepSeek 支持)。

**Q: 准确率怎么样?**
A: 实测 11 个 BEA 月结单 32 笔交易,跟人工对账完全一致;报告末尾强制输出"加总自检表"(Sheet 1 = Sheet 2 + Sheet 3 校验),误差≠0 强制重算。不确定的交易进"待用户确认事项"清单,不自行猜测。

**Q: 支持哪些银行?**
A: 测试过 BEA / Citibank / HSBC · 其他银行(渣打 / 中银 / 恒生 / 星展)理论上都能用 · prompt 是按"通用月结单结构"写的,不依赖特定银行模板。
