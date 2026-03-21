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

export default function ForumPostCardActions({ postId }) {
  const [reactionCounts, setReactionCounts] = useState({ like: 0, dislike: 0 });
  const [commentCount, setCommentCount] = useState(0);
  const [myReaction, setMyReaction] = useState("");
  const [commentText, setCommentText] = useState("");
  const [status, setStatus] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [isPending, startTransition] = useTransition();
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      const { data: authData } = await supabase.auth.getUser();
      if (active) setAuthUser(authData?.user || null);

      const { data: reactionRows } = await supabase
        .from("blog_post_reactions")
        .select("reaction, session_id")
        .eq("post_id", postId);

      const { data: commentRows } = await supabase
        .from("blog_post_comments")
        .select("id")
        .eq("post_id", postId);

      if (!active) return;
      const likeCount = (reactionRows || []).filter((row) => row.reaction === "like").length;
      const dislikeCount = (reactionRows || []).filter((row) => row.reaction === "dislike").length;
      setReactionCounts({ like: likeCount, dislike: dislikeCount });
      setCommentCount((commentRows || []).length);
      const mine = (reactionRows || []).find((row) => row.session_id === sessionId);
      setMyReaction(mine?.reaction || "");
    }

    if (postId) load();
    return () => {
      active = false;
    };
  }, [postId, sessionId]);

  function handleReaction(nextReaction) {
    if (!postId) return;
    setStatus("");
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

  function handleQuickComment() {
    if (!authUser) {
      setStatus("سجل الدخول أولًا للتعليق.");
      return;
    }
    if (!commentText.trim()) {
      setStatus("اكتب تعليقًا قصيرًا أولًا.");
      return;
    }

    setStatus("");
    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      const { error } = await supabase.from("blog_post_comments").insert({
        post_id: postId,
        session_id: sessionId,
        user_id: authUser.id,
        author_name: authUser.email || "مستخدم",
        content: commentText.trim(),
      });

      if (error) {
        setStatus("تعذر نشر التعليق.");
        return;
      }

      setCommentText("");
      setCommentCount((current) => current + 1);
      setStatus("تم نشر التعليق.");
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => handleReaction("like")}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition",
            myReaction === "like" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:text-emerald-700",
          ].join(" ")}
          disabled={isPending}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 10V5a3 3 0 0 0-6 0v5" />
            <path d="M5 10h12.2a2 2 0 0 1 2 2.4l-1.2 6a2 2 0 0 1-2 1.6H7a2 2 0 0 1-2-2v-8z" />
          </svg>
          {reactionCounts.like}
        </button>
        <button
          type="button"
          onClick={() => handleReaction("dislike")}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition",
            myReaction === "dislike" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 hover:text-rose-700",
          ].join(" ")}
          disabled={isPending}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 14v5a3 3 0 0 0 6 0v-5" />
            <path d="M19 14H6.8a2 2 0 0 1-2-2.4l1.2-6a2 2 0 0 1 2-1.6H17a2 2 0 0 1 2 2v8z" />
          </svg>
          {reactionCounts.dislike}
        </button>
        <span className="text-[11px] text-slate-400">تعليقات: {commentCount}</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="اكتب تعليقًا سريعًا..."
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
        />
        <button
          type="button"
          onClick={handleQuickComment}
          className="rounded-full bg-[var(--blog-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--blog-accent-strong)]"
          disabled={isPending}
        >
          تعليق
        </button>
      </div>

      {status ? <div className="text-[11px] text-slate-500">{status}</div> : null}
    </div>
  );
}
