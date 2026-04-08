"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "dribdo_video_auto_next";

function getSessionId() {
  try {
    const key = "dribdo_video_session";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const created = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, created);
    return created;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export default function MomentsVideoPlayerClient({ src = "", nextSrc = "", prevSrc = "", nextId = "", autoNext = true, postId = "", userId = "" }) {
  const router = useRouter();
  const mainRef = useRef(null);
  const nextLockRef = useRef(false);
  const progressTickRef = useRef(0);
  const sessionId = useMemo(() => getSessionId(), []);
  const [autoNextEnabled, setAutoNextEnabled] = useState(() => {
    if (typeof window === "undefined") return autoNext;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "0") return false;
      if (saved === "1") return true;
    } catch {}
    return autoNext;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, autoNextEnabled ? "1" : "0");
    } catch {}
  }, [autoNextEnabled]);

  useEffect(() => {
    async function sendEvent(eventType, watchSeconds = 0) {
      if (!postId) return;
      const payload = {
        postId,
        userId,
        eventType,
        watchSeconds,
        sessionId,
        path: typeof window !== "undefined" ? window.location.pathname : "",
      };

      try {
        const body = JSON.stringify(payload);
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([body], { type: "application/json" });
          navigator.sendBeacon("/api/video/analytics", blob);
        } else {
          await fetch("/api/video/analytics", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
            keepalive: true,
          });
        }
      } catch {}
    }

    const video = mainRef.current;
    if (!video) return;

    video.muted = true;
    const tryPlay = () => {
      video.play().catch(() => {});
    };

    sendEvent("open", 0);
    tryPlay();
    video.addEventListener("loadedmetadata", tryPlay);
    nextLockRef.current = false;
    progressTickRef.current = 0;

    function onPlay() {
      sendEvent("play", Math.floor(video.currentTime || 0));
    }

    function onPause() {
      sendEvent("pause", Math.floor(video.currentTime || 0));
    }

    function onTimeUpdate() {
      const seconds = Math.floor(video.currentTime || 0);
      if (seconds >= progressTickRef.current + 10) {
        progressTickRef.current = seconds;
        sendEvent("progress", seconds);
      }
    }

    function onEnded() {
      const seconds = Math.floor(video.currentTime || 0);
      sendEvent("ended", seconds);
      if (!autoNextEnabled || !nextId || nextLockRef.current) return;
      nextLockRef.current = true;
      sendEvent("auto_next", seconds);
      router.push(`/video/${nextId}`);
    }

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [autoNextEnabled, nextId, postId, router, sessionId, src, userId]);

  return (
    <>
      <div className="relative">
        <video ref={mainRef} src={src} controls autoPlay muted playsInline preload="auto" className="w-full rounded-2xl bg-black" />

        <button
          type="button"
          onClick={() => setAutoNextEnabled((v) => !v)}
          className={[
            "absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white",
            autoNextEnabled ? "bg-emerald-600/90" : "bg-slate-700/90",
          ].join(" ")}
        >
          {autoNextEnabled ? "التشغيل التالي: مفعل" : "التشغيل التالي: متوقف"}
        </button>
      </div>

      {nextSrc ? <video src={nextSrc} preload="metadata" muted className="hidden" aria-hidden="true" tabIndex={-1} /> : null}
      {prevSrc ? <video src={prevSrc} preload="metadata" muted className="hidden" aria-hidden="true" tabIndex={-1} /> : null}
    </>
  );
}
