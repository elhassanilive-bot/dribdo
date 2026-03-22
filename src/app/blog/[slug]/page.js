import Link from "next/link";
import { getPostBySlugDetailed, getPostViewsCount, listRelatedPosts } from "@/lib/blog/posts";
import { estimateReadingTime, formatArabicDate, formatCategoryLabel } from "@/lib/blog/render";
import { buildTableOfContents, injectHeadingAnchors, renderStoredBlogContent } from "@/lib/blog/content";
import BlogImage from "@/components/blog/BlogImage";
import BlogViewTracker from "@/components/blog/BlogViewTracker";
import PostInteractions from "@/components/blog/PostInteractions";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { post } = await getPostBySlugDetailed(resolvedParams.slug);

  if (!post) {
    return {
      title: "مقال غير موجود",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

function NotFoundState({ error }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
        <h1 className="text-2xl font-black text-slate-950">المقال غير موجود</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          قد يكون تم حذف المقال أو أنه لم يُنشر بعد، أو أن الرابط المختصر غير صحيح.
        </p>
        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
            سبب Supabase:
            {" "}
            <span className="font-mono">{error}</span>
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/blog" className="rounded-2xl bg-[var(--blog-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)]">
            العودة إلى المدونة
          </Link>
          <Link href="/admin/blog" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700">
            فتح لوحة النشر
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const { post, error } = await getPostBySlugDetailed(resolvedParams.slug);

  if (!post) {
    return <NotFoundState error={error} />;
  }

  const rawHtml = renderStoredBlogContent(post.content);
  const toc = buildTableOfContents(rawHtml);
  const html = injectHeadingAnchors(rawHtml, toc);
  const readingTime = estimateReadingTime(post.content);
  const viewsCount = await getPostViewsCount(post.id);
  const relatedPosts = await listRelatedPosts(post, { limit: 3 });
  const isForumPost = String(post.category || "").toLowerCase() === "forum";
  const categoryLabel = formatCategoryLabel(post.category) || "مقال";
  const articleUrl = `${site.url}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: {
      "@type": "Organization",
      name: "Dribdo Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: site.nameEn,
      url: site.url,
    },
    mainEntityOfPage: articleUrl,
    articleSection: post.category || "Blog",
    keywords: (post.tags || []).join(", "),
  };

  return (
    <div className="blog-pages-compact w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 26%,#f8fafc_100%)]">
      <BlogViewTracker postId={post.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="pb-10 pt-10 sm:pb-14 sm:pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.25rem] border border-orange-100 bg-white px-6 py-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-8 sm:py-10">
            <nav className="flex flex-wrap items-center gap-2.5 text-[13px] text-slate-500">
              <Link href="/blog" className="font-semibold transition hover:text-orange-700">
                المدونة
              </Link>
              <span>/</span>
              <span>{categoryLabel}</span>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">{categoryLabel}</span>
              <span>{formatArabicDate(post.publishedAt || post.createdAt)}</span>
              <span>{readingTime} دقائق قراءة</span>
              <span>{viewsCount} مشاهدة</span>
            </div>

            <h1
              className={[
                "mt-4 max-w-4xl font-black tracking-tight text-slate-950",
                isForumPost ? "text-[1.3rem] sm:text-[1.6rem] lg:text-[1.9rem]" : "text-[1.9rem] sm:text-[2.4rem] lg:text-[3rem]",
              ].join(" ")}
            >
              {post.title}
            </h1>

            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600 sm:text-[17px]">
              {post.excerpt}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {(post.tags || []).map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-4 text-[13px] text-slate-500">
              الكاتب: <span className="font-semibold text-slate-700">فريق تحرير دريبدو</span> • آخر تحديث:{" "}
              <span className="font-semibold text-slate-700">{formatArabicDate(post.updatedAt || post.publishedAt || post.createdAt)}</span>
            </div>
          </div>

          {post.coverImageUrl ? (
            <div className="relative mt-8 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-slate-100 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
              <div className="relative h-[18rem] sm:h-[26rem] lg:h-[34rem]">
                <BlogImage
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="100vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:px-8">
          <div className="space-y-6">
            <article className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.45)] sm:px-8 sm:py-10">
              <div className="blog-prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
            </article>
            <PostInteractions postId={post.id} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
              <div className="text-[11px] font-semibold text-slate-500">معلومات المقال</div>
              <div className="mt-4 space-y-4 text-[13px] text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-[11px] font-semibold text-slate-500">التصنيف</div>
                  <div className="mt-1 text-[15px] font-black text-slate-950">{categoryLabel}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-[11px] font-semibold text-slate-500">تاريخ النشر</div>
                  <div className="mt-1 text-[15px] font-black text-slate-950">{formatArabicDate(post.publishedAt || post.createdAt)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-[11px] font-semibold text-slate-500">وقت القراءة</div>
                  <div className="mt-1 text-[15px] font-black text-slate-950">{readingTime} دقائق</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
              <div className="text-[11px] font-semibold text-slate-500">انتقال سريع</div>
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/blog" className="rounded-2xl border border-slate-200 px-4 py-3 text-[13px] font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700">
                  كل المقالات
                </Link>
                <Link href="/admin/blog" className="rounded-2xl border border-slate-200 px-4 py-3 text-[13px] font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700">
                  نشر مقال جديد
                </Link>
              </div>
            </div>
            {toc.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
                <div className="text-[11px] font-semibold text-slate-500">Table of Contents</div>
                <div className="mt-3 space-y-2">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-lg px-2 py-1 text-[12px] text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                      style={{ paddingInlineStart: `${(item.level - 1) * 10 + 8}px` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {relatedPosts.length ? (
        <section className="pb-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 text-sm font-bold text-slate-900">مقالات ذات صلة</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm transition hover:border-orange-200"
                >
                  <div className="text-[11px] font-semibold text-slate-400">{formatCategoryLabel(related.category) || "Blog"}</div>
                  <div className="mt-1 line-clamp-2 text-[14px] font-bold text-slate-900">{related.title}</div>
                  <div className="mt-1 text-[12px] text-slate-500">{formatArabicDate(related.publishedAt || related.createdAt)}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}



