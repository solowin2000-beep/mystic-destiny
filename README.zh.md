# Mystic Destiny — 命理工具站（Astro 版）

一个用 Astro 搭的静态命理工具站，核心是**真太阳时排盘引擎**。
所有内容都是静态 HTML，计算全部在浏览器里完成，没有任何外部请求，产物可以整个文件夹上传到 Cloudflare Pages。

---

## 一、这个站比别的排盘工具多做了什么

排盘难的不是六十甲子，是"用哪个时刻去排"。这个站把三件事都算对了，并且把过程摊开给用户看：

1. **历史时区与夏令时**：用浏览器内置的 IANA 时区库，中国 1986–1991 年夏令时、美国 2007 年规则变更、Arizona / Hawaii 例外都能正确处理。
2. **经度修正**：出生于时区中央经线以东/以西，每 1 度差 4 分钟。
3. **均时差**：太阳一年里快慢在 −14.2 到 +16.4 分钟之间摆动，阈值刚好能翻转时柱。

另外两处排盘常见的坑也处理了：**立春换年**、**节气换月**（精确到秒）。

**一处刻意的数据修正**：中国大陆法定统一使用北京时间（UTC+8），出生记录也是按北京时间写的；
但时区数据库里中国西部（新疆）还额外存在一个「新疆时间」（UTC+6）。如果直接照库里的城市映射，
乌鲁木齐出生的人会被静默少算两小时。所以 `cities.js` 把大陆城市统一归到 `Asia/Shanghai`；
新疆出生、但确实用新疆时间记录的人，可以在「高级设置 → 自己填经纬度」里手动选 `Asia/Urumqi`。

## 二、文件结构（只看你以后要改的）

| 路径 | 作用 |
| --- | --- |
| `src/site.config.mjs` | **全站配置**：站点名、域名、邮箱/WhatsApp、Google/Bing 验证码、每一页的标题和描述 |
| `src/pages/` | 每个页面一个文件；文件名就是网址 |
| `src/components/BaziCalculator.astro` | 排盘计算器（全部前台逻辑，含复制结果按钮） |
| `public/lib/engine.js` | **真太阳时引擎**：时区换算 + 经度修正 + 均时差 |
| `public/lib/lunar.js` | 历法库（lunar-javascript，MIT）：节气、农历、四柱 |
| `public/lib/cities.js` | 城市库（经纬度 + 时区），**按需加载**，不输入城市就不下载 |
| `tools/` | 自检脚本：`regression.cjs`（排盘回归）、`seo-check.cjs`（产物体检） |
| `prototype/` | 最初的手工原型，保留作对照，不参与构建 |
| `public/og-default.png` | 分享图（1200×630） |
| `dist/` | 构建产物（`npm run build` 之后生成，上传的就是这个文件夹） |

改文字只改 `src/pages/*.astro`，改站点信息只改 `src/site.config.mjs`。

## 三、本地预览和构建

需要 Node.js（本机已装）。在项目文件夹里执行（PowerShell 里 npm 要用 `npm.cmd`）：

    npm.cmd install      # 第一次才需要，联网安装 Astro
    npm.cmd run dev      # 本地预览，浏览器打开 http://localhost:4321
    npm.cmd run build    # 生成 dist/ 文件夹，就是要上传的东西

## 四、联系方式与验证码（已配置好）

`src/site.config.mjs` 里已经填好：

| 字段 | 值 |
| --- | --- |
| `email` | luhua0213@hotmail.com |
| `whatsapp` | 8613515054915（页脚显示 WhatsApp，排盘结果里出现"Send the chart on WhatsApp"，并**自动带上刚算出的四柱摘要**） |
| `verification.google` | 2AyL_UnLnHfOFQTyTsuwMSUsq5aD1JfIelroMhRNBCw |
| `indexNowKey` | 与 `public/indexnow-key.txt` 一致 |

**唯一还需要你填的**：`cloudflareAnalyticsToken`（现在是空字符串）。
在 Cloudflare 后台 → Web Analytics 给 mystic-destiny 建一个站点，把 token 粘进去就会自动下发统计脚本；
留空则完全不下发，不影响其它功能。

换域名的话只改 `SITE.url` 一处。

## 五、部署到 Cloudflare Pages

1. 执行 `npm.cmd run build`
2. 打开 Cloudflare → Workers & Pages → 找到 mystic-destiny 项目 → Create new deployment
3. 把 `dist` **里面的内容**上传（不是 dist 这个文件夹本身）

## 六、SEO 已经做好的部分（上线前不用动）

- 每页独立 TDK，标题控制在 60 字符内、描述 155 字符内
- canonical、`lang="en"`、Open Graph、Twitter Card、OG 分享图
- 结构化数据：WebSite、Organization、WebApplication、Article、FAQPage、BreadcrumbList
- `sitemap.xml` 和 `robots.txt` 由代码在构建时自动生成，网址取自 `site.config.mjs`
- noindex 只用在 404 页面
- 每页只有一个 H1，标题层级递进；全站移动端适配

## 七、上线后要做的三件事

1. **Google Search Console**：提交 `https://mystic-destiny.pages.dev/sitemap.xml`，再对 5 个页面逐个"请求编入索引"。
2. **Bing 站长工具**：用 Google 账号登录后可导入 Search Console 的站点，提交同一个 sitemap。
3. **Cloudflare Web Analytics**：免费、不放 cookie，不需要隐私弹窗。

## 八、测试与自检（改动算法后必跑）

项目自带两个检查脚本，都不需要联网：

    node tools/regression.cjs    # 排盘引擎回归：21 项，全绿才算过
    node tools/seo-check.cjs     # 构建产物的 SEO 体检：H1 数量、TDK 长度、canonical、结构化数据

`regression.cjs` 用公开锚点和已核对过的实例逐条断言：

    1949-10-01 → 日柱 甲子        2000-01-01 → 日柱 戊午        1988-06-01 → 日柱 丁亥
    立春换年：2000-02-04 20:00 己卯 / 21:00 庚辰（立春 20:40:24）
    真太阳时：北京 1988-06-01 12:00 → 10:48，四柱 戊辰/丁巳/丁亥/乙巳
    夏令时：上海 1990-08-01 09:00 → 07:59，时柱由丁巳变丙辰
    均时差极值：约 −14.2 分（2 月）／+16.4 分（11 月）
    晚子时：真太阳时 23:30 时，两种流派日柱 丁亥 / 戊子

改动 `public/lib/engine.js`、`public/lib/cities.js` 或更换历法库之后，务必重跑。
