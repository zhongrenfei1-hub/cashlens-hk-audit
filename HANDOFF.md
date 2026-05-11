# Cashlens 交接文档

> 给下一个 AI / Claude / Codex 看。新会话开始时把这份贴进去,然后说:
> "接着这份 HANDOFF.md 继续帮我做 Cashlens,我现在要:[新需求]"。

**最后更新:** 2026-05-11(**v8.1 双板块架构**:新增 `audit.html` 做账审计板块 placeholder + `sendToAuditModule` handoff 机制 + 顶部 nav 切换链接 + 同源 localStorage 共享)
**最新已推送:** v8.1 双板块 — 见最新 commit · `git log -3`

---

## 🎯 你的任务(对下一个 AI · 必读)

**用户和上一个 AI 在持续迭代 Cashlens,你也接着做** — 不是来"了解项目"就完事,是来继续干的。

### 立即要做(优先级 1):
**打开 https://zhongrenfei1-hub.github.io/cashlens-hk-audit/ 验证能否访问。**
上一会话末用户报告"无法访问此网站"。我已用 `node new Function()` 验证 3 个 inline script syntax 全 OK,
**最大概率是 GitHub Pages 部署延迟**(推 commit 后 1-10 分钟才生效)。
- ✅ 能正常打开 → 跟用户确认 → 继续接他下一句话
- ❌ 仍 404 / 白屏 → 先看 https://github.com/zhongrenfei1-hub/cashlens-hk-audit/actions Pages 部署状态;
  必要时 `git revert f98254a && git push` 回滚最近 prompt 改动再排查

### 持续要做(优先级 2):

**A. 这份 HANDOFF.md 是活文档,不是一次性快照。**
每次对话有重要变化(prompt 改 / 新功能 / 修 bug / 默认值变化)都要**顺手 update + commit + push**。
不要等用户提才更新。变化大就重写,变化小就 patch。**HANDOFF 永远是当前状态的真实镜像**。

**B. 接住用户每次的需求,直接干。**
用户大方向是把 Cashlens 做成"香港中小企业审计 SaaS"。细节由他每次提出。
你的工作是:接需求 → 看 HANDOFF / 现状 → 评估方案 → 直接干 → 验证 → push → 给用户 verify URL。

### 你有的权限(用户已明确授权 — 不用每次问):
- ✅ 直接改代码(`Edit` / `Write`,不用问"要不要改")
- ✅ 直接 commit + push 到 main(GitHub Pages 自动部署)
- ✅ 直接改这份 HANDOFF.md + push(让下下个 AI 跟得上)
- ✅ 直接加 CDN 脚本 / 新前端依赖(若合理)
- ✅ 删旧代码(若某次新引入的功能用户最后说不要,直接清理)
- ✅ 改 prompt 字符串(改完必跑 syntax check 命令)

### 不要做的:
- ❌ 不要重写整个 index.html(要 incremental edit,Edit 工具改局部)
- ❌ 不要改 git config / 强制 push / `--no-verify` 跳 hook
- ❌ 不要改默认 provider / 大改 prompt 框架 / 删核心功能 — **这种重大架构变化先用 2-3 句方案 + trade-off 让用户拍板**
- ❌ 不要在 HANDOFF / commit message / 聊天里展开任何完整 API key,统一用 `[REDACTED]`

### 用户工作风格(必须适配):
- **直接干,直接验证,直接推** — 不啰嗦,不每事必请示
- 中文沟通(中英混合 OK)
- 探索性问题(怎么做更好?)用 2-3 句给方案 + trade-off 让他拍板,不直接动手
- 明确指令(直接干这个)立刻动手,不再问
- 报错 / 未确认的疑问 / 风险点 **主动说**,不要装看不见
- 改完报告 verify URL 让用户立刻能打开看
- 偏好"专业 SaaS"美学(Linear/Vercel),不要卡通风,emoji 不要泛滥

### 快速热身 checklist(接手 5 分钟内):
```bash
# 1. 切到工作目录
cd /Users/qiu/海荣香港/99_部署版

# 2. 拉远端最新
git fetch origin && git status

# 3. 看最近 5 个 commit
git log --oneline -5

# 4. 跑 syntax check 确保 inline script 没破
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script[^>]*>([\\s\\S]*?)<\\/script>/g); m.filter(s=>!s.includes('src=')).forEach((s,i)=>{ try { new Function(s.replace(/^<script[^>]*>/,'').replace(/<\\/script>$/,'')); console.log(i,'OK'); } catch(e){ console.log(i,'ERR',e.message); }});"

# 5. 启 preview server (launch.json 里 "Cashlens · 部署版" port 8101)
# 然后浏览器打开 http://localhost:8101 看跟线上是否一致
```

