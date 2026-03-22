import { renderMarkdownToHtml } from "@/lib/blog/markdown";

const HTML_PATTERN = /<\/?[a-z][\s\S]*>/i;

export function isProbablyHtml(content) {
  return HTML_PATTERN.test(String(content || "").trim());
}

export function renderStoredBlogContent(content) {
  const value = String(content || "").trim();
  if (!value) return "";
  if (isProbablyHtml(value)) return value;
  return renderMarkdownToHtml(value);
}

export function prepareBlogContentForEditor(content) {
  const value = String(content || "").trim();
  if (!value) return "<p></p>";
  if (isProbablyHtml(value)) return value;
  return renderMarkdownToHtml(value);
}
<<<<<<< HEAD
=======

export function buildTableOfContents(html) {
  const value = String(html || "");
  const headings = [];
  const headingRegex = /<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match;

  while ((match = headingRegex.exec(value)) !== null) {
    const level = Number(match[1]);
    const rawInner = match[3] || "";
    const text = rawInner
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;

    const id = `toc-${text
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `section-${headings.length + 1}`}`;

    headings.push({ id, text, level });
  }

  return headings;
}

export function injectHeadingAnchors(html, headings) {
  let value = String(html || "");
  for (const heading of headings || []) {
    const escaped = heading.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`<h([1-3])([^>]*)>([\\s\\S]*?${escaped}[\\s\\S]*?)<\\/h\\1>`, "i");
    value = value.replace(regex, `<h$1 id="${heading.id}"$2>$3</h$1>`);
  }
  return value;
}
>>>>>>> 300f687 (dribdo initial)
