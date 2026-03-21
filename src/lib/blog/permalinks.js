function toDateParts(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return { year: "0000", month: "00", day: "00" };
  }
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { year, month, day };
}

export function getPermalinkStyle() {
  return process.env.NEXT_PUBLIC_BLOG_PERMALINK_STYLE || "id-slug";
}

export function buildPermalink(post, style = getPermalinkStyle()) {
  if (!post) return "/blog";
  const slugRaw = String(post.slug || "").trim();
  const slug = slugRaw ? encodeURIComponent(slugRaw) : "";
  const id = String(post.id || "").trim();
  const date = toDateParts(post.publishedAt || post.createdAt);

  const template = process.env.NEXT_PUBLIC_BLOG_PERMALINK_TEMPLATE || "/blog/%post_id%-%postname%";

  switch (style) {
    case "plain":
      return `/blog/${id || slug}`;
    case "slug":
      return `/blog/${slug || id}`;
    case "archives":
      return `/blog/archives/${id || slug}`;
    case "date-slug":
      return `/blog/${date.year}/${date.month}/${date.day}/${slug || id}`;
    case "month-slug":
      return `/blog/${date.year}/${date.month}/${slug || id}`;
    case "custom":
      return template
        .replaceAll("%postname%", slug || id)
        .replaceAll("%post_id%", id || slug)
        .replaceAll("%year%", date.year)
        .replaceAll("%monthnum%", date.month)
        .replaceAll("%day%", date.day);
    case "id-slug":
    default:
      return `/blog/${id}${slug ? `-${slug}` : ""}`;
  }
}

export const PERMALINK_OPTIONS = [
  { value: "id-slug", label: "ID + العنوان", example: "/blog/uuid-العنوان" },
  { value: "slug", label: "عنوان المقال فقط", example: "/blog/عنوان-المقال" },
  { value: "plain", label: "رقمي (ID فقط)", example: "/blog/uuid" },
  { value: "date-slug", label: "اليوم + العنوان", example: "/blog/2026/03/21/عنوان-المقال" },
  { value: "month-slug", label: "الشهر + العنوان", example: "/blog/2026/03/عنوان-المقال" },
  { value: "archives", label: "أرشيف رقمي", example: "/blog/archives/uuid" },
  { value: "custom", label: "تركيبة مخصصة", example: "/blog/%post_id%-%postname%" },
];
