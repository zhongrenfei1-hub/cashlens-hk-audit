# Cashlens · 现金透镜 — 部署版

> 香港 SME 银行月结单 AI「统计流水」工具 · 单文件 · 纯前端 · 支持 9 家 AI 服务商 · 只算 debit 存入,绝不涉及做账/审计/税项

## 🌍 v1.1 更新:多服务商支持

| 服务商 | 国内可用 | PDF 处理 | 推荐场景 |
|--------|---------|---------|---------|
| **DeepSeek 深度求索** | ✅ 直连 | 文本提取 | 💰 极便宜 ¥0.27/M 输入 |
| **通义千问 Qwen VL** | ✅ 直连 | 转图片 | 🇨🇳 多模态 + 新用户送百万 token |
| **豆包 (火山方舟)** | ✅ 直连 | 转图片 | 🇨🇳 字节跳动旗舰 |
| **Kimi Moonshot** | ✅ 直连 | 文本提取 | 🇨🇳 长上下文 128K |
| **智谱 GLM** | ✅ 直连 | 转图片 | 🇨🇳 清华系 |
| **OpenRouter** | ⚠️ 需 VPN | 转图片 | 🌐 一个 Key 用所有模型 |
| **Anthropic Claude** | ❌ 需 VPN | 原生 PDF | 🌟 唯一原生支持 PDF,识别准确度最高 |
| **OpenAI GPT-4o** | ❌ 需 VPN | 转图片 | 🌐 通用旗舰 |
| **自定义 OpenAI 兼容** | 看 endpoint | 转图片 | ⚙️ 任何兼容 API |

**PDF 处理三种模式自动选择:**
- **原生模式** (Anthropic):PDF 直接发给模型,准确度最高
- **图片模式** (Qwen VL / Doubao Vision / GPT-4o):前端用 PDF.js 把每页转 PNG,发给视觉模型
- **文本模式** (DeepSeek / Moonshot 纯文本):用 PDF.js 提取文本(仅适合电子原版 PDF,扫描件会失败)

## ✨ 是什么

把 PDF 月结单拖到网页里 → AI 按 debit-only 规则筛 → 输出预览 + 5 张 TSV Sheet → 待确认事项迭代后 → 复制到 `统计流水模版.xlsx` 即可。主交付:`Transaction_Detail.tsv` + `Monthly_Summary.tsv`(给"做账审计板块"直接读取)。

- ✅ **零后端**:单个 `index.html`,丢到任何静态服务器就跑
- ✅ **API Key 仅本机**:存于浏览器 localStorage,永不上传第三方
- ✅ **直连 Anthropic**:浏览器 → api.anthropic.com,无中转
- ✅ **流式输出**:边生成边显示,Markdown + 表格实时渲染
- ✅ **历史项目**:自动存最近 30 个分析记录到本机
- ✅ **追问**:第一次分析后,可继续对话("列出大额交易"、"把待确认第 3 笔判为关联方")

## 📦 文件清单

```
99_部署版/
├── index.html      # 统计流水板块(主功能,~5000 行,自带 Tailwind CDN)
├── audit.html      # 做账审计板块(placeholder + handoff 接收,~300 行)
├── HANDOFF.md      # 给下一个 AI 的接手指南
└── README.md       # 本文档
```

**双板块架构**(v8.1):`index.html` = 统计流水(只算 debit 存入);`audit.html` = 做账审计板块(placeholder,从统计流水接收数据)。两个文件部署到同一 GitHub Pages,**同源 localStorage 自动共享**(API key / settings / 历史项目);**业务数据通过 `📤 发送到做账审计板块` 按钮**(localStorage handoff key `cashlens_handoff_v1`)从统计流水流到做账审计。两个板块都仅需访问对应 URL 即可。

## 🚀 部署方式(选其一)

### 方式 A:Nginx(自建服务器,推荐)

