import Link from "next/link";
<<<<<<< HEAD
import { redirect } from "next/navigation";
import { getPostByIdDetailed, getPostBySlugDetailed } from "@/lib/blog/posts";
import { estimateReadingTime, formatArabicDate } from "@/lib/blog/render";
import { renderStoredBlogContent } from "@/lib/blog/content";
import BlogImage from "@/components/blog/BlogImage";
import PostViewTracker from "@/components/blog/PostViewTracker";
import PostInteractions from "@/components/blog/PostInteractions";
=======
import { getPostBySlugDetailed, getPostViewsCount, listRelatedPosts } from "@/lib/blog/posts";
import { estimateReadingTime, formatArabicDate } from "@/lib/blog/render";
import { buildTableOfContents, injectHeadingAnchors, renderStoredBlogContent } from "@/lib/blog/content";
import BlogImage from "@/components/blog/BlogImage";
import BlogViewTracker from "@/components/blog/BlogViewTracker";
import { site } from "@/config/site";
>>>>>>> 300f687 (dribdo initial)

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function extractIdFromParam(value) {
  const raw = String(value || "");
  const match = raw.match(UUID_PATTERN);
  return match ? match[0] : "";
}

function extractSlugFromParam(value) {
  const raw = String(value || "");
  const match = raw.match(UUID_PATTERN);
  if (!match) return raw;
  const after = raw.slice(match.index + match[0].length);
  if (!after) return "";
  return after.startsWith("-") ? after.slice(1) : after;
}

function extractSlugFromPathParts(rawValue) {
  const raw = String(rawValue || "");
  if (!raw.includes("/")) return raw;
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length) return raw;
  if (parts[0] === "archives" && parts[1]) return parts[1];
  const year = /^\d{4}$/;
  const month = /^\d{2}$/;
  const day = /^\d{2}$/;
  if (parts.length >= 4 && year.test(parts[0]) && month.test(parts[1]) && day.test(parts[2])) {
    return parts.slice(3).join("-");
  }
  if (parts.length >= 3 && year.test(parts[0]) && month.test(parts[1])) {
    return parts.slice(2).join("-");
  }
  return parts[parts.length - 1];
}

async function resolvePostByParam(rawParam) {
  const decoded = rawParam ? decodeURIComponent(rawParam) : "";
  const id = extractIdFromParam(decoded);
  if (id) {
    const byId = await getPostByIdDetailed(id);
    if (byId.post) return byId;
    const fallbackSlug = extractSlugFromParam(decoded);
    if (fallbackSlug) {
      return getPostBySlugDetailed(fallbackSlug);
    }
    return byId;
  }
  const pathSlug = extractSlugFromPathParts(decoded);
  return getPostBySlugDetailed(pathSlug);
}

function buildCanonicalParam(post) {
  if (!post?.id) return "";
  const slug = post.slug ? String(post.slug) : "";
  return slug ? `${post.id}-${slug}` : post.id;
}

export async function generateMetadata({ params }) {
  const rawParam = params?.slug || "";
  if (!rawParam) {
    return {
      title: "المقال غير موجود",
      description: "تعذر العثور على المقال المطلوب.",
    };
  }

  const { post } = await resolvePostByParam(rawParam);
  if (!post) {
    return {
      title: "المقال غير موجود",
      description: "قد يكون تم حذف المقال أو أنه لم يُنشر بعد.",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/blog/${post.id}-${post.slug}` },
  };
}

function CoverPlaceholder() {
  return (
<<<<<<< HEAD
    <div className="flex h-44 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 text-slate-400">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m8 13 2.5-2.5L15 15l2-2 3 3" />
            <circle cx="9" cy="10" r="1.5" />
          </svg>
        </span>
        <span>معرض الصور</span>
=======
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
>>>>>>> 300f687 (dribdo initial)
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }) {
  const rawParam = params?.slug || "";
  const { post, error } = await resolvePostByParam(rawParam);

  if (!rawParam || !post) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
          <h1 className="text-2xl font-black text-slate-950">المقال غير موجود</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            قد يكون تم حذف المقال أو أنه لم يُنشر بعد، أو أن الرابط المختصر غير صحيح.
            {error ? ` الرسالة: ${error}` : ""}
          </p>
          <div className="mt-6">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[var(--blog-accent-strong)]"
            >
              العودة إلى المدونة
            </Link>
          </div>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const canonicalParam = buildCanonicalParam(post);
  if (canonicalParam && canonicalParam !== rawParam) {
    redirect(`/blog/${canonicalParam}`);
  }

  const contentHtml = renderStoredBlogContent(post.content);
  const readingTime = estimateReadingTime(post.content);
  const publishedAt = formatArabicDate(post.publishedAt || post.createdAt);
  const hasCover = Boolean(post.coverImageUrl);

  return (
    <div className="bg-white">
      <PostViewTracker postId={post.id} />
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#fff7ed_0%,#fff_55%)]">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-[11px] font-semibold text-slate-500 hover:text-slate-700">
            ← العودة إلى المدونة
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] tracking-[0.12em] text-orange-700">
              {post.category || "Blog"}
            </span>
            <span>{publishedAt}</span>
            <span>{readingTime} دقائق قراءة</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {post.viewCount ?? 0} مشاهدة
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {hasCover ? (
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
            <div className="relative h-52 sm:h-60">
              <BlogImage
                src={post.coverImageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : (
          <CoverPlaceholder />
        )}
=======
  const rawHtml = renderStoredBlogContent(post.content);
  const toc = buildTableOfContents(rawHtml);
  const html = injectHeadingAnchors(rawHtml, toc);
  const readingTime = estimateReadingTime(post.content);
  const viewsCount = await getPostViewsCount(post.id);
  const relatedPosts = await listRelatedPosts(post, { limit: 3 });
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
              <span>{post.category || "مقال"}</span>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">{post.category || "Blog"}</span>
              <span>{formatArabicDate(post.publishedAt || post.createdAt)}</span>
              <span>{readingTime} دقائق قراءة</span>
              <span>{viewsCount} مشاهدة</span>
            </div>

            <h1 className="mt-4 max-w-4xl text-[1.9rem] font-black tracking-tight text-slate-950 sm:text-[2.4rem] lg:text-[3rem]">
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
>>>>>>> 300f687 (dribdo initial)

        <article
          className="prose prose-sm sm:prose-base mt-6 max-w-none prose-headings:font-extrabold prose-headings:text-slate-950 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-p:leading-7 prose-a:text-blue-600 prose-a:font-semibold prose-img:rounded-xl prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

<<<<<<< HEAD
        {(post.tags || []).length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
          <PostInteractions postId={post.id} />
=======
          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
              <div className="text-[11px] font-semibold text-slate-500">معلومات المقال</div>
              <div className="mt-4 space-y-4 text-[13px] text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-[11px] font-semibold text-slate-500">التصنيف</div>
                  <div className="mt-1 text-[15px] font-black text-slate-950">{post.category || "عام"}</div>
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
>>>>>>> 300f687 (dribdo initial)
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
                  <div className="text-[11px] font-semibold text-slate-400">{related.category || "Blog"}</div>
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


