# Cashlens · 通用 OpenAI 兼容反代 Worker

> ⚠️ **v9.2 现状(2026-05-19):** 这个 Worker 是 v8.x 时代的 **OpenAI 兼容**反代 · Cashlens 自 v9.0 起锁定 **Gemini 原生 API**(`generativelanguage.googleapis.com`),已**不再使用此 Worker**。
>
> 如果要做大陆免 VPN 方案,需把 `worker.js` 重写为 **Gemini 反代**:
> - upstream 改 `generativelanguage.googleapis.com/v1beta`
> - auth header 改 `X-goog-api-key`(不是 `Authorization: Bearer`)
> - 路径透传 `/models/{model}:streamGenerateContent?alt=sse`
> - SSE 行尾仍是 `\r\n\r\n`(透传时不要 normalize)
>
> 文件保留作历史 + 未来重写参考。

---

把**任何** OpenAI 兼容后端(HTTP / HTTPS / 私有 IP / 无 CORS / 大陆访问外网)反代到 HTTPS + CORS 入口,解决浏览器拦截。

```
浏览器(HTTPS · Cashlens)
   ↓
Cloudflare Worker(HTTPS · 自动加 CORS · 你部署)
   ↓
UPSTREAM(任意 — 你的私有 server / OpenAI / 中转站)
```

---

## 适用场景

- 🔴 你有私有 server(如 `http://69.5.20.196:8080`)但 Cashlens 调不通(**Mixed Content**)
- 🔴 你想用 OpenAI / Google Gemini 直连但浏览器拒(**CORS**)
- 🔴 你的中转站不支持 CORS,Cashlens 报 `Failed to fetch`
- 🟡 你想隐藏 API key 不让客户右键看源码偷(开启模式 B)

---

## 部署 · 5 分钟一次性(纯网页操作,不装 CLI)

### 第 1 步 · 注册 Cloudflare 账号(若没有 · 2 分钟)

[https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) → 邮箱 + 密码 → 验证邮箱。

### 第 2 步 · 创建 Worker(1 分钟)

1. 登录 Dashboard → 左侧 **Workers & Pages** → **Create**(蓝按钮)→ **Create Worker**
2. **Worker name** 填 `cashlens-proxy`(随意,但记住,会变成 URL 一部分)
3. 点 **Deploy** — 部署一个 hello-world 占位
4. 看到 "Success" 后,**记下 Worker URL**:
   ```
   https://cashlens-proxy.<your-subdomain>.workers.dev
   ```

### 第 3 步 · 粘贴反代代码(1 分钟)

1. Worker 详情页 → 右上 **Edit code**
2. 进编辑器 → 左侧文件 `worker.js`(或 `index.js`)→ 右侧编辑区**全选删除**默认代码
3. 把本目录 [`worker.js`](./worker.js) 的内容**整个粘贴**进去
4. 右上 **Deploy** → 看到 "Deploy successful"

### 第 4 步 · 配置 UPSTREAM(关键 · 1 分钟)

1. Worker 详情页 → **Settings** tab → **Variables and Secrets** 区
2. 点 **Add variable**:
   - **Name**: `UPSTREAM`(必须全大写)
   - **Type**: `Plaintext`(普通变量 — 后端 URL 不是机密,公开也无所谓)
   - **Value**: 你的后端 base URL,例:
     - 私有 server:`http://69.5.20.196:8080`
     - OpenAI:`https://api.openai.com/v1`
     - Gemini OpenAI 兼容:`https://generativelanguage.googleapis.com/v1beta/openai`
     - DeepSeek:`https://api.deepseek.com`
3. 点 **Save and deploy**

### 第 5 步 · 验证 Worker(30 秒)

新开浏览器 tab,访问:

```
https://cashlens-proxy.<your-subdomain>.workers.dev/
```

应该看到类似:

```json
{
  "ok": true,
  "name": "cashlens-universal-proxy",
  "upstream": "http://69.5.20.196:8080",
  "mode": "A · passthrough(client 自己带)",
  "allowedOrigins": "* (any)",
  "ts": "2026-05-..."
}
```

`upstream` 是你填的值就 ✅。

### 第 6 步 · 在 Cashlens 用(1 分钟)

