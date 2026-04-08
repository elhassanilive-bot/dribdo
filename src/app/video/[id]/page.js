import Link from "next/link";
import { notFound } from "next/navigation";
import MomentsPostActions from "@/components/moments/MomentsPostActions";
import MomentsVideoPlayerClient from "@/components/moments/MomentsVideoPlayerClient";
import VideoPagerClient from "@/components/moments/VideoPagerClient";
import ExpandablePostText from "@/components/moments/ExpandablePostText";
import RichMomentText from "@/components/moments/RichMomentText";
import { getMomentPostById, excerptText, mediaKind, getMomentVideoNeighbors } from "@/lib/moments/posts";
import { site } from "@/config/site";

function getVideoUrl(post) {
  const urls = Array.isArray(post?.mediaUrls) ? post.mediaUrls : [];
  const byList = urls.find((url) => mediaKind(url, post?.postType) === "video");
  if (byList) return byList;
  return "";
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
  const id = String(resolved?.id || "").trim();
  if (!id) return {};

  const post = await getMomentPostById(id);
  if (!post) return {};

  const videoUrl = getVideoUrl(post);
  const titleText = excerptText(post.content, 70) || `فيديو من ${post.authorName}`;
  const description = excerptText(post.content, 160) || "شاهد فيديو من واجهة دريبدو.";
  const canonical = `/video/${id}`;

  return {
    title: titleText,
    description,
    alternates: { canonical },
    openGraph: {
      title: titleText,
      description,
      url: canonical,
      type: "video.other",
      images: [{ url: "/icon.png", width: 512, height: 512, alt: titleText }],
      videos: videoUrl ? [{ url: videoUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description,
      images: ["/icon.png"],
    },
  };
}

export default async function VideoPage({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) notFound();

  const post = await getMomentPostById(id);
  if (!post) notFound();

  const videoUrl = getVideoUrl(post);
  if (!videoUrl) notFound();

  const neighbors = await getMomentVideoNeighbors(id, { limit: 900 });

  const [nextPost, prevPost] = await Promise.all([
    neighbors.nextId ? getMomentPostById(neighbors.nextId) : Promise.resolve(null),
    neighbors.prevId ? getMomentPostById(neighbors.prevId) : Promise.resolve(null),
  ]);

  const nextVideoUrl = getVideoUrl(nextPost);
  const prevVideoUrl = getVideoUrl(prevPost);

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: excerptText(post.content, 80) || `فيديو من ${post.authorName}`,
    description: excerptText(post.content, 180) || "فيديو منشور على دريبدو",
    uploadDate: post.createdAt || new Date().toISOString(),
    contentUrl: videoUrl,
    embedUrl: `${site.url}/video/${post.id}`,
    publisher: {
      "@type": "Organization",
      name: site.nameAr,
      url: site.url,
    },
  };

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 bg-slate-100 px-2 pb-16 pt-4 sm:px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <Link href="/moments" className="font-semibold text-blue-700 hover:underline">العودة إلى الواجهة</Link>
            <span>{formatDate(post.createdAt)}</span>
          </div>

          <h1 className="mb-2 text-base font-bold text-slate-900"><RichMomentText text={excerptText(post.content, 90) || `فيديو من ${post.authorName}`} /></h1>

          <MomentsVideoPlayerClient src={videoUrl} nextSrc={nextVideoUrl} prevSrc={prevVideoUrl} nextId={neighbors.nextId} autoNext postId={post.id} userId={post.userId} />

          <ExpandablePostText text={post.content || ""} previewChars={190} className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800" />

          {Array.isArray(post.attachments) && post.attachments.length > 0 ? (
            <div className="mt-3 space-y-2">
              {post.attachments.map((file) => (
                <a key={file.id || file.fileUrl} href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs hover:bg-slate-100">
                  <span className="max-w-[70%] truncate font-semibold text-slate-700">{file.fileName || "ملف مرفق"}</span>
                  <span className="text-slate-500">فتح الملف</span>
                </a>
              ))}
            </div>
          ) : null}

          <VideoPagerClient prevId={neighbors.prevId} nextId={neighbors.nextId} />

          <div className="mt-1 text-center text-[11px] text-slate-500">{neighbors.index >= 0 ? `${neighbors.index + 1} / ${neighbors.total}` : ""}</div>
        </div>

        <MomentsPostActions postId={post.id} postContent={post.content || ""} sharePath={`/video/${post.id}`} />
      </article>
    </div>
  );
}



