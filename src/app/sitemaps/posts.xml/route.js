import { site } from "@/config/site";
import { listIndexableMomentPosts } from "@/lib/moments/posts";
import { buildUrlSet, xmlResponse } from "@/lib/seo/sitemap";

function normalizeDate(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET() {
  const entries = await listIndexableMomentPosts({ limit: 5000 });

  const urls = entries.map((entry) => ({
    url: `${site.url}/post/${entry.id}`,
    lastModified: normalizeDate(entry.lastModified),
    changeFrequency: "daily",
    priority: 0.82,
  }));

  return xmlResponse(buildUrlSet(urls));
}
