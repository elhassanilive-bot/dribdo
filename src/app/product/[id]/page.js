import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, site } from "@/config/site";
import { getMarketProductById } from "@/lib/market/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function excerpt(text, limit = 170) {
  const value = String(text || "").trim().replace(/\s+/g, " ");
  if (!value) return "";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
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

function formatPrice(product) {
  if (product?.isFree) return "مجاني";
  const amount = Number(product?.price || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "السعر عند الاتفاق";
  const currency = String(product?.currency || "MAD").trim() || "MAD";
  const fixed = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
  return `${fixed} ${currency}`;
}

function firstImage(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  return images.find((url) => String(url || "").trim()) || "";
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) return {};

  const product = await getMarketProductById(id);
  if (!product) {
    return {
      title: "منتج غير موجود",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.title || "منتج"} | السوق في دريبدو`;
  const description = excerpt(product.description, 180) || `منتج معروض في سوق دريبدو بسعر ${formatPrice(product)}.`;
  const canonical = `/product/${product.id}`;
  const image = firstImage(product) || absoluteUrl(site.defaultOgImage);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: image ? [{ url: image, alt: product.title || "منتج" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) notFound();

  const product = await getMarketProductById(id);
  if (!product) notFound();

  const pageUrl = `${site.url}/product/${product.id}`;
  const image = firstImage(product) || absoluteUrl(site.defaultOgImage);
  const description = excerpt(product.description, 260) || "منتج معروض في سوق دريبدو.";
  const location = [String(product.city || "").trim(), String(product.country || "").trim()].filter(Boolean).join("، ");

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title || "منتج",
    description,
    image: product.images || (image ? [image] : undefined),
    sku: product.id,
    category: product.categoryName || undefined,
    brand: {
      "@type": "Brand",
      name: "Dribdo",
    },
    offers: {
      "@type": "Offer",
      url: pageUrl,
      availability: "https://schema.org/InStock",
      priceCurrency: product.currency || "MAD",
      price: Number(product.price || 0),
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "Person",
        name: product.sellerName || "مستخدم",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: site.url },
      { "@type": "ListItem", position: 2, name: "اللحظات", item: `${site.url}/moments` },
      { "@type": "ListItem", position: 3, name: "السوق", item: `${site.url}/moments` },
      { "@type": "ListItem", position: 4, name: product.title || "منتج", item: pageUrl },
    ],
  };

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-3 pb-14 pt-6 sm:px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/moments" className="font-semibold text-slate-700 hover:text-blue-700">اللحظات</Link>
        <span>/</span>
        <span className="text-slate-400">السوق</span>
      </nav>

      <article className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{product.title || "منتج"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{formatPrice(product)}</span>
            {product.categoryName ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{product.categoryName}</span> : null}
            {location ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{location}</span> : null}
            <time dateTime={product.createdAt}>{formatDate(product.createdAt)}</time>
          </div>
        </header>

        {image ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img src={image} alt={product.title || "منتج"} className="h-auto max-h-[520px] w-full object-cover" loading="eager" />
          </div>
        ) : null}

        {product.description ? (
          <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 px-4 py-4 text-[1.02rem] leading-8 text-slate-800">
            {product.description}
          </div>
        ) : null}

        <section className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">البائع: {product.sellerName || "مستخدم"}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">المشاهدات: {Number(product.viewsCount || 0)}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">المفضلة: {Number(product.favoritesCount || 0)}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الرابط: <a href={pageUrl} className="font-semibold text-blue-700 hover:underline">{pageUrl}</a></div>
        </section>
      </article>
    </div>
  );
}

