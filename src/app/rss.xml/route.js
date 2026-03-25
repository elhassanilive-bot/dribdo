import { absoluteUrl, site } from "@/config/site";
import { listPostsDetailed } from "@/lib/blog/posts";
import { formatCategoryLabel } from "@/lib/blog/render";

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
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

export async function GET() {
  const { posts } = await listPostsDetailed({ limit: 200 });
  const feedUrl = absoluteUrl("/rss.xml");
  const blogUrl = absoluteUrl("/blog");
  const siteImage = absoluteUrl(site.defaultOgImage);
  const sortedPosts = [...(posts || [])].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.publishedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.publishedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });

  const lastBuildDate = normalizeDate(
    sortedPosts[0]?.updatedAt || sortedPosts[0]?.publishedAt || sortedPosts[0]?.createdAt || Date.now()
  );

  const items = sortedPosts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const pubDate = normalizeDate(post.publishedAt || post.createdAt || Date.now());
      const updatedDate = normalizeDate(post.updatedAt || post.publishedAt || post.createdAt || Date.now());
      const categoryLabel = formatCategoryLabel(post.category || "") || "مقال";
      const categories = [categoryLabel, ...(post.tags || []).filter(Boolean)]
        .map((value) => `<category>${escapeXml(value)}</category>`)
        .join("");

      const descriptionParts = [
        post.excerpt ? `<p>${escapeXml(post.excerpt)}</p>` : "",
        `<p><a href="${url}">قراءة المقال كاملًا</a></p>`,
      ].filter(Boolean);

      const imageBlock = post.coverImageUrl
        ? `<enclosure url="${escapeXml(post.coverImageUrl)}" type="image/jpeg" />`
        : "";

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description><![CDATA[${descriptionParts.join("")}]]></description>
          <pubDate>${pubDate}</pubDate>
          <source url="${blogUrl}">${escapeXml(site.name)} Blog</source>
          ${categories}
          ${imageBlock}
          <dc:creator>${escapeXml(post.authorName || site.name)}</dc:creator>
          <atom:updated>${updatedDate}</atom:updated>
        </item>
      `;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(site.name)} - Blog</title>
    <link>${blogUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.description)}</description>
    <language>ar</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Next.js / Dribdo RSS</generator>
    <managingEditor>${escapeXml(site.supportEmail)} (${escapeXml(site.name)})</managingEditor>
    <webMaster>${escapeXml(site.supportEmail)} (${escapeXml(site.name)})</webMaster>
    <image>
      <url>${siteImage}</url>
      <title>${escapeXml(site.name)}</title>
      <link>${site.url}</link>
    </image>
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
