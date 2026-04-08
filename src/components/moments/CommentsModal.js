
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { orderedReactionOptions, reactionByValue } from "@/components/moments/reactions";
import LottieReactionIcon from "@/components/moments/LottieReactionIcon";
import RichMomentText from "@/components/moments/RichMomentText";

const MEDIA_BUCKET = "media";
const SORT_OPTIONS = [
  { key: "newest", label: "الأحدث" },
  { key: "engaged", label: "الأكثر تفاعلاً" },
  { key: "all", label: "كل التعليقات" },
  { key: "oldest", label: "الأقدم" },
];
const REPORT_REASONS = ["محتوى غير لائق", "رسائل مؤذية", "محتوى مضلل", "انتهاك حقوق النشر", "أخرى"];

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  } catch {
    return date.toISOString();
  }
}

function avatarFor(name, explicit = "") {
  if (explicit) return explicit;
  const safe = encodeURIComponent(String(name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safe}&background=e2e8f0&color=0f172a&size=96&bold=true`;
}

function cleanUsername(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function profileHref(username, userId = "") {
  const cleaned = cleanUsername(username);
  if (cleaned) {
    return `/${encodeURIComponent(cleaned)}`;
  }
  return userId ? `/profile?uid=${encodeURIComponent(String(userId))}` : "/profile";
}

function inferTypeFromFile(file) {
  const mime = String(file?.type || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "voice";
  return "file";
}

function inferMediaKindFromComment(comment) {
  if (comment.type === "image") return "image";
  if (comment.type === "video") return "video";
  if (comment.type === "voice") return "voice";
  if (comment.type === "file") return "file";
  return "";
}

function totalReactions(counts) {
  return Object.values(counts || {}).reduce((sum, n) => sum + Number(n || 0), 0);
}

function countRepliesDeep(comment) {
  const list = Array.isArray(comment?.replies) ? comment.replies : [];
  return list.reduce((sum, item) => sum + 1 + countRepliesDeep(item), 0);
}

function buildTree(flat) {
  const byId = new Map();
  const roots = [];
  for (const row of flat) byId.set(row.id, { ...row, replies: [] });
  for (const item of byId.values()) {
    if (item.parentId && byId.has(item.parentId)) {
      const parent = byId.get(item.parentId);
      item.depth = Number(parent.depth || 0) + 1;
      item.replyToUserName = parent.name;
      parent.replies.push(item);
    } else {
      item.depth = Number(item.depth || 0);
      roots.push(item);
    }
  }
  function sortReplies(list) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (const item of list) sortReplies(item.replies);
  }
  sortReplies(roots);
  return roots;
}

function sortComments(list, sortKey) {
  const next = [...list];
  if (sortKey === "oldest") return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (sortKey === "engaged") {
    return next.sort((a, b) => {
      const aScore = totalReactions(a.reactionCounts) + countRepliesDeep(a) * 2;
      const bScore = totalReactions(b.reactionCounts) + countRepliesDeep(b) * 2;
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  if (sortKey === "all") return next;
  return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function collectIds(list, out = []) {
  for (const item of list || []) {
    out.push(item.id);
    if (item.replies?.length) collectIds(item.replies, out);
  }
  return out;
}

function mapTree(list, mapper) {
  return (list || []).map((item) => ({ ...mapper(item), replies: mapTree(item.replies || [], mapper) }));
}

function updateCommentInTree(list, targetId, updater) {
  return mapTree(list, (item) => (item.id === targetId ? updater(item) : item));
}

function removeCommentInTree(list, targetId) {
  return (list || []).filter((item) => item.id !== targetId).map((item) => ({ ...item, replies: removeCommentInTree(item.replies || [], targetId) }));
}

function TopReactionStack({ reactionCounts }) {
  const top = Object.entries(reactionCounts || {}).filter(([, c]) => Number(c || 0) > 0).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0)).slice(0, 3).map(([type]) => reactionByValue(type)).filter(Boolean);
  if (!top.length) return null;
  return (
    <div className="relative flex h-5 w-14 items-center">
      {top.map((reaction, i) => (
        <span key={`${reaction.value}-${i}`} className="absolute inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-white bg-white" style={{ right: `${i * 12}px`, zIndex: 5 - i }}>
          <LottieReactionIcon file={reaction.lottie} size={16} autoplay={false} loop={false} />
        </span>
      ))}
    </div>
  );
}
function CommentItem({ comment, currentUserId, onReply, onOpenPicker, pickerCommentId, onToggleReaction, onEdit, onDelete, onHide, onReport, onBlock, menuOpen, setMenuOpen }) {
  const isMine = currentUserId && comment.userId === currentUserId;
  const myReaction = reactionByValue(comment.currentUserReaction || "");
  const mediaKind = inferMediaKindFromComment(comment);
  const userProfileUrl = profileHref(comment.username, comment.userId);

  return (
    <div className="space-y-2" style={{ marginInlineStart: Math.min(Number(comment.depth || 0), 8) * 18 }}>
      <article className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-slate-100" onClick={() => setMenuOpen((v) => (v === comment.id ? "" : comment.id))} aria-label="خيارات">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
          </button>

          <div className="flex min-w-0 flex-1 items-start gap-2">
            <Link href={userProfileUrl} className="inline-flex">
              <img src={avatarFor(comment.name, comment.avatar)} alt={comment.name} className="h-9 w-9 rounded-full border border-slate-200" loading="lazy" />
            </Link>
            <div className="min-w-0 flex-1 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-500">
                <span>{formatDate(comment.createdAt)}</span>
                <Link href={userProfileUrl} className="font-bold text-slate-900 hover:underline">{comment.name}</Link>
              </div>
              {comment.replyToUserName ? <div className="mt-1 text-[11px] text-slate-500">ردًا على {comment.replyToUserName}</div> : null}
              {comment.content ? <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-800"><RichMomentText text={comment.content} /></p> : null}

              {comment.mediaUrl ? (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {mediaKind === "image" ? <img src={comment.mediaUrl} alt="وسائط التعليق" loading="lazy" className="max-h-72 w-full object-cover" /> : null}
                  {mediaKind === "video" ? <video src={comment.mediaUrl} controls preload="metadata" className="max-h-72 w-full bg-black object-contain" /> : null}
                  {mediaKind === "voice" ? <audio src={comment.voiceUrl || comment.mediaUrl} controls className="w-full" preload="none" /> : null}
                  {mediaKind === "file" ? <a href={comment.mediaUrl} target="_blank" rel="noreferrer" className="block px-3 py-3 text-sm font-semibold text-blue-700 hover:underline">فتح الملف المرفق</a> : null}
                </div>
              ) : null}

              {comment.voiceUrl && !comment.mediaUrl ? (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2"><audio src={comment.voiceUrl} controls className="w-full" preload="none" /></div>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-xs">
                {totalReactions(comment.reactionCounts) > 0 ? (
                  <button type="button" onClick={() => onOpenPicker(comment.id)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                    <span>{totalReactions(comment.reactionCounts)}</span>
                    <TopReactionStack reactionCounts={comment.reactionCounts} />
                  </button>
                ) : null}
                <button type="button" onClick={() => onReply(comment)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100">رد</button>
                <button type="button" onClick={() => onToggleReaction(comment, myReaction ? "none" : "like")} className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold", myReaction ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"].join(" ")}>
                  {myReaction?.lottie ? <LottieReactionIcon file={myReaction.lottie} size={16} autoplay={false} loop={false} /> : null}
                  <span>{myReaction?.label || "إعجاب"}</span>
                </button>
              </div>

              {pickerCommentId === comment.id ? (
                <div className="mt-2 flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {orderedReactionOptions().map((reaction) => (
                    <button key={reaction.value} type="button" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700" onClick={() => onToggleReaction(comment, reaction.value)}>
                      <LottieReactionIcon file={reaction.lottie} size={18} loop={true} autoplay={true} />
                      <span>{reaction.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      {menuOpen === comment.id ? (
        <div className="-mt-1 mb-2 rounded-xl border border-slate-200 bg-white px-2 py-2 text-right text-sm shadow-sm">
          {isMine ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onEdit(comment)} className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100">تعديل التعليق</button>
              <button type="button" onClick={() => onDelete(comment)} className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50">حذف التعليق</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onHide(comment)} className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100">إخفاء التعليق</button>
              <button type="button" onClick={() => onReport(comment)} className="rounded-full border border-amber-200 px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-50">إبلاغ</button>
              <button type="button" onClick={() => onBlock(comment)} className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50">حظر المستخدم</button>
            </div>
          )}
        </div>
      ) : null}

      {comment.replies?.length ? (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId} onReply={onReply} onOpenPicker={onOpenPicker} pickerCommentId={pickerCommentId} onToggleReaction={onToggleReaction} onEdit={onEdit} onDelete={onDelete} onHide={onHide} onReport={onReport} onBlock={onBlock} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CommentsModal({ postId, postUrl = "", open, onClose, onCountChanged }) {
  const [comments, setComments] = useState([]);
  const [sortKey, setSortKey] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [text, setText] = useState("");
  const [pickedFile, setPickedFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState("");
  const [pickerCommentId, setPickerCommentId] = useState("");
  const [isPending, startTransition] = useTransition();

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const loadComments = useCallback(async () => {
    if (!open || !postId) return;
    setLoading(true);
    setStatus("");
    const supabase = await getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      setStatus("تعذر الاتصال بقاعدة البيانات.");
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user || null;
    setAuthUser(currentUser);

    const hiddenIds = new Set();
    if (currentUser?.id) {
      try {
        const { data: hiddenRows } = await supabase.from("hidden_comments").select("comment_id").eq("user_id", currentUser.id);
        for (const row of hiddenRows || []) {
          const id = String(row.comment_id || "");
          if (id) hiddenIds.add(id);
        }
      } catch {}
    }

    const blockedIds = new Set();
    if (currentUser?.id) {
      const tries = [
        () => supabase.from("blocked_users").select("blocked_user_id").eq("user_id", currentUser.id),
        () => supabase.from("blocked_users").select("blocked_id").eq("blocker_id", currentUser.id),
      ];
      for (const fn of tries) {
        try {
          const { data } = await fn();
          for (const row of data || []) {
            const value = String(row.blocked_user_id || row.blocked_id || "");
            if (value) blockedIds.add(value);
          }
        } catch {}
      }
    }

    let rows = [];
    const firstTry = await supabase.from("comments").select("id,post_id,parent_id,user_id,content,type,media_url,voice_url,voice_duration,created_at,updated_at,is_deleted").eq("post_id", postId).order("created_at", { ascending: false }).limit(500);
    if (firstTry.error) {
      const fallback = await supabase.from("comments").select("id,post_id,parent_id,user_id,content,type,media_url,voice_url,voice_duration,created_at,updated_at").eq("post_id", postId).order("created_at", { ascending: false }).limit(500);
      rows = fallback.data || [];
    } else {
      rows = (firstTry.data || []).filter((row) => row.is_deleted !== true);
    }

    rows = rows.filter((row) => !hiddenIds.has(String(row.id || "")) && !blockedIds.has(String(row.user_id || "")));

    const commentIds = rows.map((row) => String(row.id || "")).filter(Boolean);
    const userIds = [...new Set(rows.map((row) => String(row.user_id || "")).filter(Boolean))];

    let profiles = [];
    if (userIds.length) {
      try {
        const { data } = await supabase.from("profiles").select("id,name,username,avatar_url,is_verified,is_gold_verified").in("id", userIds);
        profiles = data || [];
      } catch {}
    }
    const profileMap = new Map(profiles.map((p) => [String(p.id), p]));

    let reactions = [];
    if (commentIds.length) {
      try {
        const { data } = await supabase.from("comment_reactions").select("comment_id,user_id,type").in("comment_id", commentIds);
        reactions = data || [];
      } catch {}
    }

    const countsMap = new Map();
    const myReactionMap = new Map();
    for (const row of reactions) {
      const cid = String(row.comment_id || "");
      const type = String(row.type || "").trim();
      if (!cid || !type || type === "none") continue;
      const counts = countsMap.get(cid) || {};
      counts[type] = Number(counts[type] || 0) + 1;
      countsMap.set(cid, counts);
      if (currentUser?.id && String(row.user_id || "") === currentUser.id) myReactionMap.set(cid, type);
    }

    const flat = rows.map((row) => {
      const profile = profileMap.get(String(row.user_id || "")) || {};
      const name = String(profile.name || profile.username || "").trim() || "مستخدم";
      return {
        id: String(row.id || ""),
        postId: String(row.post_id || postId),
        parentId: row.parent_id ? String(row.parent_id) : null,
        userId: String(row.user_id || ""),
        name,
        username: cleanUsername(profile.username || ""),
        avatar: avatarFor(name, String(profile.avatar_url || "").trim()),
        content: String(row.content || ""),
        type: String(row.type || "text").toLowerCase(),
        mediaUrl: String(row.media_url || "").trim() || null,
        voiceUrl: String(row.voice_url || "").trim() || null,
        voiceDuration: Number(row.voice_duration || 0),
        createdAt: String(row.created_at || ""),
        updatedAt: String(row.updated_at || ""),
        isVerified: profile.is_verified === true,
        isGoldVerified: profile.is_gold_verified === true,
        reactionCounts: countsMap.get(String(row.id || "")) || {},
        currentUserReaction: myReactionMap.get(String(row.id || "")) || "none",
        depth: 0,
        replyToUserName: null,
        replies: [],
      };
    });

    setComments(buildTree(flat));
    setLoading(false);
  }, [open, postId]);

  useEffect(() => {
    if (!open) return;
    loadComments();
  }, [open, loadComments]);

  useEffect(() => {
    if (!open || !postId) return;
    let channel = null;
    let disposed = false;
    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase || disposed) return;
      channel = supabase
        .channel(`comments-modal-${postId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, () => loadComments())
        .on("postgres_changes", { event: "*", schema: "public", table: "comment_reactions" }, () => loadComments())
        .subscribe();
    })();

    return () => {
      disposed = true;
      if (channel) getSupabaseClient().then((supabase) => { if (supabase) supabase.removeChannel(channel); });
    };
  }, [open, postId, loadComments]);

  const visibleComments = useMemo(() => sortComments(comments, sortKey), [comments, sortKey]);
  const commentsCount = useMemo(() => collectIds(comments).length, [comments]);

  async function uploadPickedFile(supabase, userId) {
    if (!pickedFile?.file) return { type: "text", mediaUrl: null, voiceUrl: null, voiceDuration: null };
    const detectedType = pickedFile.commentType || inferTypeFromFile(pickedFile.file);
    const extRaw = String(pickedFile.file.name || "bin").split(".").pop() || "bin";
    const ext = extRaw.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `comments/${postId}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, pickedFile.file, { cacheControl: "3600", upsert: false, contentType: pickedFile.file.type || undefined });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    const publicUrl = String(urlData?.publicUrl || "").trim();
    if (!publicUrl) throw new Error("تعذر إنشاء رابط المرفق");
    if (detectedType === "voice") return { type: "voice", mediaUrl: null, voiceUrl: publicUrl, voiceDuration: null };
    return { type: detectedType, mediaUrl: publicUrl, voiceUrl: null, voiceDuration: null };
  }

  function pickFileFromInput(event, forcedType = "") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const commentType = forcedType || inferTypeFromFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPickedFile({ file, commentType, previewUrl, name: file.name });
  }

  function clearPicked() {
    if (pickedFile?.previewUrl) URL.revokeObjectURL(pickedFile.previewUrl);
    setPickedFile(null);
  }
  function submitComment() {
    if (!postId) return;
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return setStatus("تعذر الاتصال بقاعدة البيانات.");
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) return setStatus("سجل الدخول لإضافة تعليق.");
      const content = text.trim();
      if (!content && !pickedFile) return setStatus("اكتب تعليقًا أو أضف وسائط.");
      setStatus("");
      try {
        const uploaded = await uploadPickedFile(supabase, user.id);
        const payload = {
          post_id: postId,
          parent_id: replyingTo?.id || null,
          user_id: user.id,
          content,
          type: uploaded.type,
          ...(uploaded.mediaUrl ? { media_url: uploaded.mediaUrl } : {}),
          ...(uploaded.voiceUrl ? { voice_url: uploaded.voiceUrl } : {}),
          created_at: new Date().toISOString(),
        };
        const { data: inserted, error: insertError } = await supabase.from("comments").insert(payload).select("id").maybeSingle();
        if (insertError) throw insertError;
        try {
          await supabase.rpc("increment_post_comments", { post_id_param: postId });
        } catch {
          const { data: postRow } = await supabase.from("posts").select("comments_count").eq("id", postId).maybeSingle();
          await supabase.from("posts").update({ comments_count: Number(postRow?.comments_count || 0) + 1 }).eq("id", postId);
        }
        setText("");
        setReplyingTo(null);
        clearPicked();
        await loadComments();
        onCountChanged?.(inserted?.id ? 1 : 0);
      } catch (e) {
        setStatus(e?.message || "تعذر نشر التعليق.");
      }
    });
  }

  function toggleCommentReaction(comment, reactionType) {
    if (!comment?.id) return;
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) return setStatus("سجل الدخول للتفاعل مع التعليقات.");
      const normalized = reactionType === "haha" ? "funny" : reactionType;
      try {
        const { data: existing } = await supabase.from("comment_reactions").select("id,type").eq("comment_id", comment.id).eq("user_id", user.id).maybeSingle();
        if (normalized === "none") {
          if (existing) await supabase.from("comment_reactions").delete().eq("id", existing.id);
        } else if (existing && existing.type === normalized) {
          await supabase.from("comment_reactions").delete().eq("id", existing.id);
        } else if (existing) {
          await supabase.from("comment_reactions").update({ type: normalized }).eq("id", existing.id);
        } else {
          await supabase.from("comment_reactions").insert({ comment_id: comment.id, user_id: user.id, type: normalized });
        }
        setPickerCommentId("");
        await loadComments();
      } catch (e) {
        setStatus(e?.message || "تعذر حفظ التفاعل.");
      }
    });
  }

  function editComment(comment) {
    const next = window.prompt("تعديل التعليق", comment.content || "");
    if (next === null) return;
    const content = String(next).trim();
    if (!content) return setStatus("لا يمكن حفظ تعليق فارغ.");
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) return setStatus("سجل الدخول أولاً.");
      const { error } = await supabase.from("comments").update({ content, updated_at: new Date().toISOString() }).eq("id", comment.id).eq("user_id", user.id);
      if (error) return setStatus(error.message || "تعذر تعديل التعليق.");
      setComments((prev) => updateCommentInTree(prev, comment.id, (item) => ({ ...item, content })));
      setMenuOpen("");
    });
  }

  function deleteComment(comment) {
    if (!window.confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) return setStatus("سجل الدخول أولاً.");
      const { error } = await supabase.from("comments").delete().eq("id", comment.id).eq("user_id", user.id);
      if (error) return setStatus(error.message || "تعذر حذف التعليق.");
      try {
        await supabase.rpc("decrement_post_comments", { post_id_param: postId });
      } catch {
        const { data: postRow } = await supabase.from("posts").select("comments_count").eq("id", postId).maybeSingle();
        await supabase.from("posts").update({ comments_count: Math.max(0, Number(postRow?.comments_count || 0) - 1) }).eq("id", postId);
      }
      setComments((prev) => removeCommentInTree(prev, comment.id));
      setMenuOpen("");
      onCountChanged?.(-1);
    });
  }

  function hideComment(comment) {
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) return setStatus("سجل الدخول أولاً.");
      let ok = false;
      try {
        const { error } = await supabase.rpc("hide_comment", { p_comment_id: comment.id, p_user_id: user.id, p_reason: "user_hidden" });
        ok = !error;
      } catch {}
      if (!ok) {
        try {
          const { error } = await supabase.from("hidden_comments").insert({ comment_id: comment.id, user_id: user.id, reason: "user_hidden", hidden_at: new Date().toISOString() });
          ok = !error;
        } catch {}
      }
      if (!ok) return setStatus("تعذر إخفاء التعليق.");
      setComments((prev) => removeCommentInTree(prev, comment.id));
      setMenuOpen("");
      setStatus("تم إخفاء التعليق.");
    });
  }

  function reportComment(comment) {
    const reason = window.prompt(`سبب الإبلاغ:\n${REPORT_REASONS.join(" - ")}`, REPORT_REASONS[0]);
    if (!reason) return;
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) return setStatus("سجل الدخول أولاً.");
      let ok = false;
      const attempts = [
        () => supabase.from("comment_reports").insert({ comment_id: comment.id, reporter_id: user.id, reason }),
        () => supabase.from("comment_reports").insert({ comment_id: comment.id, user_id: user.id, reason }),
        () => supabase.from("blog_post_comment_reports").insert({ comment_id: comment.id, reporter_user_id: user.id, reason }),
      ];
      for (const action of attempts) {
        try {
          const { error } = await action();
          if (!error) {
            ok = true;
            break;
          }
        } catch {}
      }
      setMenuOpen("");
      setStatus(ok ? "تم إرسال البلاغ." : "تعذر إرسال البلاغ.");
    });
  }

  function blockUser(comment) {
    if (!window.confirm(`هل تريد حظر ${comment.name}؟`)) return;
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!user?.id) return setStatus("سجل الدخول أولاً.");

      let ok = false;
      for (const fn of [() => supabase.rpc("block_user", { p_blocked_id: comment.userId }), () => supabase.rpc("block_user", { blocked_id: comment.userId })]) {
        try {
          const { error } = await fn();
          if (!error) {
            ok = true;
            break;
          }
        } catch {}
      }
      if (!ok) {
        for (const fn of [() => supabase.from("blocked_users").insert({ user_id: user.id, blocked_user_id: comment.userId }), () => supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: comment.userId }), () => supabase.from("blocked_users").insert({ user_id: user.id, blocked_user_id: comment.userId, blocker_id: user.id, blocked_id: comment.userId })]) {
          try {
            const { error } = await fn();
            if (!error) {
              ok = true;
              break;
            }
          } catch {}
        }
      }
      if (!ok) return setStatus("تعذر حظر المستخدم.");
      setComments((prev) => prev.filter((item) => item.userId !== comment.userId));
      setMenuOpen("");
      setStatus("تم حظر المستخدم.");
      await loadComments();
    });
  }

  function closeModal() {
    setMenuOpen("");
    setPickerCommentId("");
    setReplyingTo(null);
    setText("");
    clearPicked();
    onClose?.();
  }

  if (!open) return null;
  return (
    <div dir="rtl" className="fixed inset-0 z-[120] bg-white">
      <div className="flex h-full flex-col">
        <header className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600">
              <button type="button" onClick={loadComments} className="rounded-full p-2 hover:bg-slate-100" aria-label="تحديث">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 12.65-5.65Z" /></svg>
              </button>
              <a href={postUrl || `/post/${postId}`} target="_blank" rel="noreferrer" className="rounded-full p-2 hover:bg-slate-100" aria-label="فتح المنشور">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>
              </a>
            </div>
            <div className="text-right"><div className="text-lg font-black text-slate-900">التعليقات ({commentsCount})</div></div>
            <button type="button" onClick={closeModal} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="إغلاق">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            {SORT_OPTIONS.map((option) => (
              <button key={option.key} type="button" onClick={() => setSortKey(option.key)} className={["rounded-full border px-4 py-2 text-sm font-semibold", sortKey === option.key ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 bg-slate-100 text-slate-700"].join(" ")}>{option.label}</button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3">
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">جارٍ تحميل التعليقات...</div> : null}
          {!loading && visibleComments.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-slate-500">لا توجد تعليقات بعد</div> : null}
          {!loading && visibleComments.length > 0 ? (
            <div className="space-y-3 pb-5">
              {visibleComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} currentUserId={authUser?.id || ""} onReply={setReplyingTo} onOpenPicker={setPickerCommentId} pickerCommentId={pickerCommentId} onToggleReaction={toggleCommentReaction} onEdit={editComment} onDelete={deleteComment} onHide={hideComment} onReport={reportComment} onBlock={blockUser} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              ))}
            </div>
          ) : null}
        </main>

        <footer className="border-t border-slate-200 bg-white p-3">
          {replyingTo ? (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
              <button type="button" onClick={() => setReplyingTo(null)} className="rounded-full p-1 text-slate-500 hover:bg-white" aria-label="إلغاء الرد"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
              <span className="text-blue-700">رد على {replyingTo.name}</span>
            </div>
          ) : null}

          {pickedFile ? (
            <div className="mb-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600"><button type="button" onClick={clearPicked} className="rounded-full px-2 py-1 hover:bg-slate-200">إزالة</button><span className="truncate">{pickedFile.name}</span></div>
              {pickedFile.commentType === "image" ? <img src={pickedFile.previewUrl} alt={pickedFile.name} className="max-h-44 w-full rounded-lg object-cover" /> : null}
              {pickedFile.commentType === "video" ? <video src={pickedFile.previewUrl} className="max-h-44 w-full rounded-lg bg-black object-contain" controls preload="metadata" /> : null}
              {pickedFile.commentType === "voice" ? <audio src={pickedFile.previewUrl} controls className="w-full" preload="none" /> : null}
              {pickedFile.commentType === "file" ? <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">ملف مرفق</div> : null}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button type="button" onClick={submitComment} disabled={isPending} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-300 text-white disabled:opacity-70" aria-label="إرسال"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M3.4 20.4 20.85 12 3.4 3.6 3.38 10l12.47 2-12.47 2 .02 6.4Z"/></svg></button>
            <div className="flex flex-1 items-center gap-1 rounded-2xl border border-slate-300 bg-white px-2 py-1.5">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="مرفق"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M16.5 6.5v9a4.5 4.5 0 1 1-9 0V5a3 3 0 0 1 6 0v9.5a1.5 1.5 0 1 1-3 0V7h-2v7.5a3.5 3.5 0 1 0 7 0V5a5 5 0 0 0-10 0v10.5a6 6 0 1 0 12 0v-9h-2Z"/></svg></button>
              <button type="button" onClick={() => setText((v) => `${v}${v ? " " : ""}😊`)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="إيموجي"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-4 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-4 8a5.98 5.98 0 0 1-4.24-1.76l1.41-1.41a4 4 0 0 0 5.66 0l1.41 1.41A5.98 5.98 0 0 1 12 18Z"/></svg></button>
              <button type="button" onClick={() => audioInputRef.current?.click()} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="صوت"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"/></svg></button>
              <button type="button" onClick={() => videoInputRef.current?.click()} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="فيديو"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17 10.5V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4Z"/></svg></button>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="صورة"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM8.5 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM5 19l4.5-6 3.5 4.5 2.5-3L19 19H5Z"/></svg></button>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFileFromInput(e, "image")} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => pickFileFromInput(e, "video")} />
              <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => pickFileFromInput(e, "voice")} />
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => pickFileFromInput(e, "file")} />
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={replyingTo ? "اكتب رداً..." : "اكتب تعليقاً..."} className="w-full bg-transparent px-2 py-1 text-right text-[29px] text-slate-700 outline-none placeholder:text-slate-400" />
            </div>
          </div>
          {status ? <div className="mt-2 text-right text-xs text-rose-700">{status}</div> : null}
        </footer>
      </div>
    </div>
  );
}










