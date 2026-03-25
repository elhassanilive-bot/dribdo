import Link from "next/link";

import { listCategorySummaries } from "@/lib/blog/posts";
import { formatCategoryLabel } from "@/lib/blog/render";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "التصنيفات | أرزابريس",
  description: "استعرض جميع التصنيفات الحقيقية الموجودة في أرزابريس وانتقل مباشرة إلى أرشيف المقالات داخل كل تصنيف.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await listCategorySummaries({ limit: 400 });

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/45">استعرض الأقسام</p>
            <h1 className="mt-3 text-4xl font-black">التصنيفات</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
              اختر التصنيف الذي تريد، وسيتم نقلك مباشرة إلى صفحة المدونة داخل هذا التصنيف.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {!categories.length ? (
          <div className="rounded-3xl border border-black/10 bg-white px-6 py-10 text-right">
            لا توجد تصنيفات بعد. بمجرد نشر المقالات ستظهر التصنيفات هنا تلقائياً.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog/category/${category.slug}`}
                className="group rounded-3xl border border-black/10 bg-white p-6 text-right shadow-sm transition hover:border-red-200 hover:shadow-md"
              >
                <div className="text-sm font-extrabold text-slate-950 group-hover:text-red-700">
                  {formatCategoryLabel(category.name)}
                </div>
                <div className="mt-2 text-xs leading-6 text-black/55">عدد المقالات: {category.count}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
