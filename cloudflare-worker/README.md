# Cashlens · DeepSeek 反代 Worker

把真 DeepSeek API key 放到 Cloudflare Worker 后端,前端浏览器看不到 key,挡 GitHub Secret Scanning + 防客户右键看源码偷 key。

```
浏览器(GitHub Pages) ──→ Cloudflare Worker ──→ DeepSeek
                          ↑
                     key 在这里(Secret 环境变量)
```

---

## 部署(首次,15-20 分钟)

> 假设你**没用过 Cloudflare**,纯网页操作,不装任何 CLI。

### 第 1 步 · 注册 Cloudflare 账号(5 分钟)

如已有账号跳过。

1. 打开 https://dash.cloudflare.com/sign-up
2. 邮箱 + 密码注册,验证邮箱
3. 登录到 Dashboard

### 第 2 步 · 创建 Worker(3 分钟)

1. 左侧菜单点 **Workers & Pages** → **Create**(蓝按钮) → **Create Worker**
2. **Worker name** 填 `cashlens-deepseek-proxy`(或你喜欢的名字 — 但记下来,之后是 URL 一部分)
3. 点 **Deploy** — 它会先部署一个 hello-world 占位 Worker
4. 部署完看到 "Success!" 页面,**记下你的 Worker URL**,形如:
   ```
   https://cashlens-deepseek-proxy.<your-subdomain>.workers.dev
   ```
   `<your-subdomain>` 是你账号的子域,Cloudflare 自动分配,以后所有 Worker 都在这个子域下。

### 第 3 步 · 替换成 Cashlens 的代码(2 分钟)

1. 还在刚才的 Worker 详情页 → 右上角 **Edit code**(铅笔图标 / Quick Edit)
2. 进编辑器后:
   - 左侧文件树点 `worker.js`(或 `index.js`,看版本)
   - 右边大编辑区**全选删除**默认代码
   - 把本目录下 `worker.js` 的内容**整个粘贴**进去
3. 右上角 **Deploy** — 等几秒看到 "Deploy successful"

### 第 4 步 · 配置 DeepSeek key(关键,3 分钟)

> ⚠️ 这一步先**回到 DeepSeek 控制台**,把之前给我的那个 key 撤掉,**重新生成一个全新 key**(叫它 keyB),只用在这里。

1. https://platform.deepseek.com/api_keys → 撤掉旧 key → **Create new API key** → 命名 `cashlens-worker` → 复制(Cloudflare 那一步要用)
2. 回到 Cloudflare Worker 详情页 → **Settings** tab → **Variables and Secrets** 区
3. 点 **Add variable**:
   - **Variable name**: `DEEPSEEK_API_KEY`(必须**完全一样**,包括大小写)
   - **Type**: 选 **Secret**(不是 Plaintext)— 这样 Worker 启动后这个值不能再读出来,只能覆盖
   - **Value**: 粘贴 keyB
4. 点 **Save and deploy** — 等几秒重新部署

### 第 5 步 · 测试 Worker 工作(1 分钟)

新开一个浏览器 tab,访问:

```
https://cashlens-deepseek-proxy.<your-subdomain>.workers.dev/
```

看到类似的 JSON 即正常:

```json
{
  "ok": true,
  "name": "cashlens-deepseek-proxy",
  "upstream": "https://api.deepseek.com",
  "keyConfigured": true,   ← 必须是 true,false 说明 key 没配上
  "ts": "2026-..."
}
```

如果 `keyConfigured: false`,回去重做第 4 步,确认变量名是 `DEEPSEEK_API_KEY`。

### 第 6 步 · 把 Worker URL 发给 Claude

把你的 Worker URL(形如 `https://cashlens-deepseek-proxy.xxx.workers.dev`)发给 Claude,我把 Cashlens 前端 baseUrl 切到这个地址,完成 C 方案接管。

---

## 后续维护

### 想换 key

1. DeepSeek 控制台撤旧 key + 生成新 key
2. Cloudflare Worker → Settings → Variables and Secrets → 找到 `DEEPSEEK_API_KEY` → **Edit** → 粘贴新 key → Save
3. 不需要改前端,前端不知道 key 是什么

### 想限制额度防盗刷

Worker 默认免费 100,000 req/天 — 如果担心被刷:

1. Worker → Settings → **Triggers** → 加 Cloudflare 自带的 Rate Limiting Rules(免费版 1 条规则,够用)
2. 规则示例:每个 IP 每分钟最多 30 次

### 想看用量 / 错误日志

Worker → 顶部 tabs 中的 **Logs**(实时日志) / **Metrics**(每天统计)

---

## 安全清单

- [x] DeepSeek 真 key 仅作为 Worker Secret 存在,前端代码看不到、network 抓包看不到
- [x] CORS Origin 白名单只允许 GitHub Pages 站点 + 本地开发域名
- [x] 流式响应原样透传,SSE 不被中间层缓存
- [x] 健康检查端点 `/` 不暴露 key 内容,只显示 `keyConfigured: true/false`

---

## 进阶 · wrangler CLI 部署(可选)

如果你以后用得多,装个 `wrangler` 更方便:

```bash
npm install -g wrangler
wrangler login          # 浏览器 OAuth 登录 Cloudflare
cd cloudflare-worker/
wrangler deploy         # 一行部署
wrangler secret put DEEPSEEK_API_KEY   # 输入 key,回车
wrangler tail           # 实时日志
```

`wrangler.toml` 已经写好,直接用。
