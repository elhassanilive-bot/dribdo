import Link from "next/link";
import { isBlogEnabled, listCategorySummaries, listPostsDetailedPaginated, listTagSummaries, listTopPosts } from "@/lib/blog/posts";
import BlogPostsPaginatedGrid from "@/components/blog/BlogPostsPaginatedGrid";
import { formatCategoryLabel } from "@/lib/blog/render";

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

const INITIAL_CATEGORIES_VISIBLE = 6;
const INITIAL_TAGS_VISIBLE = 10;

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

  return (
    <div className="blog-pages-compact w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 35%,#f8fafc_100%)]">
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!enabled ? (
            <EmptyState
              title="Ø§Ù„Ù…Ø¯ÙˆÙ†Ø© Ø¬Ø§Ù‡Ø²Ø© Ù„Ù„Ø§Ù†Ø·Ù„Ø§Ù‚"
              description="Ø£Ø¶Ù Ù…ÙØ§ØªÙŠØ­ Supabase Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ¦Ø© Ø«Ù… Ø´ØºÙ‘Ù„ Ù…Ø®Ø·Ø· Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„ ÙˆØ³ÙŠØ¨Ø¯Ø£ Ù†Ø¸Ø§Ù… Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª Ø¨Ø§Ù„Ø¹Ù…Ù„ Ù…Ø¨Ø§Ø´Ø±Ø©."
              ctaHref="/login"
              ctaLabel="ÙØªØ­ Ù„ÙˆØ­Ø© Ø§Ù„Ù†Ø´Ø±"
            />
          ) : error ? (
            <EmptyState
              title="ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª"
              description={`ØªØ¹Ø°Ù‘Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ù€ Supabase Ø£Ùˆ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª Ø§Ù„Ù…Ù†Ø´ÙˆØ±Ø©. Ø§Ù„Ø±Ø³Ø§Ù„Ø©: ${error}`}
              ctaHref="/login"
              ctaLabel="Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯"
            />
          ) : posts.length === 0 ? (
            <EmptyState
              title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‚Ø§Ù„Ø§Øª Ù…Ù†Ø´ÙˆØ±Ø© Ø¨Ø¹Ø¯"
              description="Ø§Ø³ØªØ®Ø¯Ù… Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ù„Ø¥Ø¶Ø§ÙØ© Ø£ÙˆÙ„ Ù…Ù‚Ø§Ù„ØŒ ÙˆØ³ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ Ø¨Ù…Ø¬Ø±Ø¯ Ù†Ø´Ø±Ù‡."
              ctaHref="/login"
              ctaLabel="Ù†Ø´Ø± Ø£ÙˆÙ„ Ù…Ù‚Ø§Ù„"
            />
          ) : (
            <div className="space-y-6">
              {topPosts.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-bold text-slate-900">Ø§Ù„Ø£ÙƒØ«Ø± Ù‚Ø±Ø§Ø¡Ø© Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹</div>
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
                      <div className="mb-2 text-xs font-bold text-slate-700">ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„Ù…Ø¯ÙˆÙ†Ø©</div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {categories.slice(0, INITIAL_CATEGORIES_VISIBLE).map((category) => (
                          <Link
                            key={category.slug}
                            href={`/blog/category/${category.slug}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                          >
                            {formatCategoryLabel(category.name)} ({category.count})
                          </Link>
                        ))}
                      </div>
                      {categories.length > INITIAL_CATEGORIES_VISIBLE ? (
                        <details className="mb-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                          <summary className="cursor-pointer select-none text-[11px] font-bold text-orange-700 marker:text-orange-500">
                            Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª (+{categories.length - INITIAL_CATEGORIES_VISIBLE})
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {categories.slice(INITIAL_CATEGORIES_VISIBLE).map((category) => (
                              <Link
                                key={category.slug}
                                href={`/blog/category/${category.slug}`}
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700"
                              >
                                {formatCategoryLabel(category.name)} ({category.count})
                              </Link>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                  {tags.length ? (
                    <div>
                      <div className="mb-2 text-xs font-bold text-slate-700">ÙˆØ³ÙˆÙ… Ø´Ø§Ø¦Ø¹Ø©</div>
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
                            Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„ÙˆØ³ÙˆÙ… (+{tags.length - INITIAL_TAGS_VISIBLE})
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
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


