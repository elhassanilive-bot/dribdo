"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function canUseBrowserNotification() {
  return typeof window !== "undefined" && "Notification" in window;
}

function playBeep() {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 920;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = 0.05;
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.15);
}

async function requestNotificationPermission() {
  if (!canUseBrowserNotification()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export default function SupportRealtimeNotifier({ initialLatestTicketId = "", initialUnreadCount = 0 }) {
  const [permission, setPermission] = useState("default");
  const [unreadCount, setUnreadCount] = useState(Number(initialUnreadCount || 0));
  const [lastMessage, setLastMessage] = useState("");
  const latestTicketRef = useRef(String(initialLatestTicketId || ""));
  const startedAtRef = useRef(Date.now());

  const statusText = useMemo(() => {
    if (permission === "granted") return "التنبيه الفوري: مفعل";
    if (permission === "denied") return "التنبيه الفوري: مرفوض من المتصفح";
    return "التنبيه الفوري: يحتاج تفعيل";
  }, [permission]);

  useEffect(() => {
    let timerId;
    let cancelled = false;

    requestNotificationPermission().then((state) => {
      if (!cancelled && typeof state === "string") setPermission(state);
    });

    const poll = async () => {
      try {
        const response = await fetch("/api/support/inbox/stats", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data?.ok) return;

        const nextUnreadCount = Number(data?.stats?.unreadCount || 0);
        const nextLatestId = String(data?.stats?.latestTicketId || "");
        setUnreadCount(nextUnreadCount);

        const hasNewTicket = nextLatestId && latestTicketRef.current && nextLatestId !== latestTicketRef.current;
        const recentlyStarted = Date.now() - startedAtRef.current < 7000;
        if (hasNewTicket && !recentlyStarted) {
          setLastMessage("وصلت رسالة دعم جديدة");
          playBeep();
          if (canUseBrowserNotification() && Notification.permission === "granted") {
            new Notification("Dribdo Support", { body: "وصلت رسالة جديدة في لوحة الدعم." });
          }
        }

        if (nextLatestId) latestTicketRef.current = nextLatestId;
      } catch {
        // Ignore transient polling errors.
      } finally {
        timerId = window.setTimeout(poll, 8000);
      }
    };

    timerId = window.setTimeout(poll, 3000);
    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
      <div className="font-semibold">{statusText}</div>
      <div className="mt-1 flex items-center gap-2">
        <span>غير المقروءة:</span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">{unreadCount}</span>
      </div>
      {lastMessage ? <div className="mt-1 text-emerald-700">{lastMessage}</div> : null}
    </div>
  );
}