---

## 1. 项目核心信息

| 项 | 值 |
|---|---|
| 项目名 | Cashlens(现金透镜)— 香港 SME 银行月结单「统计流水」工具(仅 debit 存入,不涉及做账/审计/税项) |
| 线上地址 | 统计流水板块 `/` · 做账审计板块 `/audit.html`(都在 https://zhongrenfei1-hub.github.io/cashlens-hk-audit/) |
| GitHub 仓库 | https://github.com/zhongrenfei1-hub/cashlens-hk-audit |
| 部署方式 | GitHub Pages,推送 `main` 后自动部署(1-10 分钟) |
| 当前主文件 | `index.html`(统计流水板块 · ~5000 行)+ `audit.html`(做账审计板块 placeholder · ~300 行) |
| 本地工作目录 | `/Users/qiu/海荣香港/99_部署版` |
| Preview server | 名为 "Cashlens · 部署版" 的 launch 配置,port 8101 |
| 当前分支 | `main` |
| 最新已推送 | 见最新 commit · `git log -3`(本次:Sheet 5 Miheng_Movement_Summary) |

辅助仓库:
- `cloudflare-worker/` 子目录:Cloudflare Worker 反代代码骨架(C 方案,**未启用**,留作后续可选)
- 还有一个**独立工具** `/Users/qiu/excel-balance-template/`(Python + openpyxl)— 跟当前 web 版无关,
  是给客户单独离线生成「统计流水模版.xlsx」的脚本

---

## 2. 用户偏好 / 工作方式

- **中文沟通**(中英混合 OK)
- **直接改、直接验证、直接推**,不要只讲方案
- 不在乎 API key 的"理论暴露"风险("key 不用管 / 风险不用管")。但**最近改成 B 方案**:
  完全移除内置 key,客户自带 key,所以这个风险话题已自然解决
- 文档/日志/聊天里不要展开任何完整 key,如必须用 `[REDACTED]`
- 关心**线上能不能打开、客户能不能直接用、是否真的有 bug**;修复后要用浏览器开线上验证
- 偏好"专业 SaaS"美学(Linear/Vercel),不要卡通风、emoji 不要泛滥
- mobile / desktop / 国内访问都要正常

---

## 3. 技术架构现状

### 形式
纯前端单文件 HTML 应用(`index.html`),没有后端。

### CDN / 浏览器端库
- Tailwind CSS(浏览器版,生产警告可忽略)
- PDF.js(PDF 文本提取)
- ECharts 5.5.1(图表)
- ExcelJS 4.4.0(按需懒加载,Excel 导出)
- SheetJS(Excel/CSV 解析输入)
- mammoth.js(Word docx)
- heic2any(iOS 图片转 JPEG)
- JSZip(ZIP 解压)
- sql.js(懒加载,SQLite)
- Tesseract.js(懒加载,OCR)
- Google Fonts:Inter / Instrument Serif / IBM Plex Mono

### AI Provider
支持 9 家:DeepSeek / 通义千问 / 豆包 / Kimi / 智谱 / aipaibox 中转 / OpenRouter / OpenAI / Anthropic / Custom OpenAI-compatible。

### 当前默认 provider/model
`deepseek` / `deepseek-chat`(V3,¥0.27/M 输入 · ¥1.1/M 输出)。

### 当前内置 API Key
**无**(B 方案,自 commit `4e3548a` 起)。
- `DEFAULTS.apiKey = ''`
- 客户必须自己去 https://platform.deepseek.com/api_keys 申请并填到设置面板
- 首页空状态有 ⚠️ 黄色横幅引导,文案已精简到 1 行
- ⚠️ DeepSeek **不支持图片/PDF 原生输入**(`pdfMode: 'text'`),PDF 由 PDF.js 先 extract 成纯文本再喂模型 — 表格密集 / 扫描件 PDF 识别精度会受影响,客户实测如效果差,让他切到 aipaibox/通义/豆包系
- 老用户 localStorage 里旧 provider/model/key 不变(向后兼容)

### Cloudflare Worker 反代(C 方案 · 未启用)
`cloudflare-worker/` 目录里有完整骨架:
- `worker.js` - 反代代码,Origin 白名单 + SSE 流透传 + 健康检查 `/`
- `README.md` - 一步步部署文档(给零 Cloudflare 经验的人)
- `wrangler.toml` - 给会用 CLI 的人

如果以后用户想"内置 key + 隐藏 key + 防客户偷",按 README 部署 Worker + 把 PROVIDERS.deepseek.baseUrl 改 Worker URL 即可。

---

## 4. 主要功能(v8.0 · 「统计流水」专家定位)

### 4.1 多格式上传 / 解析
PDF / 图片(JPG/PNG/WebP/HEIC) / Excel / CSV / Word / ZIP / EML / SQLite / TXT。
- 单文件 ≤ 64 MB
- 自动跳过 `.DS_Store` / `Thumbs.db` / `__MACOSX/`
- 支持文件夹拖拽(webkitGetAsEntry 递归)
- mobile 上无拖功能,只能点按钮选 — 文案已响应式适配

### 4.2 统计流水输出 · v8.0 工作流(预览 → 待确认迭代 → 确认 → 生成)

**第一步:预览模式**(AI 默认输出)
1. 【结论 · 3 选 1】区块:① 统计视角 / ② 老板视角 / ③ 业务视角(v8.0 删了"审计师视角""财务总监视角")
2. 极简核心结论(80-120 字)
3. 关键指标 Markdown 表格
4. 可选 ` ```chart ` JSON 块(若不出,前端自动从 TSV 兜底生成图)
5. **完整 5 张 ```tsv 块**(主交付 Sheet 1 / 2 给"做账审计板块"读;辅助 Sheet 3 / 4 / 5 给客户参考)
6. **结构化 ` ```json ` 概要块**:`preview_status: "preview"` + `metrics`(给 Hero 卡片渲染)
7. 流水观察 bullet(纯统计角度,不写做账/审计意见)
8. **【待用户确认事项】清单**(若有 — 任何分类不确定的交易必须进这里,绝不允许 AI 猜测)
9. **末尾固定提示语**(必须照搬,两句):
   - 「统计流水已完成。如有待确认事项,请回复确认后我将更新数据并继续。」
   - 「以上预览是否正确?确认无误请回复『确认生成Excel』,我将立即生成最终版本。」

**待确认事项迭代**(v8.0 新增):
- 用户逐条回答待确认事项 → AI **重新生成完整 5 张 TSV**(更新该笔 + 把该笔从清单移除)
- 不允许只追加片段;每轮都重出完整 TSV

**第二步:生成模式**(用户回"确认生成Excel"后)
1. 一行 ✅ 已生成 + 文件名建议(如 `威利星玩具_统计流水_2025.04-2026.03.xlsx`)
2. 最终版 5 张 TSV(基于预览的修正、加总自验、note 更精准)
3. ` ```json {"preview_status":"confirmed"} `(前端把 Hero 的"确认按钮"置灰)
4. **不重复**结论 / 指标卡片 / 详细说明(预览阶段已给过)

### 4.3 5 张专业 TSV Sheet(字段全英文 \\t 分隔 · 主交付 Sheet 1/2 + 辅助 Sheet 3/4/5)

**Sheet 1 · Transaction_Detail**(主表 · **仅 debit 存入交易明细** · 20 列,**严格此顺序**):
```
source_file bank_name statement_period transaction_date description counterparty
reference original_currency original_amount exchange_rate hkd_equivalent rmb_equivalent
classification is_valid_inbound exclusion_reason business_nature related_party
director_related note original_row
```
⚠️ **debit-only 规则**(prompt v4.1 起):credit / 出账行**整行跳过**,不写入任何 sheet。
- `original_amount` 字段**永远 ≥ 0**,不会出现负数
- `classification` 枚举去掉了"出账"类(因 credit 根本不读入)
- **v8.0**:`audit_note` 字段重命名为 `note`(语义"分类备注",**不引用税法/审计条款**)
- 加总自验公式 `Σ Sheet 1 hkd_equivalent = Σ Sheet 2 valid_inbound_hkd + Σ Sheet 3 total_hkd` 自然成立(没负数抵消)

**Sheet 2 · Monthly_Summary**(年-月 + 银行 + 币种聚合):
```
year_month bank_name currency valid_inbound_original valid_inbound_hkd
exchange_rate_used notes
```
(末尾追加 TOTAL 合计行)

**Sheet 3 · Exclusion_Summary**(排除项目类别汇总 · v8.0 删 citation 列):
```
exclusion_category count total_original_currency total_hkd
representative_note
```
v8.0:删 `citation` 列(新规则不引税法);`representative_audit_note` → `representative_note`(分类备注,自由文本)

**Sheet 4 · Related_Party_Inflow**(关联方汇入款单独列出 · v8.0 改名 · 删披露/声明书措辞):
```
transaction_date bank_name counterparty relation_type original_currency original_amount
hkd_equivalent business_nature has_supporting_contract note
```
v8.0:从 `Related_Party_Transactions` 改名为 `Related_Party_Inflow`;删 `citation` 列;`disclosure_note` → `note`;措辞去"披露 / 管理层声明书 / BIR51"

**Sheet 5 · Miheng_Movement_Summary**(月度外币运动汇总 · 9 列 · 升级原 Markdown 月度矩阵):
```
date fc_currency fc_in_original fc_excluded_original fc_net_original
fc_avg_rate hkd_amount note row_type
```
- prompt 让 AI 在 ```tsv 块**首部**先写 2 行 META 元数据(`META\\tcompany\\t...` / `META\\taudit_period\\t...`)+ 空行,再写列头 + 数据
- `row_type` 是辅助列,枚举 `MONTH / MOVEMENT / CURRENCY_SUBTOTAL / BAL`,前端 Excel 导出**自动隐藏第 9 列**(客户视图仅 8 列)
- `fc_avg_rate` 用逐笔加权 = Σ(amount_hkd) / Σ(amount_original),4 位小数;**明确不引入** HKMA / 银行月均价 fallback,缺失就 note 写"汇率缺失,需补录"
- 行顺序:META × 2 + 空 + 列头 → MONTH 行(年月+币种升序)→ 每币种 MOVEMENT 行 → CURRENCY_SUBTOTAL 行(`USD :` / `HKD :` ...)→ BAL 行
- 前端 `buildTsvSheet` 检测行首 "META" 自动 split 元数据 → 顶部展示 + 空行 + 列头加粗灰底,跟前 4 张 sheet 区分
- 与 Sheet 2 Monthly_Summary 必须加总自验通过(Σ MOVEMENT.hkd_amount ≈ Sheet 2 valid_inbound_hkd 合计)

### 4.4 输出长度防截断策略(prompt 已写硬约束)
1. Sheet 1 必须 100% 完整(所有 20 列、所有行、不可 "..." 省略)
2. 5 张表之间用 `═══` 横线 + 大字标题分隔
3. 极端长度(笔数 > 200 或预估 > 12k tokens)允许从 ```tsv 降级到 ```json Lines
   — **前端目前只解析 TSV**,JSON Lines 路径未实现 `parseJsonLines()`,等真实场景出现再加
4. 字段名/顺序硬约束即使切 JSON Lines 也不变

### 4.5 Excel 导出 · 4 套模板下拉
顶部 `📊 Excel ▾` 按钮点开 4 选项:
- 🟣 紫色 banner(默认)— 原版「统计流水模版.xlsx」风格
- ⬜ 极简黑白 — 适合打印 / 扫描归档
- 🔵 专业蓝白 — 深蓝企业风,适合上市公司 / 大客户
- 📅 月度分 sheet 详细 — 紫色总览 + 每月一张明细 sheet

技术:
- 主题驱动 `XLSX_THEMES` 配置,buildMatrixSheet 接受 themeKey 参数
- 月度详细从 Sheet 1 (Transaction_Detail) 按 transaction_date 拆 sheet
- artifact 底部 📊 下载 .xlsx 按钮单击=默认紫色

### 4.6 同名互转 / 董事往来 识别字段
公司名输入框下「▸ 高级:同名互转 / 董事往来 识别(可选)」折叠区:
- 公司在月结单上的别名(多行)
- 董事姓名(多行)
- localStorage 按公司名缓存 `cashlens_entity_cache_v1`,同公司下次自动 prefill,折叠区自动展开
- 填了就插到 prompt 里给 AI 严格匹配
- loadProject 加载历史项目时也触发 prefill

### 4.7 3 种结论(预览阶段 · v8.0 从 4 选 1 减到 3 选 1)
报告最开头自动并列输出 3 种风格,客户挑一种作为对外送出版本:
- 📊 统计视角(80-120 字 + 注明分类依据 + 口径净额/总额清楚 · **不引税法/审计条款**)
- 👔 老板视角(40-80 字 + 3 个数 + 适合邮件)
- 💼 业务视角(80-150 字 + 业务建议)

v8.0 删了原"🎓 审计师视角"(冲突新角色) + "📊 财务总监视角"(简化)。

### 4.8 顶部 Hero 指标卡片(从 ```json 块解析渲染)
紫粉色徽章 `📋 预览模式` / `✅ 已确认` + HKD 大数字渐变文字 + 三联指标(总笔数/有效/已剔除) +
币种 pill + Top 5 客户列表 + 「📥 确认生成 Excel」CTA 按钮(点了自动 sendFollowup `确认生成Excel`)。

