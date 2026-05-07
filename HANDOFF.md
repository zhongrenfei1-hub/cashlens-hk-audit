# Cashlens 交接文档

> 给下一个 Claude 看的状态快照。新会话开始时,把这份文档贴给 Claude,说一句:
> **"接着这份文档继续帮我做 Cashlens,我需要 [新需求]"**

---

## 项目核心信息

| 项 | 值 |
|---|---|
| **项目名** | Cashlens(现金透镜)— 香港 SME 银行流水审计工具 |
| **部署** | GitHub Pages |
| **直链** | https://zhongrenfei1-hub.github.io/cashlens-hk-audit/ |
| **仓库** | https://github.com/zhongrenfei1-hub/cashlens-hk-audit |
| **本地源码** | `/Users/qiu/海荣香港/99_部署版/index.html` |
| **GitHub 用户** | `zhongrenfei1-hub`(已 gh CLI 登录,token 存在 keychain) |
| **gh CLI 路径** | `~/.local/bin/gh` |

---

## 技术架构

- **形式**:单文件 HTML(~150KB)+ README,纯前端
- **后端**:无(故意的,客户零配置即用)
- **API 默认**:**内置** aipaibox 中转站 + Key `sk-Rph...kiH6F...` + 模型 `gpt-5.4`
  - ⚠️ Key 公开暴露在 GitHub,用户**接受了风险**(说"风险不用管"),建议在 aipaibox 控制台设余额预警 + 按 Key 限额
- **CDN 库**:Tailwind / PDF.js / ECharts 5.5.1 / SheetJS / mammoth.js / heic2any / JSZip / sql.js(懒加载)/ Tesseract.js(懒加载)/ Inter + Instrument Serif(Google Fonts)

---

## 已实现功能(版本 v2.x)

### 1. 多 AI 服务商
9 家 + 自定义:**aipaibox**(默认)/ DeepSeek / 通义千问 / 豆包 / Kimi / 智谱 / OpenRouter / OpenAI / Anthropic Claude / 自定义 OpenAI 兼容
- 设置面板可切换;Key/URL/模型/思考预算可改
- aipaibox 实测仅这些模型可用:`gpt-5.4` / `gpt-5.5` / `gpt-5.3-codex*` / `gpt-image-2`

### 2. 多文件格式(浏览器内解析)
PDF / JPG/PNG/WebP / **HEIC**(自动转 JPEG)/ Excel(xlsx/xls)/ CSV / Word(docx)/ **ZIP**(递归展开)/ EML 邮件 / SQLite / TXT
- **拖文件夹** 支持(webkitGetAsEntry 递归)
- 自动跳过 `.DS_Store` / `Thumbs.db` / `__MACOSX/`
- 单文件上限 64 MB

### 3. 提示词 v5.0(`SYSTEM_PROMPT_V4`,~第 783 行)
- 角色:10 年香港审计专家 + HKSA 230
- 严格 INCLUDE/EXCLUDE 规则
- **批量处理协议**:>12 份 PDF 自动分批,先处理 8-10 份后提示「请回复『继续』」
- 多文件交叉验证(✓/⚠/✗)
- **强制 4 段输出**:① 极简结论(80 字大白话)② 可视化(```chart 块,≥2 张)③ 结构化数据(```tsv 4 张 Sheet)④ 详细说明(含月度×币种矩阵)

### 4. 4-tab Artifact 面板
📄 报告(Markdown 渲染)/ 📈 图表(ECharts 8 类型,无图自动从 TSV 兜底)/ 📊 数据表(TSV → HTML 表格,可复制可下载)/ 📜 引用(自动抓 IRO/DIPN/SME-FRS/HKSA)

### 5. UX
- 内置交互式教程(10 步,首次自动弹,❓ 按钮重看)
- Composer 追问(占位文字 8 句轮播,完成后追问芯片)
- 顶栏 📊 上下文芯片(每模型有 limit:GPT-5.4=128K / Claude=200K / Gemini=1M)
- 顶栏 💵 成本芯片(实时计费)
- 项目历史 localStorage(最近 30 个)
- **窄屏响应式**:<1024 自动收 sidebar(汉堡 ☰)/ <1280 自动收 artifact(右上 📱)
- 报告首段(极简结论)用渐变光晕大字渲染,粗体数字 22px 三色渐变

