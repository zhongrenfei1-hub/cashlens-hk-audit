# Cashlens 交接文档 · v9.2

> 给下一个 AI / Claude / Codex 看。新会话开始时把这份贴进去,然后说:
> "接着这份 HANDOFF.md 继续帮我做 Cashlens,我现在要:[新需求]"。

**最后更新:** 2026-05-19
**当前版本:** **v9.2 · Gemini 3.5 Flash 锁定 · 准确率大修**
**部署:** ⭐ 主部署 **https://cashlens-hk-audit.vercel.app**(Vercel · auto-deploy on push)· GitHub Pages 仍并行可用但建议关
**最新已推送:** [`9abbd67`] 锁 gemini-3.5-flash + 一系列准确率修复 · `git log -15` 看全部

## 📦 本会话(2026-05-14 → 19)所有重大修复

| Commit | 类别 | 修复 |
|---|---|---|
| `9abbd67` | feat | 模型锁 **gemini-3.5-flash**(API 唯一可用 3.5) |
| `5b90871` | feat | 模型锁 gemini-3.1-pro-preview(已被 9abbd67 覆盖) |
| `a1e0072` | fix | 4 个 Excel 模板 TSV sheets 用同一硬编码色 → 现在跟主题走 |
| `5a3ae19` | **fix · 关键** | HSBC「**CR TO**」出账被误识别为进账(用户看到 Excel 行 9 错分类) |
| `f25efb2` | feat | **prompt 加文件分类与分流**(类型 A 月结单/B 审计报告/C 其他) |
| `3f431c5` | fix | 跨境收款平台提现不再误判内部转账(WorldFirst/Payoneer 等 13 个白名单) |
| `dacf474` | fix | 准确率:`temperature=0` + `thinkingBudget` 8192→24576 |
| `7d61510` | chore | 删 API Key 下方「去 aistudio 拿」提示文字 |
| `6c397bd` | fix | 「选择文件夹」点一次弹两个对话框 / 第一次打不开 |
| `8290875` | **fix · ROOT CAUSE** | **SSE `\r\n\r\n` 行尾**兼容 — 用户一直「未收到任何输出」的真正根因 |
| `dcf0786` | fix | gemini parts schema 改 camelCase(`inlineData`/`mimeType`)+ 诊断升级 |
| `d7cb769` | chore | Vercel 部署配置 + `testdata/` 永久 gitignore |

## 🎯 当前确认有效的准确率基线

实测金标准(`testdata/extracted/` 11 个 BEA 银行月结单,gemini-3.5-flash + temperature=0 + thinkingBudget=24576):
- 实际业务收入:**HKD 2,889,887.50**(2025.04 – 2026.02)
- 总笔数 / 有效 / 排除:32 / 20 / 12(含利息 + 现金存入 + 个人汇入排除)
- 跑批 130 秒 · finishReason=STOP · 输出 14.7K 字符

单 PDF 测试(`testdata/yedao_test.pdf` Citibank · 6 笔 WorldFirst 进账):
- 经营收入:**HKD 847,840.86**(旧 prompt 误判 = 0 · 新 prompt 正确识别为跨境收款平台)

## 🚧 已知尚未完成

- HANDOFF 完整重写到 v9.2(本次只更新顶部状态 + commit 表 · 后续区段仍是 v9.0 内容)
- 用户提到的「准确度差」原因还可能有其他银行(HSBC `CR TO` 已修 · 但用户的实际 HSBC PDF 我没有,无法本地验证)
- Cloudflare Worker 反代(VPN 替代方案 · 仓库 `cloudflare-worker/` 已就绪但未指向)

---

## 🚨 上一会话末尾用户状态(必读)

**用户当下痛点 · 待你接力解决:**

最后一条用户消息(原话):
> "⚠ 未收到任何输出。常见原因:1. Gemini thinking 太多吃光 token 配额 → 试试切到 Gemini Flash Latest..."
> "啥意思啊 求求你快让我用吧"

**已做(我):**
1. ✅ 升级"空输出 toast" → 不再列 4 个笼统原因 · 直接根据 `finishReason` 显示精确诊断 + 对应救生方案
   (commit `c5c4658`)
2. ✅ Gemini streamAI 加 `thinkingConfig: {thinkingBudget: 8192}` 防 thinking 吃光 maxOutputTokens
   (commit `2fda8f2`)
3. ✅ maxOutputTokens 从 16384 → 65536(Gemini outputTokenLimit)
   (commit `8586d16`)
4. ✅ model 列表对齐 Google 实际可用 ID(删 `gemini-3-pro-latest` 等不存在 ID)
   (commit `240efd1`)
5. ✅ P0 简化:UI 锁定 Gemini · settings dropdown disabled · DEFAULTS gemini
   (commit `62ff861`)

**最后建议用户:** Cmd+Shift+R 硬刷新 → Settings → 模型 → 选 **Gemini Flash Latest**(不是 Pro Latest · thinking 量大)→ 重跑。

**用户尚未反馈测试结果。**

### 你接手时立即做的事

