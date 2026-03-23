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
        ],
      },
    ],
    host: site.url,
    sitemap: `${site.url}/sitemap.xml`,
  };
}
