"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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

function avatarFor(name, explicit = "") {
  if (explicit) return explicit;
  const safe = encodeURIComponent(String(name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safe}&background=fee2e2&color=991b1b&size=96&bold=true`;
}

function ToolRow({ icon, title, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between border-b border-slate-200 px-2 py-2.5 text-right transition hover:bg-slate-50">
      <span className="text-sm font-semibold text-slate-800">{title}</span>
      <span className="inline-flex items-center gap-2">
        {icon}
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6"/></svg>
      </span>
    </button>
  );
}

export default function MomentsComposer({ onCreated }) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [bgColor, setBgColor] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [viewer, setViewer] = useState({ id: "", name: "", avatar: "" });

  const mediaInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const previewFiles = useMemo(
    () => selectedFiles.map((item) => ({ ...item, previewUrl: URL.createObjectURL(item.file) })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => previewFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }, [previewFiles]);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase || !active) return;

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("name,avatar_url").eq("id", user.id).maybeSingle();
      if (active) {
        setViewer({
          id: user.id,
          name: String(profile?.name || user.user_metadata?.name || "").trim() || "مستخدم",
          avatar: String(profile?.avatar_url || user.user_metadata?.avatar_url || "").trim(),
        });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function clearComposer() {
    setText("");
    setSelectedFiles([]);
    setIsAnonymous(false);
    setBgColor("");
  }

  function appendToText(snippet) {
    setText((current) => [current.trim(), snippet].filter(Boolean).join(" "));
  }

  function pickBackgroundColor() {
    const colors = ["#FDE68A", "#BFDBFE", "#FBCFE8", "#DCFCE7", "#E9D5FF", "#FECACA", ""];
    const idx = colors.indexOf(bgColor);
    const next = colors[(idx + 1) % colors.length];
    setBgColor(next);
    setStatus({ type: "success", message: next ? "تم تغيير لون الخلفية." : "تمت إزالة لون الخلفية." });
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
      normalized.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, mediaType });
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

        const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, item.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: item.file.type,
        });

        if (uploadError) {
          setStatus({ type: "error", message: uploadError.message || `تعذر رفع ${item.file.name}.` });
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
        is_anonymous: isAnonymous,
        ...(uploadedUrls.length > 0 ? { media_url: uploadedUrls[0], media_urls: uploadedUrls } : {}),
        ...(bgColor ? { custom_background_color: bgColor, bg_color: bgColor } : {}),
      };

      const { error: postError } = await supabase.from("posts").insert(payload);
      if (postError) {
        setStatus({ type: "error", message: postError.message || "تعذر إنشاء المنشور." });
        return;
      }

      clearComposer();
      setStatus({ type: "success", message: "تم نشر اللحظة بنجاح." });
      setIsOpen(false);
      onCreated?.();
    });
  }

  return (
    <section className="space-y-3">
      <div className="rounded-[1.7rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => mediaInputRef.current?.click()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50">
            <img src="/dribdo-assets/camera/camera.svg" alt="كاميرا" className="h-8 w-8" loading="lazy" />
          </button>
          <button type="button" onClick={() => setIsOpen(true)} className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-right text-lg text-slate-700 transition hover:bg-slate-50">
            ما جديدك اليوم؟
          </button>
          <img src={avatarFor(viewer.name, viewer.avatar)} alt={viewer.name || "مستخدم"} className="h-12 w-12 rounded-full border border-slate-200" loading="lazy" />
        </div>
      </div>

      <input ref={mediaInputRef} type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
      <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={handleFilesChange} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFilesChange} className="hidden" />

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/35 p-3 sm:p-6">
          <div className="mx-auto h-full w-full max-w-4xl overflow-hidden rounded-[2.2rem] bg-white">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
                <button type="submit" disabled={isPending} className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-70">التالي</button>

                <div className="text-center">
                  <h2 className="text-4xl font-black text-slate-900">إضافة منشور</h2>
                  <label className="mt-3 inline-flex items-center gap-2 text-xl font-semibold text-slate-700">
                    نشر بهوية مجهولة
                    <span className="relative inline-flex h-11 w-20 items-center rounded-full bg-slate-200 p-1">
                      <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="peer sr-only" />
                      <span className="h-9 w-9 rounded-full bg-slate-600 transition peer-checked:translate-x-9 peer-checked:bg-emerald-600" />
                    </span>
                  </label>
                </div>

                <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 text-slate-700 hover:bg-slate-100" aria-label="إغلاق">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="grid flex-1 grid-cols-1 overflow-hidden border-t border-slate-200 lg:grid-cols-[1fr_360px]">
                <div className="flex h-full flex-col">
                  <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    rows={7}
                    placeholder="ما الذي تريد مشاركته؟"
                    className="h-72 w-full resize-none border-b border-slate-200 px-6 py-6 text-3xl text-slate-700 outline-none placeholder:text-slate-400"
                    style={{ background: bgColor || "transparent" }}
                  />

                  {previewFiles.length > 0 ? (
                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                      {previewFiles.map((item) => (
                        <div key={item.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {item.mediaType === "image" ? (
                            <img src={item.previewUrl} alt={item.file.name} className="h-40 w-full object-cover" loading="lazy" />
                          ) : (
                            <video src={item.previewUrl} className="h-40 w-full object-cover" controls preload="metadata" />
                          )}
                          <button type="button" onClick={() => removeFile(item.id)} className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">حذف</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <aside className="overflow-y-auto border-r border-slate-200 p-3">
                  <ToolRow title="إضافة صورة" icon={<img src="/dribdo-assets/fels-posts/image.svg" alt="صورة" className="h-5 w-5" loading="lazy" />} onClick={() => mediaInputRef.current?.click()} />
                  <ToolRow title="إضافة فيديو" icon={<img src="/dribdo-assets/vedio/comment.svg" alt="فيديو" className="h-5 w-5" loading="lazy" />} onClick={() => videoInputRef.current?.click()} />
                  <ToolRow title="شعور ونشاط" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-pink-500" fill="currentColor"><path d="M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10Zm-4-8a1.5 1.5 0 1 0 0 3h8a1.5 1.5 0 1 0 0-3Zm.5-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>} onClick={() => appendToText("😊 أشعر بسعادة")} />
                  <ToolRow title="إشارة" icon={<span className="text-2xl font-bold text-blue-600">@</span>} onClick={() => appendToText("@")} />
                  <ToolRow title="الموقع" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-500" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg>} onClick={() => appendToText("📍")} />
                  <ToolRow title="رابط" icon={<img src="/dribdo-assets/published/copy-link.svg" alt="رابط" className="h-5 w-5" loading="lazy" />} onClick={() => appendToText("https://")} />
                  <ToolRow title="ملصقات" icon={<span className="text-xs font-bold text-cyan-500">GIF</span>} onClick={() => setStatus({ type: "success", message: "أضف GIF عبر رفع صورة متحركة." })} />
                  <ToolRow title="اختيار لون الخلفية" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-fuchsia-600" fill="currentColor"><path d="M12 3a9 9 0 0 0 0 18h1a4 4 0 0 0 0-8h-1a2 2 0 1 1 0-4h1a4 4 0 0 0 0-8Zm-5.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm3-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm3 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>} onClick={pickBackgroundColor} />
                  <ToolRow title="رفع ملف" icon={<img src="/dribdo-assets/published/save.svg" alt="ملف" className="h-5 w-5" loading="lazy" />} onClick={() => fileInputRef.current?.click()} />

                  {status.message ? (
                    <div className={["mt-3 rounded-xl border px-3 py-2 text-sm", status.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"].join(" ")}>
                      {status.message}
                    </div>
                  ) : null}
                </aside>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
