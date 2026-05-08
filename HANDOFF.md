# Cashlens 交接文档

> 给下一个 AI / Claude / Codex 看。新会话开始时，把这份文档贴进去，然后说：
> “接着这份 HANDOFF.md 继续帮我做 Cashlens，我现在要：[新需求]”。

最后更新：2026-05-08 13:26 CST
当前线上确认版本：`f323390` (`fix: harden report rendering and validation`)

---

## 1. 项目核心信息

| 项 | 值 |
|---|---|
| 项目名 | Cashlens（现金透镜）— 香港 SME 银行流水审计分析工具 |
| 线上地址 | https://zhongrenfei1-hub.github.io/cashlens-hk-audit/ |
| GitHub 仓库 | https://github.com/zhongrenfei1-hub/cashlens-hk-audit |
| 部署方式 | GitHub Pages，推送 `main` 后自动部署 |
| 当前主文件 | `index.html`（单文件前端应用） |
| 当前本地审查目录 | `/tmp/cashlens-hk-audit-review` |
| 当前分支 | `main` |
| 最新提交 | `f323390 fix: harden report rendering and validation` |

注意：旧版 HANDOFF 里写的本地路径 `/Users/qiu/海荣香港/99_部署版` 已不应视为当前工作路径。当前这次修复是在 `/tmp/cashlens-hk-audit-review` 完成并直接推送到 GitHub。

---

## 2. 用户偏好 / 工作方式

- 用户中文沟通，能接受中英混合。
- 用户偏好“直接改、直接验证、直接推”，不要只讲方案。
- 用户明确说过 API key 风险“key 不用管 / 风险不用管”，所以后续不要反复把 key 暴露当主任务。
- 但写文档、日志、聊天时不要输出任何完整 key / token / 密码；如必须提到，用 `[REDACTED]`。
- 用户关心线上网站是否真的能打开、客户能不能直接用、有没有实际 bug。
- 修复后要用浏览器打开线上站验证，而不是只看代码。

---

## 3. 技术架构现状

- 形式：纯前端单文件 HTML 应用。
- 后端：无。
- 部署：GitHub Pages。
- 主要 CDN / 浏览器端库：
  - Tailwind
  - PDF.js
  - ECharts
  - SheetJS
  - mammoth.js
  - heic2any
  - JSZip
  - sql.js（懒加载）
  - Tesseract.js（懒加载）
  - Google Fonts / Inter / Instrument Serif / IBM Plex Mono
- AI Provider：支持 aipaibox、DeepSeek、通义千问、豆包、Kimi、智谱、OpenRouter、OpenAI、Anthropic、自定义 OpenAI-compatible。
- 当前默认 provider/model：`aipaibox` / `gpt-5.4`。
- 默认 API key 存在于前端源码中，文档里不要展开写，统一视为 `[REDACTED]`。

---

## 4. 主要功能

1. 多格式上传 / 解析
   - PDF
   - 图片 JPG / PNG / WebP
   - HEIC / HEIF 自动转 JPEG
   - Excel
   - CSV / TSV
   - Word docx
   - ZIP 递归展开
   - EML / MSG
   - SQLite
   - TXT / MD / JSON / LOG

2. 浏览器内文件处理
   - 单文件上限 64 MB。
   - 自动跳过 `.DS_Store` / `Thumbs.db` / `__MACOSX/`。
   - 支持文件夹拖拽（webkitGetAsEntry 递归）。

3. 审计分析输出
   - 极简结论
   - 可视化图表
   - TSV 数据表
   - 详细说明
   - 自动识别 IRO / DIPN / SME-FRS / HKSA 引用

4. Artifact 面板
   - 报告 tab
   - 图表 tab
   - 数据表 tab
   - 引用 tab

5. 交互
   - 设置面板
   - 新手教程
   - 追问输入框
   - 项目历史 localStorage
   - 导出 Markdown / TSV

---

## 5. 这次已经修复的 bug（提交 f323390）

### 5.1 XSS：AI 报告 Markdown 渲染会执行 HTML

原问题：
- `renderArtifactReport()` 里把 `renderMarkdown(text)` 直接塞进 `innerHTML`。
- `renderMarkdown()` 对 heading / table / list / blockquote 等内容没有先 escape。
- 测试 payload：
  - `renderArtifactReport('### <img src=x onerror="document.body.dataset.xss=1">')`
- 修复前线上会触发 `document.body.dataset.xss = "1"`。

修复：
- `renderMarkdown()` 在保护 code block / inline code 后，对普通 Markdown 文本统一 `escapeHtml(md)`。
- 再做 heading / table / list / blockquote 转换。
- code block / chart / tsv 恢复时继续 escape 动态文本。

验证：
- 线上执行 payload 后等待 800ms，`document.body.dataset.xss` 为空。
- HTML 标签会作为文本显示，不会执行。

