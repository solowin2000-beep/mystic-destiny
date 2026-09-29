/*
 * 全站唯一配置中心。
 * 站点名、域名、每页的 TDK（标题 / 描述 / 主关键词）都在这里改，改完全站生效。
 * title 控制在 60 字符以内、description 控制在 155 字符以内，这是 Google 的显示上限。
 */

export const SITE = {
  url: 'https://mystic-destiny.pages.dev',
  name: 'Mystic Destiny',
  tagline: 'Four Pillars charts, corrected to true solar time',

  // GEO：页面与结构化数据里的发布/更新日期。以后改了内容，把 updated 改成当天。
  published: '2026-09-28',
  updated: '2026-09-29',
  // WhatsApp 号码只填数字与国际区号，不要有 + 和空格，例如 8613515054915。
  email: 'luhua0213@hotmail.com',
  whatsapp: '8613515054915',

  verification: {
    google: '2AyL_UnLnHfOFQTyTsuwMSUsq5aD1JfIelroMhRNBCw',
    bing: '',
  },

  // IndexNow（Bing / Yandex 即时收录）。public/indexnow-key.txt 的内容必须与这个值完全一致。
  indexNowKey: 'b7d2e4f6a1c38e5092f7ab4d6c1e83a5',

  // Cloudflare Web Analytics（免费、不放 cookie、不需要隐私弹窗）。留空则不下发统计脚本。
  // 在 Cloudflare 后台 → Web Analytics 为 mystic-destiny 建一个站点，把给到的 token 填在这里。
  cloudflareAnalyticsToken: '53302768a9684bf5bb0b7ee7957fa4eb',
};

export const PAGES = [
  {
    path: '/',
    title: 'BaZi Calculator with True Solar Time',
    description:
      'Free BaZi calculator: your four pillars on true solar time, corrected for historical timezones, daylight saving, longitude and the equation of time.',
    keyword: 'bazi calculator',
    ogType: 'website',
  },
  {
    path: '/bazi-calculator/',
    title: 'Four Pillars of Destiny Calculator (BaZi)',
    description:
      'Enter your birth city, date and clock time to get your four pillars on true solar time, with the whole correction chain shown step by step.',
    keyword: 'four pillars of destiny calculator',
    ogType: 'website',
  },
  {
    path: '/true-solar-time/',
    title: 'True Solar Time in BaZi Charts',
    description:
      'Why your birth clock is not your BaZi birth time: longitude, the equation of time and daylight saving can each move your hour pillar.',
    keyword: 'true solar time bazi',
    ogType: 'article',
  },
  {
    path: '/bazi-hour-pillar/',
    title: 'BaZi Hour Pillar and Birth Time',
    description:
      'How the BaZi hour pillar is decided: the two-hour branches, the midnight boundary, the late zi hour debate, and how daylight saving moves it.',
    keyword: 'bazi hour pillar',
    ogType: 'article',
  },
  {
    path: '/what-is-bazi/',
    title: 'What Is BaZi? The Four Pillars Explained',
    description:
      'What BaZi is, how the four pillars are built from the heavenly stems and earthly branches, and what the day master and the five elements actually tell you.',
    keyword: 'what is bazi',
    ogType: 'article',
  },
];
