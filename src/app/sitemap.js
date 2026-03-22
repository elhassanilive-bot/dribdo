import { site } from "@/config/site";
import { listCategorySummaries, listPostsDetailed, listTagSummaries } from "@/lib/blog/posts";

export default async function sitemap() {
  const [{ posts }, categories, tags] = await Promise.all([
    listPostsDetailed({ limit: 1200 }),
    listCategorySummaries({ limit: 60 }),
    listTagSummaries({ limit: 120 }),
  ]);

  const staticPages = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/blog`, changeFrequency: "daily", priority: 0.9 },
  ];

  const postPages = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || post.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages = categories.map((category) => ({
    url: `${site.url}/blog/category/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  const tagPages = tags.map((tag) => ({
    url: `${site.url}/blog/tag/${tag.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...tagPages];
}
