import { buildUrlSet, getSitemapDatasets, xmlResponse } from "@/lib/seo/sitemap";

export async function GET() {
  const { categoryEntries } = await getSitemapDatasets();
  return xmlResponse(buildUrlSet(categoryEntries));
}
