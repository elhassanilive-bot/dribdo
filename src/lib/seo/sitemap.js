import { site } from "@/config/site";
import { listCategorySummaries, listPostsDetailed, listTagSummaries } from "@/lib/blog/posts";

export const staticPages = [
  "/",
  "/about",
  "/blog",
  "/forum",
  "/features",
  "/download",
  "/faq",
  "/help-center",
  "/contact",
  "/privacy",
  "/terms",
  "/security",
  "/deletion",
  "/dmca",
  "/complaints",
  "/report-issue",
  "/agreements",
  "/service-policies/charity",
  "/service-policies/jobs",
  "/service-policies/marketplace",
  "/service-policies/marriage",
  "/service-policies/notes-sheets",
  "/service-policies/real-estate",
  "/service-policies/tools",
  "/service-policies/verification",
];

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeDate(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function getSitemapDatasets() {
  const [{ posts }, categories, tags] = await Promise.all([
    listPostsDetailed({ limit: 1200 }),
    listCategorySummaries({ limit: 60 }),
    listTagSummaries({ limit: 120 }),
  ]);

  return {
    staticEntries: staticPages.map((path, index) => ({
      url: `${site.url}${path}`,
      lastModified: normalizeDate(new Date()),
      changeFrequency: path === "/" || path === "/blog" || path === "/forum" ? "daily" : "weekly",
      priority: index === 0 ? 1 : path === "/blog" || path === "/forum" ? 0.9 : 0.75,
    })),
    postEntries: (posts || []).map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: normalizeDate(post.updatedAt || post.publishedAt || post.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    categoryEntries: (categories || []).map((category) => ({
      url: `${site.url}/blog/category/${category.slug}`,
      lastModified: normalizeDate(new Date()),
      changeFrequency: "weekly",
      priority: 0.65,
    })),
    tagEntries: (tags || []).map((tag) => ({
      url: `${site.url}/blog/tag/${tag.slug}`,
      lastModified: normalizeDate(new Date()),
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  };
}

export function buildUrlSet(entries) {
  const body = entries
    .map(
      (entry) => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${escapeXml(entry.lastModified)}</lastmod>
    <changefreq>${escapeXml(entry.changeFrequency)}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>`;
}

export function buildSitemapIndex(entries) {
  const body = entries
    .map(
      (entry) => `
  <sitemap>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${escapeXml(entry.lastModified)}</lastmod>
  </sitemap>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</sitemapindex>`;
}

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
