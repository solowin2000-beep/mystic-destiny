import { SITE, PAGES } from '../site.config.mjs';

// 静态构建时生成 /sitemap.xml。新增页面只要加进 site.config.mjs 的 PAGES，这里自动包含。
// lastmod 告诉 Google "这一页是新改的"，它会更快安排回访抓取（对 AI 引擎同理）。
// 想让某一页写死日期，就在 site.config.mjs 里给那一页加 lastmod: 'YYYY-MM-DD'。
const buildDate = new Date().toISOString().slice(0, 10);

export const GET = () => {
  const urls = PAGES.map((page) => {
    const lastmod = page.lastmod || buildDate;
    return '  <url>\n' +
      '    <loc>' + new URL(page.path, SITE.url).href + '</loc>\n' +
      '    <lastmod>' + lastmod + '</lastmod>\n' +
      '  </url>';
  }).join('\n');

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls + '\n' +
    '</urlset>\n';

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
