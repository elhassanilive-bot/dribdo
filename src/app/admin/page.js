import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";

export const metadata = {
  title: "لوحة الأدمن",
  description: "لوحة إدارة موقع دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

const ADMIN_SESSION_COOKIE = "dribdo_admin_blog_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function createAdminSessionValue(token) {
  const seed = process.env.NEXT_PUBLIC_SUPABASE_URL || "dribdo-admin";
  return createHash("sha256").update(`${seed}:${token}`).digest("hex");
}

function secureEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function hasValidAdminSession(cookieStore) {
  const expectedToken = process.env.BLOG_ADMIN_TOKEN || "";
  if (!expectedToken) return true;

  const cookieValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!cookieValue) return false;
  return secureEqual(cookieValue, createAdminSessionValue(expectedToken));
}

async function setAdminSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/admin",
  });
}

async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

function AdminGate({ loginAction, loginError }) {
  return (
    <div className="w-full">
      <section className="w-full bg-gradient-to-br from-red-50 to-rose-100 py-14 sm:py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">قفل لوحة الأدمن</h1>
            <p className="mt-3 text-gray-700 leading-relaxed">لا يمكن فتح صفحة الأدمن إلا بإدخال كلمة السر.</p>
            <form action={loginAction} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-900">كلمة السر</span>
                <input
                  name="adminToken"
                  type="password"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white"
                  placeholder="BLOG_ADMIN_TOKEN"
                />
              </label>
              {loginError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{loginError}</div>
              ) : null}
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                فتح القفل
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function AdminHome({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const loginError = resolvedSearchParams?.auth === "denied" ? "كلمة السر غير صحيحة." : null;
  const lockEnabled = Boolean(process.env.BLOG_ADMIN_TOKEN);
  const cookieStore = await cookies();
  const sessionValid = hasValidAdminSession(cookieStore);

  async function loginAction(formData) {
    "use server";
    const expectedToken = process.env.BLOG_ADMIN_TOKEN || "";
    const providedToken = String(formData.get("adminToken") || "");

    if (!expectedToken || providedToken === expectedToken) {
      if (expectedToken) await setAdminSessionCookie(expectedToken);
      redirect("/admin");
    }

    redirect("/admin?auth=denied");
  }

  async function logoutAction() {
    "use server";
    await clearAdminSessionCookie();
    redirect("/admin");
  }

  if (lockEnabled && !sessionValid) {
    return <AdminGate loginAction={loginAction} loginError={loginError} />;
  }

  return (
    <div className="w-full">
      <section className="w-full bg-gradient-to-br from-red-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <form action={logoutAction} className="mb-6 text-right">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-rose-300 hover:text-rose-700"
            >
              قفل الصفحة (تسجيل خروج)
            </button>
          </form>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">لوحة الأدمن</h1>
            <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">لوحة عامة مؤقتًا. لاحقًا يمكن تقييدها للمسؤول فقط.</p>
          </div>
        </div>
      </section>

      <section className="w-full py-14 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">المدونة</h2>
              <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">إنشاء وكتابة ونشر المقالات بمحرر متقدم مع معاينة فورية.</p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/admin/blog"
                  className="inline-flex items-center justify-center bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  محرر المقالات
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  عرض المدونة
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">بلاغات التعليقات</h2>
              <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                راجع البلاغات واتخذ الإجراء المناسب لإخفاء أو حذف التعليقات المخالفة.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/admin/reports"
                  className="inline-flex items-center justify-center bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  مراجعة البلاغات
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">إعدادات</h2>
              <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                هذا المكان مخصص لاحقًا لإعدادات الموقع (روابط السوشيال، البريد، SEO…).
              </p>
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                حاليًا الإعدادات موجودة في <code>.env.local</code> و <code>src/config/site.js</code>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