### 5.2 设置面板默认 provider 显示错误

原问题：
- 实际 `getProvider()` 默认是 `aipaibox`。
- 但 `openSettings()` fallback 写死为 `'deepseek'`。
- 首次打开设置会显示 DeepSeek / deepseek-chat，和实际运行状态不一致。

修复：
- `openSettings()` 改为 `const provider = s.provider || DEFAULTS.provider;`
- 模型选择默认也补上 `DEFAULTS.model`。

验证：
- 线上打开设置后：
  - provider = `aipaibox`
  - model = `gpt-5.4`

### 5.3 日期为空仍能开始分析

原问题：
- 清空审计期间开始或结束日期后仍会调用分析。
- prompt 里出现空日期。

修复：
- `startAnalysis()` 增加必填校验。
- 空日期时 toast：`请先填写完整审计期间`，并 return。

验证：
- stub `streamAI` 后，空日期情况下调用次数为 0。

### 5.4 开始日期晚于结束日期仍能分析

原问题：
- 可提交 `2026-12-31 至 2025-01-01` 这种反向期间。

修复：
- `startAnalysis()` 增加顺序校验。
- `periodStart > periodEnd` 时 toast：`审计期间开始日期不能晚于结束日期`，并 return。

验证：
- stub `streamAI` 后，反向日期情况下调用次数为 0。

### 5.5 CSV / TXT 单独上传时 prompt 误写 PDF 交叉验证

原问题：
- 原逻辑用 `hasNonPdf` 判断。
- 只上传 CSV/TXT 也会出现“PDF 月结单 + 其他辅助资料”的交叉验证提示。

修复：
- 改成：
  - `hasPdf = stagedFiles.some(f => f.category === 'pdf' || f.subcat === 'pdf')`
  - `hasAux = stagedFiles.some(f => !(f.category === 'pdf' || f.subcat === 'pdf'))`
  - 只有 `hasPdf && hasAux` 时才加入交叉验证提示。

验证：
- 仅上传 CSV 时，prompt 不再包含 `PDF 月结单` / `其他辅助资料` / `外部资料交叉验证`。

### 5.6 custom / oneapi Base URL 为空时误请求相对路径

原问题：
- provider = custom，Base URL 为空时，会请求当前静态站的 `/chat/completions`。
- 线上表现为 `HTTP 405`，用户看不懂。

修复：
- `getProviderConfig()` 对 custom / oneapi 保留空 baseUrl。
- `streamAI()` 开始请求前检查 `provider?.baseUrl`。
- 为空则 `onError('请先在设置中填写 Base URL(例如 https://your-endpoint/v1)')`，不发 fetch。

验证：
- 线上测试 fetch 调用次数 = 0。
- 错误信息为：`请先在设置中填写 Base URL(例如 https://your-endpoint/v1)`。

### 5.7 “新分析”后旧报告状态残留

原问题：
- 点击“新分析”后，UI 清空了部分状态，但 `window.__latestReport` 仍保留旧报告。
- 导出/复制等可能拿到旧内容。

修复：
- `newSession()` 中加入：
  - `window.__latestReport = ''`
  - 清空 `artifactReportTab` / `artifactChartsTab` / `artifactTablesTab` / `artifactCitationsTab`
  - `artifactStatus` 重置为 `等待分析`
  - 移除 `.chart-count`

验证：
- 设置 `window.__latestReport = 'old'` 后调用 `newSession()`，结果为空字符串。

### 5.8 文案不准确

修复：
- “API Key 加密存于浏览器 localStorage”改为“API Key 仅保存在本机浏览器 localStorage(无后端中转)”。
- “PDF 仅在你浏览器内 base64,直接通过 HTTPS 发往 api.anthropic.com”改为“上传文件仅在浏览器内读取,直接通过 HTTPS 发往你选择的模型服务商”。
- 分析气泡中“份月结单”改成“份文件”。

---

## 6. 已验证结果

本地验证：
- 本地静态服务打开成功。
- 页面标题正确。
- XSS payload 不执行。
- 设置默认显示 aipaibox / gpt-5.4。
- 空日期不调用分析。
- 日期反向不调用分析。
- CSV-only prompt 不再出现 PDF 交叉验证。
- custom Base URL 空不会 fetch。
- 新分析会清空 latestReport。

线上验证：
- 打开：`https://zhongrenfei1-hub.github.io/cashlens-hk-audit/?verify=f323390`
- 页面标题：`Cashlens · 现金透镜 · 香港审计流水分析`
- 检查补丁文本存在。
- XSS payload 不执行。
- 设置默认：aipaibox / gpt-5.4。
- custom Base URL 空：fetch 调用 0 次，友好报错。

---

## 7. 当前已知未修 / 可后续优化

