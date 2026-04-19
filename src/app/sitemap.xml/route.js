import { site } from "@/config/site";
import { listIndexableMarketProducts } from "@/lib/market/products";
import { listIndexableRealEstateProperties } from "@/lib/real-estate/properties";
import { listIndexableJobProfiles } from "@/lib/jobs/profiles";
import { listIndexableCharityItems } from "@/lib/charity/items";
import { buildSitemapIndex, getSitemapDatasets, xmlResponse } from "@/lib/seo/sitemap";

export async function GET() {
  const [datasets, productEntries, propertyEntries, jobsEntries, charityEntries] = await Promise.all([
    getSitemapDatasets(),
    listIndexableMarketProducts({ limit: 5000 }),
    listIndexableRealEstateProperties({ limit: 5000 }),
    listIndexableJobProfiles({ limit: 5000 }),
    listIndexableCharityItems({ limit: 5000 }),
  ]);

  const latestDates = [
    ...datasets.staticEntries.map((entry) => entry.lastModified),
    ...datasets.postEntries.map((entry) => entry.lastModified),
    ...datasets.categoryEntries.map((entry) => entry.lastModified),
    ...datasets.tagEntries.map((entry) => entry.lastModified),
    ...productEntries.map((entry) => entry.lastModified),
    ...propertyEntries.map((entry) => entry.lastModified),
    ...jobsEntries.map((entry) => entry.lastModified),
    ...charityEntries.map((entry) => entry.lastModified),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const lastModified = latestDates[0] || new Date().toISOString();
  const xml = buildSitemapIndex([
    { url: `${site.url}/sitemaps/pages.xml`, lastModified },
    { url: `${site.url}/sitemaps/blog.xml`, lastModified },
    { url: `${site.url}/sitemaps/posts.xml`, lastModified },
    { url: `${site.url}/sitemaps/products.xml`, lastModified },
    { url: `${site.url}/sitemaps/properties.xml`, lastModified },
    { url: `${site.url}/sitemaps/jobs.xml`, lastModified },
    { url: `${site.url}/sitemaps/charity.xml`, lastModified },
    { url: `${site.url}/sitemaps/categories.xml`, lastModified },
    { url: `${site.url}/sitemaps/tags.xml`, lastModified },
  ]);

  return xmlResponse(xml);
}