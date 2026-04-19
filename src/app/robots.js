import { site } from "@/config/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/login",
          "/signup",
          "/account",
          "/forgot-password",
          "/auth/reset",
          "/dribdo-vault-7q9m2n8x5r4k1p6t3s-admin-portal",
          "/dribdo-vault-7q9m2n8x5r4k1p6t3s-admin-portal/*",
          "/dribdo-vault-q8k2m9x4t1p7z6c3r5-support-inbox-portal",
          "/dribdo-vault-q8k2m9x4t1p7z6c3r5-support-inbox-portal/*",
        ],
      },
    ],
    host: site.url,
    sitemap: `${site.url}/sitemap.xml`,
  };
}
