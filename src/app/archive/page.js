import { redirect } from "next/navigation";

export const metadata = {
  title: "جميع المقالات (الأرشيف)",
  description: "أرشيف أرزابريس: تصفح جميع المقالات مع الترقيم والتصنيفات.",
  alternates: { canonical: "/archive" },
};

export default function ArchivePage({ searchParams }) {
  const params = new URLSearchParams();
  const page = Number(searchParams?.page || 1);
  const category = String(searchParams?.category || "").trim();

  if (Number.isFinite(page) && page > 1) params.set("page", String(page));
  if (category) params.set("category", category);

  const query = params.toString();
  redirect(query ? `/?${query}` : "/");
}

