import { site } from "@/config/site";
import { listIndexableCharityItems } from "@/lib/charity/items";
import { buildUrlSet, xmlResponse } from "@/lib/seo/sitemap";

function normalizeDate(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET() {
  const entries = await listIndexableCharityItems({ limit: 5000 });

  const urls = entries.map((entry) => ({
    url: `${site.url}/charity/${entry.id}`,
    lastModified: normalizeDate(entry.lastModified),
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return xmlResponse(buildUrlSet(urls));
}