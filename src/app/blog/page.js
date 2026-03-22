import Link from "next/link";
<<<<<<< HEAD
import { listPostsDetailed, isBlogEnabled, listCommentCountsForPosts } from "@/lib/blog/posts";
import { estimateReadingTime, formatArabicDate } from "@/lib/blog/render";
import BlogImage from "@/components/blog/BlogImage";
import { buildPermalink } from "@/lib/blog/permalinks";
=======
import { isBlogEnabled, listCategorySummaries, listPostsDetailedPaginated, listTagSummaries, listTopPosts } from "@/lib/blog/posts";
import BlogPostsPaginatedGrid from "@/components/blog/BlogPostsPaginatedGrid";
>>>>>>> 300f687 (dribdo initial)

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Blog",
  description: "Latest Dribdo blog posts and updates.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "Dribdo Blog RSS" }],
    },
  },
};

<<<<<<< HEAD
function PostCard({ post, commentCount = 0 }) {
  const imageHeight = "h-28 sm:h-32";
  const readingTime = estimateReadingTime(post.content);

  return (
    <article
      className="group overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_14px_35px_-35px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)]"
    >
      <Link href={buildPermalink(post)} className="block">
        <div className={`relative overflow-hidden bg-slate-100 ${imageHeight}`}>
          <BlogImage
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-col justify-between p-3 sm:p-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] tracking-[0.14em] text-orange-700">
                {post.category || "Blog"}
              </span>
              <span>{formatArabicDate(post.publishedAt || post.createdAt)}</span>
              <span>{readingTime} دقائق قراءة</span>
            </div>
            <h2 className="mt-2 text-sm font-black leading-tight text-slate-950 sm:text-base">
              {post.title}
            </h2>
            <p className="mt-1.5 text-[11px] leading-5 text-slate-600 sm:text-xs">
              {post.excerpt}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {(post.tags || []).slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-orange-700 transition group-hover:text-orange-800">
              <span>قراءة المزيد</span>
              <span className="text-[10px] text-slate-400">• {commentCount} تعليقات</span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {post.viewCount ?? 0} مشاهدة
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
=======
const INITIAL_CATEGORIES_VISIBLE = 6;
const INITIAL_TAGS_VISIBLE = 10;
>>>>>>> 300f687 (dribdo initial)

function EmptyState({ title, description, ctaHref, ctaLabel }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-7">
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)]"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export default async function BlogIndex({ searchParams }) {
  const enabled = isBlogEnabled();
<<<<<<< HEAD
  const { posts, error } = await listPostsDetailed({ limit: 30 });
  const commentCounts = await listCommentCountsForPosts(posts.map((post) => post.id));
  const remainingPosts = posts;
=======
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number.parseInt(String(resolvedSearchParams?.page || "1"), 10) || 1);
  const per = Math.max(1, Math.min(Number.parseInt(String(resolvedSearchParams?.per || "9"), 10) || 9, 40));
  const q = String(resolvedSearchParams?.q || "").trim();
  const category = String(resolvedSearchParams?.category || "").trim();
  const tag = String(resolvedSearchParams?.tag || "").trim();

  const [paginated, topPosts, categories, tags] = await Promise.all([
    listPostsDetailedPaginated({ page, limit: per, query: q, category, tag }),
    listTopPosts({ limit: 6 }),
    listCategorySummaries({ limit: 10 }),
    listTagSummaries({ limit: 18 }),
  ]);
  const { posts, error, total } = paginated;
>>>>>>> 300f687 (dribdo initial)

  return (
    <div className="blog-pages-compact w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 35%,#f8fafc_100%)]">
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!enabled ? (
            <EmptyState
              title="المدونة جاهزة للانطلاق"
              description="أضف مفاتيح Supabase إلى البيئة ثم شغّل مخطط الجداول وسيبدأ نظام المقالات بالعمل مباشرة."
              ctaHref="/admin/blog"
              ctaLabel="فتح لوحة النشر"
            />
          ) : error ? (
            <EmptyState
              title="تعذر تحميل المقالات"
              description={`تعذّر الاتصال بـ Supabase أو قراءة المقالات المنشورة. الرسالة: ${error}`}
              ctaHref="/admin/blog"
              ctaLabel="التحقق من الإعداد"
            />
          ) : posts.length === 0 ? (
            <EmptyState
              title="لا توجد مقالات منشورة بعد"
              description="استخدم لوحة الإدارة لإضافة أول مقال، وسيظهر هنا تلقائيًا بمجرد نشره."
              ctaHref="/admin/blog"
              ctaLabel="نشر أول مقال"
            />
          ) : (
<<<<<<< HEAD
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post) => (
                <PostCard key={post.slug} post={post} commentCount={commentCounts[post.id] || 0} />
              ))}
=======
            <div className="space-y-6">
              {topPosts.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-bold text-slate-900">الأكثر قراءة هذا الأسبوع</div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {topPosts.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition hover:border-orange-200"
                      >
                        <div className="text-[11px] font-semibold text-slate-400">#{index + 1}</div>
                        <div className="mt-1 line-clamp-2 text-[13px] font-bold text-slate-900">{post.title}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {(categories.length || tags.length) && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  {categories.length ? (
                    <div>
                      <div className="mb-2 text-xs font-bold text-slate-700">تصنيفات المدونة</div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {categories.slice(0, INITIAL_CATEGORIES_VISIBLE).map((category) => (
                          <Link
                            key={category.slug}
                            href={`/blog/category/${category.slug}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                          >
                            {category.name} ({category.count})
                          </Link>
                        ))}
                      </div>
                      {categories.length > INITIAL_CATEGORIES_VISIBLE ? (
                        <details className="mb-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                          <summary className="cursor-pointer select-none text-[11px] font-bold text-orange-700 marker:text-orange-500">
                            عرض المزيد من التصنيفات (+{categories.length - INITIAL_CATEGORIES_VISIBLE})
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {categories.slice(INITIAL_CATEGORIES_VISIBLE).map((category) => (
                              <Link
                                key={category.slug}
                                href={`/blog/category/${category.slug}`}
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                              >
                                {category.name} ({category.count})
                              </Link>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                  {tags.length ? (
                    <div>
                      <div className="mb-2 text-xs font-bold text-slate-700">وسوم شائعة</div>
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, INITIAL_TAGS_VISIBLE).map((tag) => (
                          <Link
                            key={tag.slug}
                            href={`/blog/tag/${tag.slug}`}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                      {tags.length > INITIAL_TAGS_VISIBLE ? (
                        <details className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                          <summary className="cursor-pointer select-none text-[11px] font-bold text-orange-700 marker:text-orange-500">
                            عرض المزيد من الوسوم (+{tags.length - INITIAL_TAGS_VISIBLE})
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tags.slice(INITIAL_TAGS_VISIBLE).map((tag) => (
                              <Link
                                key={tag.slug}
                                href={`/blog/tag/${tag.slug}`}
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                              >
                                #{tag.name}
                              </Link>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}

              <BlogPostsPaginatedGrid
                posts={posts}
                total={total}
                initialPage={page}
                initialPerPage={per}
                initialQuery={q}
                initialCategory={category}
                initialTag={tag}
                availableCategories={categories.map((item) => item.name)}
                availableTags={tags.map((item) => item.name)}
                serverMode
              />
>>>>>>> 300f687 (dribdo initial)
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

