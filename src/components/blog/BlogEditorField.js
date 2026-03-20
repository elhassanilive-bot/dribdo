"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderMarkdownToHtml } from "@/lib/blog/markdown";

function insertAround(text, selectionStart, selectionEnd, before, after) {
  const start = Math.max(0, selectionStart ?? 0);
  const end = Math.max(start, selectionEnd ?? start);
  const selected = text.slice(start, end) || "";
  const next = text.slice(0, start) + before + selected + after + text.slice(end);
  const nextCursor = start + before.length + selected.length + after.length;
  return { next, nextCursor };
}

function insertLinePrefix(text, selectionStart, selectionEnd, prefix) {
  const start = Math.max(0, selectionStart ?? 0);
  const end = Math.max(start, selectionEnd ?? start);
  const before = text.slice(0, start);
  const selected = text.slice(start, end) || "";
  const after = text.slice(end);
  const lines = (selected || "").split("\n").map((line) => (line.trim() ? `${prefix}${line}` : line));
  const replacement = lines.join("\n") || `${prefix}`;
  const next = before + replacement + after;
  const nextCursor = (before + replacement).length;
  return { next, nextCursor };
}

function ToolButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
    >
      {children}
    </button>
  );
}

export default function BlogEditorField({ name = "content", storageKey = "Dribdo_blog_draft" }) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  });
  const [tab, setTab] = useState("write");
  const textareaRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, value);
    } catch {}
  }, [storageKey, value]);

  const previewHtml = useMemo(() => renderMarkdownToHtml(value), [value]);
  const wordCount = useMemo(() => {
    const words = value
      .replace(/[`*_>#\[\]\(\)!-]/g, " ")
      .trim()
      .split(/\s+/g)
      .filter(Boolean);

    return words.length;
  }, [value]);

  function apply(action) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let result;
    switch (action) {
      case "bold":
        result = insertAround(text, start, end, "**", "**");
        break;
      case "italic":
        result = insertAround(text, start, end, "*", "*");
        break;
      case "code":
        result = insertAround(text, start, end, "`", "`");
        break;
      case "h2":
        result = insertLinePrefix(text, start, end, "## ");
        break;
      case "h3":
        result = insertLinePrefix(text, start, end, "### ");
        break;
      case "quote":
        result = insertLinePrefix(text, start, end, "> ");
        break;
      case "ul":
        result = insertLinePrefix(text, start, end, "- ");
        break;
      case "ol":
        result = insertLinePrefix(text, start, end, "1. ");
        break;
      case "link": {
        const url = prompt("ضع الرابط (https:// أو /path):");
        if (!url) return;
        result = insertAround(text, start, end, "[", `](${url})`);
        break;
      }
      case "image": {
        const url = prompt("ضع رابط الصورة (https:// أو /path):");
        if (!url) return;
        result = insertAround(text, start, end, "![", `](${url})`);
        break;
      }
      case "codeblock":
        result = insertAround(text, start, end, "```\n", "\n```");
        break;
      default:
        return;
    }

    setValue(result.next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.nextCursor, result.nextCursor);
    });
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <ToolButton onClick={() => apply("h2")}>H2</ToolButton>
          <ToolButton onClick={() => apply("h3")}>H3</ToolButton>
          <ToolButton onClick={() => apply("bold")}>عريض</ToolButton>
          <ToolButton onClick={() => apply("italic")}>مائل</ToolButton>
          <ToolButton onClick={() => apply("link")}>رابط</ToolButton>
          <ToolButton onClick={() => apply("image")}>صورة</ToolButton>
          <ToolButton onClick={() => apply("ul")}>قائمة</ToolButton>
          <ToolButton onClick={() => apply("ol")}>ترقيم</ToolButton>
          <ToolButton onClick={() => apply("quote")}>اقتباس</ToolButton>
          <ToolButton onClick={() => apply("code")}>كود</ToolButton>
          <ToolButton onClick={() => apply("codeblock")}>كتلة كود</ToolButton>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={
              tab === "write"
                ? "rounded-xl bg-[var(--blog-accent)] px-3 py-2 text-sm font-semibold text-white"
                : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            }
          >
            كتابة
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={
              tab === "preview"
                ? "rounded-xl bg-[var(--blog-accent)] px-3 py-2 text-sm font-semibold text-white"
                : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            }
          >
            معاينة
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <input type="hidden" name={name} value={value} />

        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={18}
            className="min-h-[28rem] w-full rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-base leading-8 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300"
            placeholder={"اكتب المقال هنا بصيغة Markdown...\n\n# عنوان رئيسي\n## عنوان فرعي\nفقرة افتتاحية قوية...\n- نقطة أولى\n- نقطة ثانية\n\n![وصف الصورة](https://example.com/image.jpg)\n\n[رابط مرجعي](https://example.com)"}
          />
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5">
            {value.trim() ? (
              <article
                className="blog-prose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p className="text-slate-500">لا يوجد محتوى للمعاينة بعد.</p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <div>عدد الكلمات: {wordCount}</div>
          <button
            type="button"
            onClick={() => {
              setValue("");
              try {
                localStorage.removeItem(storageKey);
              } catch {}
            }}
            className="font-semibold text-slate-600 transition hover:text-orange-700"
          >
            مسح المسودة
          </button>
        </div>
      </div>
    </div>
  );
}
