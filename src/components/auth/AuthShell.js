"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

function BenefitIcon({ name, className = "" }) {
  if (name === "bookmark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          d="M6 3h12a2 2 0 0 1 2 2v17l-8-4-8 4V5a2 2 0 0 1 2-2z"
        />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          d="M12.1 21.2l-.1.1-.1-.1C7 16.9 4 14.1 4 10.8 4 8.6 5.6 7 7.8 7c1.4 0 2.8.7 3.6 1.8.8-1.1 2.2-1.8 3.6-1.8 2.2 0 3.8 1.6 3.8 3.8 0 3.3-3 6.1-7.8 10.4z"
        />
      </svg>
    );
  }

  if (name === "comment") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path fill="none" stroke="currentColor" strokeWidth="2" d="M4 5h16v11H8l-4 4V5z" />
      </svg>
    );
  }

  if (name === "publish") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path fill="none" stroke="currentColor" strokeWidth="2" d="M4 20h16" />
        <path fill="none" stroke="currentColor" strokeWidth="2" d="M14 4l6 6-10 10H4v-6L14 4z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 2l8 4v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4z" />
    </svg>
  );
}

function AuthTabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm font-bold transition",
        active ? "border-red-700 bg-red-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AuthShell({ initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function bindAuthState() {
      const supabase = await getSupabaseClient();
      if (!supabase || !active) return null;

      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (!active) return;
        if (event === "PASSWORD_RECOVERY") {
          setMode("reset");
          setRecoveryReady(true);
        }
      });

      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash.includes("type=recovery")) {
        setMode("reset");
        setRecoveryReady(true);
      }

      return () => data.subscription.unsubscribe();
    }

    const cleanupPromise = bindAuthState();

    return () => {
      active = false;
      Promise.resolve(cleanupPromise).then((cleanup) => cleanup && cleanup());
    };
  }, []);

  const pageTitle = useMemo(() => {
    if (mode === "signup") return "إنشاء حساب جديد";
    if (mode === "forgot") return "استعادة كلمة المرور";
    if (mode === "reset") return "تعيين كلمة مرور جديدة";
    return "تسجيل الدخول";
  }, [mode]);

  async function ensureProfile(supabase, user, fallbackName = "") {
    if (!user) return;
    const safeName =
      String(fallbackName || "").trim() ||
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "مستخدم جديد";

    await supabase.from("user_profiles").upsert(
      {
        id: user.id,
        email: user.email,
        display_name: safeName,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.avatar_url || null,
      },
      { onConflict: "id" }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");

    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("ربط Supabase غير متاح حاليا.");

      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        setMessage("تم تسجيل الدخول بنجاح. يمكنك الآن حفظ المقالات والتعليق والتفاعل وإدارة حسابك.");
        if (typeof window !== "undefined") window.location.href = "/account";
        return;
      }

      if (mode === "signup") {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth?mode=reset` : undefined;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: { display_name: displayName },
          },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await ensureProfile(supabase, data.user, displayName);
        }

        setMessage("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب إذا طُلب منك ذلك.");
        return;
      }

      if (mode === "forgot") {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth?mode=reset` : undefined;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (resetError) throw resetError;
        setMessage("أرسلنا لك رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
        return;
      }

      if (mode === "reset") {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setMessage("تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بها.");
        setRecoveryReady(false);
        setMode("signin");
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "تعذر تنفيذ العملية المطلوبة.");
    } finally {
      setPending(false);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-right text-amber-950">
          فعّل إعدادات Supabase أولا حتى يعمل تسجيل الدخول وإنشاء الحساب.
        </div>
      </section>
    );
  }

  const signupBenefits = [
    {
      icon: "bookmark",
      title: "حفظ المقالات للقراءة لاحقا",
      description: "احفظ ما يعجبك في قائمة خاصة داخل حسابك مع تنظيم بسيط.",
    },
    {
      icon: "heart",
      title: "الإعجاب والتفاعل",
      description: "تفاعل مع المقالات بنقرة واحدة واطّلع الجميع على عدد الإعجابات.",
    },
    {
      icon: "comment",
      title: "التعليقات والردود",
      description: "شارك رأيك وناقش الآخرين، مع إمكانية تعديل وحذف تعليقك.",
    },
    {
      icon: "publish",
      title: "نشر مقالات كمساهم",
      description: "ارسِل مقالاتك للمراجعة، وبعد القبول تظهر مباشرة في الموقع.",
    },
  ];

  return (
    <section dir="rtl" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.35)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[linear-gradient(160deg,#111827_0%,#1f2937_42%,#7f1d1d_100%)] p-8 text-right text-white sm:p-10">
          <div className="text-xs font-extrabold tracking-[0.22em] text-red-300">ARZAPRESS ACCOUNT</div>
          <h1 className="mt-5 text-4xl font-black leading-[1.4]">جريدة الكترونية متعددة المجالات بكل الأنواع</h1>
          <p className="mt-5 text-base leading-8 text-white/80">
            أنشئ حسابك أو سجل الدخول ثم علّق باسمك وصورتك، واحفظ المقالات وتابع نشاطك من صفحة الحساب.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/82">
            <div>بريد إلكتروني آمن</div>
            <div>اسم ظاهر وصورة ملف شخصي</div>
            <div>إدارة كلمة المرور والبريد من صفحة الحساب</div>
          </div>
        </div>

        <div className="p-6 text-right sm:p-10">
          <div className="flex flex-wrap gap-2">
            <AuthTabButton active={mode === "signin"} onClick={() => setMode("signin")}>
              تسجيل الدخول
            </AuthTabButton>
            <AuthTabButton active={mode === "signup"} onClick={() => setMode("signup")}>
              إنشاء حساب
            </AuthTabButton>
            <AuthTabButton active={mode === "forgot"} onClick={() => setMode("forgot")}>
              استعادة كلمة المرور
            </AuthTabButton>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold text-slate-500">بوابة المستخدم</div>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{pageTitle}</h2>
          </div>

          {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">{message}</div> : null}
          {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">{error}</div> : null}

          {mode === "signup" ? (
            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-right">
                  <div className="text-[11px] font-extrabold tracking-[0.16em] text-red-700">مزايا الحساب</div>
                  <div className="mt-1 text-lg font-black text-slate-950">أنشئ حسابك لتحصل على</div>
                </div>
                <span className="h-5 w-1 shrink-0 bg-red-700" />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {signupBenefits.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-right">
                    <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <BenefitIcon name={item.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-950">{item.title}</div>
                      <div className="mt-1 text-xs leading-6 text-slate-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">الاسم الظاهر</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="الاسم الذي سيظهر في التعليقات"
                />
              </label>
            ) : null}

            {mode !== "reset" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">البريد الإلكتروني</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="name@example.com"
                />
              </label>
            ) : null}

            {mode !== "forgot" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">{mode === "reset" ? "كلمة المرور الجديدة" : "كلمة المرور"}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-red-300 focus:bg-white"
                  placeholder="••••••••"
                />
              </label>
            ) : null}

            {mode === "reset" && !recoveryReady ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-950">
                افتح رابط الاستعادة من بريدك الإلكتروني أولا، وبعدها ستظهر هنا خانة تعيين كلمة المرور الجديدة.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={pending || (mode === "reset" && !recoveryReady)}
              className="inline-flex min-w-40 items-center justify-center rounded-full bg-red-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "جارٍ التنفيذ..." : pageTitle}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            بعد تسجيل الدخول يمكنك إدارة حسابك من{" "}
            <Link href="/account" className="font-semibold text-red-700">
              صفحة الحساب
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
}
