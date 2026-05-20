#!/usr/bin/env node
/**
 * Cashlens 健康检查脚本 · 一键验证 prompt + Gemini API + 准确率底线
 *
 * 用法:
 *   GEMINI_KEY=AIza... node scripts/verify.mjs
 *
 * 默认测试样本:testdata/yedao_test.pdf(本地 Citibank 月结单 · gitignored)
 * 期望:HKD 847,515.72 / 6 笔有效 / 自检表 ✓ / 跨境收款平台 ✓ / finishReason=STOP
 *
 * 自定义测试样本 + 期望值:
 *   GEMINI_KEY=...  TEST_PDF=path/to/my.pdf  TEST_EXPECT_HKD=123456.78  TEST_EXPECT_TXNS=5  node scripts/verify.mjs
 *
 * 退出码 0=PASS 1=FAIL · 适合 CI / Vercel build hook / 手动 smoke test
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KEY = process.env.GEMINI_KEY;
const PDF_PATH = process.env.TEST_PDF || path.join(ROOT, 'testdata', 'yedao_test.pdf');
const EXPECT_HKD = parseFloat(process.env.TEST_EXPECT_HKD || '847515.72');
const EXPECT_TXNS = parseInt(process.env.TEST_EXPECT_TXNS || '6');
const EXPECT_TOLERANCE = parseFloat(process.env.TEST_TOLERANCE || '1.01');

console.log('🔬 Cashlens 健康检查\n');

if (!KEY) {
  console.error('❌ 缺 GEMINI_KEY 环境变量');
  console.error('   用法: GEMINI_KEY=AIza... node scripts/verify.mjs');
  process.exit(2);
}
if (!fs.existsSync(PDF_PATH)) {
  console.error(`❌ PDF 不存在: ${PDF_PATH}`);
  console.error('   默认查 testdata/yedao_test.pdf · 或 TEST_PDF=path/to/file.pdf 指定');
  process.exit(2);
}

// 从 index.html 直接抽 SYSTEM_PROMPT_V4(免依赖 testdata/SYSTEM_PROMPT.txt 同步)
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const promptMatch = indexHtml.match(/const SYSTEM_PROMPT_V4 = `([\s\S]*?)`;/);
if (!promptMatch) {
  console.error('❌ 未在 index.html 找到 SYSTEM_PROMPT_V4');
  process.exit(2);
}
const prompt = promptMatch[1];
console.log(`📐 prompt: ${prompt.length} 字符 · 测试 PDF: ${path.basename(PDF_PATH)} · 期望 HKD ${EXPECT_HKD.toLocaleString()}\n`);

const b64 = fs.readFileSync(PDF_PATH).toString('base64');
const body = {
  contents: [{ role: 'user', parts: [
    { text: '请按 system prompt 处理这份文件 · 输出报告。' },
    { inlineData: { mimeType: 'application/pdf', data: b64 } },
  ]}],
  systemInstruction: { parts: [{ text: prompt }] },
  generationConfig: { maxOutputTokens: 65536, thinkingConfig: { thinkingBudget: 24576 }, temperature: 0 },
};

const t0 = Date.now();
const r = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse',
  { method: 'POST', headers: { 'X-goog-api-key': KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) }
);

if (!r.ok) {
  console.error('❌ FAIL: HTTP', r.status);
  console.error(await r.text());
  process.exit(1);
}

let buf = '', full = '', usage = {}, finishReason = null;
const dec = new TextDecoder();
const reader = r.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += dec.decode(value, { stream: true });
  buf = buf.replace(/\r\n/g, '\n');
  let sep;
  while ((sep = buf.indexOf('\n\n')) !== -1) {
    const ev = buf.slice(0, sep);
    buf = buf.slice(sep + 2);
    let d = '';
    for (const l of ev.split('\n')) if (l.startsWith('data:')) d = (d ? d + '\n' : '') + l.slice(5).trim();
    if (!d) continue;
    try {
      const o = JSON.parse(d);
      const ps = o.candidates?.[0]?.content?.parts;
      if (ps) for (const p of ps) if (p.text) full += p.text;
      if (o.candidates?.[0]?.finishReason) finishReason = o.candidates[0].finishReason;
      if (o.usageMetadata) usage = o.usageMetadata;
    } catch {}
  }
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
const outPath = path.join(ROOT, 'testdata', 'verify_out.md');
try { fs.writeFileSync(outPath, full); } catch {}

// 校验
const hkdMatch = full.match(/有效净进账总额\s*\(HKD\)\s*\|\s*\*{0,2}([\d,\.]+)/) ||
                 full.match(/实际(?:业务)?收入[^0-9]*([\d,\.]+)/);
const hkd = hkdMatch ? parseFloat(hkdMatch[1].replace(/,/g, '')) : null;
const txnsMatch = full.match(/总交易笔数\s*\/\s*有效进账\s*\/\s*已排除\s*\|\s*(\d+)\s*\/\s*(\d+)/);
const validTxns = txnsMatch ? parseInt(txnsMatch[2]) : null;
const hasSelfcheck = full.includes('加总自检');
const hasMaterialEval = full.includes('材料评估');
const hasCrossPlatform = full.includes('WORLD FIRST') || full.includes('WorldFirst') || full.includes('跨境收款');

const checks = [
  { name: 'finishReason=STOP        ', pass: finishReason === 'STOP', actual: finishReason || '(无)' },
  { name: `HKD ≈ ${EXPECT_HKD.toLocaleString()} ±${EXPECT_TOLERANCE}`, pass: hkd !== null && Math.abs(hkd - EXPECT_HKD) < EXPECT_TOLERANCE, actual: hkd?.toLocaleString() ?? '(未抽到)' },
  { name: `有效笔数 = ${EXPECT_TXNS}              `, pass: validTxns === EXPECT_TXNS, actual: validTxns ?? '?' },
  { name: '报告顶部含「材料评估」段', pass: hasMaterialEval, actual: hasMaterialEval ? '✓' : '✗' },
  { name: '报告末尾含「加总自检表」', pass: hasSelfcheck, actual: hasSelfcheck ? '✓' : '✗' },
  { name: '识别跨境收款平台         ', pass: hasCrossPlatform, actual: hasCrossPlatform ? '✓' : '✗' },
];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`⏱  ${elapsed}s · 输出 ${full.length} 字符`);
console.log(`📊 tokens · prompt: ${usage.promptTokenCount} · output: ${usage.candidatesTokenCount} · thinking: ${usage.thoughtsTokenCount}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
let allPass = true;
for (const c of checks) {
  console.log(`  ${c.pass ? '✅' : '❌'}  ${c.name}  · 实际: ${c.actual}`);
  if (!c.pass) allPass = false;
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(allPass ? '\n🟢 整体: PASS' : `\n🔴 整体: FAIL · 看 ${outPath} 找原因`);
process.exit(allPass ? 0 : 1);
