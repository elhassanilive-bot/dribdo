"use client";

import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

function shouldCountView(postId) {
  if (typeof window === "undefined") return false;
  const key = `dribdo_viewed_${postId}`;
  if (window.sessionStorage.getItem(key)) {
    return false;
  }
  window.sessionStorage.setItem(key, "1");
  return true;
}

export default function PostViewTracker({ postId }) {
  useEffect(() => {
    if (!postId || !shouldCountView(postId)) return;

    let active = true;

    async function run() {
      const supabase = await getSupabaseClient();
      if (!supabase || !active) return;

      await supabase.rpc("increment_blog_post_views", {
        p_post_id: postId,
      });
    }

    run();

    return () => {
      active = false;
    };
  }, [postId]);

  return null;
}
