"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = "media";
const MAX_MEDIA_FILES = 6;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 120 * 1024 * 1024;

function normalizeMediaType(file) {
  if (String(file?.type || "").startsWith("image/")) return "image";
  if (String(file?.type || "").startsWith("video/")) return "video";
  return "";
}

function detectPostType(text, files) {
  if (!files.length) return "text";
  const hasVideo = files.some((item) => item.mediaType === "video");
  const hasImage = files.some((item) => item.mediaType === "image");
  if (hasVideo && !hasImage && !text.trim()) return "video";
  if (hasImage) return "image";
  return hasVideo ? "video" : "text";
}

export default function MomentsComposer({ onCreated }) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isPending, startTransition] = useTransition();

  const previewFiles = useMemo(
    () =>
      selectedFiles.map((item) => ({
        ...item,
        previewUrl: URL.createObjectURL(item.file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previewFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [previewFiles]);

  function clearComposer() {
    setText("");
    setSelectedFiles([]);
  }

  function handleFilesChange(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    const normalized = [];
    for (const file of files) {
      const mediaType = normalizeMediaType(file);
      if (!mediaType) {
        setStatus({ type: "error", message: "يمكنك رفع صور أو فيديو فقط." });
        return;
      }

      if (mediaType === "image" && file.size > MAX_IMAGE_SIZE) {
        setStatus({ type: "error", message: `الصورة ${file.name} أكبر من 10MB.` });
        return;
      }

      if (mediaType === "video" && file.size > MAX_VIDEO_SIZE) {
        setStatus({ type: "error", message: `الفيديو ${file.name} أكبر من 120MB.` });
        return;
      }

      normalized.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        mediaType,
      });
    }

    setSelectedFiles((current) => {
      const next = [...current, ...normalized].slice(0, MAX_MEDIA_FILES);
      if (current.length + normalized.length > MAX_MEDIA_FILES) {
        setStatus({ type: "error", message: `الحد الأقصى ${MAX_MEDIA_FILES} ملفات.` });
      } else {
        setStatus({ type: "", message: "" });
      }
      return next;
    });
  }

  function removeFile(fileId) {
    setSelectedFiles((current) => current.filter((item) => item.id !== fileId));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const trimmed = text.trim();
    if (!trimmed && selectedFiles.length === 0) {
      setStatus({ type: "error", message: "أضف نصًا أو وسائط قبل النشر." });
      return;
    }

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus({ type: "error", message: "Supabase غير مُعد." });
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user) {
        setStatus({ type: "error", message: "يجب تسجيل الدخول أولًا." });
        return;
      }

      const uploadedUrls = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const item = selectedFiles[index];
        const ext = (item.file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${user.id}/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext || "bin"}`;

        const { error: uploadError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, item.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: item.file.type,
          });

        if (uploadError) {
          setStatus({
            type: "error",
            message: uploadError.message || `تعذر رفع ${item.file.name}.`,
          });
          return;
        }

        const { data: urlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        const publicUrl = String(urlData?.publicUrl || "").trim();
        if (!publicUrl) {
          setStatus({ type: "error", message: "تعذر إنشاء رابط الوسائط." });
          return;
        }

        uploadedUrls.push(publicUrl);
      }

      const postType = detectPostType(trimmed, selectedFiles);
      const payload = {
        user_id: user.id,
        content: trimmed,
        type: postType,
        posts_privacy: "everyone",
        post_source_type: "user_post",
        ...(uploadedUrls.length > 0 ? { media_url: uploadedUrls[0], media_urls: uploadedUrls } : {}),
      };

      const { error: postError } = await supabase.from("posts").insert(payload);
      if (postError) {
        setStatus({ type: "error", message: postError.message || "تعذر إنشاء المنشور." });
        return;
      }

      clearComposer();
      setStatus({ type: "success", message: "تم نشر اللحظة بنجاح." });
      onCreated?.();
    });
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_65px_-45px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-black text-slate-950">أنشئ منشورًا</h2>
        <p className="mt-1 text-sm text-slate-600">نص، صور، فيديو. نفس نمط لحظات التطبيق.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          placeholder="ماذا يحدث الآن؟"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
        />

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            إضافة صور/فيديو
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-slate-500">حتى {MAX_MEDIA_FILES} ملفات.</span>
        </div>

        {previewFiles.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previewFiles.map((item) => (
              <div key={item.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {item.mediaType === "image" ? (
                  <img src={item.previewUrl} alt={item.file.name} className="h-36 w-full object-cover" loading="lazy" />
                ) : (
                  <video src={item.previewUrl} className="h-36 w-full object-cover" controls preload="metadata" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {status.message ? (
          <div
            className={[
              "rounded-xl border px-3 py-2 text-sm",
              status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {status.message}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "جارٍ النشر..." : "نشر"}
          </button>
        </div>
      </form>
    </section>
  );
}
