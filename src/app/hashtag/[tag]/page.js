import Link from "next/link";
import RichMomentText from "@/components/moments/RichMomentText";
import { listMomentPostsByHashtag, normalizeHashtagTag, mediaKind, excerptText } from "@/lib/moments/posts";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  } catch {
    return date.toISOString();
  }
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const tag = normalizeHashtagTag(resolved?.tag || "");
  if (!tag) {
    return { title: "هاشتاج غير صالح", robots: { index: false, follow: false } };
  }

  const title = `#${tag} | منشورات الهاشتاج`;
  const description = `عرض كل منشورات الهاشتاج #${tag} في واجهة دريبدو.`;

  return {
    title,
    description,
    alternates: { canonical: `/hashtag/${encodeURIComponent(tag)}` },
    openGraph: {
      title,
      description,
      url: `/hashtag/${encodeURIComponent(tag)}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function HashtagPage({ params }) {
  const resolved = await params;
  const tag = normalizeHashtagTag(resolved?.tag || "");

  if (!tag) {
    return (
      <div dir="rtl" className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600">الهاشتاج غير صالح.</div>
      </div>
    );
  }

  const posts = await listMomentPostsByHashtag(tag, { limit: 180 });
  const canonical = `${site.url}/hashtag/${encodeURIComponent(tag)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `#${tag}`,
    url: canonical,
    description: `منشورات الهاشتاج #${tag}`,
  };

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-3 pb-14 pt-6 sm:px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-4 rounded-3xl border border-slate-200 bg-white px-5 py-5">
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">#{tag}</h1>
        <p className="mt-1 text-sm text-slate-600">عدد المنشورات: {posts.length}</p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600">لا توجد منشورات لهذا الهاشتاج بعد.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const firstMedia = Array.isArray(post.mediaUrls) ? post.mediaUrls[0] : "";
            const firstKind = firstMedia ? mediaKind(firstMedia, post.postType) : "";
            return (
              <article key={post.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{post.authorName}</span>
                    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                  </div>

                  {post.content ? (
                    <div className="mt-3 whitespace-pre-wrap text-[14px] leading-7 text-slate-800">
                      <RichMomentText text={excerptText(post.content, 240)} />
                    </div>
                  ) : null}

                  {firstMedia ? (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      {firstKind === "video" ? (
                        <video src={firstMedia} preload="metadata" muted playsInline className="h-64 w-full object-cover bg-black" />
                      ) : (
                        <img src={firstMedia} alt="وسائط المنشور" loading="lazy" className="h-64 w-full object-cover" />
                      )}
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <Link href={`/post/${post.id}`} className="inline-flex rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
                      فتح المنشور
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
