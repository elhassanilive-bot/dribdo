"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!password.trim()) {
      setStatus({ type: "error", message: "أدخل كلمة مرور جديدة." });
      return;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setStatus({ type: "error", message: "Supabase غير مُعد." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: password.trim() });
    if (error) {
      setStatus({ type: "error", message: error.message || "تعذر تحديث كلمة المرور." });
      return;
    }

    setStatus({ type: "success", message: "تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول." });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-16">
      <form onSubmit={handleSubmit} className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.45)]">
        <h1 className="text-2xl font-black text-slate-950">تعيين كلمة مرور جديدة</h1>
        <p className="mt-2 text-sm text-slate-600">أدخل كلمة مرور جديدة لحسابك ثم احفظها.</p>

        <label className="mt-6 block text-sm font-semibold text-slate-900">
          كلمة المرور الجديدة
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
            required
          />
        </label>

        {status.message ? (
          <div className={status.type === "error" ? "mt-4 text-sm text-rose-600" : "mt-4 text-sm text-emerald-600"}>
            {status.message}
          </div>
        ) : null}

        <button
          type="submit"
          className="mt-6 inline-flex min-w-40 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)]"
        >
          حفظ كلمة المرور
        </button>
      </form>
    </div>
  );
}

