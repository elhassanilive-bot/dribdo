"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { orderedReactionOptions, reactionByValue } from "@/components/moments/reactions";
import LottieReactionIcon from "@/components/moments/LottieReactionIcon";
import CommentsModal from "@/components/moments/CommentsModal";

const PICKER_OPTIONS = orderedReactionOptions();

function prettyCount(value) {
  const n = Number(value || 0);
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;
}

function normalizeCounts(post) {
  return {
    likes: Number(post?.likes_count || 0),
    comments: Number(post?.comments_count || 0),
    shares: Number(post?.shares_count || 0),
    views: Number(post?.views_count || 0),
  };
}

function normalizeReactionValue(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || raw === "none") return "";
  if (raw === "haha" || raw === "laugh" || raw === "laughing" || raw === "😂") return "funny";
  if (raw === "thumbsup" || raw === "thumbs_up" || raw === "liked" || raw === "👍") return "like";
  if (raw === "heart" || raw === "favorite" || raw === "favourite" || raw === "❤" || raw === "❤️") return "love";
  return raw;
}

function reactionValueFromRow(row) {
  if (!row || typeof row !== "object") return "";
  return normalizeReactionValue(
    row.type ??
      row.reaction_type ??
      row.reactionType ??
      row.reaction ??
      row.value ??
      row.emoji ??
      ""
  );
}