### 6. 视觉语言
- 主色:深紫黑 `#08020e` + 三色渐变(紫 #A855F7 → 粉 #FA1AC0 → 橙 #FF8C42)
- 玻璃拟态卡片 + Instrument Serif 标题 + Inter 正文 + IBM Plex Mono 数字
- 灵感来自 motionai + platform-rocket 设计语言(自己重写实现)

---

## 文件结构

```
/Users/qiu/海荣香港/99_部署版/
├── index.html            # 单文件应用,所有功能在此
├── README.md             # 给客户看的部署说明
└── HANDOFF.md            # 本文件,给下一个 Claude 看
```

`index.html` 内部关键位置(行号近似,改动后会偏移):
- 第 ~285 行:CSS 样式
- 第 ~315-345 行:顶栏 HTML(含 ☰/📱/❓/⚙️/导出 按钮)
- 第 ~485 行:右侧 artifact panel HTML
- 第 ~705 行:`DEFAULTS`(内置 API Key 在此)
- 第 ~785 行:`SYSTEM_PROMPT_V4`(系统提示词)
- 第 ~880 行:`PROVIDERS` 配置(9 家服务商)
- 第 ~1500 行:`handleFiles` + 多格式 parser
- 第 ~1700 行:`handleDataTransfer`(文件夹拖拽)
- 第 ~2070 行:`renderArtifactReport` + `autoGenerateChartsFromTsv`
- 第 ~2300 行:`buildUserContent`(provider-aware)
- 第 ~2500 行:`streamAI`(SSE 流式 + 多 provider)
- 第 ~2900 行:Tour 教程引擎(10 步)

---

## 部署 & 改动流程

```bash
# 编辑后部署
cd /Users/qiu/海荣香港/99_部署版
# ... 改 index.html ...
git add -A
git -c user.name="zhongrenfei1-hub" \
    -c user.email="231221504+zhongrenfei1-hub@users.noreply.github.com" \
    commit -m "改了什么"
git push
# GitHub Pages 1-2 分钟自动重建,刷新网址生效
```

**强制刷新**:用户访问后用 `Cmd+Shift+R` 跳过浏览器缓存。

---

## 已知限制 / 可能的下一步

1. **API Key 暴露**:部署在公共 repo 里,任何人都能拿到 — 已和用户确认接受风险。建议:
   - aipaibox 控制台设余额预警(¥50 阈值)
   - 设单 Key 日额度上限
2. **后端代理**:用户拒绝过加 Cloudflare Worker 代理。如想加回来,模板见 README 提示
3. **登录系统**:用户问过,我推荐过 Cloudflare Worker + KV,但用户最终选了"零配置嵌 Key"
4. **图表准确度**:gpt-5.4 实测识别"DBS 中国"会误判成"南商",中文银行识别有偏差,推荐换 Claude(但需要 VPN)
5. **大批量优化**:>12 份 PDF 走分批(已实现),但用户每次手动回复「继续」,可考虑加按钮

---

## 用户偏好(很重要)

- **语言**:中文交流,代码标识符英文
- **风格**:直接、简洁,不要太啰嗦,代码改动一次推完
- **风险态度**:务实派,API Key 公开这种事知情后选了"风险不用管"
- **审美**:深色 + 渐变 + 大字数字,看过 motionai / platform-rocket
- **测试方式**:让我用 preview 工具实际打开网站验证再给他看
- **最关心**:能直接给客户用,客户看不懂技术,需要大白话 + 大数字 + 自动出图

---

## 在新 Claude 会话里怎么续上

把这份文档贴给新 Claude,然后说:

> "接着这份 HANDOFF.md 继续帮我做 Cashlens。
> 现在我想:[在这里写新需求,比如「再加一个 X 功能」/ 「修一个 bug:Y」/ 「优化 Z」]"

Claude 会:
1. 读这份文档了解现状
2. 必要时读 `index.html` 看具体代码
3. 改完后用 git push 部署
4. 在 preview 里验证

**别跟新 Claude 说"接着上一个"** — Claude 没有跨会话记忆,需要看文档。
