"use client";

import { useEffect } from "react";

function ensureViewerId() {
  const key = "dribdo_viewer_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

export default function BlogViewTracker({ postId }) {
  useEffect(() => {
    if (!postId) return;
    const viewerId = ensureViewerId();
    const markerKey = `viewed_post_${postId}`;
    if (window.sessionStorage.getItem(markerKey)) return;

    fetch("/api/blog/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId, viewerId }),
    }).finally(() => {
      window.sessionStorage.setItem(markerKey, "1");
    });
  }, [postId]);

  return null;
}
