import { site } from "@/config/site";
import { listIndexableJobProfiles } from "@/lib/jobs/profiles";
import { buildUrlSet, xmlResponse } from "@/lib/seo/sitemap";

function normalizeDate(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET() {
  const entries = await listIndexableJobProfiles({ limit: 5000 });

  const urls = entries.map((entry) => ({
    url: `${site.url}/job/${entry.id}`,
    lastModified: normalizeDate(entry.lastModified),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return xmlResponse(buildUrlSet(urls));
}