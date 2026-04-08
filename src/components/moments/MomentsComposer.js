"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = "media";
const MAX_MEDIA_FILES = 6;
const MAX_DOC_FILES = 6;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 120 * 1024 * 1024;
const MAX_DOC_SIZE = 30 * 1024 * 1024;

const STICKER_PACK = [
  { id: "st-1", label: "ملصق 1", url: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif" },
  { id: "st-2", label: "ملصق 2", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" },
  { id: "st-3", label: "ملصق 3", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
  { id: "st-4", label: "ملصق 4", url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif" },
  { id: "st-5", label: "ملصق 5", url: "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif" },
  { id: "st-6", label: "ملصق 6", url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif" },
  { id: "st-7", label: "ملصق 7", url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" },
  { id: "st-8", label: "ملصق 8", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
  { id: "st-9", label: "ملصق 9", url: "https://media.giphy.com/media/l46CkATpdyLwLI7vi/giphy.gif" },
  { id: "st-10", label: "ملصق 10", url: "https://media.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy.gif" },
  { id: "st-11", label: "ملصق 11", url: "https://media.giphy.com/media/3ohs7KViF6rA4aan5u/giphy.gif" },
  { id: "st-12", label: "ملصق 12", url: "https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif" },
];

const DOC_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.zip,.rar,.7z,.json,.xml,.md";

function normalizeMediaType(file) {
  if (String(file?.type || "").startsWith("image/")) return "image";
  if (String(file?.type || "").startsWith("video/")) return "video";
  return "";
}

function normalizeDocType(file) {
  const type = String(file?.type || "").toLowerCase();
  const name = String(file?.name || "").toLowerCase();
  if (
    type.includes("pdf") ||
    type.includes("officedocument") ||
    type.includes("msword") ||
    type.includes("excel") ||
    type.includes("powerpoint") ||
    type.includes("text") ||
    type.includes("csv") ||
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("7z")
  ) return true;

  return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv|zip|rar|7z|json|xml|md)$/i.test(name);
}

function detectPostType(text, files, sticker) {
  const hasMedia = files.length > 0 || Boolean(sticker);
  if (!hasMedia) return "text";
  const hasVideo = files.some((item) => item.mediaType === "video");
  const hasImage = files.some((item) => item.mediaType === "image") || Boolean(sticker);
  if (hasVideo && !hasImage && !text.trim()) return "video";
  if (hasImage) return "image";
  return hasVideo ? "video" : "text";
}

function avatarFor(name, explicit = "") {
  if (explicit) return explicit;
  const safe = encodeURIComponent(String(name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safe}&background=fee2e2&color=991b1b&size=96&bold=true`;
}

function cleanUsername(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function ensureHttp(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
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
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [attachedLinks, setAttachedLinks] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [bgColor, setBgColor] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [viewer, setViewer] = useState({ id: "", name: "", avatar: "" });

  const [linkDraft, setLinkDraft] = useState("");
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false);

  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [stickerSearch, setStickerSearch] = useState("");

  const [isMentionPickerOpen, setIsMentionPickerOpen] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionUsers, setMentionUsers] = useState([]);

  const mediaInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const previewFiles = useMemo(
    () => selectedFiles.map((item) => ({ ...item, previewUrl: URL.createObjectURL(item.file) })),
    [selectedFiles]
  );

  useEffect(() => () => {
    previewFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
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

    return () => { active = false; };
  }, []);

  function clearComposer() {
    setText("");
    setSelectedFiles([]);
    setSelectedDocs([]);
    setAttachedLinks([]);
    setSelectedSticker(null);
    setIsAnonymous(false);
    setBgColor("");
    setLinkDraft("");
    setMentionSearch("");
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
        setStatus({ type: "error", message: `الحد الأقصى ${MAX_MEDIA_FILES} ملفات وسائط.` });
      } else {
        setStatus({ type: "", message: "" });
      }
      return next;
    });
  }

  function handleDocFilesChange(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const normalized = [];
    for (const file of files) {
      if (!normalizeDocType(file)) {
        setStatus({ type: "error", message: `الملف ${file.name} ليس مستندًا مدعومًا.` });
        return;
      }
      if (Number(file.size || 0) > MAX_DOC_SIZE) {
        setStatus({ type: "error", message: `الملف ${file.name} أكبر من 30MB.` });
        return;
      }
      normalized.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file });
    }

    setSelectedDocs((current) => {
      const next = [...current, ...normalized].slice(0, MAX_DOC_FILES);
      if (current.length + normalized.length > MAX_DOC_FILES) {
        setStatus({ type: "error", message: `الحد الأقصى ${MAX_DOC_FILES} مستندات.` });
      } else {
        setStatus({ type: "", message: "" });
      }
      return next;
    });
  }

  function removeFile(fileId) {
    setSelectedFiles((current) => current.filter((item) => item.id !== fileId));
  }

  function removeDoc(fileId) {
    setSelectedDocs((current) => current.filter((item) => item.id !== fileId));
  }

  function removeLink(index) {
    setAttachedLinks((current) => current.filter((_, idx) => idx !== index));
  }

  function applyLink() {
    const cleaned = ensureHttp(linkDraft);
    if (!cleaned) {
      setStatus({ type: "error", message: "أدخل رابطًا صحيحًا." });
      return;
    }

    setAttachedLinks((current) => {
      if (current.some((item) => item.url === cleaned)) return current;
      return [...current, { url: cleaned }];
    });

    appendToText(cleaned);
    setLinkDraft("");
    setIsLinkPickerOpen(false);
    setStatus({ type: "success", message: "تمت إضافة الرابط إلى المنشور." });
  }

  async function openMentionPicker() {
    setIsMentionPickerOpen(true);
    setMentionLoading(true);
    setMentionUsers([]);

    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("تعذر الاتصال.");

      const { data: authData } = await supabase.auth.getUser();
      const uid = String(authData?.user?.id || "");
      if (!uid) throw new Error("يجب تسجيل الدخول.");

      const followingIds = new Set();

      try {
        const { data } = await supabase.from("follows").select("following_id,status").eq("follower_id", uid).eq("status", "accepted").limit(500);
        for (const row of data || []) {
          const id = String(row?.following_id || "");
          if (id) followingIds.add(id);
        }
      } catch {}

      if (followingIds.size === 0) {
        try {
          const { data } = await supabase.from("followers").select("following_id").eq("follower_id", uid).limit(500);
          for (const row of data || []) {
            const id = String(row?.following_id || "");
            if (id) followingIds.add(id);
          }
        } catch {}
      }

      const ids = [...followingIds];
      if (!ids.length) {
        setMentionUsers([]);
        return;
      }

      const { data: profiles } = await supabase.from("profiles").select("id,name,username,avatar_url").in("id", ids).limit(500);
      const rows = (profiles || []).map((row) => ({
        id: String(row?.id || ""),
        name: String(row?.name || "مستخدم").trim() || "مستخدم",
        username: cleanUsername(row?.username || ""),
        avatar: String(row?.avatar_url || ""),
      })).filter((item) => item.id);

      setMentionUsers(rows);
    } catch (err) {
      setStatus({ type: "error", message: String(err?.message || "تعذر تحميل المتابَعين.") });
    } finally {
      setMentionLoading(false);
    }
  }

  function insertMention(user) {
    const tag = user?.username ? `@${user.username}` : `@${user.name}`;
    appendToText(tag);
    setIsMentionPickerOpen(false);
    setMentionSearch("");
  }

  function chooseSticker(sticker) {
    setSelectedSticker(sticker);
    setIsStickerPickerOpen(false);
    setStickerSearch("");
    setStatus({ type: "success", message: `تم اختيار ملصق ${sticker.label}.` });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const trimmed = text.trim();
    if (!trimmed && selectedFiles.length === 0 && selectedDocs.length === 0 && !selectedSticker && attachedLinks.length === 0) {
      setStatus({ type: "error", message: "أضف نصًا أو وسائط أو ملصقًا أو ملفًا قبل النشر." });
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

      const uploadedMediaUrls = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const item = selectedFiles[index];
        const ext = (item.file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${user.id}/posts/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext || "bin"}`;

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
        uploadedMediaUrls.push(publicUrl);
      }

      if (selectedSticker?.url) {
        uploadedMediaUrls.push(selectedSticker.url);
      }

      const postType = detectPostType(trimmed, selectedFiles, selectedSticker);
      const finalContent = [trimmed, ...attachedLinks.map((item) => item.url)].filter(Boolean).join("\n").trim();

      const payload = {
        user_id: user.id,
        content: finalContent,
        custom_text: finalContent,
        type: postType,
        posts_privacy: "everyone",
        post_source_type: "user_post",
        is_anonymous: isAnonymous,
        anonymous_name: isAnonymous ? "مستخدم مجهول" : null,
        ...(uploadedMediaUrls.length > 0 ? { media_url: uploadedMediaUrls[0], media_urls: uploadedMediaUrls } : {}),
        ...(bgColor ? { custom_background_color: bgColor, bg_color: bgColor } : {}),
      };

      const { data: insertedPost, error: postError } = await supabase.from("posts").insert(payload).select("id").single();
      if (postError || !insertedPost?.id) {
        setStatus({ type: "error", message: postError?.message || "تعذر إنشاء المنشور." });
        return;
      }

      if (selectedDocs.length > 0) {
        for (let index = 0; index < selectedDocs.length; index += 1) {
          const item = selectedDocs[index];
          const ext = (item.file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
          const path = `${user.id}/docs/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext || "bin"}`;

          const { error: docUploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, item.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: item.file.type || "application/octet-stream",
          });

          if (docUploadError) continue;

          const { data: docUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
          const fileUrl = String(docUrlData?.publicUrl || "").trim();
          if (!fileUrl) continue;

          const commonPayload = {
            post_id: insertedPost.id,
            user_id: user.id,
            file_name: item.file.name,
            file_type: item.file.type || "application/octet-stream",
            file_size: Number(item.file.size || 0),
            file_url: fileUrl,
          };

          const first = await supabase.from("post_files").insert(commonPayload);
          if (first.error) {
            await supabase.from("post_files").insert({
              post_id: insertedPost.id,
              name: item.file.name,
              type: item.file.type || "application/octet-stream",
              size: Number(item.file.size || 0),
              url: fileUrl,
            });
          }
        }
      }

      clearComposer();
      setStatus({ type: "success", message: "تم نشر اللحظة بنجاح." });
      setIsOpen(false);
      onCreated?.();
    });
  }

  const filteredStickers = STICKER_PACK.filter((item) => {
    const q = stickerSearch.trim().toLowerCase();
    if (!q) return true;
    return item.label.toLowerCase().includes(q);
  });

  const filteredMentionUsers = mentionUsers.filter((item) => {
    const q = mentionSearch.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.username.toLowerCase().includes(q);
  });

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
      <input ref={fileInputRef} type="file" accept={DOC_ACCEPT} multiple onChange={handleDocFilesChange} className="hidden" />

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
                <div className="flex h-full flex-col overflow-y-auto">
                  <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    rows={7}
                    placeholder="ما الذي تريد مشاركته؟"
                    className="h-72 w-full resize-none border-b border-slate-200 px-6 py-6 text-3xl text-slate-700 outline-none placeholder:text-slate-400"
                    style={{ background: bgColor || "transparent" }}
                  />

                  {attachedLinks.length ? (
                    <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
                      {attachedLinks.map((item, index) => (
                        <span key={`${item.url}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                          <a href={item.url} target="_blank" rel="noreferrer" className="max-w-[180px] truncate hover:underline">{item.url}</a>
                          <button type="button" onClick={() => removeLink(index)} className="text-sky-700">×</button>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {selectedSticker ? (
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="relative inline-flex overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <img src={selectedSticker.url} alt={selectedSticker.label} className="h-28 w-28 object-cover" loading="lazy" />
                        <button type="button" onClick={() => setSelectedSticker(null)} className="absolute left-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white">حذف</button>
                      </div>
                    </div>
                  ) : null}

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

                  {selectedDocs.length > 0 ? (
                    <div className="space-y-2 border-t border-slate-100 px-4 py-3">
                      {selectedDocs.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                          <div className="max-w-[80%] truncate font-semibold text-slate-700">{item.file.name}</div>
                          <button type="button" onClick={() => removeDoc(item.id)} className="text-rose-600">إزالة</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <aside className="overflow-y-auto border-r border-slate-200 p-3">
                  <ToolRow title="إضافة صورة" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-500" fill="currentColor"><path d="M4 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm10 1V5H6v13h12V8h-2a2 2 0 0 1-2-2Zm-4 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm-3.5 7 2.2-2.7a1 1 0 0 1 1.56.02L12 16l1.3-1.6a1 1 0 0 1 1.54-.03L17.5 17H6.5Z"/></svg>} onClick={() => mediaInputRef.current?.click()} />
                  <ToolRow title="إضافة فيديو" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-rose-500" fill="currentColor"><path d="M4 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2.2l3.3-2a1 1 0 0 1 1.5.87v9.82a1 1 0 0 1-1.5.86l-3.3-2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm4 2v8l7-4-7-4Z"/></svg>} onClick={() => videoInputRef.current?.click()} />
                  <ToolRow title="شعور ونشاط" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-pink-500" fill="currentColor"><path d="M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10Zm-4-8a1.5 1.5 0 1 0 0 3h8a1.5 1.5 0 1 0 0-3Zm.5-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>} onClick={() => appendToText("😊 أشعر بسعادة")} />
                  <ToolRow title="إشارة" icon={<span className="text-2xl font-bold text-blue-600">@</span>} onClick={openMentionPicker} />
                  <ToolRow title="الموقع" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-500" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg>} onClick={() => appendToText("📍")} />
                  <ToolRow title="رابط" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 14a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 14"/><path d="M14 10a5 5 0 0 1 0 7L12.5 18.5a5 5 0 0 1-7-7L7 10"/></svg>} onClick={() => setIsLinkPickerOpen(true)} />
                  <ToolRow title="ملصقات" icon={<span className="text-xs font-bold text-cyan-500">GIF</span>} onClick={() => setIsStickerPickerOpen(true)} />
                  <ToolRow title="اختيار لون الخلفية" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-fuchsia-600" fill="currentColor"><path d="M12 3a9 9 0 0 0 0 18h1a4 4 0 0 0 0-8h-1a2 2 0 1 1 0-4h1a4 4 0 0 0 0-8Zm-5.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm3-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm3 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>} onClick={pickBackgroundColor} />
                  <ToolRow title="رفع ملف" icon={<svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><rect x="4" y="18" width="16" height="3" rx="1.5"/></svg>} onClick={() => fileInputRef.current?.click()} />

                  {status.message ? (
                    <div className={["mt-3 rounded-xl border px-3 py-2 text-sm", status.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"].join(" ")}>
                      {status.message}
                    </div>
                  ) : null}
                </aside>
              </div>
            </form>
          </div>

          {isLinkPickerOpen ? (
            <div className="fixed inset-0 z-[90] bg-black/30 p-4" onClick={() => setIsLinkPickerOpen(false)}>
              <div className="mx-auto mt-24 max-w-lg rounded-2xl border border-slate-200 bg-white p-4" onClick={(e) => e.stopPropagation()} dir="rtl">
                <div className="text-sm font-black text-slate-900">إضافة رابط</div>
                <input value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} placeholder="https://example.com" className="mt-3 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-sky-400" />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setIsLinkPickerOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">إلغاء</button>
                  <button type="button" onClick={applyLink} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white">إضافة</button>
                </div>
              </div>
            </div>
          ) : null}

          {isStickerPickerOpen ? (
            <div className="fixed inset-0 z-[90] bg-black/30 p-4" onClick={() => setIsStickerPickerOpen(false)}>
              <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-slate-200 bg-white p-4" onClick={(e) => e.stopPropagation()} dir="rtl">
                <div className="mb-3 text-sm font-black text-slate-900">اختيار ملصق متحرك (GIF)</div>
                <input value={stickerSearch} onChange={(e) => setStickerSearch(e.target.value)} placeholder="ابحث عن ملصق" className="mb-3 h-10 w-full rounded-xl border border-slate-300 px-3 text-xs outline-none focus:border-cyan-400" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {filteredStickers.map((sticker) => (
                    <button key={sticker.id} type="button" onClick={() => chooseSticker(sticker)} className="overflow-hidden rounded-xl border border-slate-200 p-1 text-center hover:bg-slate-50">
                      <img src={sticker.url} alt={sticker.label} className="h-20 w-full rounded-lg object-cover" loading="lazy" />
                      <span className="mt-1 block text-[11px] font-semibold text-slate-600">{sticker.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {isMentionPickerOpen ? (
            <div className="fixed inset-0 z-[90] bg-black/30 p-4" onClick={() => setIsMentionPickerOpen(false)}>
              <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-slate-200 bg-white p-4" onClick={(e) => e.stopPropagation()} dir="rtl">
                <div className="mb-3 text-sm font-black text-slate-900">إشارة إلى متابَعين</div>
                <input value={mentionSearch} onChange={(e) => setMentionSearch(e.target.value)} placeholder="ابحث بالاسم أو اسم المستخدم" className="mb-3 h-10 w-full rounded-xl border border-slate-300 px-3 text-xs outline-none focus:border-blue-400" />

                {mentionLoading ? <div className="rounded-xl border border-slate-200 px-3 py-4 text-xs text-slate-600">جارٍ تحميل القائمة...</div> : null}
                {!mentionLoading && filteredMentionUsers.length === 0 ? <div className="rounded-xl border border-slate-200 px-3 py-4 text-xs text-slate-600">لا يوجد متابَعون لعرضهم.</div> : null}

                {!mentionLoading && filteredMentionUsers.length > 0 ? (
                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {filteredMentionUsers.map((user) => (
                      <button key={user.id} type="button" onClick={() => insertMention(user)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{user.username ? `@${user.username}` : ""}</div>
                        </div>
                        <img src={avatarFor(user.name, user.avatar)} alt={user.name} className="h-8 w-8 rounded-full border border-slate-200" loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}




