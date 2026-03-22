import { site } from "@/config/site";
import { listPostsDetailed } from "@/lib/blog/posts";

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { posts } = await listPostsDetailed({ limit: 200 });

  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt || post.createdAt || Date.now()).toUTCString();
      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <description>${escapeXml(post.excerpt)}</description>
          <pubDate>${pubDate}</pubDate>
        </item>
      `;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)} - Blog</title>
    <link>${site.url}/blog</link>
    <description>${escapeXml(site.description)}</description>
    <language>ar</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
