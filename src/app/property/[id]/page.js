import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, site } from "@/config/site";
import { getRealEstatePropertyById } from "@/lib/real-estate/properties";

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

function formatPrice(item) {
  const amount = Number(item?.price || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "السعر عند الاتفاق";
  const currency = String(item?.currency || "MAD").trim() || "MAD";
  return `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)} ${currency}`;
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) return {};

  const property = await getRealEstatePropertyById(id);
  if (!property) return { title: "عقار غير موجود", robots: { index: false, follow: false } };

  const title = `${property.title || "عقار"} | عقارات دريبدو`;
  const description = excerpt(property.description, 180) || "عقار معروض في قسم العقارات على دريبدو.";
  const canonical = `/property/${property.id}`;
  const image = String(property?.images?.[0] || "").trim() || absoluteUrl(site.defaultOgImage);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", images: image ? [{ url: image, alt: property.title || "عقار" }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function PropertyPage({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) notFound();

  const property = await getRealEstatePropertyById(id);
  if (!property) notFound();

  const pageUrl = `${site.url}/property/${property.id}`;
  const image = String(property?.images?.[0] || "").trim() || absoluteUrl(site.defaultOgImage);

  const propertySchema = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title || "عقار",
    description: excerpt(property.description, 260) || "عقار معروض في دريبدو.",
    image: property.images || (image ? [image] : undefined),
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: property.currency || "MAD",
      price: Number(property.price || 0),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-3 pb-14 pt-6 sm:px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }} />
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/moments" className="font-semibold text-slate-700 hover:text-blue-700">اللحظات</Link><span>/</span><span className="text-slate-400">العقارات</span>
      </nav>
      <article className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{property.title || "عقار"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{formatPrice(property)}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.city || ""} {property.country ? `، ${property.country}` : ""}</span>
            <time dateTime={property.createdAt}>{formatDate(property.createdAt)}</time>
          </div>
        </header>
        {image ? <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"><img src={image} alt={property.title || "عقار"} className="h-auto max-h-[520px] w-full object-cover" loading="eager" /></div> : null}
        {property.description ? <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 px-4 py-4 text-[1.02rem] leading-8 text-slate-800">{property.description}</div> : null}
        <section className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">نوع العقار: {property.propertyType || "-"}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الغرض: {property.purpose || "-"}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">عدد الغرف: {Number(property.bedrooms || 0)}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الرابط: <a href={pageUrl} className="font-semibold text-blue-700 hover:underline">{pageUrl}</a></div>
        </section>
      </article>
    </div>
  );
}