function buildReactionStatsFromMap(map) {
  return [...map.entries()]
    .filter(([type, count]) => type && Number(count || 0) > 0)
    .map(([type, count]) => ({ type, count: Number(count || 0), meta: reactionByValue(type) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function StatIcon({ src, alt }) {
  return <img src={src} alt={alt} className="h-[14px] w-[14px] object-contain opacity-75" loading="lazy" />;
}

function ShareOptionsModal({ open, canCopyText, onClose, onShareExternal, onCopyText, onCopyLink }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[118] bg-black/40 p-3" dir="rtl" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-2xl bg-slate-100 p-2" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-1.5 h-1 w-12 rounded-full bg-slate-300" />

        <div className="space-y-1.5">
          <button type="button" onClick={onShareExternal} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
            <div>
              <div className="text-[11px] font-bold text-slate-900">مشاركة خارجية</div>
              <div className="text-[10px] text-slate-500">مشاركة المنشور عبر التطبيقات</div>
            </div>
            <img src="/dribdo-assets/vedio/share.svg" alt="مشاركة" className="h-4 w-4" loading="lazy" />
          </button>

          {canCopyText ? (
            <button type="button" onClick={onCopyText} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
              <div>
                <div className="text-[11px] font-bold text-slate-900">نسخ نص المنشور</div>
                <div className="text-[10px] text-slate-500">نسخ النص إلى الحافظة</div>
              </div>
              <img src="/dribdo-assets/published/copy-text.svg" alt="نسخ النص" className="h-4 w-4" loading="lazy" />
            </button>
          ) : null}

          <button type="button" onClick={onCopyLink} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-right">
            <div>
              <div className="text-[11px] font-bold text-slate-900">نسخ رابط المنشور</div>
              <div className="text-[10px] text-slate-500">نسخ الرابط إلى الحافظة</div>
            </div>
            <img src="/dribdo-assets/published/copy-link.svg" alt="نسخ الرابط" className="h-4 w-4" loading="lazy" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MomentsPostActions({ postId, postContent = "", sharePath = "" }) {
  const [counts, setCounts] = useState({ likes: 0, comments: 0, shares: 0, views: 0 });
  const [myReaction, setMyReaction] = useState("");
  const [reactionStats, setReactionStats] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [status, setStatus] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const longPressTimerRef = useRef(null);
  const suppressClickUntilRef = useRef(0);

  const myReactionView = useMemo(() => reactionByValue(myReaction), [myReaction]);
  const finalSharePath = useMemo(() => {
    const candidate = String(sharePath || "").trim();
    if (!candidate) return `/post/${postId}`;
    return candidate.startsWith("/") ? candidate : `/${candidate}`;
  }, [postId, sharePath]);

  const refreshPostMeta = useCallback(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase || !postId) return;

    const { data: postRow } = await supabase
      .from("posts")
      .select("likes_count,comments_count,shares_count,views_count")
      .eq("id", postId)
      .maybeSingle();

    if (postRow) setCounts(normalizeCounts(postRow));

    const { data: reactionRows } = await supabase.from("reactions").select("*").eq("post_id", postId).limit(500);

    if (!reactionRows) {
      setReactionStats([]);
      return;
    }

    const map = new Map();
    for (const row of reactionRows) {
      const key = reactionValueFromRow(row);
      if (!key) continue;
      map.set(key, Number(map.get(key) || 0) + 1);
    }

    setReactionStats(buildReactionStatsFromMap(map));
  }, [postId]);

  const loadMyReaction = useCallback(async (supabase, userId) => {
    if (!supabase || !postId || !userId) {
      setMyReaction("");
      return;
    }

    const userColumns = ["user_id", "uid", "profile_id", "author_user_id", "owner_id"];
    let list = [];

    for (const column of userColumns) {
      try {
        const { data } = await supabase
          .from("reactions")
          .select("*")
          .eq("post_id", postId)
          .eq(column, userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (Array.isArray(data) && data.length) {
          list = data;
          break;
        }
      } catch {}
    }

    const first = list[0] || null;
    setMyReaction(reactionValueFromRow(first));
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
        await loadMyReaction(supabase, user.id);
      } else {
        setMyReaction("");
      }

      await refreshPostMeta();
    })();

    return () => {
      active = false;
    };
  }, [postId, refreshPostMeta, loadMyReaction]);

  useEffect(() => {
    let supabaseClient = null;
    let channel = null;

    (async () => {
      const supabase = await getSupabaseClient();
      if (!supabase || !postId) return;
      supabaseClient = supabase;

      channel = supabase
        .channel(`moments_reactions_${postId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "reactions", filter: `post_id=eq.${postId}` }, () => {
          refreshPostMeta();
        })
        .subscribe();
    })();

    return () => {
      if (supabaseClient && channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [postId, refreshPostMeta]);

  function rollbackReaction(previousReaction, previousStats, previousLikes) {
    setMyReaction(previousReaction);
    setReactionStats(previousStats);
    setCounts((current) => ({ ...current, likes: previousLikes }));
  }

  function applyReaction(reactionValue) {
    if (!postId) return;
    if (!authUser?.id) {
      setStatus("سجّل الدخول للتفاعل.");
      return;
    }

    const selectedReaction = normalizeReactionValue(reactionValue);
    const previousReaction = normalizeReactionValue(myReaction);
    const nextReaction = previousReaction === selectedReaction ? "" : selectedReaction;
    const previousStats = reactionStats;
    const previousLikes = counts.likes;

    setShowPicker(false);
    setStatus("");

    // Optimistic UI: apply immediately like Flutter app behavior.
    setMyReaction(nextReaction);
    setReactionStats((current) => {
      const map = new Map();
      for (const item of current) {
        const key = normalizeReactionValue(item?.type);
        if (!key) continue;
        map.set(key, Number(item?.count || 0));
      }
      if (previousReaction) {
        map.set(previousReaction, Math.max(0, Number(map.get(previousReaction) || 0) - 1));
      }
      if (nextReaction) {
        map.set(nextReaction, Number(map.get(nextReaction) || 0) + 1);
      }
      return buildReactionStatsFromMap(map);
    });
    setCounts((current) => ({
      ...current,
      likes: Math.max(0, Number(current.likes || 0) + (nextReaction ? 1 : 0) - (previousReaction ? 1 : 0)),
    }));

    startTransition(async () => {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        rollbackReaction(previousReaction, previousStats, previousLikes);
        return;
      }

      try {
        const { error: rpcError } = await supabase.rpc("simple_toggle_reaction", {
          p_user_id: authUser.id,
          p_post_id: postId,
          p_type: selectedReaction,
        });
        if (rpcError) throw rpcError;
      } catch (_) {
        try {
          const { data: existingRows } = await supabase
            .from("reactions")
            .select("id,type")
            .eq("post_id", postId)
            .eq("user_id", authUser.id)
            .order("created_at", { ascending: false })
            .limit(20);

          const existingList = Array.isArray(existingRows) ? existingRows : [];

          if (!nextReaction) {
            if (existingList.length) {
              const ids = existingList.map((row) => row.id).filter(Boolean);
              if (ids.length) {
                await supabase.from("reactions").delete().in("id", ids);
              }
            }
          } else if (existingList.length) {
            const [first, ...rest] = existingList;
            await supabase.from("reactions").update({ type: nextReaction }).eq("id", first.id);
            const restIds = rest.map((row) => row.id).filter(Boolean);
            if (restIds.length) {
              await supabase.from("reactions").delete().in("id", restIds);
            }
          } else {
            await supabase.from("reactions").insert({ post_id: postId, user_id: authUser.id, type: nextReaction });
          }
        } catch (_) {
          rollbackReaction(previousReaction, previousStats, previousLikes);
          setStatus("تعذر حفظ التفاعل.");
          return;
        }
      }

      try {
        await loadMyReaction(supabase, authUser.id);
      } catch (_) {}

      try {
        await refreshPostMeta();
      } catch (_) {}
    });
  }


  async function reportShareEvent() {
    try {
      await fetch("/api/video/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: String(authUser?.id || ""),
          eventType: "share",
          watchSeconds: 0,
          path: finalSharePath,
        }),
        keepalive: true,
      });
    } catch {}
  }
  async function copyPostLink() {
    if (!postId) return;
    const url = `${window.location.origin}${finalSharePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("تم نسخ رابط المنشور.");
      reportShareEvent();
    } catch (_) {
      setStatus(url);
    }
  }

  async function shareExternal() {
    if (!postId) return;
    const url = `${window.location.origin}${finalSharePath}`;

    if (navigator.share) {
      try {
        await navigator.share({ url, title: "منشور من دريبدو" });
        setStatus("تمت المشاركة الخارجية.");
        reportShareEvent();
        return;
      } catch (_) {}
    }

    await copyPostLink();
  }

  async function copyPostText() {
    const text = String(postContent || "").trim();
    if (!text) {
      setStatus("لا يوجد نص في هذا المنشور.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("تم نسخ نص المنشور.");
    } catch (_) {
      setStatus("تعذر نسخ النص.");
    }
  }

  const reactionTotal = useMemo(() => reactionStats.reduce((sum, item) => sum + Number(item.count || 0), 0), [reactionStats]);

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleLikeClick() {
    if (Date.now() < suppressClickUntilRef.current) return;
    if (!myReaction || myReaction === "none" || myReaction === "like") {
      applyReaction("like");
    } else {
      setShowPicker(true);
    }
  }

  function handleLikeTouchStart() {
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      setShowPicker(true);
      suppressClickUntilRef.current = Date.now() + 700;
    }, 420);
  }

  function handleLikeTouchEnd() {
    clearLongPressTimer();
  }

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, []);

  return (
    <div dir="rtl" className="mt-2 rounded-b-2xl border-t border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] text-slate-500">
        <button type="button" onClick={() => setShowPicker((value) => !value)} className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 transition hover:bg-slate-100">
          <span className="relative flex items-center">
            {reactionStats.length ? (
              reactionStats.map((item, index) => (
                <span key={`${item.type}-${index}`} className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-white bg-white" style={{ marginInlineStart: index === 0 ? 0 : -8, zIndex: 4 - index }}>
                  <LottieReactionIcon file={item.meta?.lottie} size={16} autoplay={false} loop={false} />
                </span>
              ))
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white">
                <StatIcon src="/dribdo-assets/fels-posts/likes-posts.svg" alt="تفاعل" />
              </span>
            )}
          </span>
          <span>{prettyCount(reactionTotal || counts.likes)}</span>
        </button>

        <div className="flex items-center gap-3">
          {counts.comments > 0 ? <span className="inline-flex items-center gap-1"><StatIcon src="/dribdo-assets/fels-posts/comments-posts.svg" alt="تعليقات" /> {prettyCount(counts.comments)}</span> : null}
          {counts.shares > 0 ? <span className="inline-flex items-center gap-1"><StatIcon src="/dribdo-assets/fels-posts/sharing-posts.svg" alt="مشاركات" /> {prettyCount(counts.shares)}</span> : null}
          {counts.views > 0 ? <span className="inline-flex items-center gap-1"><StatIcon src="/dribdo-assets/fels-posts/eye.svg" alt="مشاهدات" /> {prettyCount(counts.views)}</span> : null}
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-1 border-y border-slate-100 px-2 py-1">
        <button
          type="button"
          onClick={handleLikeClick}
          onMouseEnter={() => setShowPicker(true)}
          onTouchStart={handleLikeTouchStart}
          onTouchEnd={handleLikeTouchEnd}
          onTouchCancel={handleLikeTouchEnd}
          onContextMenu={(event) => {
            event.preventDefault();
            setShowPicker(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {myReactionView?.lottie ? <LottieReactionIcon file={myReactionView.lottie} size={18} autoplay={false} loop={false} /> : <img src="/dribdo-assets/fels-posts/likes-posts.svg" alt="إعجاب" className="h-[18px] w-[18px] object-contain" loading="lazy" />}
          <span>{myReactionView?.label || "أعجبني"}</span>
        </button>

        <button type="button" onClick={() => setCommentsOpen(true)} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
          <img src="/dribdo-assets/fels-posts/comments-posts.svg" alt="تعليق" className="h-[18px] w-[18px] object-contain" loading="lazy" />
          <span>تعليق</span>
        </button>

        <button type="button" onClick={() => { setShowPicker(false); setShowShareMenu(true); }} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
          <img src="/dribdo-assets/fels-posts/sharing-posts.svg" alt="مشاركة" className="h-[18px] w-[18px] object-contain" loading="lazy" />
          <span>مشاركة</span>
        </button>
      </div>

      {showPicker ? (
        <div className="border-b border-slate-100 bg-white px-2 py-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PICKER_OPTIONS.map((reaction, index) => (
              <button key={reaction.value} type="button" onClick={() => applyReaction(reaction.value)} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-blue-300">
                <LottieReactionIcon file={reaction.lottie} size={22} loop={true} autoplay={true} />
                <span>{reaction.label}</span>
                {index === 1 ? <span className="ms-1 h-4 w-px bg-slate-200" aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ShareOptionsModal
        open={showShareMenu}
        canCopyText={Boolean(String(postContent || "").trim())}
        onClose={() => setShowShareMenu(false)}
        onShareExternal={async () => {
          setShowShareMenu(false);
          await shareExternal();
        }}
        onCopyText={async () => {
          setShowShareMenu(false);
          await copyPostText();
        }}
        onCopyLink={async () => {
          setShowShareMenu(false);
          await copyPostLink();
        }}
      />

      <CommentsModal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={postId}
        postUrl={finalSharePath}
        onCountChanged={() => {
          refreshPostMeta();
        }}
      />

      {status ? <div className="border-t border-slate-100 px-3 py-2 text-xs text-rose-700">{status}</div> : null}
    </div>
  );
}






