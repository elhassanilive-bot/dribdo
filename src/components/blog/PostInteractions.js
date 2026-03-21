"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

function getSessionId() {
  if (typeof window === "undefined") return "";
  const key = "dribdo_forum_session";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}

export default function PostInteractions({ postId }) {
  const [commentForm, setCommentForm] = useState({ name: "", content: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [comments, setComments] = useState([]);
  const [reactionCounts, setReactionCounts] = useState({ like: 0, dislike: 0 });
  const [myReaction, setMyReaction] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [replyingToId, setReplyingToId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [reportState, setReportState] = useState({ open: false, commentId: "", reason: "إساءة", details: "" });
  const [isPending, startTransition] = useTransition();

  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      const { data: authData } = await supabase.auth.getUser();
      setAuthUser(authData?.user || null);

      const { data: commentRows } = await supabase
        .from("blog_post_comments")
        .select("id, author_name, content, created_at, session_id, user_id, parent_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      const { data: reactionRows } = await supabase
        .from("blog_post_reactions")
        .select("reaction, session_id")
        .eq("post_id", postId);

      if (!active) return;

      setComments(commentRows || []);
      const likeCount = (reactionRows || []).filter((row) => row.reaction === "like").length;
      const dislikeCount = (reactionRows || []).filter((row) => row.reaction === "dislike").length;
      setReactionCounts({ like: likeCount, dislike: dislikeCount });
      const mine = (reactionRows || []).find((row) => row.session_id === sessionId);
      setMyReaction(mine?.reaction || "");
    }

    if (postId) {
      loadData();
    }

    return () => {
      active = false;
    };
  }, [postId, sessionId]);

  useEffect(() => {
    let subscription;
    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthUser(session?.user || null);
      }).data.subscription;
    })();
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function handleAuth(event) {
    event.preventDefault();
    const email = authEmail.trim();
    const password = authPassword.trim();
    if (authSubmitting) return;
    setAuthSubmitting(true);
    setStatus({ type: "", message: "" });
    try {

    if (!email) {
      setStatus({ type: "error", message: "أدخل بريدك الإلكتروني أولًا." });
      return;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setStatus({ type: "error", message: "Supabase غير مُعد." });
      return;
    }

    if (authMode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset` : undefined,
      });
      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر إرسال رابط استعادة كلمة المرور." });
        return;
      }
      setStatus({ type: "success", message: "تم إرسال رابط استعادة كلمة المرور إلى بريدك." });
      return;
    }

    if (!password) {
      setStatus({ type: "error", message: "أدخل كلمة المرور." });
      return;
    }

    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر إنشاء الحساب." });
        return;
      }
      setStatus({ type: "success", message: "تم إنشاء الحساب. افحص بريدك لتأكيد الحساب." });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus({ type: "error", message: error.message || "تعذر تسجيل الدخول." });
      return;
    }

    setStatus({ type: "success", message: "تم تسجيل الدخول بنجاح." });
  } finally {
    setAuthSubmitting(false);
  }
  }

  async function handleSignOut() {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthUser(null);
  }

  function updateCommentField(key, value) {
    setCommentForm((current) => ({ ...current, [key]: value }));
  }

  function resetCommentForm() {
    setCommentForm({ name: "", content: "" });
  }

  function resetReply() {
    setReplyingToId("");
    setReplyText("");
  }

  function handleReaction(nextReaction) {
    if (!postId) return;
    setStatus({ type: "", message: "" });

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus({ type: "error", message: "Supabase غير مُعد." });
        return;
      }

      const { data: existing } = await supabase
        .from("blog_post_reactions")
        .select("id, reaction")
        .eq("post_id", postId)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existing && existing.reaction === nextReaction) {
        const { error } = await supabase.from("blog_post_reactions").delete().eq("id", existing.id);
        if (!error) {
          setMyReaction("");
          setReactionCounts((current) => ({
            ...current,
            [nextReaction]: Math.max(0, current[nextReaction] - 1),
          }));
        }
        return;
      }

      if (existing) {
        const { error } = await supabase
          .from("blog_post_reactions")
          .update({ reaction: nextReaction })
          .eq("id", existing.id);
        if (!error) {
          setMyReaction(nextReaction);
          setReactionCounts((current) => ({
            like: current.like + (nextReaction === "like" ? 1 : -1),
            dislike: current.dislike + (nextReaction === "dislike" ? 1 : -1),
          }));
        }
        return;
      }

      const { error } = await supabase.from("blog_post_reactions").insert({
        post_id: postId,
        session_id: sessionId,
        reaction: nextReaction,
      });
      if (!error) {
        setMyReaction(nextReaction);
        setReactionCounts((current) => ({
          ...current,
          [nextReaction]: current[nextReaction] + 1,
        }));
      }
    });
  }

  function handleCommentSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const name = commentForm.name.trim() || "زائر";
    const content = commentForm.content.trim();

    if (!content || content.length < 3) {
      setStatus({ type: "error", message: "اكتب تعليقًا واضحًا قبل النشر." });
      return;
    }

    if (!authUser) {
      setStatus({ type: "error", message: "يرجى تسجيل الدخول قبل التعليق." });
      return;
    }

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus({ type: "error", message: "Supabase غير مُعد." });
        return;
      }

      const { data, error } = await supabase.from("blog_post_comments").insert({
        post_id: postId,
        session_id: sessionId,
        user_id: authUser.id,
        author_name: name || authUser.email || "مستخدم",
        content,
      }).select("id, author_name, content, created_at, session_id, user_id").single();

      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر نشر التعليق." });
        return;
      }

      setComments((current) => [data, ...current]);
      setStatus({ type: "success", message: "تم نشر تعليقك بنجاح." });
      resetCommentForm();
    });
  }

  function handleReplySubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!replyingToId) {
      return;
    }

    if (!authUser) {
      setStatus({ type: "error", message: "ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù‚Ø¨Ù„ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚." });
      return;
    }

    const content = replyText.trim();
    if (!content || content.length < 2) {
      setStatus({ type: "error", message: "Ø§ÙƒØªØ¨ Ø±Ø¯Ù‹Ø§ Ù…Ù†Ø§Ø³Ø¨Ø§Ù‹." });
      return;
    }

    const name = commentForm.name.trim() || "Ø²Ø§Ø¦Ø±";

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus({ type: "error", message: "Supabase ØºÙŠØ± Ù…ÙØ¹Ø¯." });
        return;
      }

      const { data, error } = await supabase
        .from("blog_post_comments")
        .insert({
          post_id: postId,
          parent_id: replyingToId,
          session_id: sessionId,
          user_id: authUser.id,
          author_name: name || authUser.email || "Ù…Ø³ØªØ®Ø¯Ù…",
          content,
        })
        .select("id, author_name, content, created_at, session_id, user_id, parent_id")
        .single();

      if (error) {
        setStatus({ type: "error", message: error.message || "ØªØ¹Ø°Ø± Ù†Ø´Ø± Ø§Ù„Ø±Ø¯." });
        return;
      }

      setComments((current) => [data, ...current]);
      setStatus({ type: "success", message: "ØªÙ… Ù†Ø´Ø± Ø§Ù„Ø±Ø¯." });
      resetReply();
    });
  }

  function startEdit(comment) {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  }

  function cancelEdit() {
    setEditingCommentId("");
    setEditingContent("");
  }

  function saveEdit(commentId) {
    if (!editingContent.trim()) {
      setStatus({ type: "error", message: "لا يمكن حفظ تعليق فارغ." });
      return;
    }

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus({ type: "error", message: "Supabase غير مُعد." });
        return;
      }

      const { error } = await supabase
        .from("blog_post_comments")
        .update({ content: editingContent.trim() })
        .eq("id", commentId);

      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر تعديل التعليق." });
        return;
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId ? { ...comment, content: editingContent.trim() } : comment
        )
      );
      cancelEdit();
      setStatus({ type: "success", message: "تم تحديث التعليق." });
    });
  }

  function deleteComment(commentId) {
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus({ type: "error", message: "Supabase غير مُعد." });
        return;
      }

      const { error } = await supabase.from("blog_post_comments").delete().eq("id", commentId);
      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر حذف التعليق." });
        return;
      }

      setComments((current) => current.filter((comment) => comment.id !== commentId));
      setStatus({ type: "success", message: "تم حذف التعليق." });
    });
  }

  function openReport(commentId) {
    setReportState({ open: true, commentId, reason: "إساءة", details: "" });
  }

  function closeReport() {
    setReportState({ open: false, commentId: "", reason: "إساءة", details: "" });
  }

  function submitReport(event) {
    event.preventDefault();
    if (!reportState.commentId) return;

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setStatus({ type: "error", message: "Supabase غير مُعد." });
        return;
      }

      const { error } = await supabase.from("blog_post_comment_reports").insert({
        comment_id: reportState.commentId,
        session_id: sessionId,
        reason: reportState.reason,
        details: reportState.details.trim(),
      });

      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر إرسال البلاغ." });
        return;
      }

      setStatus({ type: "success", message: "تم إرسال البلاغ، شكرًا لك." });
      closeReport();
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-black text-slate-950">تفاعل مع المقال</h3>
          <div className="text-xs text-slate-500">سجل الملاحظات والآراء مفيد للجميع</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleReaction("like")}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
              myReaction === "like" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:text-emerald-700",
            ].join(" ")}
            disabled={isPending}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
            </svg>
            إعجاب
            <span className="text-xs text-slate-500">{reactionCounts.like}</span>
          </button>
          <button
            type="button"
            onClick={() => handleReaction("dislike")}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
              myReaction === "dislike" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:text-rose-700",
            ].join(" ")}
            disabled={isPending}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.499 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
            </svg>
            لم يعجبني
            <span className="text-xs text-slate-500">{reactionCounts.dislike}</span>
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)]">
        <h3 className="text-lg font-black text-slate-950">التعليقات</h3>

        {!authUser ? (
          <form onSubmit={handleAuth} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
                required
              />
              {authMode !== "reset" ? (
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
                  required
                />
              ) : (
                <div className="text-xs text-slate-500">
                  سنرسل لك رابط استعادة كلمة المرور على بريدك.
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={authMode === "login" ? "text-orange-600" : "hover:text-orange-600"}
              >
                تسجيل الدخول
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={authMode === "signup" ? "text-orange-600" : "hover:text-orange-600"}
              >
                إنشاء حساب
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setAuthMode("reset")}
                className={authMode === "reset" ? "text-orange-600" : "hover:text-orange-600"}
              >
                نسيت كلمة المرور
              </button>
            </div>
            <button
              type="submit"
              disabled={authSubmitting}
              className="inline-flex min-w-40 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {authMode === "signup" ? "إنشاء حساب" : authMode === "reset" ? "إرسال رابط الاستعادة" : "تسجيل الدخول"}
            </button>
            {status.message ? (
              <div className={status.type === "error" ? "text-sm text-rose-600" : "text-sm text-emerald-600"}>
                {status.message}
              </div>
            ) : null}
          </form>
        ) : (
          <form onSubmit={handleCommentSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={commentForm.name}
              onChange={(event) => updateCommentField("name", event.target.value)}
              placeholder="اسمك (اختياري)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
            />
            <div className="text-xs text-slate-500">
              مرحبًا {authUser.email}. <button type="button" onClick={handleSignOut} className="text-orange-600">تسجيل خروج</button>
            </div>
          </div>
          <textarea
            value={commentForm.content}
            onChange={(event) => updateCommentField("content", event.target.value)}
            rows={4}
            placeholder="اكتب رأيك أو المشكلة التي تواجهها..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-w-40 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "جارٍ النشر..." : "نشر التعليق"}
            </button>
            {status.message ? (
              <span className={status.type === "error" ? "text-sm text-rose-600" : "text-sm text-emerald-600"}>
                {status.message}
              </span>
            ) : null}
          </div>
        </form>
        )}

        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              لا توجد تعليقات بعد. كن أول من يشارك رأيه.
            </div>
          ) : (
            comments
              .filter((comment) => !comment.parent_id)
              .map((comment) => {
                const replies = comments.filter((reply) => reply.parent_id === comment.id);
                return (
                  <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{comment.author_name}</span>
                      <span>•</span>
                      <span>{new Date(comment.created_at).toLocaleString("ar-MA")}</span>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-3 space-y-3">
                        <textarea
                          value={editingContent}
                          onChange={(event) => setEditingContent(event.target.value)}
                          rows={3}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(comment.id)}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            disabled={isPending}
                          >
                            حفظ التعديل
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm leading-7 text-slate-700">{comment.content}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => openReport(comment.id)}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        بلاغ
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingToId(comment.id)}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        رد
                      </button>
                      {authUser && comment.user_id && comment.user_id === authUser.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(comment)}
                            className="text-slate-600 hover:text-slate-800"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteComment(comment.id)}
                            className="text-slate-600 hover:text-slate-800"
                          >
                            حذف
                          </button>
                        </>
                      ) : null}
                    </div>

                    {replyingToId === comment.id ? (
                      <form onSubmit={handleReplySubmit} className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-4 py-4">
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          rows={3}
                          placeholder="اكتب ردّك..."
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-full bg-[var(--blog-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--blog-accent-strong)] disabled:opacity-70"
                          >
                            إرسال الرد
                          </button>
                          <button
                            type="button"
                            onClick={resetReply}
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {replies.length > 0 ? (
                      <div className="mt-4 space-y-3 border-r-2 border-orange-100 pr-4">
                        {replies.map((reply) => (
                          <div key={reply.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-slate-700">{reply.author_name}</span>
                              <span>•</span>
                              <span>{new Date(reply.created_at).toLocaleString("ar-MA")}</span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-700">{reply.content}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                              <button
                                type="button"
                                onClick={() => openReport(reply.id)}
                                className="text-rose-600 hover:text-rose-700"
                              >
                                بلاغ
                              </button>
                              {authUser && reply.user_id && reply.user_id === authUser.id ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEdit(reply)}
                                    className="text-slate-600 hover:text-slate-800"
                                  >
                                    تعديل
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteComment(reply.id)}
                                    className="text-slate-600 hover:text-slate-800"
                                  >
                                    حذف
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })
          )}
        </div>
      </section>

      {reportState.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={submitReport}
            className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xl font-black text-slate-950">إبلاغ عن تعليق</h4>
                <p className="mt-2 text-sm text-slate-600">
                  ساعدنا في تحسين المجتمع بإبلاغنا عن التعليقات المسيئة أو غير المناسبة.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReport}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                إغلاق
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                السبب
                <select
                  value={reportState.reason}
                  onChange={(event) => setReportState((current) => ({ ...current, reason: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
                >
                  <option value="إساءة">إساءة</option>
                  <option value="سبام">سبام</option>
                  <option value="محتوى غير لائق">محتوى غير لائق</option>
                  <option value="معلومات مضللة">معلومات مضللة</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-800">
                تفاصيل إضافية (اختياري)
                <textarea
                  value={reportState.details}
                  onChange={(event) => setReportState((current) => ({ ...current, details: event.target.value }))}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeReport}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
              >
                إرسال البلاغ
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
