"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import CommentReactionButtons from "@/components/forum/CommentReactionButtons";

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

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString("ar-MA");
  } catch {
    return "";
  }
}

function buildAvatarUrl(name, explicitUrl = "") {
  if (explicitUrl) return explicitUrl;
  const safeName = encodeURIComponent((name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safeName}&background=e8eef6&color=0f172a&size=96&bold=true`;
}

export default function PostInteractions({ postId }) {
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [authUser, setAuthUser] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [replyingToId, setReplyingToId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [expandedComments, setExpandedComments] = useState(false);
  const [reactionCounts, setReactionCounts] = useState({ like: 0, dislike: 0 });
  const [myReaction, setMyReaction] = useState("");
  const [isPending, startTransition] = useTransition();

  const sessionId = useMemo(() => getSessionId(), []);

  const loadComments = useCallback(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase || !postId) return;

    let commentRows = [];
    const withAvatar = await supabase
      .from("blog_post_comments")
      .select("id, author_name, author_avatar_url, content, created_at, session_id, user_id, parent_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (withAvatar.error) {
      const fallback = await supabase
        .from("blog_post_comments")
        .select("id, author_name, content, created_at, session_id, user_id, parent_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      commentRows = fallback.data || [];
    } else {
      commentRows = withAvatar.data || [];
    }

    setComments(commentRows);
  }, [postId]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const supabase = await getSupabaseClient();
      if (!supabase || !postId) return;

      const { data: authData } = await supabase.auth.getUser();
      const { data: reactionRows } = await supabase
        .from("blog_post_reactions")
        .select("reaction, session_id")
        .eq("post_id", postId);

      if (!active) return;
      setAuthUser(authData?.user || null);

      await loadComments();

      const rows = reactionRows || [];
      const like = rows.filter((row) => row.reaction === "like").length;
      const dislike = rows.filter((row) => row.reaction === "dislike").length;
      setReactionCounts({ like, dislike });
      const mine = rows.find((row) => row.session_id === sessionId);
      setMyReaction(mine?.reaction || "");
    }

    loadData();

    return () => {
      active = false;
    };
  }, [loadComments, postId, sessionId]);

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

  const topLevelComments = useMemo(
    () => comments.filter((comment) => !comment.parent_id),
    [comments]
  );

  const visibleTopLevelComments = useMemo(() => {
    if (expandedComments) return topLevelComments;
    return topLevelComments.slice(0, 10);
  }, [expandedComments, topLevelComments]);

  function getReplies(parentId) {
    return comments
      .filter((comment) => comment.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  function getDisplayName() {
    const metadata = authUser?.user_metadata || {};
    return (
      String(metadata.full_name || "").trim() ||
      String(metadata.display_name || "").trim() ||
      String(authUser?.email || "").trim() ||
      "مستخدم"
    );
  }

  function getDisplayNameFromUser(user) {
    const metadata = user?.user_metadata || {};
    return (
      String(metadata.full_name || "").trim() ||
      String(metadata.display_name || "").trim() ||
      String(user?.email || "").trim() ||
      "مستخدم"
    );
  }

  function getMyAvatar() {
    const metadata = authUser?.user_metadata || {};
    return String(metadata.avatar_url || "").trim();
  }

  function getAvatarFromUser(user) {
    const metadata = user?.user_metadata || {};
    return String(metadata.avatar_url || "").trim();
  }

  function getResolvedAvatar(comment, isOwner) {
    const ownerAvatar = isOwner ? getAvatarFromUser(authUser) : "";
    return buildAvatarUrl(comment.author_name, comment.author_avatar_url || ownerAvatar);
  }

  async function insertCommentWithFallback(payload) {
    const supabase = await getSupabaseClient();
    if (!supabase) return { data: null, error: new Error("SUPABASE_UNAVAILABLE") };

    const withAvatar = await supabase
      .from("blog_post_comments")
      .insert(payload)
      .select("id, author_name, author_avatar_url, content, created_at, session_id, user_id, parent_id")
      .single();

    if (!withAvatar.error) return withAvatar;

    if (String(withAvatar.error.message || "").toLowerCase().includes("author_avatar_url")) {
      const { author_avatar_url, ...legacyPayload } = payload;
      const fallback = await supabase
        .from("blog_post_comments")
        .insert(legacyPayload)
        .select("id, author_name, content, created_at, session_id, user_id, parent_id")
        .single();
      return fallback;
    }

    return withAvatar;
  }

  function handlePostReaction(nextReaction) {
    if (!postId) return;
    setStatus({ type: "", message: "" });

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

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
    if (!authUser) {
      setStatus({ type: "error", message: "يجب تسجيل الدخول للتعليق." });
      return;
    }

    const content = commentContent.trim();
    if (content.length < 2) {
      setStatus({ type: "error", message: "اكتب تعليقًا واضحًا (حرفان على الأقل)." });
      return;
    }

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      const { data: latestAuth } = supabase ? await supabase.auth.getUser() : { data: null };
      const freshUser = latestAuth?.user || authUser;
      if (!freshUser?.id) {
        setStatus({ type: "error", message: "يجب تسجيل الدخول للتعليق." });
        return;
      }

      const payload = {
        post_id: postId,
        session_id: sessionId,
        user_id: freshUser.id,
        author_name: getDisplayNameFromUser(freshUser),
        author_avatar_url: getAvatarFromUser(freshUser),
        content,
      };

      const { data, error } = await insertCommentWithFallback(payload);
      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر نشر التعليق." });
        return;
      }

      if (data) {
        setComments((current) => [data, ...current]);
      } else {
        await loadComments();
      }

      setCommentContent("");
      setStatus({ type: "success", message: "تم نشر التعليق بنجاح." });
    });
  }

  function handleReplySubmit(event) {
    event.preventDefault();
    if (!replyingToId) return;

    if (!authUser) {
      setStatus({ type: "error", message: "يجب تسجيل الدخول للرد." });
      return;
    }

    const content = replyText.trim();
    if (content.length < 2) {
      setStatus({ type: "error", message: "اكتب ردًا واضحًا (حرفان على الأقل)." });
      return;
    }

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      const { data: latestAuth } = supabase ? await supabase.auth.getUser() : { data: null };
      const freshUser = latestAuth?.user || authUser;
      if (!freshUser?.id) {
        setStatus({ type: "error", message: "يجب تسجيل الدخول للرد." });
        return;
      }

      const payload = {
        post_id: postId,
        parent_id: replyingToId,
        session_id: sessionId,
        user_id: freshUser.id,
        author_name: getDisplayNameFromUser(freshUser),
        author_avatar_url: getAvatarFromUser(freshUser),
        content,
      };

      const { data, error } = await insertCommentWithFallback(payload);
      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر نشر الرد." });
        return;
      }

      if (data) {
        setComments((current) => [data, ...current]);
      } else {
        await loadComments();
      }

      setReplyText("");
      setReplyingToId("");
      setStatus({ type: "success", message: "تم نشر الرد." });
    });
  }

  function startEdit(comment) {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content || "");
  }

  function cancelEdit() {
    setEditingCommentId("");
    setEditingContent("");
  }

  function saveEdit(commentId) {
    const content = editingContent.trim();
    if (content.length < 2) {
      setStatus({ type: "error", message: "التعليق قصير جدًا." });
      return;
    }

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      const { error } = await supabase
        .from("blog_post_comments")
        .update({ content })
        .eq("id", commentId);

      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر تعديل التعليق." });
        return;
      }

      setComments((current) =>
        current.map((item) => (item.id === commentId ? { ...item, content } : item))
      );
      cancelEdit();
      setStatus({ type: "success", message: "تم تعديل التعليق." });
    });
  }

  function deleteComment(commentId) {
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      const { error } = await supabase.from("blog_post_comments").delete().eq("id", commentId);
      if (error) {
        setStatus({ type: "error", message: error.message || "تعذر حذف التعليق." });
        return;
      }

      setComments((current) =>
        current.filter((item) => item.id !== commentId && item.parent_id !== commentId)
      );
      setStatus({ type: "success", message: "تم حذف التعليق." });
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => handlePostReaction("like")}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition",
              myReaction === "like" ? "border-emerald-400" : "border-slate-300",
            ].join(" ")}
            disabled={isPending}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-black" fill="currentColor" aria-hidden="true">
              <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
            </svg>
            <span>{reactionCounts.like}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePostReaction("dislike")}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition",
              myReaction === "dislike" ? "border-rose-400" : "border-slate-300",
            ].join(" ")}
            disabled={isPending}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-black" fill="currentColor" aria-hidden="true">
              <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.498 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
            </svg>
            <span>{reactionCounts.dislike}</span>
          </button>

          <span className="text-slate-500">عدد التعليقات: {topLevelComments.length}</span>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <h3 className="text-lg font-black text-slate-900">التعليقات</h3>

        <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
          <textarea
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            rows={3}
            placeholder={authUser ? "اكتب تعليقك هنا..." : "سجّل الدخول أولًا حتى تتمكن من التعليق"}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white"
            disabled={!authUser || isPending}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={!authUser || isPending}
              className="inline-flex min-w-36 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "جارٍ النشر..." : "نشر التعليق"}
            </button>
            {!authUser ? (
              <span className="text-xs text-slate-500">لتفعيل التعليقات: سجّل الدخول من صفحة الحساب.</span>
            ) : null}
          </div>
        </form>

        {status.message ? (
          <div
            className={[
              "mt-4 rounded-xl border px-3 py-2 text-sm",
              status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {status.message}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {topLevelComments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              لا توجد تعليقات بعد. كن أول من يعلّق.
            </div>
          ) : (
            visibleTopLevelComments.map((comment) => {
              const replies = getReplies(comment.id);
              const isOwner = Boolean(authUser?.id && comment.user_id && authUser.id === comment.user_id);
              const avatar = getResolvedAvatar(comment, isOwner);

              return (
                <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={avatar}
                      alt={comment.author_name || "مستخدم"}
                      className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">{comment.author_name || "مستخدم"}</span>
                        <span>•</span>
                        <span>{formatDate(comment.created_at)}</span>
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={(event) => setEditingContent(event.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-orange-300"
                          />
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => saveEdit(comment.id)}
                              className="rounded-full bg-emerald-600 px-3 py-1.5 text-white"
                              disabled={isPending}
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-700"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.content}</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                        <CommentReactionButtons commentId={comment.id} />
                        <button
                          type="button"
                          onClick={() => setReplyingToId(comment.id)}
                          className="text-slate-700 hover:text-slate-900"
                        >
                          رد
                        </button>
                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(comment)}
                              className="text-slate-700 hover:text-slate-900"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteComment(comment.id)}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              حذف
                            </button>
                          </>
                        ) : null}
                      </div>

                      {replyingToId === comment.id ? (
                        <form onSubmit={handleReplySubmit} className="mt-3 space-y-2 rounded-xl border border-orange-200 bg-orange-50/30 p-3">
                          <textarea
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            rows={2}
                            placeholder="اكتب ردك..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-300"
                          />
                          <div className="flex gap-2 text-xs font-semibold">
                            <button
                              type="submit"
                              disabled={isPending}
                              className="rounded-full bg-[var(--blog-accent)] px-3 py-1.5 text-white"
                            >
                              نشر الرد
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToId("");
                                setReplyText("");
                              }}
                              className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-700"
                            >
                              إلغاء
                            </button>
                          </div>
                        </form>
                      ) : null}

                      {replies.length > 0 ? (
                        <div className="mt-4 space-y-2 border-r-2 border-slate-100 pr-3">
                          {replies.map((reply) => {
                            const replyOwner = Boolean(authUser?.id && reply.user_id && authUser.id === reply.user_id);
                            const replyAvatar = getResolvedAvatar(reply, replyOwner);

                            return (
                              <div key={reply.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                <div className="flex items-start gap-2.5">
                                  <img
                                    src={replyAvatar}
                                    alt={reply.author_name || "مستخدم"}
                                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                                    loading="lazy"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                      <span className="font-semibold text-slate-800">{reply.author_name || "مستخدم"}</span>
                                      <span>•</span>
                                      <span>{formatDate(reply.created_at)}</span>
                                    </div>
                                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">{reply.content}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                                      <CommentReactionButtons commentId={reply.id} />
                                      {replyOwner ? (
                                        <button
                                          type="button"
                                          onClick={() => deleteComment(reply.id)}
                                          className="text-rose-600 hover:text-rose-700"
                                        >
                                          حذف
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {topLevelComments.length > 10 ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setExpandedComments((current) => !current)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              {expandedComments ? "إخفاء المزيد" : `عرض المزيد (${topLevelComments.length - 10})`}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
