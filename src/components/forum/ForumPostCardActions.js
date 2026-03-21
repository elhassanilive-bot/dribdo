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

export default function ForumPostCardActions({ postId, viewCount = 0 }) {
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
    <div className="mt-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => handleReaction("like")}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 transition",
            myReaction === "like" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:text-emerald-700",
          ].join(" ")}
          disabled={isPending}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
          </svg>
          {reactionCounts.like}
        </button>
        <button
          type="button"
          onClick={() => handleReaction("dislike")}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 transition",
            myReaction === "dislike" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 hover:text-rose-700",
          ].join(" ")}
          disabled={isPending}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.498 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
          </svg>
          {reactionCounts.dislike}
        </button>
        <span className="text-[10px] text-slate-400">تعليقات: {commentCount}</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {viewCount} مشاهدة
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="اكتب تعليقًا سريعًا..."
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
        />
        <button
          type="button"
          onClick={handleQuickComment}
          className="rounded-full bg-[var(--blog-accent)] px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[var(--blog-accent-strong)]"
          disabled={isPending}
        >
          تعليق
        </button>
      </div>

      {status ? <div className="text-[10px] text-slate-500">{status}</div> : null}
    </div>
  );
}
