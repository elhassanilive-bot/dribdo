import { site } from "@/config/site";
import { buildSitemapIndex, getSitemapDatasets, xmlResponse } from "@/lib/seo/sitemap";

export async function GET() {
  const datasets = await getSitemapDatasets();
  const latestDates = [
    ...datasets.staticEntries.map((entry) => entry.lastModified),
    ...datasets.postEntries.map((entry) => entry.lastModified),
    ...datasets.categoryEntries.map((entry) => entry.lastModified),
    ...datasets.tagEntries.map((entry) => entry.lastModified),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const lastModified = latestDates[0] || new Date().toISOString();
  const xml = buildSitemapIndex([
    { url: `${site.url}/sitemaps/pages.xml`, lastModified },
    { url: `${site.url}/sitemaps/blog.xml`, lastModified },
    { url: `${site.url}/sitemaps/categories.xml`, lastModified },
    { url: `${site.url}/sitemaps/tags.xml`, lastModified },
  ]);

  return xmlResponse(xml);
}
