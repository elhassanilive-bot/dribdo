import { buildUrlSet, getSitemapDatasets, xmlResponse } from "@/lib/seo/sitemap";

export async function GET() {
  const { staticEntries } = await getSitemapDatasets();
  return xmlResponse(buildUrlSet(staticEntries));
}