1. **打开 https://zhongrenfei1-hub.github.io/cashlens-hk-audit/?v=diag** 看线上能否打开,看到 Gemini badge
2. **问用户:**"切到 Gemini Flash Latest 后跑了吗?如果还'未收到任何输出',toast 现在会显示具体诊断,把诊断文字截给我"
3. **根据诊断响应:**
   - `MAX_TOKENS · thinking N · 输出 0` → thinkingBudget 不够 · 提议改成 4096(让真实输出更多空间)
   - `SAFETY` → 改 prompt 措辞 / 换 2.5 Flash(更宽松)
   - `RECITATION` → 换 PDF 或简化 prompt
   - `?` / `无 finishReason` → 网络问题 · 让用户看 F12 Network 的 streamGenerateContent 请求
   - `STOP` 但输出 0 → Bug · 看 SSE 解析 fn

---

## 🎯 持续要做(对下一个 AI · 必读)

**用户在持续迭代 Cashlens,你接着做** — 不是来"了解项目"就完事,是来继续干的。

### A. 这份 HANDOFF.md 是活文档

每次重要变化(prompt 改 / 新功能 / 修 bug / 默认值变化)都要**顺手 update + commit + push**。
不要等用户提才更新。**HANDOFF 永远是当前状态的真实镜像**。

### B. 接住用户每次的需求,直接干

用户大方向是把 Cashlens 做成"香港 SME 银行月结单 → AI 统计流水"工具。细节由他每次提出。
你的工作是:接需求 → 看 HANDOFF / 现状 → 评估方案 → 直接干 → 验证 → push → 给 verify URL。

### 你有的权限(用户已明确授权 — 不用每次问)

- ✅ 直接改代码(`Edit` / `Write`,不用问"要不要改")
- ✅ 直接 commit + push 到 main(GitHub Pages 自动部署)
- ✅ 直接改这份 HANDOFF.md + push
- ✅ 直接加 CDN 脚本 / 新前端依赖(若合理)
- ✅ 删旧代码(若某次新引入的功能用户最后说不要,直接清理)
- ✅ 改 prompt 字符串(改完必跑 syntax check 命令)

### 不要做的

- ❌ **不要用 Python regex 做大改 index.html** — 上次踩过坑,误删 750 行 Settings modal HTML。**只用 Edit / Write 工具**,精确字符串。
- ❌ 不要重写整个 index.html
- ❌ 不要改 git config / 强制 push / `--no-verify` 跳 hook
- ❌ 不要改默认 provider / 大改 prompt 框架 / 删核心功能 — 重大架构变化先 2-3 句方案 + trade-off 让用户拍板
- ❌ 不要在 HANDOFF / commit message / 聊天里展开完整 API key(用户在聊天里贴过多次 Gemini key + 自建 server key · 建议提示他 revoke + 重新生成)

### 用户工作风格(必须适配)

- **直接干,直接验证,直接推** — 不啰嗦,不每事必请示
- 中文沟通(中英混合 OK)
- 探索性问题(怎么做更好?)用 2-3 句给方案 + trade-off 让他拍板,不直接动手
- 明确指令(直接干这个)立刻动手,不再问
- 报错 / 未确认的疑问 / 风险点 **主动说**,不要装看不见
- 改完报告 verify URL 让他立刻能打开看
- 偏好"专业 SaaS"美学(Linear/Vercel),不要卡通风,emoji 不要泛滥

### 快速热身 checklist(接手 5 分钟内)

```bash
# 1. 切到工作目录
cd /Users/qiu/海荣香港/99_部署版

# 2. 拉远端最新
git fetch origin && git status

# 3. 看最近 10 个 commit(本会话改动多 · 倒序看到 v9.0 关键节点)
git log --oneline -10

# 4. 跑 syntax check 确保 inline script 没破
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script[^>]*>([\\s\\S]*?)<\\/script>/g); m.filter(s=>!s.includes('src=')).forEach((s,i)=>{ try { new Function(s.replace(/^<script[^>]*>/,'').replace(/<\\/script>$/,'')); console.log(i,'OK'); } catch(e){ console.log(i,'ERR',e.message); }});"

# 5. 启 preview server (launch.json 里 "Cashlens · 部署版" port 8101)
# 然后浏览器打开 http://localhost:8101 看跟线上是否一致

# 6. curl 验证 Gemini API 端点(已知 key 在 conversation history,建议让用户提供新 key)
# 实测:
#   GET https://generativelanguage.googleapis.com/v1beta/models?key=AIza...  → 可用模型列表
#   POST .../models/gemini-flash-latest:generateContent  → 单次生成
#   POST .../models/gemini-flash-latest:streamGenerateContent?alt=sse → 流式
```

---

## 1. 项目核心信息

| 项 | 值 |
|---|---|
| 项目名 | Cashlens(现金透镜)· **v9.0 Gemini 专属** · 香港 SME 银行月结单统计流水工具 |
| 定位 | 仅算 debit 存入 · 绝不涉及做账/审计/税项 · 输出"做账审计板块"可读 TSV |
| 线上地址 | 统计流水板块 `/` · 做账审计板块 `/audit.html` · 都在 https://zhongrenfei1-hub.github.io/cashlens-hk-audit/ |
| GitHub | https://github.com/zhongrenfei1-hub/cashlens-hk-audit |
| 部署方式 | GitHub Pages · 推 `main` 自动部署(1-10 分钟) |
| 当前主文件 | `index.html`(统计流水 · ~5000 行)· `audit.html`(做账审计 placeholder · ~300 行) |
| 本地工作目录 | `/Users/qiu/海荣香港/99_部署版` |
| 孤岛克隆 | `/Users/qiu/cashlens-hk-audit`(每次 push 后用 `git pull origin main` 同步) |
| Preview server | "Cashlens · 部署版" launch 配置 · port 8101 |
| 当前分支 | `main` |
| 最新已推送 | `c5c4658` 空输出诊断 + finishReason capture(2026-05-14) |

