import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { getJobProfileById } from "@/lib/jobs/profiles";

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

function formatSalary(item) {
  const min = Number(item?.expectedSalaryMin || 0);
  const max = Number(item?.expectedSalaryMax || 0);
  const currency = String(item?.salaryCurrency || "MAD").trim() || "MAD";
  if (min > 0 && max > 0) return `${min.toFixed(0)} - ${max.toFixed(0)} ${currency}`;
  if (min > 0) return `من ${min.toFixed(0)} ${currency}`;
  if (max > 0) return `حتى ${max.toFixed(0)} ${currency}`;
  return item?.salaryNegotiable ? "قابل للتفاوض" : "غير محدد";
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) return {};

  const profile = await getJobProfileById(id);
  if (!profile) return { title: "وظيفة غير موجودة", robots: { index: false, follow: false } };

  const title = `${profile.fullName || "مستخدم"} - ${profile.jobTitle || "ملف وظيفي"} | وظائف دريبدو`;
  const description = excerpt(profile.bio, 180) || "ملف وظيفي معروض في قسم الوظائف على دريبدو.";
  const canonical = `/job/${profile.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function JobPage({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) notFound();

  const profile = await getJobProfileById(id);
  if (!profile) notFound();

  const pageUrl = `${site.url}/job/${profile.id}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName || "مستخدم",
    jobTitle: profile.jobTitle || undefined,
    description: excerpt(profile.bio, 260) || "ملف وظيفي في دريبدو.",
    url: pageUrl,
  };

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-3 pb-14 pt-6 sm:px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/moments" className="font-semibold text-slate-700 hover:text-blue-700">اللحظات</Link><span>/</span><span className="text-slate-400">الوظائف</span>
      </nav>
      <article className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{profile.fullName || "مستخدم"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{profile.jobTitle || "ملف وظيفي"}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatSalary(profile)}</span>
            <time dateTime={profile.createdAt}>{formatDate(profile.createdAt)}</time>
          </div>
        </header>
        {profile.bio ? <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 px-4 py-4 text-[1.02rem] leading-8 text-slate-800">{profile.bio}</div> : null}
        <section className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">المدينة: {profile.locationCity || "-"}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الدولة: {profile.locationCountry || "-"}</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الخبرة: {Number(profile.experienceYears || 0)} سنة</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">الرابط: <a href={pageUrl} className="font-semibold text-blue-700 hover:underline">{pageUrl}</a></div>
        </section>
      </article>
    </div>
  );
}