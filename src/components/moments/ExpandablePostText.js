"use client";

import { useMemo, useState } from "react";

function linkifyText(text) {
  const raw = String(text || "");
  if (!raw) return null;
  const parts = raw.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, idx) => {
    if (/^https?:\/\//i.test(part)) {
      return <a key={`ln-${idx}`} href={part} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">{part}</a>;
    }
    return <span key={`tx-${idx}`}>{part}</span>;
  });
}

export default function ExpandablePostText({ text = "", previewChars = 190, className = "" }) {
  const [expanded, setExpanded] = useState(false);

  const normalized = useMemo(() => String(text || "").trim(), [text]);
  const long = normalized.length > previewChars;
  const visibleText = !long || expanded ? normalized : `${normalized.slice(0, previewChars).trim()}...`;

  if (!normalized) return null;

  return (
    <p className={className || "whitespace-pre-wrap text-sm leading-7 text-slate-800"}>
      {linkifyText(visibleText)}
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mr-2 inline-flex text-xs font-bold text-blue-700 hover:underline"
        >
          {expanded ? "إخفاء" : "عرض المزيد"}
        </button>
      ) : null}
    </p>
  );
}
