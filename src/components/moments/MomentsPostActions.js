"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { orderedReactionOptions, reactionByValue } from "@/components/moments/reactions";

const PICKER_OPTIONS = orderedReactionOptions();

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ar-MA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function prettyCount(value) {
  const n = Number(value || 0);
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;
}

function avatarFor(name, explicit = "") {
  if (explicit) return explicit;
  const safe = encodeURIComponent(String(name || "مستخدم").slice(0, 30));
  return `https://ui-avatars.com/api/?name=${safe}&background=e2e8f0&color=0f172a&size=96&bold=true`;
}

function normalizeCounts(post) {
  return {
    likes: Number(post?.likes_count || 0),
    comments: Number(post?.comments_count || 0),
    shares: Number(post?.shares_count || 0),
    views: Number(post?.views_count || 0),
  };
}

export default function MomentsPostActions({ postId, postAuthorId, onMutated }) {
  const [counts, setCounts] = useState({ likes: 0, comments: 0, shares: 0, views: 0 });
  const [myReaction, setMyReaction] = useState("");
  const [reactionStats, setReactionStats] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [status, setStatus] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isPending, startTransition] = useTransition();

  const myReactionView = useMemo(() => reactionByValue(myReaction), [myReaction]);

  const refreshPostMeta = useCallback(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase || !postId) return;

    const { data: postRow } = await supabase
      .from("posts")
      .select("likes_count,comments_count,shares_count,views_count")
      .eq("id", postId)
      .maybeSingle();

    if (postRow) setCounts(normalizeCounts(postRow));

    const { data: reactionRows } = await supabase.from("reactions").select("type").eq("post_id", postId).limit(300);
    if (!reactionRows) {
      setReactionStats([]);
      return;
    }

    const map = new Map();
    for (const row of reactionRows) {
      const key = String(row?.type || "").trim();
      if (!key || key === "none") continue;
      map.set(key, Number(map.get(key) || 0) + 1);
    }

    const stats = [...map.entries()]
      .map(([type, count]) => ({ type, count, meta: reactionByValue(type) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    setReactionStats(stats);
  }, [postId]);

  const loadComments = useCallback(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase || !postId) return;

    let rows = [];
    const firstTry = await supabase
      .from("comments")
      .select("id,user_id,content,created_at,parent_id,is_deleted")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (firstTry.error) {
      const fallback = await supabase
        .from("comments")
        .select("id,user_id,content,created_at,parent_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .limit(30);
      rows = fallback.data || [];
    } else {
      rows = (firstTry.data || []).filter((row) => row.is_deleted !== true);
    }

    const onlyTopLevel = rows.filter((row) => !row.parent_id);
    const userIds = [...new Set(onlyTopLevel.map((row) => String(row.user_id || "")).filter(Boolean))];

    let profileMap = new Map();
    if (userIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("id,name,avatar_url").in("id", userIds);
      profileMap = new Map((profiles || []).map((p) => [String(p.id), p]));
    }

    setComments(
      onlyTopLevel.map((row) => {
        const profile = profileMap.get(String(row.user_id || "")) || {};
        const name = String(profile.name || "").trim() || "مستخدم";
        return {
          id: row.id,
          userId: String(row.user_id || ""),
          content: row.content || "",
          createdAt: row.created_at,
          name,
          avatar: avatarFor(name, String(profile.avatar_url || "").trim()),
        };
      })
    );
  }, [postId]);

  useEffect(() => {
    let active = true;

    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase || !postId || !active) return;

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      if (!active) return;
      setAuthUser(user);

      if (user?.id) {
        const { data: reactionRow } = await supabase
          .from("reactions")
          .select("type")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (active) setMyReaction(String(reactionRow?.type || ""));
      }

      await Promise.all([refreshPostMeta(), loadComments()]);
    })();

    return () => {
      active = false;
    };
  }, [postId, refreshPostMeta, loadComments]);

  function applyReaction(reactionValue) {
    if (!postId) return;
    if (!authUser?.id) {
      setStatus("سجّل الدخول للتفاعل.");
      return;
    }

    setShowPicker(false);
    setStatus("");

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      try {
        await supabase.rpc("simple_toggle_reaction", {
          p_user_id: authUser.id,
          p_post_id: postId,
          p_type: reactionValue,
        });
      } catch (_) {
        const { data: existing } = await supabase
          .from("reactions")
          .select("id,type")
          .eq("post_id", postId)
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (existing && existing.type === reactionValue) {
          await supabase.from("reactions").delete().eq("id", existing.id);
        } else if (existing) {
          await supabase.from("reactions").update({ type: reactionValue }).eq("id", existing.id);
        } else {
          await supabase.from("reactions").insert({ post_id: postId, user_id: authUser.id, type: reactionValue });
        }
      }

      const { data: myRow } = await supabase
        .from("reactions")
        .select("type")
        .eq("post_id", postId)
        .eq("user_id", authUser.id)
        .maybeSingle();

      setMyReaction(String(myRow?.type || ""));
      await refreshPostMeta();
      onMutated?.();
    });
  }

  function submitComment(event) {
    event.preventDefault();
    if (!postId) return;
    if (!authUser?.id) {
      setStatus("سجّل الدخول للتعليق.");
      return;
    }

    const content = commentText.trim();
    if (!content) {
      setStatus("اكتب تعليقًا أولًا.");
      return;
    }

    setStatus("");

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: authUser.id,
        content,
        type: "text",
        created_at: new Date().toISOString(),
      });

      if (error) {
        setStatus(error.message || "تعذر نشر التعليق.");
        return;
      }

      try {
        await supabase.rpc("increment_post_comments", { post_id_param: postId });
      } catch (_) {
        const { data: current } = await supabase.from("posts").select("comments_count").eq("id", postId).maybeSingle();
        await supabase.from("posts").update({ comments_count: Number(current?.comments_count || 0) + 1 }).eq("id", postId);
      }

      setCommentText("");
      setShowComments(true);
      await Promise.all([refreshPostMeta(), loadComments()]);
      onMutated?.();
    });
  }

  async function shareExternal() {
    if (!postId) return;
    const url = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({ url, title: "منشور من دريبدو" });
        return;
      } catch (_) {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("تم نسخ رابط المنشور.");
    } catch (_) {
      setStatus(url);
    }
  }

  function shareInside() {
    if (!postId) return;
    if (!authUser?.id) {
      setStatus("سجّل الدخول للمشاركة.");
      return;
    }

    setShowShare(false);
    setStatus("");

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      const insertPayload = {
        user_id: authUser.id,
        content: "قام بمشاركة منشور",
        type: "shared",
        shared_post_id: postId,
        posts_privacy: "everyone",
        post_source_type: "user_post",
      };

      const { error: insertError } = await supabase.from("posts").insert(insertPayload);
      if (insertError) {
        setStatus(insertError.message || "تعذرت المشاركة داخل دريبدو.");
        return;
      }

      try {
        await supabase.rpc("increment_post_shares", { post_id_param: postId });
      } catch (_) {
        const { data: current } = await supabase.from("posts").select("shares_count").eq("id", postId).maybeSingle();
        await supabase.from("posts").update({ shares_count: Number(current?.shares_count || 0) + 1 }).eq("id", postId);
      }

      await refreshPostMeta();
      onMutated?.();
      setStatus("تمت مشاركة المنشور.");
    });
  }

  const reactionTotal = useMemo(() => reactionStats.reduce((sum, item) => sum + Number(item.count || 0), 0), [reactionStats]);

  return (
    <div className="mt-2 rounded-b-2xl border-t border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] text-slate-500">
        <button
          type="button"
          onClick={() => setShowPicker((value) => !value)}
          className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 transition hover:bg-slate-100"
        >
          <span className="relative flex items-center">
            {reactionStats.length ? (
              reactionStats.map((item, index) => (
                <span
                  key={`${item.type}-${index}`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white text-xs"
                  style={{ marginInlineStart: index === 0 ? 0 : -8, zIndex: 4 - index }}
                  title={item.meta?.label || item.type}
                >
                  {item.meta?.emoji || "👍"}
                </span>
              ))
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs">👍</span>
            )}
          </span>
          <span>{prettyCount(reactionTotal || counts.likes)}</span>
        </button>

        <div className="flex items-center gap-3">
          {counts.comments > 0 ? <span>{prettyCount(counts.comments)} تعليق</span> : null}
          {counts.shares > 0 ? <span>{prettyCount(counts.shares)} مشاركة</span> : null}
          {counts.views > 0 ? <span>{prettyCount(counts.views)} مشاهدة</span> : null}
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-1 border-y border-slate-100 px-2 py-1">
        <button
          type="button"
          onClick={() => {
            if (!myReaction || myReaction === "none" || myReaction === "like") {
              applyReaction("like");
            } else {
              setShowPicker(true);
            }
          }}
          onMouseEnter={() => {
            if (myReaction && myReaction !== "none" && myReaction !== "like") {
              setShowPicker(true);
            }
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <span>{myReactionView?.emoji || "👍"}</span>
          <span>{myReactionView?.label || "أعجبني"}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((value) => !value)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <span>💬</span>
          <span>تعليق</span>
        </button>

        <button
          type="button"
          onClick={() => setShowShare((value) => !value)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <span>↗</span>
          <span>مشاركة</span>
        </button>
      </div>

      {showPicker ? (
        <div className="border-b border-slate-100 bg-slate-50 px-2 py-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PICKER_OPTIONS.map((reaction, index) => (
              <button
                key={reaction.value}
                type="button"
                onClick={() => applyReaction(reaction.value)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-red-300"
              >
                <span className="text-sm">{reaction.emoji}</span>
                <span>{reaction.label}</span>
                {index === 1 ? <span className="ms-1 h-4 w-px bg-slate-200" aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showShare ? (
        <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={shareInside}
              disabled={isPending}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-70"
            >
              مشاركة داخل دريبدو
            </button>
            <button
              type="button"
              onClick={shareExternal}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              مشاركة خارجية
            </button>
          </div>
        </div>
      ) : null}

      <div className="px-3 py-2">
        <form onSubmit={submitComment} className="flex items-center gap-2">
          <img
            src={avatarFor(authUser?.user_metadata?.name || "أنت", authUser?.user_metadata?.avatar_url || "")}
            alt="صورة المستخدم"
            className="h-7 w-7 rounded-full border border-slate-200"
            loading="lazy"
          />
          <input
            type="text"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={authUser ? "اكتب تعليقًا..." : "سجّل الدخول للتعليق"}
            disabled={!authUser || isPending}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800 outline-none transition focus:border-red-300"
          />
          <button
            type="submit"
            disabled={!authUser || isPending}
            className="rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-800 disabled:opacity-70"
          >
            نشر
          </button>
        </form>
      </div>

      {showComments ? (
        <div className="space-y-2 border-t border-slate-100 px-3 py-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <article key={comment.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-start gap-2">
                  <img src={comment.avatar} alt={comment.name} className="mt-0.5 h-7 w-7 rounded-full border border-slate-200" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-800">{comment.name}</span>
                      <span>{formatDate(comment.createdAt)}</span>
                      {comment.userId && comment.userId === postAuthorId ? (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px]">صاحب المنشور</span>
                      ) : null}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-6 text-slate-700">{comment.content}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-xs text-slate-500">لا توجد تعليقات بعد.</div>
          )}
        </div>
      ) : null}

      {status ? <div className="border-t border-slate-100 px-3 py-2 text-xs text-rose-700">{status}</div> : null}
    </div>
  );
}
