"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AdminOwnerGate({ authorizeAction, title = "دخول لوحة الإدارة", description }) {
  const formRef = useRef(null);
  const [accessToken, setAccessToken] = useState("");
  const [status, setStatus] = useState("جارٍ التحقق من الحساب...");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        if (!active) return;
        setStatus("");
        setError("Supabase غير مهيأ على الواجهة.");
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;

      if (sessionError || !data?.session?.access_token) {
        setStatus("");
        setError("يجب تسجيل الدخول أولًا بالحساب المالك.");
        return;
      }

      setAccessToken(data.session.access_token);
      setStatus("تم العثور على جلسة صالحة. جارٍ فتح لوحة الإدارة...");

      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 50);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)] sm:p-8">
          <h1 className="text-2xl font-black text-slate-950">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {description || "هذه الصفحة لا تظهر إلا لصاحب الحساب المخول. يجب أن تكون مسجل الدخول بنفس الحساب."}
          </p>
          <form ref={formRef} action={authorizeAction} className="mt-6 space-y-4">
            <input type="hidden" name="accessToken" value={accessToken} />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {status || "بانتظار الجلسة..."}
            </div>
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={!accessToken}
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              فتح الإدارة
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