```bash
# 1. 把 index.html 上传到服务器,例如 /var/www/cashlens/
scp index.html user@server:/var/www/cashlens/

# 2. Nginx 配置
server {
    listen 443 ssl http2;
    server_name cashlens.your-domain.com;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    root /var/www/cashlens;
    index index.html;

    # 静态文件缓存(可选)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=300";
    }
}
```

> ⚠️ **必须用 HTTPS**!浏览器要求 `localStorage` 和 `fetch()` 在安全上下文运行。
> 用 [certbot](https://certbot.eff.org/) 一键申请免费证书。

### 方式 B:Netlify Drop(最快,30 秒搞定)

1. 打开 https://app.netlify.com/drop
2. 把 `99_部署版` 整个文件夹拖进去
3. 拿到 `https://xxx.netlify.app` 即用

### 方式 C:GitHub Pages

```bash
git init
git add index.html README.md
git commit -m "init cashlens"
gh repo create cashlens --public --source=. --push
gh api -X POST /repos/$(gh api user -q .login)/cashlens/pages \
   -f source.branch=main -f source.path=/
```

部署到 `https://<username>.github.io/cashlens/`。

### 方式 D:Vercel

```bash
npm i -g vercel
cd 99_部署版
vercel --prod
```

### 方式 E:本地试用(无需部署)

```bash
cd 99_部署版
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 🔑 首次使用

1. 打开网页,会自动弹出设置面板
2. 粘贴你的 Anthropic API Key(从 https://console.anthropic.com/settings/keys 获取)
3. 点击 **测试连接** 确认 Key 有效
4. 点击 **保存**
5. 把 PDF 月结单拖到中间区域 → 输入公司名 + 期间 → 点击 **开始分析**

## 💰 费用预估

每次分析的费用取决于:
- 模型(Sonnet 比 Opus 便宜 5 倍)
- PDF 数量与页数
- 是否启用 Extended Thinking

参考(16 份 DBS 月结单 ≈ 1 MB / 64 页):

| 模型 | 输入 ~163K | 输出 ~28K | 合计 |
|------|-----------|-----------|------|
| Sonnet 4.5 | $0.49 | $0.42 | **≈ $0.91** |
| Opus 4.5 | $2.45 | $2.10 | ≈ $4.55 |
| Haiku 4.5 | $0.16 | $0.14 | ≈ $0.30 |

启用 prompt caching(自动)后,**第二次起重跑同一组 PDF 只花 10% 输入费用**。

## ⚙️ 设置项详解

| 项 | 说明 | 默认值 |
|----|------|------|
| API Key | 你的 sk-ant-... | (空) |
| 模型 | Sonnet 4.5 / Opus 4.5 / Haiku 4.5 / 自定义 | Sonnet 4.5 |
| Extended Thinking | 思考预算 tokens(0 = 关闭) | 0 |
| 最大输出 Tokens | 单次响应上限 | 16384 |
| 系统提示词 | v8.0「统计流水」规则(可编辑) | v8.0 默认 |

## 🛡️ 安全说明

| 数据 | 储存位置 | 是否上传 |
|------|---------|---------|
| API Key | 浏览器 localStorage(仅本机)| 仅 → api.anthropic.com |
| PDF 文件 | 浏览器内存(关闭页面即清除)| → api.anthropic.com(base64)|
| 分析报告 | localStorage(本机最近 30 条)| 不上传 |
| 提示词 | localStorage | 仅 → api.anthropic.com |

**默认无中转**(浏览器直连 AI provider),关闭网页 = 内存数据消失。共用电脑请记得清除 localStorage。

> ⚠️ **例外**:OpenAI / Google Gemini / 私有 HTTP server **必须**通过反代(浏览器 CORS / Mixed Content 限制)。
> 详见下方 [🔌 部署反代 Worker](#-部署反代-worker可选--解决-cors--mixed-content)。

## 🔌 部署反代 Worker(可选 · 解决 CORS / Mixed Content)

某些后端浏览器调不通:

| 后端 | 浏览器拦截原因 | 必须反代 |
|---|---|---|
| OpenAI `api.openai.com` | CORS(OpenAI 不允许浏览器直连) | ✅ |
| Google Gemini | CORS(同上) | ✅ |
| 私有 server `http://x.x.x.x:8080` | Mixed Content(HTTPS 页面禁调 HTTP) | ✅ |
| 中转站(部分) | 服务商没设 CORS header | 可能需要 |
| DeepSeek / 通义千问 / 豆包 / Kimi / 智谱 | 服务商设了 CORS | 不需要 |
| Anthropic Claude | `anthropic-dangerous-direct-browser-access` 例外 | 不需要 |
| OpenRouter / aipaibox | 这些**本身**就是反代,自带 CORS | 不需要 |

### 一键部署(5 分钟)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zhongrenfei1-hub/cashlens-hk-audit/tree/main/cloudflare-worker)

或者按 [`cloudflare-worker/README.md`](./cloudflare-worker/README.md) 图文指南手动部署(纯网页操作,不装 CLI)。

### 部署后用法

Cashlens 设置:
- **服务商**:自定义 OpenAI 兼容
- **Base URL**:`https://your-worker-name.<your-subdomain>.workers.dev`(你的 worker URL)
- **API Key**:你的真实 key(worker 透传不存)
- **模型**:自定义 → 填后端支持的 model ID

完事,以后客户用永远 work。

## 🐞 常见问题

### Q: 测试连接失败,提示 "Invalid API Key"
检查 Key 是否完整(应以 `sk-ant-api03-` 开头)。在 https://console.anthropic.com/settings/keys 重新生成。

### Q: CORS 错误 / Failed to fetch / Mixed Content
浏览器禁止 HTTPS 页面调 HTTP API(Mixed Content)和无 CORS 后端(CORS)。
- **Anthropic Claude**:`anthropic-dangerous-direct-browser-access: true` 例外,直连 OK
- **DeepSeek / 通义千问 / 豆包 / Kimi / 智谱 / OpenRouter / aipaibox**:服务商设了 CORS,直连 OK
- **OpenAI / Gemini / 私有 server**:必须部署反代 worker,见上方 [🔌 部署反代 Worker](#-部署反代-worker可选--解决-cors--mixed-content)

### Q: PDF 太大上传失败
单文件限 32 MB,总请求建议 < 100 MB。超大 PDF 请先用 PDF 工具拆分。

### Q: 想用别的模型
设置 → 模型 → 选 **自定义** → 粘贴模型 ID(如 `claude-opus-4-7-20260301`)。

### Q: 报告太长,模型在中途截断
设置中调高 **最大输出 Tokens**(默认 16384,可调到 64000)。

### Q: 想改分类规则
设置 → 高级:系统提示词 v8.0 → 直接编辑,保存后下次分析自动应用。改完不满意可点"还原默认"。

## 📐 技术栈

- **前端**: 单文件 HTML + Tailwind CSS(CDN)+ vanilla JS(无打包工具)
- **API**: Anthropic Messages API + streaming(SSE)+ prompt caching
- **存储**: localStorage(API Key + 最近 30 个项目)
- **依赖**: 仅 `tailwindcss` CDN(可改本地打包)

## 📄 许可

私有,仅供 Cashlens 部署使用。Cashlens 仅做银行流水「统计流水」,不涉及做账/审计/税项;具体做账审计由下游"做账审计板块"另行处理。

## 🔗 相关

- 提示词:见 `index.html` 内 `SYSTEM_PROMPT_V4` 常量(v8.0「统计流水」专家定位,prompt 已内嵌)
- Excel 模版:`../02_模版/统计流水模版.xlsx`
- 历史:旧 v4.0 docx 在 `../01_提示词/`(已被 v8.0 替代,仅作为历史参考)
