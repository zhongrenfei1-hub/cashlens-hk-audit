# Changelog

按时间倒序 · 最新在最上 · 链接: 每个 hash 点开看完整 diff

## v9.2 · 2026-05-19 — 准确率大修 + UI / Sell

### ✨ Features
- 锁定 **Gemini 3.5 Flash** 单一模型(API 实测唯一可用 3.5 · reasoning 模型 · 准确率高)([`9abbd67`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/9abbd67))
- Prompt **硬约束 4** · 报告末尾强制输出「加总自检表」 · Sheet 1 = Sheet 2 + Sheet 3 校验 · 误差≠0 强制重算([`d1d711b`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/d1d711b))
- Prompt **第〇步 · 文件分类与分流** · 自动识别类型 A 月结单 / B 审计报告 / C 其他 · 不一刀切套模板([`f25efb2`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/f25efb2))
- **跨境收款平台白名单** · WorldFirst / Payoneer / PingPong / 连连 / Stripe / Airwallex / Worldpay / Skyee / Geoswift / Wise / Revolut / 万里汇 13 个 · 提现自动识别客户货款([`3f431c5`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/3f431c5))
- Cost chip 显示当前 model + 价格 hover tooltip([`373a764`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/373a764))

### 🐛 关键 Bug Fix
- **🚨 SSE `\r\n\r\n` 行尾兼容** · 用户「未收到任何输出」的真正根因 — Gemini 用 CRLF 但代码切 `\n\n`([`8290875`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/8290875))
- **HSBC `CR TO` 出账被误识别为进账** · 描述含 CR 不等于进账 · 看金额在哪一列([`5a3ae19`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/5a3ae19))
- Gemini parts schema 改 camelCase(`inlineData`/`mimeType`)+ SSE 诊断升级([`dcf0786`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/dcf0786))
- 选择文件夹双弹对话框 + 第一次打不开 · dz click bubbling 修复([`6c397bd`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/6c397bd))
- 4 个 Excel 模板 TSV sheets 用同一硬编码色 → 现在跟主题走([`a1e0072`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/a1e0072))
- 准确率参数:`temperature=0` + `thinkingBudget` 8192→24576([`dacf474`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/dacf474))

### 📚 Docs
- README 重写为 v9.2 landing copy(229 行 → 121 行)([`f4d6150`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/f4d6150))
- 传播素材库 `docs/SELL.md`(微信/朋友圈/知乎/Twitter/elevator/FAQ 6 种长度)([`e27bcd4`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/e27bcd4))
- HANDOFF 顶部状态 + commit 表升级到 v9.2([`47e01fd`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/47e01fd))

### 🚀 Infrastructure
- Vercel 主部署 + `vercel.json` 配置 + 安全 headers · `testdata/` 永久 gitignored([`d7cb769`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/d7cb769))

### 🎨 UI 简化
- Settings 极简化(只留 Key + 验证 + 保存)([`cbe52b2`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/cbe52b2))
- 删 API Key 下方「去 aistudio 拿」提示([`7d61510`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/7d61510))

### 📊 准确率基线
- 11 个 BEA 银行月结单(2025.04 – 2026.02)· 实际业务收入 **HKD 2,889,887.50** · 32 / 20 / 12 笔
- 单 PDF Citibank yedao(2023.10)· 经营收入 **HKD 847,515.72** · 自检表 ✅ 通过

---

## v9.0 · 2026-05-14 — Gemini 专属定位

- 从多 provider 通用工具简化到 Gemini 专用([`62ff861`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/62ff861))
- HANDOFF.md 完整重写([`9b05088`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/9b05088))
- 空输出诊断 · capture finishReason + thoughtsTokenCount([`c5c4658`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/c5c4658))
- thinkingBudget=8192 限制 · 防 thinking 吃光 maxOutputTokens([`2fda8f2`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/2fda8f2))
- maxOutputTokens 16384 → 65536([`8586d16`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/8586d16))

---

## v8.x · 此前

加 Gemini 原生协议支持 · PDF 直传 inline base64 · URL auto-config · 反代 Worker 通用化等 · 详见 `git log` 完整历史。