1. API key 暴露
   - 用户已明确说不用管。
   - 后续如果要商业化，建议改成 Cloudflare Worker / Edge Function 代理 + 限额 + 域名白名单。
   - 交接/聊天中不要输出完整 key。

2. 首屏教程遮罩体验
   - 有时视觉检查会看到新手教程 overlay / 遮罩较重。
   - console 对 modal 状态和视觉截图曾有差异，可能是 tour overlay 不在 `.modal-backdrop` 查询里。
   - 可后续检查 `cashlens_tour_seen_v1`、tour DOM、首次访问逻辑。

3. 首屏上传图标偏大 / 布局视觉比例
   - 网站能打开，但首屏上传图标和布局可以更精致。
   - 这次没有做视觉重构。

4. 关于弹窗底部略贴边 / 内容滚动提示不明显
   - 之前 DOM 测过：`clientHeight 504`、`scrollHeight 531`。
   - 可加底部 padding 或更明显滚动阴影。

5. prompt 版本命名混乱
   - 代码变量仍叫 `SYSTEM_PROMPT_V4`，UI 有 v4.2，旧 HANDOFF 曾写 v5.0。
   - 当前未统一版本体系。
   - 后续建议加一个 `APP_VERSION` / `PROMPT_VERSION` 常量，UI、关于、HANDOFF 都引用。

6. Markdown 渲染器仍是轻量自研
   - 已修 XSS 主风险。
   - 但复杂 Markdown 支持有限。
   - 后续如要更稳，可以引入成熟 Markdown parser + DOMPurify。

7. 没有自动化测试套件
   - 当前主要靠 browser console 手工测试。
   - 后续可加 Playwright 测试：XSS、设置默认、日期校验、custom Base URL、newSession。

---

## 8. 关键代码位置（当前大致行号）

行号会随修改变化，以搜索函数名为准。

- `DEFAULTS`：约 1138 行
- `getProvider()` / `getProviderConfig()` / `getModel()`：约 1144 行
- `openSettings()`：约 1236 行
- `normalizeBaseUrl()` / `saveSettings()` / `testApiKey()`：约 1285 行
- `escapeHtml`：约 1402 行
- `handleFiles()`：约 1615 行
- `renderStagedFiles()`：约 1695 行
- `renderArtifactReport()`：约 2240 行
- `renderMarkdown()`：约 2379 行
- `streamAI()`：约 2464 行
- `buildUserContent()`：约 2600 行附近
- `startAnalysis()`：约 2742 行
- `loadProject()` / `newSession()`：约 3120 行附近

---

## 9. 常用维护命令

```bash
# 当前这次工作的本地目录
cd /tmp/cashlens-hk-audit-review

# 更新 main
git checkout main
git pull --ff-only origin main

# 看状态
git status --short
git log --oneline -5

# 本地预览
python3 -m http.server 8765
# 浏览器打开 http://127.0.0.1:8765/index.html

# 提交并推送
git add index.html HANDOFF.md
git commit -m "fix: describe change"
git push origin main

# 线上验证
# 打开 https://zhongrenfei1-hub.github.io/cashlens-hk-audit/?verify=<commit>
```

注意：之前有一条命令被环境阻止过，不要重试同类组合：
- `node --check /tmp/cashlens-script-9.js; ...`
- 后续语法检查优先用浏览器实际打开 + console，或简单 git diff / grep / Python 文本检查。

---

## 10. 给下一个 AI 的建议流程

如果用户说“继续改 Cashlens”：

1. 先读这份 `HANDOFF.md`。
2. `cd /tmp/cashlens-hk-audit-review`，确认 `git status --short` 干净。
3. `git pull --ff-only origin main`。
4. 搜索并读取 `index.html` 相关函数。
5. 修改后本地开静态服务验证。
6. 用浏览器实际打开页面，做至少一轮 console 验证。
7. commit + push。
8. 打开 GitHub Pages 线上 URL，加 `?verify=<commit>` 避免缓存。
9. 把验证结果用中文简洁汇报给用户。

---

## 11. 如果要继续修 bug，优先级建议

P0 / P1：
- 添加 Playwright 或最小浏览器测试脚本，防止 XSS / 日期 / provider regression。
- 检查 tour overlay 首次访问逻辑，避免遮挡或看起来“首屏不干净”。
- 统一版本号：`APP_VERSION`、`PROMPT_VERSION`。

P2：
- 关于弹窗滚动体验。
- 上传区域视觉比例。
- Markdown 渲染质量。
- 历史项目 localStorage 清理 / 导出。

P3：
- 真正的后端代理 / 登录 / 额度控制（用户之前不急）。

---

## 12. 一句话状态摘要

Cashlens 当前线上可打开，最新 `f323390` 已修复报告 XSS、设置默认错乱、日期校验、CSV-only prompt 误判、custom Base URL 空请求、新分析状态残留和部分误导文案；下一步适合做首屏/教程体验、版本号统一和自动化测试。
