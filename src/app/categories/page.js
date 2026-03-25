import Link from "next/link";
import { listPostCategories } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "التصنيفات",
  description: "استعرض تصنيفات أرزابريس وانتقل مباشرة إلى أرشيف المقالات داخل كل تصنيف.",
  alternates: { canonical: "/categories" },
};

function buildCategoryHref(category) {
  const params = new URLSearchParams();
  params.set("category", category);
  return `/?${params.toString()}`;
}

export default async function CategoriesPage() {
  const { categories, error } = await listPostCategories();
  const sorted = [...(categories || [])].sort((a, b) => a.localeCompare(b, "ar"));

  return (
    <div className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/45">استعرض الأقسام</p>
            <h1 className="mt-3 text-4xl font-black">التصنيفات</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
              اختر التصنيف الذي تريد، وسيتم نقلك مباشرة إلى صفحة المقالات داخل هذا التصنيف.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-right text-sm text-rose-900">
            حدث خطأ أثناء جلب التصنيفات: {error}
          </div>
        ) : null}

        {!sorted.length && !error ? (
          <div className="rounded-3xl border border-black/10 bg-white px-6 py-10 text-right">
            لا توجد تصنيفات بعد. بمجرد نشر المقالات ستظهر التصنيفات هنا تلقائيا.
          </div>
        ) : null}

        {sorted.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((category) => (
              <Link
                key={category}
                href={buildCategoryHref(category)}
                className="group rounded-3xl border border-black/10 bg-white p-6 text-right shadow-sm transition hover:border-red-200 hover:shadow-md"
              >
                <div className="text-sm font-extrabold text-slate-950 group-hover:text-red-700">{category}</div>
                <div className="mt-2 text-xs leading-6 text-black/55">تصفح مقالات هذا التصنيف</div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

