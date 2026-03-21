import Link from "next/link";
import { getPostBySlugDetailed } from "@/lib/blog/posts";
import { estimateReadingTime, formatArabicDate } from "@/lib/blog/render";
import { renderStoredBlogContent } from "@/lib/blog/content";
import BlogImage from "@/components/blog/BlogImage";
import PostInteractions from "@/components/blog/PostInteractions";
import PostViewTracker from "@/components/blog/PostViewTracker";

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
        <h1 className="text-3xl font-black text-slate-950">المقال غير موجود</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
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

  const html = renderStoredBlogContent(post.content);
  const readingTime = estimateReadingTime(post.content);

  return (
    <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 26%,#f8fafc_100%)]">
      <PostViewTracker postId={post.id} />
      <section className="pb-10 pt-10 sm:pb-14 sm:pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.25rem] border border-orange-100 bg-white px-6 py-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-8 sm:py-10">
            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <Link href="/blog" className="font-semibold transition hover:text-orange-700">
                المدونة
              </Link>
              <span>/</span>
              <span>{post.category || "مقال"}</span>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">{post.category || "Blog"}</span>
              <span>{formatArabicDate(post.publishedAt || post.createdAt)}</span>
              <span>{readingTime} دقائق قراءة</span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              {post.excerpt}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {(post.tags || []).map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

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
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:px-8">
          <div className="space-y-8">
            <article className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.45)] sm:px-8 sm:py-10">
              <div className="blog-prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
            </article>
            <PostInteractions postId={post.id} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
              <div className="text-sm font-semibold text-slate-500">معلومات المقال</div>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold text-slate-500">التصنيف</div>
                  <div className="mt-1 text-lg font-black text-slate-950">{post.category || "عام"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold text-slate-500">تاريخ النشر</div>
                  <div className="mt-1 text-lg font-black text-slate-950">{formatArabicDate(post.publishedAt || post.createdAt)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold text-slate-500">وقت القراءة</div>
                  <div className="mt-1 text-lg font-black text-slate-950">{readingTime} دقائق</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
              <div className="text-sm font-semibold text-slate-500">انتقال سريع</div>
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/blog" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700">
                  كل المقالات
                </Link>
                <Link href="/admin/blog" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700">
                  نشر مقال جديد
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
