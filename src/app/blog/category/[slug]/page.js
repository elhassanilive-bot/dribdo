import Link from "next/link";
import BlogPostsPaginatedGrid from "@/components/blog/BlogPostsPaginatedGrid";
import { listCategorySummaries, listPostsDetailed } from "@/lib/blog/posts";
import { createSlugCandidate } from "@/lib/blog/slug";
import { formatCategoryLabel } from "@/lib/blog/render";
import { absoluteUrl, site } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }) {
  const resolved = await params;
  const categories = await listCategorySummaries({ limit: 120 });
  const category = categories.find((item) => item.slug === resolved.slug);
  const categoryLabel = formatCategoryLabel(category?.name || "");
  const title = category ? `تصنيف: ${categoryLabel}` : "تصنيف غير موجود";
  const description = category
    ? `تصفح المقالات المرتبطة بتصنيف ${categoryLabel} داخل مدونة دريبدو واكتشف المحتوى الأقرب إلى هذا المجال.`
    : "هذا التصنيف غير متوفر حاليًا في مدونة دريبدو.";

  return {
    title,
    description,
    keywords: category ? [`تصنيف ${categoryLabel}`, `${categoryLabel}`, "مدونة دريبدو"] : undefined,
    alternates: { canonical: `/blog/category/${resolved.slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/category/${resolved.slug}`,
      images: [{ url: "/screenshots/ads.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/screenshots/ads.png"],
    },
  };
}

export default async function BlogCategoryPage({ params }) {
  const resolved = await params;
  const categories = await listCategorySummaries({ limit: 120 });
  const category = categories.find((item) => item.slug === resolved.slug);

  if (!category) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-black text-slate-900">التصنيف غير موجود</h1>
        <Link href="/blog" className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          العودة للمدونة
        </Link>
      </div>
    );
  }

  const { posts } = await listPostsDetailed({ limit: 1200 });
  const filtered = posts.filter((post) => createSlugCandidate(post.category) === category.slug);
  const categoryLabel = formatCategoryLabel(category.name);
  const pageUrl = `${site.url}/blog/category/${resolved.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: site.url },
      { "@type": "ListItem", position: 2, name: "المدونة", item: `${site.url}/blog` },
      { "@type": "ListItem", position: 3, name: categoryLabel, item: pageUrl },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `تصنيف: ${categoryLabel}`,
    description: `تصفح المقالات المرتبطة بتصنيف ${categoryLabel} داخل مدونة دريبدو.`,
    url: pageUrl,
    inLanguage: "ar",
    isPartOf: site.url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filtered.slice(0, 12).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  };

  return (
    <div className="blog-pages-compact w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 35%,#f8fafc_100%)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="font-semibold hover:text-orange-700">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/blog" className="font-semibold hover:text-orange-700">
              المدونة
            </Link>
            <span>/</span>
            <span>{categoryLabel}</span>
          </nav>
          <h1 className="mb-3 text-2xl font-black text-slate-950">تصنيف: {categoryLabel}</h1>
          <p className="mb-6 max-w-3xl text-sm leading-7 text-slate-600">
            تصفح المقالات المرتبطة بهذا التصنيف واكتشف محتوى دريبدو المنظم حول {categoryLabel}.
          </p>
          <BlogPostsPaginatedGrid posts={filtered} />
        </div>
      </section>
    </div>
  );
}