打开 [Cashlens](https://zhongrenfei1-hub.github.io/cashlens-hk-audit/) → 右上角 **设置**:

| 字段 | 填什么 |
|---|---|
| **服务商** | 自定义 OpenAI 兼容 |
| **Base URL** | `https://cashlens-proxy.<your-subdomain>.workers.dev`(你的 worker URL) |
| **API Key** | 你的真实 API key(直接粘 · worker 透传不存) |
| **模型** | 下拉选「自定义」→ 填后端支持的 model ID(如 `gpt-5.5` / `qwen-max` / 等) |

点「测试连接」→ 看到 ✅。完事,以后客户用永远 work。

---

## 模式 B · 隐藏 key(可选 · 给公开部署用)

如果你想让客户**不需要自己填 key**(key 由你预设在 worker 端),走模式 B:

第 4 步多加 1 个 variable:
- **Name**: `UPSTREAM_KEY`
- **Type**: **Secret**(必须是 Secret · 防别人偷)
- **Value**: 你的 API key(`sk-...`)

之后:
- Cashlens 端 **Base URL** 不变(填 worker URL)
- Cashlens 端 **API Key** 留空 / 填任意字符串都行(worker 会忽略,自己注入 `UPSTREAM_KEY`)
- 客户看 network 抓包,只看到 worker URL,看不到真 key

---

## 进阶配置

### 限制 Origin 白名单(防别人盗用你的 worker)

默认允许任意 Origin。如果只想给特定网站用:

加 variable:
- **Name**: `ALLOWED_ORIGINS`
- **Type**: `Plaintext`
- **Value**: `https://zhongrenfei1-hub.github.io,http://localhost:8101`(逗号分隔)

### 看错误详情(调试用)

加 variable `DEBUG` = `1` → Worker 返回详细错误。**调好后改回 `0` 或删掉**(防泄漏内部信息)。

### 看实时日志 / 用量

Worker 详情页 → 顶部 **Logs**(实时)/ **Metrics**(每天统计)。

### 防盗刷

Worker 默认免费 100,000 req/天(够 100 客户每天 1000 次)。担心被刷:

Worker → **Settings** → **Triggers** → 加 **Rate Limiting Rule**(免费版 1 条):
- 规则:每个 IP 每分钟 ≤ 30 次

---

## 进阶 · wrangler CLI 部署(熟手用)

```bash
npm install -g wrangler
wrangler login                                # OAuth 登录
cd cloudflare-worker/
wrangler deploy                               # 一行部署
wrangler secret put UPSTREAM                  # 输入后端 URL,回车
wrangler secret put UPSTREAM_KEY              # (可选)模式 B
wrangler tail                                 # 实时日志
```

`wrangler.toml` 已配好。

---

## 一键部署按钮

如果你的 Cloudflare 已登录,直接点这个按钮跳到 wizard:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zhongrenfei1-hub/cashlens-hk-audit/tree/main/cloudflare-worker)

部署后在 Worker Settings 加 `UPSTREAM` 变量即可。

---

## 常见问题

### Q1: `keyConfigured: false` / 错误说 UPSTREAM 没配

回 [第 4 步](#第-4-步--配置-upstream关键--1-分钟),确认 variable name 是 `UPSTREAM`(全大写)。

### Q2: `502 Upstream fetch failed`

`UPSTREAM` 可达性问题:
- 后端 IP 是不是真的在线?`curl -v UPSTREAM` 看看
- 后端是否要求特定 header / IP 白名单?(Worker IP 是 Cloudflare 的)
- 加 `DEBUG=1` 看具体错误

### Q3: `403 Origin not allowed`

`ALLOWED_ORIGINS` 设了但没包含 Cashlens 域名。删 `ALLOWED_ORIGINS` 变量 = 允许任意。

### Q4: 流式响应不工作 / SSE 截断

Worker 已设 `Cache-Control: no-store` 防中间层缓存。如果还截断,检查:
- 后端确实在发 SSE(`Content-Type: text/event-stream`)
- 超时(默认 5 分钟,长 thinking 可能超)

### Q5: 想反代多个不同后端

每个后端**部署一个 worker**(改 worker name + 改 UPSTREAM)。1 worker = 1 target,简单清晰。

---

## 安全清单

- [x] HTTPS 入口(Cloudflare 自动)
- [x] CORS 自动加(允许 Cashlens 跨域)
- [x] 流式 SSE 原样透传
- [x] 不缓存(防中间层窃听)
- [x] 健康检查端点 `/` 不暴露 key 内容
- [x] 可选 Origin 白名单防盗用
- [x] 可选模式 B 隐藏 key 防客户偷
- [x] 通用 — 任何 OpenAI 兼容后端都能反代

---

**部署完毕**:把你的 worker URL 填进 Cashlens 设置即可。后续维护成本 ≈ 0(Cloudflare 替你跑)。
