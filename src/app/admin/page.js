import Link from "next/link";
import { redirect } from "next/navigation";
import AdminOwnerGate from "@/components/admin/AdminOwnerGate";
import { clearAdminSessionCookie, hasValidAdminSession, setAdminSessionCookie, validateAdminAccessToken } from "@/lib/admin/access";

export const metadata = {
  title: "لوحة الأدمن",
  description: "لوحة إدارة موقع دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

function buildAdminErrorMessage(searchParams) {
  if (searchParams?.auth !== "denied") return null;

  const details = [];
  if (searchParams?.reason === "email_mismatch") {
    if (searchParams?.uid) details.push(`المعرف الحالي: ${searchParams.uid}`);
    if (searchParams?.expected) details.push(`البريد المسموح: ${searchParams.expected}`);
    if (searchParams?.email) details.push(`البريد الحالي: ${searchParams.email}`);
  }

  return details.length
    ? `هذا الحساب غير مخول للوصول إلى لوحة الإدارة. ${details.join(" | ")}`
    : "هذا الحساب غير مخول للوصول إلى لوحة الإدارة.";
}

export default async function AdminHome({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const loginError = buildAdminErrorMessage(resolvedSearchParams);
  const sessionValid = await hasValidAdminSession();

  async function authorizeAction(formData) {
    "use server";

    const result = await validateAdminAccessToken(formData.get("accessToken"));
    if (!result.ok) {
      if (result.code === "email_mismatch") {
        const uid = encodeURIComponent(result.actualUserId || "");
        const expected = encodeURIComponent(result.expectedEmail || "");
        const email = encodeURIComponent(result.actualEmail || "");
        redirect(`/admin?auth=denied&reason=email_mismatch&uid=${uid}&expected=${expected}&email=${email}`);
      }

      redirect("/admin?auth=denied");
    }

    await setAdminSessionCookie();
    redirect("/admin");
  }

  async function logoutAction() {
    "use server";
    await clearAdminSessionCookie();
    redirect("/admin");
  }

  if (!sessionValid) {
    return (
      <div className="w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 28%,#f8fafc_100%)]">
        <AdminOwnerGate
          authorizeAction={authorizeAction}
          title="دخول لوحة الأدمن"
          description={loginError || "هذه الصفحة تظهر فقط عند تسجيل الدخول بالحساب المالك."}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="w-full bg-gradient-to-br from-red-50 to-rose-100 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <form action={logoutAction} className="mb-6 text-right">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-rose-300 hover:text-rose-700"
            >
              قفل الصفحة
            </button>
          </form>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900">لوحة الأدمن</h1>
            <p className="mt-4 text-xl text-gray-700">الوصول مقصور على حساب المالك فقط.</p>
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10">
              <h2 className="text-3xl font-bold text-gray-900">المدونة</h2>
              <p className="mt-3 leading-relaxed text-gray-700">إنشاء وكتابة ونشر المقالات من لوحة التحرير.</p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/admin/blog"
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
                  href="/admin/reports"
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

