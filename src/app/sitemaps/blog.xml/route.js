import { buildUrlSet, getSitemapDatasets, xmlResponse } from "@/lib/seo/sitemap";

export async function GET() {
  const { postEntries } = await getSitemapDatasets();
  return xmlResponse(buildUrlSet(postEntries));
}
