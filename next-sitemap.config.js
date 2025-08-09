/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000",
  generateRobotsTxt: true,
  sitemapSize: 7000,
};
