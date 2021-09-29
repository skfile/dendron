/**
 * @type {import('next-sitemap').IConfig}
 */
const config = {
  siteUrl: process.env.SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
	exclude: ["/refs/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: ["/refs/"],
      },
    ],
  },
};

module.exports = config;
