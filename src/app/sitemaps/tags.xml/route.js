import { buildUrlSet, getSitemapDatasets, xmlResponse } from "@/lib/seo/sitemap";

export async function GET() {
  const { tagEntries } = await getSitemapDatasets();
  return xmlResponse(buildUrlSet(tagEntries));
}
