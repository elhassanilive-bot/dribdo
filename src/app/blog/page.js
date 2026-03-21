import Link from "next/link";
import { listPostsDetailed, isBlogEnabled, listCommentCountsForPosts } from "@/lib/blog/posts";
import { estimateReadingTime, formatArabicDate } from "@/lib/blog/render";
import BlogImage from "@/components/blog/BlogImage";
import { buildPermalink } from "@/lib/blog/permalinks";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "المدونة",
  description: "آخر أخبار ومقالات دريبدو.",
  alternates: { canonical: "/blog" },
};

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

function EmptyState({ title, description, ctaHref, ctaLabel }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-slate-600">{description}</p>
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

export default async function BlogIndex() {
  const enabled = isBlogEnabled();
  const { posts, error } = await listPostsDetailed({ limit: 30 });
  const commentCounts = await listCommentCountsForPosts(posts.map((post) => post.id));
  const remainingPosts = posts;

  return (
    <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 35%,#f8fafc_100%)]">
      <section className="border-b border-orange-100/80 pb-12 pt-14 sm:pb-16 sm:pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700 shadow-sm">
              Dribdo Newsroom
            </div>
            <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              مدونة حديثة تعرض المقالات كواجهة إخبارية أنيقة وسريعة
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              تغطية، تحليلات، أدلة، وتحديثات منتج ضمن تجربة قراءة مريحة تدعم الصور والوسوم والروابط المختصرة
              والتوسع المستقبلي إلى SEO ووسائط متعددة.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["الترتيب", "الأحدث أولًا", "حسب published_at DESC"],
              ["التصفية", "منشور فقط", "RLS + status = published"],
              ["التجربة", "Responsive", "واجهة واضحة على الهاتف والديسكتوب"],
            ].map(([label, value, hint]) => (
              <div key={label} className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur">
                <div className="text-sm text-slate-500">{label}</div>
                <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{hint}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
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
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post) => (
                <PostCard key={post.slug} post={post} commentCount={commentCounts[post.id] || 0} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
