"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!password.trim() || !confirmPassword.trim()) {
      setStatus({ type: "error", message: "أدخل كلمة المرور الجديدة وتأكيدها." });
      return;
    }

    if (password.trim().length < 6) {
      setStatus({ type: "error", message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." });
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setStatus({ type: "error", message: "تأكيد كلمة المرور غير مطابق." });
      return;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setStatus({ type: "error", message: "Supabase غير مُعد بعد." });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password.trim() });
      if (error) throw error;
      setStatus({ type: "success", message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول." });
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus({ type: "error", message: error?.message || "تعذر تحديث كلمة المرور." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-24">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.45)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Reset Password</p>
        <h1 className="mt-3 text-2xl font-black text-slate-950">تعيين كلمة مرور جديدة</h1>
        <p className="mt-2 text-sm text-slate-600">بعد فتح رابط الاسترجاع من البريد، أدخل كلمة مرور جديدة هنا.</p>

        <label className="mt-6 block text-sm font-semibold text-slate-900">
          كلمة المرور الجديدة
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
            required
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-900">
          تأكيد كلمة المرور
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:bg-white"
            required
          />
        </label>

        {status.message ? (
          <div
            className={`mt-4 rounded-xl border px-4 py-2 text-sm ${
              status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex min-w-40 items-center justify-center rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
        </button>
      </form>
    </div>
  );
}
