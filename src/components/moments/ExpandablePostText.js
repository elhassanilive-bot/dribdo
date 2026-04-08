"use client";

import { useMemo, useState } from "react";
import RichMomentText from "@/components/moments/RichMomentText";

export default function ExpandablePostText({ text = "", previewChars = 190, className = "" }) {
  const [expanded, setExpanded] = useState(false);

  const normalized = useMemo(() => String(text || "").trim(), [text]);
  const long = normalized.length > previewChars;
  const visibleText = !long || expanded ? normalized : `${normalized.slice(0, previewChars).trim()}...`;

  if (!normalized) return null;

  return (
    <p className={className || "whitespace-pre-wrap text-sm leading-7 text-slate-800"}>
      <RichMomentText text={visibleText} />
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