辅助:
- `cloudflare-worker/` 子目录:**v9.0 起不再活跃**(Gemini 直连 CORS OK,不需要反代)· 留作未来 fallback
- `excel-balance-template/`(Python · 独立工具 · 离线生成「统计流水模版.xlsx」· 跟当前 web 版无关)

---

## 2. 用户偏好 / 工作方式(必读)

- **中文沟通**(中英混合 OK)
- **直接改、直接验证、直接推**,不要只讲方案
- 不在乎 API key 的"理论暴露"风险("key 不用管 / 风险不用管")
- 文档/日志/聊天里不要展开任何完整 key,用 `[REDACTED]`
- 关心**线上能不能打开、客户能不能直接用、是否真的有 bug**;修复后要用浏览器开线上验证
- 偏好"专业 SaaS"美学(Linear/Vercel),不要卡通风、emoji 不要泛滥
- mobile / desktop / 国内访问都要正常
- **大陆访问 Gemini 需 VPN**(Google 域名被墙)

---

## 3. 技术架构现状(v9.2)

### 形式
纯前端单文件 HTML 应用(`index.html` ~270KB inline JS)· 无后端 · `audit.html` 是平级独立板块。

### CDN / 浏览器端库
- Tailwind CSS(浏览器版)
- PDF.js(**v9.0 起 Gemini 不用了** · 留作未来 fallback 模式)
- ECharts 5.5.1(图表)
- ExcelJS 4.4.0(按需懒加载 · Excel 导出)
- SheetJS / mammoth / heic2any / JSZip / sql.js / Tesseract.js(多格式文件解析)
- Google Fonts:Inter / Instrument Serif / IBM Plex Mono

### AI Provider(v9.2 锁死 · 单模型单 provider)

**UI 层 + 代码层:** **只有 `gemini-3.5-flash` 一个模型 · 不可切换**。
- `PROVIDERS.gemini.models` 只剩 1 个 entry(`gemini-3.5-flash`)
- `DEFAULTS.model = 'gemini-3.5-flash'`
- `getModel()` 加白名单校验 · localStorage 残留旧 ID 强制纠正
- 历史多 provider 代码(anthropic / openai / oneapi 等 9 个)仍在 PROVIDERS / streamAI / buildUserContent,但 UI 不暴露。`format === 'gemini'` 分支是当前唯一活跃路径。

### Gemini 原生协议

- baseUrl: `https://generativelanguage.googleapis.com/v1beta`
- URL: `{baseUrl}/models/gemini-3.5-flash:streamGenerateContent?alt=sse`
- Auth: **`X-goog-api-key: AIza...`**(不是 Bearer)
- Request body:
  ```js
  {
    contents: [{role: 'user'|'model', parts: [{text}, {inlineData: {mimeType, data}}]}],
    systemInstruction: { parts: [{text: SYSTEM_PROMPT_V4}] },
    generationConfig: {
      maxOutputTokens: 65536,
      thinkingConfig: { thinkingBudget: 24576 },  // v9.2 提高 · 实测金标准 thinking 仅用 ~3K
      temperature: 0                              // v9.2 新加 · 财务 deterministic 必须
    }
  }
  ```
- SSE response:**每个 event 用 `\r\n\r\n` 分隔**(CRLF 风格 · 不是 `\n\n` · 这是关键陷阱),每个 chunk 完整 JSON,提取 `candidates[0].content.parts[].text` 流式;`usageMetadata.promptTokenCount / candidatesTokenCount / thoughtsTokenCount`;`candidates[0].finishReason`

### 5 大踩坑总结(本会话血泪填的)

#### Pitfall A · SSE 行尾是 `\r\n\r\n` 不是 `\n\n`(ROOT CAUSE)
Gemini `streamGenerateContent?alt=sse` 用 HTTP CRLF 风格 · 代码 `buffer.indexOf('\n\n')` 永远 -1 → events=0 → 用户看「未收到任何输出」。**Fix:** 每次 chunk 写入 buffer 后 `buffer.replace(/\r\n/g, '\n')` normalize。([`8290875`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/8290875))

#### Pitfall B · HSBC「`CR TO XXX`」是出账不是进账
描述里 `CR TO 132-XXXX` = Credit Transfer **TO** account = 转账给某账户 = **出账**(钱出去)· 看 `CR` 会误以为进账。**Fix:** prompt 强制以「金额在 Deposit 列 vs Withdrawal 列」判断方向,描述里的 CR/DR/CR TO/CR FROM 仅供参考。([`5a3ae19`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/5a3ae19))

