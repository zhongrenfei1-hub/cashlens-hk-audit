/**
 * Cashlens · 通用 OpenAI 兼容反代 Worker
 *
 * 用途:把任何 OpenAI 兼容后端反代到 HTTPS + CORS-enabled 入口,
 * 解决浏览器 Mixed Content(HTTPS 调 HTTP) / CORS 拦截问题。
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║ 架构(2 种模式)                                                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║ 模式 A · 透传(默认 · 推荐 SME 用)                              ║
 * ║   浏览器(HTTPS) → Worker(HTTPS·CORS) → UPSTREAM(任意)        ║
 * ║   key 由客户端 Authorization header 提供;worker 透传不存。       ║
 * ║                                                                  ║
 * ║ 模式 B · 隐藏 key(适合公开部署 + 防客户偷 key)                  ║
 * ║   设置 env.UPSTREAM_KEY 后,worker 自动注入 Bearer,前端不再带。  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 配置(Worker secrets / vars):
 *   UPSTREAM         必填  目标后端 base URL(如 http://69.5.20.196:8080 或 https://api.openai.com/v1)
 *   ALLOWED_ORIGINS  选填  Origin 白名单(逗号分隔);不设 = 允许任意 Origin
 *   UPSTREAM_KEY     选填  设置即启用模式 B,前端不再需要填 key
 *   DEBUG            选填  '1' 时返回详细错误便于排查
 *
 * Cashlens 端用法:
 *   Settings → Provider 选「自定义 OpenAI 兼容」
 *   Base URL 填: https://your-worker.workers.dev (worker URL)
 *   API Key 填: 你的真实 API key(模式 A);或空(模式 B,key 在 worker 端)
 *   Model 填: 后端支持的 model ID(下拉选「自定义」手填,如 gpt-5.5 / qwen-max 等)
 */

const DEFAULT_TIMEOUT_MS = 300000; // 5 min(支持 stream + 长 thinking)

function buildAllowedOrigins(env) {
  if (!env.ALLOWED_ORIGINS) return null; // null = 允许任意 Origin
  return new Set(
    env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  );
}

function corsHeaders(origin, allowed) {
  let allowOrigin;
  if (allowed === null) {
    // 允许任意:回填具体 Origin(支持 credentials 时不能用 *)
    allowOrigin = origin || '*';
  } else if (allowed.has(origin)) {
    allowOrigin = origin;
  } else {
    allowOrigin = '';
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, anthropic-version, anthropic-dangerous-direct-browser-access, x-api-key, openai-organization, openai-beta',
    'Access-Control-Expose-Headers': 'Content-Type, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResp(payload, status, origin, allowed) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin, allowed),
    },
  });
}

function jsonError(status, message, origin, allowed) {
  return jsonResp({ error: { message, type: 'proxy_error' } }, status, origin, allowed);
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

    // 健康检查 / 根路径
    if (url.pathname === '/' || url.pathname === '/healthz') {
      return jsonResp({
        ok: true,
        name: 'cashlens-universal-proxy',
        upstream: env.UPSTREAM || '⚠️ NOT SET — 在 Cloudflare → Worker → Settings → Variables 配置 UPSTREAM',
        mode: env.UPSTREAM_KEY ? 'B · hidden-key(worker 注入)' : 'A · passthrough(client 自己带)',
        allowedOrigins: allowed === null ? '* (any)' : [...allowed],
        ts: new Date().toISOString(),
      }, 200, origin, allowed);
    }

    // Origin 白名单(仅当配置了 ALLOWED_ORIGINS)
    if (allowed !== null && origin && !allowed.has(origin)) {
      return jsonError(403, `Origin ${origin} not in ALLOWED_ORIGINS whitelist`, origin, allowed);
    }

    // UPSTREAM 必须配置
    if (!env.UPSTREAM) {
      return jsonError(500,
        'Worker 未配置 UPSTREAM 环境变量。' +
        '请到 Cloudflare Dashboard → Worker → Settings → Variables → Add variable,' +
        '名称 UPSTREAM,值填你的后端 URL(如 http://69.5.20.196:8080)。',
        origin, allowed);
    }

    // 拼目标 URL
    const upstreamBase = env.UPSTREAM.replace(/\/+$/, '');
    const upstreamUrl = `${upstreamBase}${url.pathname}${url.search}`;

    // 构造转发 headers
    const fwdHeaders = new Headers();
    for (const [k, v] of request.headers.entries()) {
      const key = k.toLowerCase();
      // 不转发:Cloudflare 元 header / host / origin / cookie
      if (['origin', 'host', 'cookie',
           'cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor',
           'x-forwarded-for', 'x-forwarded-proto', 'x-real-ip'].includes(key)) continue;
      // 模式 B:worker 自己注入 key,丢弃客户端 Authorization
      if (env.UPSTREAM_KEY && key === 'authorization') continue;
      fwdHeaders.set(k, v);
    }
    if (env.UPSTREAM_KEY) {
      fwdHeaders.set('Authorization', `Bearer ${env.UPSTREAM_KEY}`);
    }
    if (!fwdHeaders.has('Content-Type') && request.method !== 'GET') {
      fwdHeaders.set('Content-Type', 'application/json');
    }

    // 转发(支持 SSE 流式响应)
    let upstream;
    try {
      upstream = await fetch(upstreamUrl, {
        method: request.method,
        headers: fwdHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
    } catch (err) {
      const msg = env.DEBUG === '1' ? err.message : '检查 UPSTREAM 是否可达(Worker 日志看详情)';
      return jsonError(502, `Upstream fetch failed: ${msg}`, origin, allowed);
    }

    // 透传响应(SSE / JSON / 任何 content-type),只覆盖 CORS 头
    const respHeaders = new Headers(upstream.headers);
    const cors = corsHeaders(origin, allowed);
    for (const [k, v] of Object.entries(cors)) respHeaders.set(k, v);
    // 防 Cloudflare 中间层缓存 SSE 流
    respHeaders.set('Cache-Control', 'no-store');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  },
};
