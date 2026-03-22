import Link from "next/link";
import { SECRET_ADMIN_BLOG_PATH, SECRET_ADMIN_REPORTS_PATH } from "@/lib/admin/paths";

export const metadata = {
  title: "لوحة الأدمن",
  description: "لوحة إدارة موقع دريبدو.",
  robots: { index: false, follow: false },
};

export default function AdminHome() {
  return (
    <div className="w-full">
      <section className="w-full bg-gradient-to-br from-red-50 to-rose-100 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900">لوحة الأدمن</h1>
          <p className="mt-4 text-xl text-gray-700">لوحة إدارة المقالات والبلاغات.</p>
        </div>
      </section>

      <section className="w-full bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10">
              <h2 className="text-3xl font-bold text-gray-900">المدونة</h2>
              <p className="mt-3 leading-relaxed text-gray-700">إنشاء وكتابة ونشر المقالات من لوحة التحرير.</p>
              <div className="mt-8 flex gap-4">
                <Link
                  href={SECRET_ADMIN_BLOG_PATH}
                  className="inline-flex items-center justify-center rounded-lg bg-red-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-800"
                >
                  محرر المقالات
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 font-semibold text-gray-900 transition-colors"
                >
                  عرض المدونة
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10">
              <h2 className="text-3xl font-bold text-gray-900">بلاغات التعليقات</h2>
              <p className="mt-3 leading-relaxed text-gray-700">مراجعة البلاغات واتخاذ الإجراء المناسب.</p>
              <div className="mt-8 flex gap-4">
                <Link
                  href={SECRET_ADMIN_REPORTS_PATH}
                  className="inline-flex items-center justify-center rounded-lg bg-red-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-800"
                >
                  مراجعة البلاغات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
