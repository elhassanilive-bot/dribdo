import Link from "next/link";
import PostMediaLightbox from "@/components/post/PostMediaLightbox";
import { absoluteUrl, site } from "@/config/site";
import { excerptText, getMomentPostById, listMomentPostsForFeed, mediaKind } from "@/lib/moments/posts";
import RichMomentText from "@/components/moments/RichMomentText";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function hexToRgb(hex) {
  const value = String(hex || "").trim();
  const match = value.match(/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/);
  if (!match) return null;
  const raw = match[1];
  const normalized = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const int = Number.parseInt(normalized, 16);
  if (!Number.isFinite(int)) return null;
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function isDarkColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance < 0.5;
}

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const post = await getMomentPostById(resolved.id);

  if (!post) {
    return {
      title: "منشور غير موجود",
      robots: { index: false, follow: false },
    };
  }

  const titleText = excerptText(post.content, 70) || `منشور من ${post.authorName}`;
  const descText = excerptText(post.content, 170) || "منشور من دريبدو";
  const ogImage = post.mediaUrls.find((url) => mediaKind(url, post.postType) === "image") || absoluteUrl(site.defaultOgImage);

  return {
    title: titleText,
    description: descText,
    alternates: { canonical: `/post/${post.id}` },
    openGraph: {
      title: titleText,
      description: descText,
      url: `/post/${post.id}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descText,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function NotFoundPost() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center">
        <h1 className="text-2xl font-black text-slate-900">المنشور غير موجود</h1>
        <p className="mt-3 text-sm text-slate-600">قد يكون الرابط خاطئًا أو تم حذف المنشور.</p>
        <Link href="/moments" className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          العودة إلى اللحظات
        </Link>
      </div>
    </div>
  );
}

function Attachments({ files = [] }) {
  if (!files.length) return null;
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-900">الملفات</h2>
      <ul className="mt-3 space-y-2">
        {files.map((file) => (
          <li key={file.id || file.fileUrl} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <a href={file.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">
              {file.fileName || "ملف مرفق"}
            </a>
            {file.fileType ? <span className="mr-2 text-xs text-slate-500">{file.fileType}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function PostPage({ params }) {
  const resolved = await params;
  const post = await getMomentPostById(resolved.id);

  if (!post) return <NotFoundPost />;

  const related = (await listMomentPostsForFeed({ limit: 80 }))
    .filter((item) => item.id !== post.id && item.userId === post.userId)
    .slice(0, 4);
  const hasColorBackground = Boolean(post.bgColor);
  const darkBackground = hasColorBackground ? isDarkColor(post.bgColor) : false;
  const fallbackTextColor = hasColorBackground
    ? (darkBackground ? "#ffffff" : "#0f172a")
    : "#111827";
  const postTextStyle = {
    background: post.bgColor || "transparent",
    color: darkBackground ? "#ffffff" : (post.textColor || fallbackTextColor),
  };

  const descText = excerptText(post.content, 170) || "منشور من دريبدو";
  const ogImage = post.mediaUrls.find((url) => mediaKind(url, post.postType) === "image") || absoluteUrl(site.defaultOgImage);
  const pageUrl = `${site.url}/post/${post.id}`;

  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: excerptText(post.content, 90) || `منشور من ${post.authorName}`,
    description: descText,
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    url: pageUrl,
    image: ogImage,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.likesCount || 0 },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.commentsCount || 0 },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: site.url },
      { "@type": "ListItem", position: 2, name: "اللحظات", item: `${site.url}/moments` },
      { "@type": "ListItem", position: 3, name: "المنشور", item: pageUrl },
    ],
  };

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-3 pb-14 pt-6 sm:px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/moments" className="font-semibold text-slate-700 hover:text-blue-700">اللحظات</Link>
        <span>/</span>
        <span className="text-slate-400">منشور</span>
      </nav>

      <article className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl"><RichMomentText text={excerptText(post.content, 90) || `منشور من ${post.authorName}`} /></h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{post.authorName}</span>
            <span>•</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>
        </header>

        {post.content ? (
          <div
            className="mt-5 whitespace-pre-wrap rounded-2xl px-4 py-4 text-[1.06rem] leading-8"
            style={postTextStyle}
          >
            <RichMomentText text={post.content} />
          </div>
        ) : null}

        <PostMediaLightbox mediaUrls={post.mediaUrls} postType={post.postType} />
        <Attachments files={post.attachments} />
      </article>

      {related.length ? (
        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900">منشورات أخرى من نفس المستخدم</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {related.map((item) => (
              <Link key={item.id} href={`/post/${item.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-blue-200">
                <div className="line-clamp-2 font-semibold text-slate-800"><RichMomentText text={excerptText(item.content, 100) || "منشور بدون نص"} /></div>
                <div className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}


