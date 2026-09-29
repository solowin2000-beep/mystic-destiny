import { SITE } from '../site.config.mjs';

/*
 * 静态构建时生成 /robots.txt。
 * GEO 关键点：AI 问答引擎的爬虫必须被显式放行 —— 它们进不来，你在 ChatGPT / Perplexity /
 * Copilot 的答案里就等于不存在。下面这些是 2026 年主流的 AI 抓取方。
 */
const AI_CRAWLERS = [
  'GPTBot',            // OpenAI：训练与检索
  'OAI-SearchBot',     // OpenAI：ChatGPT 搜索索引
  'ChatGPT-User',      // 用户在 ChatGPT 里打开你的页面
  'ClaudeBot',         // Anthropic
  'Claude-User',       // 用户在 Claude 里打开你的页面
  'PerplexityBot',     // Perplexity
  'Perplexity-User',
  'Google-Extended',   // Google Gemini / AI 概览
  'Applebot',          // Apple
  'Applebot-Extended', // Apple Intelligence
  'Bingbot',           // Bing / Copilot
  'DuckAssistBot',     // DuckDuckGo AI
  'Amazonbot',
  'meta-externalagent',
  'CCBot',             // Common Crawl：很多开源模型的语料来源
];

export const GET = () => {
  const lines = ['User-agent: *', 'Allow: /', ''];
  for (const bot of AI_CRAWLERS) {
    lines.push('User-agent: ' + bot);
    lines.push('Allow: /');
    lines.push('');
  }
  lines.push('Sitemap: ' + new URL('/sitemap.xml', SITE.url).href);
  lines.push('');
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
