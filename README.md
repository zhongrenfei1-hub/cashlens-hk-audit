# Cashlens · 现金透镜

> **香港中小企业银行月结单 → AI 统计流水**
> 单文件纯前端工具 · Gemini 3.5 Flash 驱动 · 0 后端 · 数据全程不离开你的浏览器

🔗 **线上版本:** https://cashlens-hk-audit.vercel.app

---

## ⚡ 30 秒上手

1. 打开 https://cashlens-hk-audit.vercel.app
2. 右上角 ⚙️ 填 Gemini API Key([去 aistudio.google.com 拿](https://aistudio.google.com/apikey))
3. 拖任意材料进上传区(PDF / Excel / Word / ZIP / 图片 / 邮件 等 9 种格式)
4. 30 秒到 2 分钟 · 出完整统计流水报告 + 5 张可下载的 Excel sheet

> **大陆需 VPN**(Gemini API 在大陆被墙 · Vercel 域名也部分被屏蔽 · 见下方 Cloudflare Worker 反代方案)

---

## 🎯 解决什么问题

香港做账师事务所 / 中小企业每月手工对银行月结单做「统计流水」,流程是:
1. 客户传一堆乱七八糟的 PDF / Excel / 截图过来
2. 你一笔笔录入、分类:**有效进账 / 利息 / 内部转账 / 关联方 / 银行费用**
3. 加总、按月、按币种汇总
4. 套「统计流水模版.xlsx」格式出报告

**手工至少 2-4 小时一家公司。Cashlens 把它压缩到 1 分钟。**

---

## ✨ 核心能力

### 📁 自动识别材料类型(不强行套模板)
- **类型 A · 银行月结单** → 走完整统计流水
- **类型 B · 审计报告/财报** → 摘录关键字段(意见/财年/营业额/净利润)
- **类型 C · 合同/发票/营业执照/工资单** → 一行说明 + 关键字段
- 核心精神:**「分析师」不是「打印机」** · 客户给什么都先识别再决定

### 🏦 香港中小企业实务规则内建
- 严格只读 Deposit/存入列 · Withdrawal/提取整行跳过
- **HSBC `CR TO` 出账识别**(描述含 CR 不等于进账 · 看金额在哪一列)
- **跨境收款平台白名单**(WorldFirst / Payoneer / PingPong / 连连支付 / Stripe / Airwallex / Worldpay / Skyee / Geoswift / Wise / Revolut / 万里汇 13 个 · 自动识别为客户货款经平台中转 · 不再误判内部转账)
- 利息 / 银行费用 / 董事往来 / 关联方汇入 → 分类排除
- 多币种自动按 HKMA 中间价折算 HKD

### 📊 5 张 Excel Sheet 输出
| Sheet | 内容 |
|---|---|
| Transaction_Detail | 20 列交易明细(主表) |
| Monthly_Summary | 月度有效进账汇总 |
| Exclusion_Summary | 利息/费用/转账等排除项 |
| Related_Party_Inflow | 关联方汇入款单列 |
| Miheng_Movement_Summary | 月度外币运动 |

### 🎨 4 个 Excel 视觉主题
- 🟣 **紫色 banner**(默认 · 原版「统计流水模版」风格)
- ⬜ **极简黑白**(打印 / 扫描归档)
- 🔵 **专业蓝白**(上市公司 / 大客户企业风)
- 📅 **月度分 sheet 详细**(紫色总览 + 每月一张明细)

### 🔒 隐私设计
- **0 后端服务器** · 你的财务数据**永远不经过我们的服务器**
- API Key + 设置存浏览器 `localStorage` · 不上传
- PDF 直接在浏览器里 base64 发给 Google Gemini · 一对一直连
- 仓库 `testdata/` 永久 `gitignore` · 测试数据也绝不进 Git

---

## 🛠 技术架构

- **单文件 HTML** · 268KB inline JS · 无打包 · 无 npm 安装
- **AI 模型:** Gemini 3.5 Flash(锁定 · API 实测唯一可用 3.5 · reasoning 模型)
- **参数:** `temperature=0`(deterministic)· `thinkingBudget=24576` · `maxOutputTokens=65536`
- **PDF 处理:** 直接 inline_data base64 喂 Gemini(免转图 · 浏览器零预处理)
- **导出:** ExcelJS 生成 .xlsx · SheetJS 解析上传的 .xlsx
- **部署:** GitHub Pages + Vercel(主)双部署 · push 自动 deploy

---

## 🚀 自己部署

```bash
git clone https://github.com/zhongrenfei1-hub/cashlens-hk-audit
cd cashlens-hk-audit
python3 -m http.server 8101
# 浏览器开 http://localhost:8101
```

部署到 Vercel:fork 仓库 → Vercel Import Git Repo → Deploy。
可在 Vercel Settings → Deployment Protection 开 Password Protection 锁起来。

## 🔬 开发 · 一键健康检查

改动 prompt / 升级模型 / 部署后,跑这个验证准确率底线还在:

```bash
# 把样本 PDF 放 testdata/yedao_test.pdf · 或用 TEST_PDF=path/x.pdf 指定
GEMINI_KEY=AIza... node scripts/verify.mjs
```

输出:
```
✅ finishReason=STOP
✅ HKD ≈ 847,515.72 ±1
✅ 有效笔数 = 6
✅ 报告顶部含「材料评估」段
✅ 报告末尾含「加总自检表」
✅ 识别跨境收款平台

🟢 整体: PASS
```

退出码 0=PASS 1=FAIL · 可作 CI gate / Vercel build hook / 手动 smoke test。

---

## 大陆免 VPN 方案

仓库内 `cloudflare-worker/` 已就绪反代 Gemini API:
```bash
cd cloudflare-worker
npx wrangler deploy
# 然后在 Cashlens Settings 把 baseUrl 改成 https://your-worker.workers.dev
```

⚠️ Cloudflare `workers.dev` 在大陆也部分被墙 · 用自己的域名 + Cloudflare 代理可显著改善。

---

## 🗺 项目状态

**当前版本:** v9.2 · 详细变更见 [HANDOFF.md](./HANDOFF.md)

**实测准确率基线**(11 个 BEA 银行月结单 · 2025.04 – 2026.02):
- 实际业务收入:**HKD 2,889,887.50**
- 总笔数 / 有效 / 排除:32 / 20 / 12
- 跑批 130 秒 · finishReason=STOP

---

## 📄 许可

私有,仅供 Cashlens 部署使用。Cashlens 仅做银行流水「统计流水」· 不涉及做账/审计/税项 · 具体做账审计由下游「做账审计板块」另行处理。
