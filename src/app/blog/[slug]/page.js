import Link from "next/link";
import { getPostBySlugDetailed } from "@/lib/blog/posts";
import { estimateReadingTime, formatArabicDate } from "@/lib/blog/render";
import { renderStoredBlogContent } from "@/lib/blog/content";
import BlogImage from "@/components/blog/BlogImage";
import PostViewTracker from "@/components/blog/PostViewTracker";
import PostInteractions from "@/components/blog/PostInteractions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }) {
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";
  if (!slug) {
    return {
      title: "المقال غير موجود",
      description: "تعذر العثور على المقال المطلوب.",
    };
  }

  const { post } = await getPostBySlugDetailed(slug);
  if (!post) {
    return {
      title: "المقال غير موجود",
      description: "قد يكون تم حذف المقال أو أنه لم يُنشر بعد.",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

function CoverPlaceholder() {
  return (
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
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }) {
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";
  const { post, error } = await getPostBySlugDetailed(slug);

  if (!slug || !post) {
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

        <article
          className="prose prose-sm sm:prose-base mt-6 max-w-none prose-headings:font-extrabold prose-headings:text-slate-950 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-p:leading-7 prose-a:text-blue-600 prose-a:font-semibold prose-img:rounded-xl prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

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
        </div>
      </section>
    </div>
  );
}
