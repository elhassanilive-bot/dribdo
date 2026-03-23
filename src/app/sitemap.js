import { site } from "@/config/site";
import { listCategorySummaries, listPostsDetailed, listTagSummaries } from "@/lib/blog/posts";

const staticPages = [
  "/",
  "/about",
  "/blog",
  "/forum",
  "/features",
  "/download",
  "/faq",
  "/help-center",
  "/contact",
  "/privacy",
  "/terms",
  "/security",
  "/deletion",
  "/dmca",
  "/complaints",
  "/report-issue",
  "/agreements",
  "/service-policies/charity",
  "/service-policies/jobs",
  "/service-policies/marketplace",
  "/service-policies/marriage",
  "/service-policies/notes-sheets",
  "/service-policies/real-estate",
  "/service-policies/tools",
  "/service-policies/verification",
];

export default async function sitemap() {
  const [{ posts }, categories, tags] = await Promise.all([
    listPostsDetailed({ limit: 1200 }),
    listCategorySummaries({ limit: 60 }),
    listTagSummaries({ limit: 120 }),
  ]);

  const staticEntries = staticPages.map((path, index) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" || path === "/blog" || path === "/forum" ? "daily" : "weekly",
    priority: index === 0 ? 1 : path === "/blog" || path === "/forum" ? 0.9 : 0.75,
  }));

  const postPages = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || post.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages = categories.map((category) => ({
    url: `${site.url}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  const tagPages = tags.map((tag) => ({
    url: `${site.url}/blog/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postPages, ...categoryPages, ...tagPages];
}
