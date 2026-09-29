import { defineConfig } from 'astro/config';
import { SITE } from './src/site.config.mjs';

export default defineConfig({
  // 站点正式地址。换域名时只改 src/site.config.mjs 里的这一处。
  site: SITE.url,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
