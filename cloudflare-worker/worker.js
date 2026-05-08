/**
 * Cashlens · DeepSeek 反代 Worker
 *
 * 架构:
 *   浏览器(GitHub Pages) ──→ 这个 Worker ──→ DeepSeek API
 *                            ↑
 *                            真 key 只在这里(配置成 Worker secret 环境变量)
 *
 * 安全:
 *   - 真 key 不出 Worker,前端代码里看不到、network 抓包也看不到
 *   - Origin 白名单:只接受 https://zhongrenfei1-hub.github.io 和本地开发地址
 *   - 请求转发后流式响应原样透传(支持 SSE)
 *
 * 部署:
 *   见同目录 README.md
 *
 * 配置环境变量(secret):
 *   DEEPSEEK_API_KEY  必填  你的 DeepSeek API key(sk-...)
 *   ALLOWED_ORIGINS   选填  逗号分隔的额外 Origin 白名单(默认仅 GitHub Pages 站点)
 *   DEBUG             选填  '1' 时返回详细错误用于排查
 */

const UPSTREAM = 'https://api.deepseek.com';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://zhongrenfei1-hub.github.io',
  'http://localhost:8101',
  'http://127.0.0.1:8101',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

function buildAllowedOrigins(env) {
  const extra = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra]);
}

function corsHeaders(origin, allowed) {
  const allowOrigin = allowed.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, anthropic-version, anthropic-dangerous-direct-browser-access',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonError(status, message, origin, allowed) {
  return new Response(JSON.stringify({ error: { message, type: 'proxy_error' } }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin, allowed),
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = buildAllowedOrigins(env);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
    }

    // 健康检查 / 浏览器直访的根路径
    if (url.pathname === '/' || url.pathname === '/healthz') {
      return new Response(JSON.stringify({
        ok: true,
        name: 'cashlens-deepseek-proxy',
        upstream: UPSTREAM,
        keyConfigured: Boolean(env.DEEPSEEK_API_KEY),
        ts: new Date().toISOString(),
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders(origin, allowed),
        },
      });
    }

    // Origin 校验(允许无 Origin 的 server-side 请求,例如 curl 测试)
    if (origin && !allowed.has(origin)) {
      return jsonError(403, `Origin ${origin} not allowed`, origin, allowed);
    }

    // key 必须配置
    if (!env.DEEPSEEK_API_KEY) {
      return jsonError(500, 'Worker 未配置 DEEPSEEK_API_KEY 环境变量', origin, allowed);
    }

    // 转发到 DeepSeek
    const upstreamUrl = `${UPSTREAM}${url.pathname}${url.search}`;
    const fwdHeaders = new Headers();
    // 把客户端原始 Content-Type / Accept 等转发,但不要带 Origin/Host/Cookie
    for (const [k, v] of request.headers.entries()) {
      const key = k.toLowerCase();
      if (['origin', 'host', 'cookie', 'authorization', 'cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor', 'x-forwarded-for', 'x-forwarded-proto', 'x-real-ip'].includes(key)) continue;
      fwdHeaders.set(k, v);
    }
    fwdHeaders.set('Authorization', `Bearer ${env.DEEPSEEK_API_KEY}`);
    if (!fwdHeaders.has('Content-Type') && request.method !== 'GET') {
      fwdHeaders.set('Content-Type', 'application/json');
    }

    let upstream;
    try {
      upstream = await fetch(upstreamUrl, {
        method: request.method,
        headers: fwdHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      });
    } catch (err) {
      return jsonError(502, `Upstream fetch failed: ${env.DEBUG === '1' ? err.message : 'see worker logs'}`, origin, allowed);
    }

    // 透传响应(包括 SSE 流);只覆盖 CORS 相关 header
    const respHeaders = new Headers(upstream.headers);
    const cors = corsHeaders(origin, allowed);
    for (const [k, v] of Object.entries(cors)) respHeaders.set(k, v);
    // 防 Cloudflare 中间层缓存流式响应
    respHeaders.set('Cache-Control', 'no-store');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  },
};
