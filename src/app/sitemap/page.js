import Link from "next/link";

export const metadata = {
  title: "خريطة الموقع",
  description: "خريطة موقع HTML لصفحات أرزابريس الأساسية.",
  alternates: { canonical: "/sitemap" },
};

const staticLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/archive", label: "جميع المقالات (الأرشيف)" },
  { href: "/categories", label: "التصنيفات" },
  { href: "/contributors", label: "المساهمون" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "اتصل بنا" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/help-center", label: "مركز المساعدة" },
  { href: "/complaints", label: "الإبلاغ عن مشكلة / بلاغ محتوى" },
  { href: "/privacy", label: "سياسة الخصوصية" },
  { href: "/terms", label: "شروط الاستخدام" },
  { href: "/comment-policy", label: "سياسة التعليقات" },
  { href: "/contributor-policy", label: "سياسة النشر للمساهمين" },
  { href: "/disclaimer", label: "إخلاء المسؤولية" },
  { href: "/dmca", label: "حقوق النشر (DMCA)" },
];

export default function HtmlSitemapPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/45">روابط</p>
            <h1 className="mt-3 text-4xl font-black">خريطة الموقع</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">قائمة مختصرة بأهم صفحات الموقع لتسهيل التصفح.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {staticLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-right text-sm font-semibold text-slate-950 shadow-sm transition hover:border-red-200 hover:text-red-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

