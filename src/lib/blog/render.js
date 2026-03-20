export function formatArabicDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function estimateReadingTime(content) {
  const words = String(content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  if (!words) return 1;
  return Math.max(1, Math.ceil(words / 220));
}

export function renderPlainContent(content) {
  const text = String(content || "").trim();
  if (!text) return [];

  return text
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);
}