JSON schema(```json 块字段约束):
- `valid_inbound_hkd / total_count / valid_count / excluded_count`:**number** 类型(纯数字,不带引号/千分位)
- `currency_breakdown`:按 share_pct 降序;share_pct 是 0-100 数字(不带 %)
- `top_customers`:按 hkd 降序,**最多 5 条**
- `period`:严格 `"YYYY.MM - YYYY.MM"` 格式(点号 + 空格短横空格)
- 不许加 `//` 注释(必须合法 JSON)
- 同一报告不混合 TSV + JSON

### 4.9 3 种 loading 形态(按场景)
| 形态 | 比例 | 用途 | 已集成位置 | API |
|---|---|---|---|---|
| **audit-loader** | 16:5 | 大区域,4 阶段循环动画 | (备用,无固定位置) | `auditLoadingHTML(size?)` |
| **audit-progress** | 横向 | 4 阶段顺次激活进度条,看见 AI 进度 | `thinkingDots()` | `auditProgressHTML()` + `startAuditProgress(rootEl, opts)` |
| **audit-spinner** | 1:1 单圆 | 小空间 / 按钮 / toast | `toastLoading()` + downloadXlsx | `auditSpinnerHTML(size?)` (xs/sm/md/lg/inline) |

`startAuditProgress` 默认 1.5s/阶段时间驱动,opts 可传 `{stageDuration, loopDelay}`;
未来若想绑真实 stream 进度(按 onText token 数推进),改一行就行。

### 4.10 3 个 chat tab + artifact panel(v8.0 删了引用 tab)
报告 tab / 图表 tab / 数据表 tab。**引用 tab 已删** — v8.0 不引税法,留空 tab 会显 broken。
- ⚠️ 之前修过一个 ECharts 在 hidden 容器里 init 成 0×0 的 bug(commit `45693c0`):
  - `switchArtifactTab('charts')` 时阶梯式 resize(同步 + RAF + 50ms + 200ms)
  - `renderChartCard` 给每个 chart 容器挂 ResizeObserver
  - `__chartInstances.push` 提到 try 外
  这套 fix 比单次 resize 鲁棒得多,headless 浏览器也能正确渲染。

### 4.11 mobile 端全套优化(对标 ChatGPT/Claude/Gemini · commit `bbc97c1`)
- 顶部 nav mobile 隐藏:companyBtn / ctxChip / costChip / 顶部 Excel / 导出按钮
- artifact panel mobile 下变全屏 modal(`#artifactPanel.show-mobile` + `width: 100vw`)
- artifact mobile-bar(顶部小工具栏)只 mobile 显示,含返回按钮 + Excel + 导出
- Settings modal mobile 全屏化
- 安全区:`env(safe-area-inset-*)` 适配 iOS notch / Android 底部
- 触屏 hit area:按钮 ≥44px,`input/textarea` 强制 ≥16px 防 iOS auto zoom
- 教程 tour mobile 强制居中显示(很多 tour target 在 mobile 隐藏,靠 `isMobileTour` 切到中央)
- dropzone 文案响应式:desktop 显示"把月结单拖到这里",mobile 显示"点下方按钮上传"

### 4.12 5 种导出
1. 顶部 📊 Excel ▾(4 模板下拉)
2. 顶部 📥 导出(下载 .md)
3. artifact 底部 📋 复制 / 📥 下载 .md / 📊 复制 TSV / 📊 下载 .xlsx
4. artifact mobile-bar:📊 Excel + 📥 .md
5. 数据表 tab 每张 sheet 旁:📋 复制 TSV / 📥 下载 .tsv

`setExportButtonsDisabled(disabled)` helper 同步控制 4 个 export 按钮的 disabled 状态(顶部 2 + mobile-bar 2)。

### 4.13 双板块架构(v8.1 新增 · 统计流水 + 做账审计)

**两个独立 HTML / 两个独立 URL / 同源 localStorage 自动共享**:
- `index.html`(`/`)= 统计流水板块(当前主功能 · ~5000 行)
- `audit.html`(`/audit.html`)= 做账审计板块(placeholder + handoff 接收 · ~300 行)

**自动共享(同源 localStorage,零代码)**:
- API key / provider / model / settings
- 历史项目(`cashlens_projects_v1`)
- 同名互转 / 董事缓存(`cashlens_entity_cache_v1`)

**业务数据 handoff(显式 push 模式)**:
- localStorage key: `cashlens_handoff_v1`
- 统计流水板块:artifact toolbar 的 `📤 发送到做账审计` 按钮 → `sendToAuditModule()`(`index.html` 内)→ 把当前 `window.__latestReport` 的 5 张 TSV + metrics + 公司/期间存到 localStorage → 自动跳 `/audit.html`(700ms 延迟让 toast 显示)
- 做账审计板块:`init()` 检测 `localStorage[HANDOFF_KEY]`,有数据 → 渲染 hero 卡 + 5 张 TSV 预览;无数据 → 渲染 empty state + 跳回统计流水板块 CTA
- 实时同步:监听 `storage` 事件,另一标签页 push 时自动刷新

**Handoff payload schema**:
```js
{
  company: string,           // 公司名(从 #companyLabel 取)
  period: string,            // "YYYY-MM-DD — YYYY-MM-DD" 或 metrics.period
  receivedAt: ISO timestamp,
  metrics: {                 // 从 extractPreviewMetrics() 拿;可能为空对象
    valid_inbound_hkd, total_count, valid_count, excluded_count,
    currency_breakdown, top_customers, period
  },
  tsvBlocks: string[],       // 通常 5 张 TSV(主交付 Sheet 1/2 + 辅助 3/4/5)
  rawReport: string          // 完整 markdown 报告(后续做账审计逻辑可能用)
}
```

**跨板块切换 UI**:
- `index.html` 顶部 nav:`📚 做账审计 →` 链接到 `/audit.html`(`md:flex` desktop 显示;mobile 因空间不够隐藏)
- `audit.html` 顶部 nav:`📊 统计流水 →` 链接回 `/`(始终显示)
- `audit.html` 无独立 Settings UI(跳回 `index.html` 改);Footer 有提示链接

**做账审计板块当前内容(placeholder · 待实现)**:
- Empty state:无 handoff 数据 → "暂无数据" + 跳统计流水板块 CTA
- Received state:有 handoff 数据 → Hero 卡(公司 + 期间 + 接收时间 + 3 指标 + 清除/复制全部 TSV 按钮)+ 5 张 TSV 预览表(标记主交付 vs 辅助)+ "做账审计功能开发中" 占位
- 真正的做账审计逻辑(prompt / output / schema / AI 调用)留以后做,届时把 SYSTEM_PROMPT_AUDIT 之类的常量塞进 audit.html

---

## 5. 本会话(从 e0f200c 到 f98254a)所有重大改动

按提交倒序:

| Commit | 内容 |
|---|---|
| (本次 · v8.1) | **双板块架构 · 新增 audit.html 做账审计板块 + handoff 机制**:同仓库新增 `audit.html`(~300 行,独立 URL `/audit.html`);同源 localStorage 自动共享 settings / 历史项目;新增 `sendToAuditModule()` JS + artifact toolbar 「📤 发送到做账审计」按钮(push 模式 · 把 5 张 TSV + metrics + 公司/期间存到 `localStorage["cashlens_handoff_v1"]` 然后跳 audit.html);audit.html 包含 Empty state + Received state(Hero 卡 + 5 张 TSV 预览 + 复制全部 / 清除按钮)+ storage 事件实时同步;index.html 顶部 nav 加 「📚 做账审计 →」desktop 切换链接;HANDOFF section 4.13 新增双板块架构说明 |
| `b47549c` | **v8.0 去做账审计化大改 + 待确认事项迭代流程**:角色定位「统计流水」专家;prompt 加 [核心使命] + [不确定性处理规则] + 末尾固定提示语;Sheet 4 `Related_Party_Transactions` → `Related_Party_Inflow`;字段重命名 `audit_note` → `note` / `disclosure_note` → `note` / `representative_audit_note` → `representative_note`;Sheet 3/4 `citation` 列全删;风格化结论 4 选 1 → 3 选 1(删审计师/财务总监视角);删月度矩阵 Markdown 附加内容(Sheet 5 已覆盖);前端引用 tab 整删;前端 ~15 处文案去 HKSA / IRO / DIPN / SME-FRS / BIR51 / 管理层声明书 / 工作底稿 / 审计报告 / 审计师事务所;[严格执行规则] 3 条硬约束;followup chip 删 "按 BIR51 格式重新输出" / "生成审计调整分录建议" |
| `4daf4ce` | prompt debit-only 修正:credit 出账整行跳过,Sheet 1 永远 ≥ 0;classification 去"出账"枚举;前端文案去"出账" |
| `348262b` | Sheet 5 · Miheng_Movement_Summary 月度外币运动汇总:prompt 加 schema(META 头 + 9 列 + row_type 枚举 + 加总自验)+ 前端 `buildTsvSheet` 加 META 解析 / row_type 列隐藏 / `fc_*` 数字格式 |
| `f98254a` | prompt 加输出顺序与长度策略 |
| `c88f150` | audit-spinner 单圆 + toastLoading |
| `bde97da` | 4 阶段进度感知 loader(替换循环动画) |
| `ec98607` | 4 阶段审计风循环动画(audit-loader) |
| `1bcee43` | prompt 强化 3 点(字段顺序硬约束/标题/分类一致性) |
| `6111cc3` | JSON schema 字段类型/排序/上限约束精确化 |
| `16221cf` | prompt v7.1 预览-确认-生成工作流 + Hero 卡片 |
| `bdd663d` | 升级 prompt 到专业审计 schema(4 张专业 sheet) |
| `bbc97c1` | mobile 端全套优化 |
| `1f81363` | 修图表文字重叠 |
| `45693c0` | 修图表 tab 空白(ECharts hidden init 0×0) |
| `4decf5f` | Excel 4 套模板下拉 |
| `5df5802` | AI 4 种风格化结论 |
| `3b65e49` | 同名互转/董事往来识别字段 |
| `8b44bba` | 删 onboarding 5 步注册引导 93 行 |
| `d07b9df` | 精简 API Key 引导 |
| `4e3548a` | B 方案 - 移除内置 API Key |
| `e9b3f98` | Cloudflare Worker 反代框架(C 方案,未启用) |
| `efa6169` | 默认切到 DeepSeek + 内置 key(后被 B 方案撤销) |
| `288147b` | 默认 model gpt-5.4 → gpt-5.5(后被 efa6169 切到 deepseek-chat) |
| `e0f200c` | 一键导出 Excel(模板月度矩阵 + 4 张明细) |

---

## 6. 当前已知问题

### 6.1 ⚠️ 用户报告"无法访问此网站"
- 时间:本会话末尾,推完 `f98254a` 后用户反馈
- 已 verify:`node new Function()` 检查 3 个 inline script syntax 全 OK
- 最大概率:GitHub Pages 部署延迟(commit 推送 → Pages 重新构建需要 1-10 分钟)
- 兜底排查:
  1. https://github.com/zhongrenfei1-hub/cashlens-hk-audit/actions 看 Pages 部署状态
  2. 强制刷新浏览器(Cmd+Shift+R) / 换 incognito 窗口测
  3. 用 `?verify=f98254a` 这种 query 不影响,可去掉
  4. 极少数情况怀疑 prompt 字符串里反引号转义出 bug:`git revert f98254a` 再 push 试试

### 6.2 mobile 优化还未做完的小尾巴
- mobile 上 artifact 全屏 modal 的滚动行为还有微细节(顶部 mobile-bar 跟主内容滚动同步)
- 教程 tour mobile 直接居中,但首次访问的引导内容针对 desktop 元素(部分 step 因为 element hidden 自动跳过居中,可能客户感觉跳跃) — 真实用户测后再优化

### 6.3 JSON Lines 降级路径前端未实现
prompt 已要求笔数 > 200 时从 TSV 切 JSON Lines,但前端 `extractChartSpecs` / `buildTsvSheet` /
`autoGenerateChartsFromTsv` 都只 parse TSV。等真实大批量场景出现再加 `parseJsonLines()`。

### 6.4 ```chart 块前端未严格 schema 校验
现有 `extractChartSpecs` 用 `JSON.parse` 直接 parse,若 AI 输出格式偏差(比如 `data` 里是字符串而非数字),
`buildChartOption` 不会主动报错而是渲染空图。可加 schema check(but low priority)。

---

## 7. 关键代码位置(按行号)

| 功能 | 起始行号(±) | 备注 |
|---|---|---|
| Header(顶部 nav) | 325 | 含响应式 hidden sm:flex 等 |
| 空状态 + 上传区 | 480 | dropzone + 「⚠️ 请先在设置里填 API Key」横幅 |
| Settings Modal | 720 | mobile 全屏化已加 |
| `SYSTEM_PROMPT_V4` | 878 | v7.1 工作流 + 4 张 TSV schema + 长度策略 + 严格规则 |
| `PROVIDERS` 配置 | ~1067 | 9 家服务商 + DeepSeek 默认 |
| `DEFAULTS` | ~1248 | provider/apiKey/model;apiKey 已清空 |
| `toast` / `toastLoading` | ~1910 | toastLoading 内嵌 audit-spinner |
| `auditSpinnerHTML` | ~1932 | spinner 组件 |
| `auditLoadingHTML` / `auditProgressHTML` / `startAuditProgress` | ~2200 | 3 种 loading |
| `thinkingDots` | ~2280 | 现用 audit-progress |
| `extractChartSpecs` | ~2880 | 抓 ```chart 块 |
| `extractPreviewMetrics` | ~2999 | 抓 ```json preview_status 块 |
| `renderPreviewHero` | ~3015 | Hero 卡片 HTML 生成 |
| `confirmGenerateExcel` | ~3070 | CTA 按钮自动塞「确认生成Excel」+ sendFollowup |
| `renderArtifactReport` | ~3083 | 入口:hero prepend + Markdown + chart + tables |
| `autoGenerateChartsFromTsv` | ~2920 | 从 4 张 TSV 兜底生成 3 张图 |
| `XLSX_THEMES` + `buildMatrixSheet` | ~3460 | 4 套主题 |
| `addMonthlyDetailSheets` | ~3622 | 月度详细模板 |
| `downloadXlsx` | ~3673 | 4 模板下拉入口,含 toastLoading |
| `parseBalanceMatrix` | ~3450 | Markdown 月度矩阵 → Excel |
| `entityCache` 函数族 | ~1100 | localStorage 同名/董事缓存 |
| Tour `TOUR_STEPS` | ~3917 | 10 步教程 |
| Init `DOMContentLoaded` | ~4178 | 初始化各种 |

---

## 8. 常用维护命令

```bash
# 进工作目录
cd /Users/qiu/海荣香港/99_部署版

# 拉远端(部署版本不一定是本地最新,接手前先 fetch)
git fetch origin && git status

# 看最近 commit
git log --oneline -20

# 启 preview server(launch.json 已配置)
# Cashlens · 部署版 默认 port 8101,自动指向当前目录

# 检查 syntax(改完 index.html 必跑)
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script[^>]*>([\\s\\S]*?)<\\/script>/g); m.filter(s=>!s.includes('src=')).forEach((s,i)=>{ try { new Function(s.replace(/^<script[^>]*>/,'').replace(/<\\/script>$/,'')); console.log(i,'OK'); } catch(e){ console.log(i,'ERR',e.message); }});"

# commit 推送(GitHub Pages 自动部署)
git add index.html && git commit -m "..." && git push origin main
```

---

## 9. 给下一个 AI 的接手流程

1. **打开 https://zhongrenfei1-hub.github.io/cashlens-hk-audit/** 验证线上能打开(本会话末用户报告无法访问)
2. **看 git log -10** 了解最近改了什么
3. **跑 syntax check 命令** 确认 inline script 都 OK
4. **理解 v7.1 工作流**(预览 → 确认 → 生成),这是当前 prompt 核心
5. **理解 4 张 TSV schema** 和前端解析依赖关系(改字段名要同步前端 regex)
6. **读用户最新一句话再决定下一步**

### 改动注意事项

#### 改 SYSTEM_PROMPT_V4 的反引号
prompt 里要描述 ` ```tsv ` / ` ```json ` 时,反引号必须**三重转义** `\\\`\\\`\\\``(template literal 内)。
否则反引号会闭合 template literal,导致 JS 语法错误 → 整个网站白屏。
改完**必跑** syntax check 再 push。

#### 改 4 张 TSV 字段
- 字段名不要随便改(前端 `autoGenerateChartsFromTsv` 字段查找的 regex 依赖)
- 顺序也不能改(prompt 里写了"严格此顺序")
- 加新字段:在 prompt schema 里末尾加 + 前端 regex 加 fallback

#### 改 mobile 样式
看 head `<style>` 里的 `@media (max-width: 639px)` / `1023px` / `1279px` 几个断点,Cashlens 用的是:
- &lt; 640px = mobile(纯单列)
- 640-1023 = tablet(无 sidebar)
- 1024-1279 = desktop 中(有 sidebar 无 artifact)
- ≥ 1280 = 三列全开

---

## 10. 下一步优先级建议

按用户当前关注度排序:

1. **Verify 线上能打开** — 用户最新报"无法访问",先解决
2. **真实跑一份分析看 v7.1 输出是否符合 prompt 规格**(预览 → 确认 → 生成 / 4 张 TSV / JSON 概要 / 4 风格 / 横线分隔等)
   — 如果 AI 输出哪里没按规格,加更狠的 prompt 措辞或加前端容错
3. **mobile 真机实测** — preview headless 浏览器只能模拟,真机滚动、键盘弹出、安全区可能还有边角问题
4. **Excel 4 套模板让客户挑** — 客户说哪套保留,删其余,清理代码
5. **Cloudflare Worker** — 如果客户改主意想隐藏 key,按 `cloudflare-worker/README.md` 部署
6. **JSON Lines 前端解析** — 等真实 200+ 笔交易场景再加

---

**文档维护原则:** 每次大改完顺手更新这份 HANDOFF.md(尤其当 prompt 改动 / 新增 commit 群 / fix 重大 bug 后),让下一个 AI 一眼看懂状态。
