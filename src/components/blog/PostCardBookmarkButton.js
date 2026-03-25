"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

function formatCount(value) {
  const count = Number(value) || 0;
  if (count < 1000) return String(count);
  if (count < 1000000) return `${Math.round(count / 100) / 10}k`;
  return `${Math.round(count / 100000) / 10}m`;
}

function BookmarkIcon({ filled = false, className = "" }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="currentColor"
          d="M6 3h12a2 2 0 0 1 2 2v17l-8-4-8 4V5a2 2 0 0 1 2-2z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M6 3h12a2 2 0 0 1 2 2v17l-8-4-8 4V5a2 2 0 0 1 2-2z"
      />
    </svg>
  );
}

export default function PostCardBookmarkButton({ postId, slug }) {
  const [session, setSession] = useState(null);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);

  const canUse = useMemo(() => Boolean(isSupabaseConfigured() && postId && slug), [postId, slug]);

  useEffect(() => {
    if (!canUse) return;
    let active = true;
    let subscription = null;

    async function loadSavedState(supabase, userId) {
      if (!userId) {
        setSaved(false);
        return;
      }

      const { data: bookmarkRow } = await supabase
        .from("blog_post_bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!active) return;
      setSaved(Boolean(bookmarkRow?.id));
    }

    async function load() {
      const supabase = await getSupabaseClient();
      if (!supabase || !active) return;

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!active) return;
      setSession(currentSession);

      // Public aggregate (count only)
      const { data: countData } = await supabase.rpc("get_post_bookmark_count", { post_slug: slug });
      if (!active) return;
      setCount(Number(countData) || 0);

      await loadSavedState(supabase, currentSession?.user?.id || null);

      subscription = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        // Update saved state if user logs in/out while staying on the page.
        loadSavedState(supabase, nextSession?.user?.id || null);
      })?.data?.subscription;
    }

    load();
    return () => {
      active = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [canUse, postId, slug]);

  async function toggle(event) {
    // This button sits on top of a Link; prevent navigation.
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (!canUse) return;

    setPending(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      const {
        data: { session: latestSession },
      } = await supabase.auth.getSession();
      setSession(latestSession);

      if (!latestSession?.user) {
        window.location.href = "/auth";
        return;
      }

      if (saved) {
        const { error } = await supabase.from("blog_post_bookmarks").delete().eq("post_id", postId).eq("user_id", latestSession.user.id);
        if (error) throw error;
        setSaved(false);
        setCount((c) => Math.max(0, (Number(c) || 0) - 1));
      } else {
        const { error } = await supabase.from("blog_post_bookmarks").insert({ post_id: postId, user_id: latestSession.user.id, folder: null });
        if (error) throw error;
        setSaved(true);
        setCount((c) => (Number(c) || 0) + 1);
      }
    } finally {
      setPending(false);
    }
  }

  if (!canUse) return null;

  return (
    <div dir="rtl" className="absolute right-3 top-3 z-10">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        aria-label={saved ? "إزالة من المحفوظات" : "حفظ المنشور"}
        title={saved ? "محفوظ" : "حفظ"}
        className={[
          "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-extrabold shadow-sm backdrop-blur transition",
          "disabled:cursor-not-allowed disabled:opacity-60",
          saved ? "border-slate-900 bg-slate-900/95 text-white" : "border-white/60 bg-white/92 text-slate-900 hover:bg-white",
        ].join(" ")}
      >
        <BookmarkIcon filled={saved} className="h-4 w-4" />
        <span className={saved ? "text-white" : "text-slate-900"}>{formatCount(count)}</span>
      </button>
    </div>
  );
}