#### Pitfall C · 跨境收款平台提现 ≠ 内部转账
WorldFirst / Payoneer / PingPong / Stripe 等平台描述含 "FT INTERNAL TRANSFER" 但实质是**客户货款经平台中转** = 经营收入。旧 prompt 默认全排 → 经营收入 = 0(误判)。**Fix:** prompt 加 13 个平台白名单,默认计入有效进账。([`3f431c5`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/3f431c5))

#### Pitfall D · Gemini parts schema 必须 camelCase
REST v1beta API 严格要求 `inlineData` / `mimeType`(不是 `inline_data` / `mime_type`)· snake_case 会被静默丢弃 → candidates 空。([`dcf0786`](https://github.com/zhongrenfei1-hub/cashlens-hk-audit/commit/dcf0786))

#### Pitfall E · Gemini 3.x thinking 大量消耗
默认 thinking 不限制 → 可能吃光 maxOutputTokens 配额 → 输出 0。**Fix:** `thinkingConfig.thinkingBudget = 24576`(v9.2)· `maxOutputTokens = 65536` · `temperature = 0`。

#### Pitfall F · `gemini-3-pro-latest` 不存在
`-latest` 别名只有 3 个:`gemini-pro-latest` / `gemini-flash-latest` / `gemini-flash-lite-latest`。Gemini 3.x 系列只有 `-preview` 或 `-flash` 后缀。v9.2 锁定 `gemini-3.5-flash`(ListModels 实测可用)。

#### Pitfall G · OpenAI 兼容端点不接 PDF inline base64
Google `/v1beta/openai/chat/completions` 对 PDF base64 inline 返回 400 "Unsupported file URI type"。**所以走原生 API 才能 inline PDF base64 喂 Gemini**。

### Cloudflare Worker 反代(C 方案 · v9.0 不再活跃)

`cloudflare-worker/` 目录有完整骨架(worker.js / README.md / wrangler.toml)· 通用 OpenAI 兼容反代 · 支持任意 UPSTREAM:
- 模式 A · 透传:client 自己带 key
- 模式 B · 隐藏 key:UPSTREAM_KEY env var 时 worker 注入

**v9.0 起 Gemini 直连 OK 无 CORS / Mixed Content 问题,所以这个 worker 暂时无用。**
保留作未来 fallback(如果 Google 政策变 / 用户加私有 server / 等)。

---

## 4. v9.0 主要功能

### 4.1 多格式上传 / 解析

PDF / 图片(JPG/PNG/WebP/HEIC) / Excel / CSV / Word / ZIP / EML / SQLite / TXT。
- 单文件 ≤ 64 MB
- 自动跳过 `.DS_Store` / `Thumbs.db` / `__MACOSX/`
- 支持文件夹拖拽(webkitGetAsEntry 递归)

### 4.2 v9.0 工作流(预览 → 待确认迭代 → 确认 → 生成)

**第一步 · 预览模式**(AI 默认输出 · 9 段):
1. 【结论 · 3 选 1】区块:① 统计视角 / ② 老板视角 / ③ 业务视角(v8.0 删了"审计师视角"+"财务总监视角")
2. 极简核心结论(80-120 字)
3. 关键指标 Markdown 表
4. 可选 ` ```chart ` JSON 块(若不出,前端从 TSV 兜底)
5. **完整 5 张 ```tsv 块**(主交付 Sheet 1+2 给"做账审计板块" · 辅助 Sheet 3+4+5 客户参考)
6. **结构化 ` ```json ` 概要块**:`preview_status: "preview"` + `metrics`(Hero 卡片)
7. 流水观察 bullet(纯统计角度 · 不写做账/审计意见)
8. **【待用户确认事项】清单**(若有 · 任何字段不确定的交易必须进这里 · 绝不允许 AI 猜测)
9. **【做账审计提醒事项】清单**(若有 · 5 类嫌疑 advisory · 见 [4.4](#44-做账审计提醒事项-v82))
10. **末尾固定提示语**(必照搬):
    - 「统计流水已完成。如有待确认事项,请回复确认后我将更新数据并继续。如有做账审计提醒事项,请到「📚 做账审计板块」补充凭证后人工确认。」
    - 「以上预览是否正确?确认无误请回复『确认生成Excel』,我将立即生成最终版本。」

**第二步 · 生成模式**(用户回"确认生成Excel"后):
1. 一行 ✅ 已生成 + 文件名建议
2. 最终版 5 张 TSV(基于预览的修正)
3. ` ```json {"preview_status":"confirmed"} ` 块
4. **不重复**结论 / 指标卡片 / 详细说明

### 4.3 5 张 TSV Sheet

| Sheet | 名字 | 用途 | 标签 |
|---|---|---|---|
| 1 | `Transaction_Detail` | 全部 debit 交易明细(20 列) | **主交付** |
| 2 | `Monthly_Summary` | 年-月 + 银行 + 币种聚合 | **主交付** |
| 3 | `Exclusion_Summary` | 排除类别汇总 · 5 列(v8.0 删 citation 列) | 辅助 |
| 4 | `Related_Party_Inflow` | 关联方汇入款单独列出 · 10 列(v8.0 改名 + 删 citation + disclosure_note → note) | 辅助 |
| 5 | `Miheng_Movement_Summary` | 月度外币运动汇总 · 9 列 · META 头 + row_type | 辅助 |

主交付 Sheet 1 字段:
```
source_file bank_name statement_period transaction_date description counterparty
reference original_currency original_amount exchange_rate hkd_equivalent rmb_equivalent
classification is_valid_inbound exclusion_reason business_nature related_party
director_related note original_row
```
- `original_amount` **永远 ≥ 0**(只读 debit)
- v8.0:`audit_note` → `note`(语义"分类备注" · 不引用税法/审计条款)

Sheet 5 特殊 schema:
- 9 列:`date / fc_currency / fc_in_original / fc_excluded_original / fc_net_original / fc_avg_rate / hkd_amount / note / row_type`
- 文件首 2 行 META 元数据:`META\tcompany\t{公司名}` + `META\taudit_period\t{period}`
- row_type 枚举:`MONTH / MOVEMENT / CURRENCY_SUBTOTAL / BAL`
- 前端 `buildTsvSheet` 检测 META 头 → 顶部斜体灰色 · 空行 · 列头加粗灰底
- row_type 第 9 列自动 hidden(客户视图仅 8 列)

### 4.4 做账审计提醒事项(v8.2)

prompt 加 [做账审计提醒规则] · AI 识别 5 类嫌疑项 advisory(**绝不下做账审计结论**):

| 类别 | 识别线索 |
|---|---|
| 💰 资本利得嫌疑 | `SALE OF / PROCEEDS / 处置 / DISPOSAL`;或单笔非常规大额(>1/3 月度均值) |
| 🌏 境外收入嫌疑 | counterparty 境外 / 对手银行境外 / `OVERSEAS / OFFSHORE` |
| 📈 股息 / 投资收益 | `DIVIDEND / 股息 / 分红 / DIVD` |
| © 知识产权 / 特许 | `LICENSE / ROYALTY / 授权 / 使用费` |
| 🏛️ 政府补贴 / 资助 | `政府 / GOV / SUBSIDY / GRANT` |

输出格式:5 类按笔数倒序 · 某类 0 笔跳过 · 5 类都 0 整个区块跳过。

**绝不**:写"应税/豁免"结论 · 引 IRO/DIPN/HKSA/BIR51 法条编号。这是 advisory(提示)不是 conclusion(结论)。

### 4.5 Excel 导出 · 4 套模板下拉

顶部 `📊 Excel ▾`:🟣 紫色 banner(默认)/ ⬜ 极简黑白 / 🔵 专业蓝白 / 📅 月度分 sheet。

技术:`XLSX_THEMES` 配置 · `buildMatrixSheet(wb, matrix, meta, themeKey)` · monthlyTabs 模板从 Sheet 1 按 transaction_date 拆每月一张 sheet。

### 4.6 同名互转 / 董事往来 识别字段

公司名输入框下「▸ 高级:同名互转 / 董事往来 识别」:
- 公司在月结单上的别名(多行)
- 董事姓名(多行)
- localStorage 按公司名缓存 `cashlens_entity_cache_v1`
- 填了就插到 prompt 给 AI 严格匹配

### 4.7 双板块架构(v8.1)

**两个独立 HTML · 两个独立 URL · 同源 localStorage 自动共享:**
- `index.html` (`/`) = 统计流水板块(主功能)
- `audit.html` (`/audit.html`) = 做账审计板块(placeholder + handoff 接收 · ~300 行)

**自动共享(同源 localStorage,零代码):**
- API key / provider / model / settings
- 历史项目(`cashlens_projects_v1`)
- 同名互转 / 董事缓存(`cashlens_entity_cache_v1`)

**业务数据 handoff(push 模式):**
- localStorage key: `cashlens_handoff_v1`
- 统计流水板块 artifact toolbar 的 `📤 发送到做账审计` 按钮 → `sendToAuditModule()`(`index.html` 内)→ 把当前 `window.__latestReport` 的 5 张 TSV + metrics + 元数据存到 localStorage → 自动跳 `/audit.html`
- 做账审计板块 `init()` 检测 `localStorage[HANDOFF_KEY]` 读取并渲染 Hero 卡 + 5 张 TSV 预览
- 监听 `storage` 事件实时同步

**Handoff payload schema:**
```js
{
  company: string,
  period: string,              // "YYYY-MM-DD — YYYY-MM-DD"
  receivedAt: ISO timestamp,
  metrics: { valid_inbound_hkd, total_count, valid_count, excluded_count, currency_breakdown, top_customers, period },
  tsvBlocks: string[],         // 5 张 TSV(主交付 Sheet 1/2 + 辅助 3/4/5)
  rawReport: string            // 完整 markdown 报告
}
```

### 4.8 URL auto-config(v8.x · 一键链接)

支持 query 参数:`?provider=X&model=Y&key=Z` 一键写入 localStorage:
```
https://zhongrenfei1-hub.github.io/cashlens-hk-audit/?provider=gemini&model=gemini-flash-latest&key=AIza...
```
- 写完后 `history.replaceState` 清 URL · 防 key 泄漏到 history
- toast: `✅ 已自动配置 · provider=gemini · model=gemini-flash-latest · apiKey=***`
- (v9.0 baseUrl 参数已弃用 · Gemini 用固定 baseUrl)

### 4.9 顶部 Hero 指标卡片(从 ```json 块解析)

紫粉色徽章 `📋 预览模式` / `✅ 已确认` + HKD 大数字渐变 + 三联指标(总笔数/有效/已剔除) + 币种 pill + Top 5 客户 + 「📥 确认生成 Excel」CTA 按钮(自动 sendFollowup `确认生成Excel`)。

### 4.10 3 种 loading 形态

| 形态 | 用途 |
|---|---|
| `audit-spinner` | 1:1 单圆 · toast / 按钮 / downloadXlsx |
| `audit-progress` | 4 阶段顺次激活(chat 流) |
| `audit-loader` | 16:5 大区域(备用 · 未启用) |

### 4.11 3 个 chat tab + Excel 预览 tab(v8.3)

- 📄 报告(Markdown + Hero)
- 📈 图表(ECharts)
- 📊 数据表(5 张 TSV 预览 · 各自复制 / 下载 .tsv)
- **📋 Excel 预览**(v8.3 新增 · 模拟 .xlsx 在 Excel 打开 · sheet 切换 + 列字母 + 行号 + 紫色 banner 表头)

引用 tab 已删(v8.0 · 不再有 IRO/HKSA chip 输出)

### 4.12 mobile 适配(v7.x)

顶部 nav mobile 隐藏不必要按钮 / artifact 全屏 modal / Settings 全屏化 / 安全区 / 触屏 hit area ≥44px / 教程 tour mobile 居中。

### 4.13 5 种导出 + handoff

1. 顶部 📊 Excel ▾(4 模板)
2. 顶部 📥 导出(下载 .md)
3. artifact 底部 📋 复制 / 📥 .md / 📊 复制 TSV / 📊 下载 .xlsx / **📤 发送到做账审计**
4. mobile-bar:📊 Excel + 📥 .md
5. 数据表 tab 每张 sheet:📋 复制 TSV / 📥 下载 .tsv

### 4.14 复制按钮 3 级 fallback(v8.1 fix)

`copyText()` / `safeCopyText()`:
1. L1 现代 Clipboard API:`navigator.clipboard.writeText()`
2. L2 旧版兼容:`document.execCommand('copy')`(隐藏 textarea)
3. L3 手动复制:`window.prompt()` 弹文本框已全选

防御浏览器插件(沉浸式翻译等)拦截 + 失焦 + 旧版 Safari + 微信 webview。

---

## 5. 历史版本 v8.0 → v9.0 重大改动(归档 · v9.2 部分见顶部 commit 表)

> 顶部「本会话(2026-05-14 → 19)所有重大修复」表是 v9.2 现状。下面这张表是 v8.0 → v9.0 的历史归档,保留给好奇接手 AI 看「为什么这样设计」的来龙去脉。

按提交倒序:

| Commit | 内容 |
|---|---|
| `c5c4658` | **空输出诊断**:streamAI capture finishReason + thoughtsTokenCount · toast 根据 finishReason 显示精确诊断 + 救生方案(MAX_TOKENS / SAFETY / RECITATION / 网络) |
| `2fda8f2` | Gemini `thinkingBudget: 8192` 限制 thinking 量 · 防 thinking 吃光 maxOutputTokens |
| `8586d16` | Gemini `maxOutputTokens` 16384 → 65536(Gemini 上限) |
| `240efd1` | model 列表实测对齐 · 删不存在 `gemini-3-pro-latest` · 加 `-preview` 后缀的 Gemini 3 · 加 Flash-Lite Latest · 9 个模型 |
| `62ff861` | **P0 简化** · UI 锁住 Gemini · settings dropdown disabled + 1 option · DEFAULTS gemini · Gemini brand badge + footer |
| `8586d16` 之前的回滚 | git restore 回 a24954b(因 Python regex 误删 750 行 Settings modal) |
| `a24954b` | **Gemini 走原生 API**(format=gemini · `streamGenerateContent` + `X-goog-api-key` + `contents/parts/inline_data`)· PDF 直传 inline base64(免 PDF.js 转图) |
| `bb3a364` | **URL auto-config** · `?provider=X&model=Y&key=Z` 一键写入 localStorage · history.replaceState 清 URL |
| `b6080da` | Gemini model 加 `gemini-pro-latest` / `gemini-flash-latest` 别名 + hint 改"实测 CORS 允许 GitHub Pages 直连" |
| `107a9dd` | 加 Google Gemini provider(走 OpenAI 兼容端点 · 后被 a24954b 改成原生 API) |
| `e1fb82a` | 复制按钮 3 级 fallback(navigator.clipboard → execCommand → prompt 手动)防浏览器插件拦截 |
| `94c4e81` | 删 Extended Thinking 滑块 + 最大输出 Tokens UI(简化 settings) |
| `0fa95b7` | Settings 文案修「直接发 无中转」误导 + OpenAI/Gemini hint 加 CORS 警告 |
| `25503e3` | OpenAI 模型列表更新(GPT-5.5 / GPT-5 / GPT-5 Mini / o3-mini · v9.0 后用户看不到这些) |
| `2ae3632` | **双板块架构** · 新增 audit.html + handoff 机制 + 同源 localStorage 共享 |
| `a7f71d4` | Handoff 鲁棒化 · fallback regex + 允许无 TSV 时降级发送 + audit.html `<pre>` 显示 rawReport |
| `bba859a` | 加「📋 Excel 预览」tab · 模拟 .xlsx 在 Excel 打开样子 |
| `b47549c` | **v8.0 去做账审计化大改 + 待确认事项迭代流程** · 角色定位「统计流水」专家 · prompt 加 [核心使命] + [不确定性处理规则] + 末尾固定提示语 · Sheet 4 改名 Related_Party_Inflow · 字段重命名 · 引用 tab 删 · 风格化结论 4→3 |
| `685d492` | **v8.2 做账审计提醒事项** · prompt 加 [做账审计提醒规则] · 5 类嫌疑 advisory |
| `4daf4ce` | prompt debit-only 修正 · credit 出账整行跳过 · Sheet 1 永远 ≥ 0 |
| `348262b` | Sheet 5 · Miheng_Movement_Summary 月度外币运动汇总 · prompt 加 schema(META 头 + 9 列 + row_type)+ 前端 `buildTsvSheet` 加 META 解析 |
| `8d38dfc` | sidebar 历史项目列表加 `overflow-y-auto` 修不能滚动 bug |

---

## 6. 关键代码位置(2026-05-19 实测 · v9.2 行号)

| 功能 | 行号 | 备注 |
|---|---|---|
| `SYSTEM_PROMPT_V4` | **1363** | 第〇步文件分类 + 严格分类 + HSBC CR TO + 跨境平台白名单 + 5 TSV + 4 硬约束(含自检表) |
| `PROVIDERS` 配置 | **1778** | 历史 11 个 provider · UI 锁定 gemini · `format === 'gemini'` 唯一活跃 |
| `loadSettings` | **1995** | localStorage CRUD · key=`cashlens_settings_v2` |
| `DEFAULTS` | **2063** | `provider='gemini'` / `model='gemini-3.5-flash'` |
| `getModel()` | **2091** | 白名单校验 · localStorage 残留旧 ID 强制纠正到 3.5-flash |
| `appendCard` | **2894** | 把 HTML 卡片追加到 chat stream |
| `renderArtifactReport` | **3550** | 入口:Hero + Markdown + chart + tables + Excel preview |
| `XLSX_THEMES` | **3985** | 3 主题(purple/minimal/blue · monthlyTabs 走 purple) |
| `buildTsvSheet` | **4258** | v9.2 加 themeKey 参数 · header bg/fg + zebra 用主题色 |
| `streamAI` | **4502** | 3 format 分支(anthropic / **gemini · 原生 API** / openai) · SSE `\r\n` normalize · 诊断计数 |
| `buildUserContent` | **4747** | Gemini PDF 路径用 `inlineData`/`mimeType` camelCase |
| 主流程 `onUsage` 诊断 toast | **5038** | finishReason 分支显示精确诊断 · 含 SSE 统计行 |
| `TOUR_STEPS` | **5490** | 10 步教程 |
| Init `DOMContentLoaded` | **5748** | `applyUrlAutoConfig()` + 各种初始化 |

---

## 7. 常用维护命令

```bash
# 进工作目录
cd /Users/qiu/海荣香港/99_部署版

# 拉远端
git fetch origin && git status

# 看最近 commits
git log --oneline -10

# 启 preview server(launch.json 已配)
# "Cashlens · 部署版" port 8101

# Syntax check(改完 index.html 必跑)
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script[^>]*>([\\s\\S]*?)<\\/script>/g); m.filter(s=>!s.includes('src=')).forEach((s,i)=>{ try { new Function(s.replace(/^<script[^>]*>/,'').replace(/<\\/script>$/,'')); console.log(i,'OK'); } catch(e){ console.log(i,'ERR',e.message); }});"

# Commit + push
git add index.html && git commit -m "..." && git push origin main

# Sync 孤岛 B(每次 push 后跑一下)
cd /Users/qiu/cashlens-hk-audit && git pull origin main && cd -

# Curl 验证线上(替换 hash)
curl -sI "https://zhongrenfei1-hub.github.io/cashlens-hk-audit/?v=NEW_COMMIT_HASH" | grep -iE "(HTTP|last-modified|etag)"

# Gemini API 实测(替换 KEY)
KEY="AIza..."
# 列模型
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$KEY" | python3 -c "import sys,json;[print(m['name'].replace('models/','')) for m in json.load(sys.stdin)['models'] if 'generateContent' in m.get('supportedGenerationMethods',[])]" | grep gemini | head
# 流式生成测试
curl -s --max-time 20 -N -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse" \
  -H "Content-Type: application/json" -H "X-goog-api-key: $KEY" \
  -d '{"contents":[{"parts":[{"text":"ping"}]}],"generationConfig":{"maxOutputTokens":1024,"thinkingConfig":{"thinkingBudget":512}}}' | head -c 1000
```

---

## 8. P1 / P2 完整简化方案(待选)

v9.0 P0 只锁了 UI · 后端 11 家 provider 抽象仍在。如果用户以后想完整精简到只 Gemini:

### P1 中等简化(45 分钟 · ~25 Edit)
- 删 PROVIDERS 里 10 家非 Gemini 配置
- 简化 streamAI / buildUserContent / testApiKey 只留 Gemini 分支
- 删 normalizeBaseUrl / preflightBaseUrl 函数

### P2 完整简化(1.5 小时 · ~50 Edit)
- P1 + sidebar 文案 / Tour 文案 / footer / chip 全改 Gemini 定位
- HANDOFF / README 重写 Gemini 专属定位
- cloudflare-worker/ 目录可选删(Gemini 不需要)

**⚠️ 痛点:** 用 Python regex 做大改容易误删大段 HTML(上次踩过 750 行)· **只用 Edit 工具精确字符串**。

---

## 9. 下一个 AI 接手流程(按这个顺序做)

1. **打开 https://zhongrenfei1-hub.github.io/cashlens-hk-audit/?v=diag** 验证线上能打开 · 看到「Gemini 专属」badge
2. **看 git log -10** 了解最近改了什么
3. **跑 syntax check** 确认 inline script 都 OK
4. **理解 v9.0 Gemini 协议**(原生 API · `streamGenerateContent` · `X-goog-api-key` · `contents/parts/inline_data`)
5. **理解 v8.0+ 工作流**(预览 → 待确认迭代 → 确认 → 生成 · 9 段输出)
6. **理解 5 张 TSV schema** + 前端解析依赖关系
7. **看 [上一会话末尾用户状态](#-上一会话末尾用户状态必读)**:用户报"未收到任何输出" · 已加诊断 · 建议切 Flash · 待用户测试反馈
8. **读用户最新一句话决定下一步**

### 改动注意事项

#### 改 SYSTEM_PROMPT_V4 反引号
prompt 里 ` ```tsv ` / ` ```json ` 等反引号必须**三重转义** `\\\`\\\`\\\``(template literal 内)。
否则反引号闭合 template literal → JS syntax error → 整站白屏。
**改完必跑 syntax check 再 push**。

#### 改 5 张 TSV 字段
- 字段名不要随便改(前端 `autoGenerateChartsFromTsv` 字段查找的 regex 依赖)
- 顺序也不能改(prompt 里写"严格此顺序")
- 加新字段:prompt schema 末尾加 + 前端 regex 加 fallback

#### 改 Gemini 配置
- maxOutputTokens 改动小心 · `thinkingBudget` 不能超过 maxOutputTokens
- 加 model 必须用 `ListModels` API 实测真实 ID(别再编 `gemini-3-pro-latest` 这种不存在的)

#### 改 mobile 样式
看 head `<style>` 里的 `@media (max-width: 639px)` / `1023px` / `1279px`:
- < 640px = mobile(纯单列)
- 640-1023 = tablet(无 sidebar)
- 1024-1279 = desktop 中(有 sidebar 无 artifact)
- ≥ 1280 = 三列全开

---

## 10. 下一步优先级建议(v9.2 现状)

**Cashlens 当前处于 stable plateau** · 核心 bug 修完 · 准确率底线已验证 · 文档全部刷新 ·
4 个 Excel 主题视觉差异化 · cost chip 显示运行模型 · `scripts/verify.mjs` 健康检查脚本 · GitHub Release v9.2 公开。

可能的下一波工作(按 ROI 排序):

1. **🟡 等用户用真实新 PDF 跑 · 看是否还有 bank-specific 偏差**
   - HSBC `CR TO` 已修(用户截图证据)· 但 HSBC `BE/F BALANCE` / 多账户对账等 corner case 未测
   - 其他银行(渣打 / 中银 / 恒生 / 星展)用户暂无测试样本 · 实地跑会暴露新规则
2. **🟢 P0 完整 dead code cleanup**(~50KB 减肥)
   - PROVIDERS 删非 gemini/custom 9 个 entry(纯 dead UI)
   - streamAI 删 anthropic / openai 分支(除非保留自定义 baseUrl 走 OpenAI 兼容)
   - buildUserContent 删 anthropic native PDF 路径
   - 风险中等 · 268KB → ~220KB
3. **🟢 做账审计板块 audit.html**
   - 当前是 placeholder · 用户期望真正的做账审计功能(prompt + UI + AI 调用 + 输出 schema)
   - 需求确认后可大动
4. **🟡 prompt cache 优化成本**
   - 13K prompt 每次都喂 Gemini · 跑 11 PDF 一次 ~$0.005 · 高频跑能省 50%
   - Gemini context caching API: https://ai.google.dev/gemini-api/docs/caching
5. **🟡 Cloudflare Worker 反代部署**(大陆免 VPN 半解决)
   - 仓库 `cloudflare-worker/` 已就绪 · 用户给个 cf account 就能 deploy
6. **🟢 多语言 i18n**(英文版给海外用户)

**不要做:**
- 不要再扩 prompt 长度(13K → 16K 已接近边际效益临界 · 再加只是噪音)
- 不要加多 LLM provider 切换(用户已明确锁 Gemini)
- 不要加后端 server(隐私设计核心 · 数据不离开浏览器)

---

**文档维护原则:** 每次大改完顺手更新这份 HANDOFF.md(尤其 prompt 改动 / 新增 commit 群 / 修重大 bug 后),让下一个 AI 一眼看懂状态。

**一键健康检查:** `GEMINI_KEY=... node scripts/verify.mjs` 退出码 0=PASS · 改动后必跑。
