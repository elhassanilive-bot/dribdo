import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, site } from "@/config/site";
import { getCharityItemById } from "@/lib/charity/items";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function excerpt(text, limit = 180) {
  const value = String(text || "").trim().replace(/\s+/g, " ");
  if (!value) return "";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
  } catch {
    return d.toISOString();
  }
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) return {};

  const item = await getCharityItemById(id);
  if (!item) return { title: "حالة غير موجودة", robots: { index: false, follow: false } };

  const title = `${item.title || "حالة صدقة"} | الصدقات في دريبدو`;
  const description = excerpt(item.description, 180) || "حالة صدقة منشورة في دريبدو.";
  const canonical = `/charity/${item.id}`;
  const image = String(item?.images?.[0] || "").trim() || absoluteUrl(site.defaultOgImage);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", images: image ? [{ url: image, alt: item.title || "حالة صدقة" }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function CharityPage({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) notFound();

  const item = await getCharityItemById(id);
  if (!item) notFound();

  const pageUrl = `${site.url}/charity/${item.id}`;
  const image = String(item?.images?.[0] || "").trim() || absoluteUrl(site.defaultOgImage);

  const schema = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: item.title || "حالة صدقة",
    description: excerpt(item.description, 260) || "حالة صدقة منشورة في دريبدو.",
    datePublished: item.createdAt || undefined,
    image: item.images || (image ? [image] : undefined),
    author: { "@type": "Person", name: item.userName || "مستخدم" },
    url: pageUrl,
  };

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-3 pb-14 pt-6 sm:px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/moments" className="font-semibold text-slate-700 hover:text-blue-700">اللحظات</Link><span>/</span><span className="text-slate-400">الصدقات</span>
      </nav>
      <article className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{item.title || "حالة صدقة"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{item.type === "request" ? "طلب مساعدة" : item.type === "urgent" ? "حالة طارئة" : "تبرع"}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{item.city || ""} {item.country ? `، ${item.country}` : ""}</span>
            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </div>
        </header>
        {image ? <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"><img src={image} alt={item.title || "حالة صدقة"} className="h-auto max-h-[520px] w-full object-cover" loading="eager" /></div> : null}
        {item.description ? <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 px-4 py-4 text-[1.02rem] leading-8 text-slate-800">{item.description}</div> : null}
        <section className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الناشر: {item.userName || "مستخدم"}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الاهتمام: {Number(item.interestCount || 0)}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الفئة: {item.category || "-"}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الرابط: <a href={pageUrl} className="font-semibold text-blue-700 hover:underline">{pageUrl}</a></div>
        </section>
      </article>
    </div>
  );
}