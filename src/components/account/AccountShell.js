"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

const AUTH_LINKS = [
  { key: "login", label: "تسجيل الدخول", href: "/login" },
  { key: "signup", label: "إنشاء حساب", href: "/signup" },
  { key: "reset", label: "استرجاع كلمة المرور", href: "/forgot-password" },
];

function modeToTab(mode) {
  if (mode === "signup") return "signup";
  if (mode === "forgot-password") return "reset";
  return "login";
}

function StatusMessage({ status }) {
  if (!status?.message) return null;
  const isError = status.type === "error";
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {status.message}
    </div>
  );
}

export default function AccountShell({ mode = "account" }) {
  const router = useRouter();
  const ready = useMemo(() => isSupabaseConfigured(), []);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [authTab, setAuthTab] = useState(modeToTab(mode));
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState({ type: "", message: "" });

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    setAuthTab(modeToTab(mode));
  }, [mode]);

  useEffect(() => {
    let active = true;
    let authSub = null;

    (async () => {
      if (!ready) {
        if (active) setLoading(false);
        return;
      }

      const supabase = await getSupabaseClient();
      if (!supabase) {
        if (active) setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (active) {
        setUser(data?.user || null);
        setLoading(false);
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      authSub = listener?.subscription || null;
    })();

    return () => {
      active = false;
      authSub?.unsubscribe?.();
    };
  }, [ready]);

  useEffect(() => {
    if (!user) return;
    setProfileName(String(user.user_metadata?.full_name || ""));
    setProfileEmail(user.email || "");
    setProfileAvatarUrl(String(user.user_metadata?.avatar_url || ""));
  }, [user]);

  useEffect(() => {
    if (!loading && user && mode !== "account") {
      router.replace("/account");
    }
  }, [loading, user, mode, router]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthStatus({ type: "", message: "" });

    const email = authEmail.trim();
    const password = authPassword.trim();

    if (!email) {
      setAuthStatus({ type: "error", message: "البريد الإلكتروني مطلوب." });
      return;
    }

    if (authTab !== "reset" && !password) {
      setAuthStatus({ type: "error", message: "كلمة المرور مطلوبة." });
      return;
    }

    if (authTab === "signup" && password.length < 6) {
      setAuthStatus({ type: "error", message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." });
      return;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setAuthStatus({ type: "error", message: "Supabase غير مُعد بعد." });
      return;
    }

    setAuthSubmitting(true);

    try {
      if (authTab === "signup") {
        const fullName = authName.trim();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || undefined } },
        });
        if (error) throw error;

        setAuthStatus({ type: "success", message: "تم إنشاء الحساب. تحقق من بريدك إذا كان التأكيد مفعلًا." });
        return;
      }

      if (authTab === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset` : undefined,
        });
        if (error) throw error;

        setAuthStatus({ type: "success", message: "تم إرسال رابط استرجاع كلمة المرور إلى بريدك." });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setAuthStatus({ type: "success", message: "تم تسجيل الدخول بنجاح." });
      setAuthPassword("");
      if (mode !== "account") router.replace("/account");
    } catch (error) {
      setAuthStatus({ type: "error", message: error?.message || "تعذرت العملية. حاول مرة أخرى." });
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileStatus({ type: "", message: "" });

    if (!user) {
      setProfileStatus({ type: "error", message: "يجب تسجيل الدخول أولا." });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileStatus({ type: "error", message: "الملف يجب أن يكون صورة." });
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setProfileStatus({ type: "error", message: "حجم الصورة كبير. الحد الأقصى 2MB." });
      return;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setProfileStatus({ type: "error", message: "تعذر الاتصال بخدمة التخزين." });
      return;
    }

    const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = extension.replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

    setAvatarUploading(true);
    setAvatarFileName(file.name);

    try {
      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("profile-avatars").getPublicUrl(filePath);
      const nextUrl = String(data?.publicUrl || "").trim();
      if (!nextUrl) throw new Error("تعذر إنشاء رابط الصورة.");

      setProfileAvatarUrl(nextUrl);
      setProfileStatus({ type: "success", message: "تم رفع الصورة. اضغط حفظ الملف الشخصي لتأكيدها." });
    } catch (error) {
      setProfileStatus({ type: "error", message: error?.message || "تعذر رفع الصورة." });
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  }

  async function handleUpdateProfile(event) {
    event.preventDefault();
    setProfileStatus({ type: "", message: "" });

    const supabase = await getSupabaseClient();
    if (!supabase || !user) {
      setProfileStatus({ type: "error", message: "لا يمكن تحديث الملف الشخصي الآن." });
      return;
    }

    const nextName = profileName.trim();
    const nextEmail = profileEmail.trim();
    const nextAvatar = profileAvatarUrl.trim();

    if (!nextEmail) {
      setProfileStatus({ type: "error", message: "البريد الإلكتروني مطلوب." });
      return;
    }

    setProfileSubmitting(true);

    try {
      const currentName = String(user.user_metadata?.full_name || "").trim();
      const currentEmail = String(user.email || "").trim();

      const updates = {
        data: {
          ...user.user_metadata,
          full_name: nextName,
          avatar_url: nextAvatar,
        },
      };

      if (nextEmail !== currentEmail) updates.email = nextEmail;

      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      if (data?.user) setUser(data.user);

      const emailChanged = nextEmail !== currentEmail;
      const nameChanged = nextName !== currentName;

      if (!emailChanged && !nameChanged) {
        setProfileStatus({ type: "success", message: "تم حفظ الصورة الشخصية والبيانات." });
      } else if (emailChanged) {
        setProfileStatus({ type: "success", message: "تم الحفظ. تحقق من بريدك لتأكيد العنوان الجديد إذا لزم." });
      } else {
        setProfileStatus({ type: "success", message: "تم تحديث الملف الشخصي بنجاح." });
      }
    } catch (error) {
      setProfileStatus({ type: "error", message: error?.message || "تعذر تحديث الملف الشخصي." });
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setPasswordStatus({ type: "", message: "" });

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setPasswordStatus({ type: "error", message: "أدخل كلمة المرور الجديدة وتأكيدها." });
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordStatus({ type: "error", message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل." });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordStatus({ type: "error", message: "تأكيد كلمة المرور غير مطابق." });
      return;
    }

    const supabase = await getSupabaseClient();
    if (!supabase || !user) {
      setPasswordStatus({ type: "error", message: "لا يمكن تغيير كلمة المرور الآن." });
      return;
    }

    setPasswordSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({ type: "success", message: "تم تحديث كلمة المرور بنجاح." });
    } catch (error) {
      setPasswordStatus({ type: "error", message: error?.message || "تعذر تحديث كلمة المرور." });
    } finally {
      setPasswordSubmitting(false);
    }
  }

  async function handleSignOut() {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthStatus({ type: "success", message: "تم تسجيل الخروج." });
  }

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
          Supabase Auth غير مُعد بعد. أضف الإعدادات داخل <code>.env.local</code>.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-5 text-slate-600">جارٍ تحميل الحساب...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-28 sm:px-6 lg:px-8">
      <section className="rounded-[2.5rem] border border-slate-200 bg-[linear-gradient(135deg,#fff5f5_0%,#ffffff_55%,#fff1f2_100%)] p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Dribdo Account</p>
        <h1 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">الحساب</h1>
        <p className="mt-2 text-sm text-slate-600">تسجيل دخول آمن وإدارة بيانات الحساب.</p>
      </section>

      {!user ? (
        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-45px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {AUTH_LINKS.map((tab) => {
              const active = authTab === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  onClick={() => setAuthTab(tab.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <form onSubmit={handleAuthSubmit} className="grid gap-4">
            {authTab === "signup" ? (
              <label className="block text-sm font-semibold text-slate-900">
                الاسم
                <input
                  type="text"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="اسمك"
                />
              </label>
            ) : null}

            <label className="block text-sm font-semibold text-slate-900">
              البريد الإلكتروني
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
                placeholder="name@example.com"
                required
              />
            </label>

            {authTab !== "reset" ? (
              <label className="block text-sm font-semibold text-slate-900">
                كلمة المرور
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </label>
            ) : null}

            <StatusMessage status={authStatus} />

            <button
              type="submit"
              disabled={authSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {authSubmitting
                ? "جارٍ التنفيذ..."
                : authTab === "signup"
                  ? "إنشاء حساب"
                  : authTab === "reset"
                    ? "إرسال رابط الاسترجاع"
                    : "تسجيل الدخول"}
            </button>
          </form>
        </section>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-45px_rgba(15,23,42,0.45)] sm:p-6">
            <h2 className="text-xl font-black text-slate-950">الملف الشخصي</h2>
            <p className="mt-1 text-sm text-slate-600">تعديل الاسم والبريد الإلكتروني والصورة الشخصية.</p>

            <form onSubmit={handleUpdateProfile} className="mt-5 grid gap-4">
              <label className="block text-sm font-semibold text-slate-900">
                الاسم
                <input
                  type="text"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="اسمك"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                البريد الإلكتروني
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(event) => setProfileEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
                  required
                />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">الصورة الشخصية</p>
                <p className="mt-1 text-xs text-slate-500">اختر صورة من جهازك (JPG/PNG/WEBP حتى 2MB).</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">
                    {avatarUploading ? "جارٍ الرفع..." : "رفع صورة"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={avatarUploading}
                    />
                  </label>
                  {avatarFileName ? <span className="text-xs text-slate-500">{avatarFileName}</span> : null}
                  {profileAvatarUrl ? (
                    <button
                      type="button"
                      onClick={() => setProfileAvatarUrl("")}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                    >
                      إزالة الصورة
                    </button>
                  ) : null}
                </div>
              </div>

              {profileAvatarUrl ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <img src={profileAvatarUrl} alt="الصورة الشخصية" className="h-12 w-12 rounded-full border border-slate-200 object-cover" />
                  <span className="text-xs text-slate-500">معاينة الصورة الشخصية</span>
                </div>
              ) : null}

              <StatusMessage status={profileStatus} />

              <button
                type="submit"
                disabled={profileSubmitting}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {profileSubmitting ? "جارٍ الحفظ..." : "حفظ الملف الشخصي"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-45px_rgba(15,23,42,0.45)] sm:p-6">
            <h2 className="text-xl font-black text-slate-950">الأمان</h2>
            <p className="mt-1 text-sm text-slate-600">تغيير كلمة المرور وتسجيل الخروج.</p>

            <form onSubmit={handleChangePassword} className="mt-5 grid gap-4">
              <label className="block text-sm font-semibold text-slate-900">
                كلمة المرور الجديدة
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                تأكيد كلمة المرور
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </label>

              <StatusMessage status={passwordStatus} />

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {passwordSubmitting ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              تسجيل الخروج
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
