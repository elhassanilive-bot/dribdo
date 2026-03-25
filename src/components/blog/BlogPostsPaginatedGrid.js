"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { estimateReadingTime, formatArabicDate, formatCategoryLabel } from "@/lib/blog/render";
import BlogImage from "@/components/blog/BlogImage";
import { createSlugCandidate } from "@/lib/blog/slug";

const DESKTOP_PER_PAGE = 9;
const MOBILE_PER_PAGE = 8;

function buildPagination(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("ellipsis-left");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis-right");

  items.push(totalPages);
  return items;
}

function PostCard({ post, priority = false }) {
  const readingTime = estimateReadingTime(post.content);
  const imageAlt = post.coverImageAlt || `صورة توضيحية للمقال: ${post.title}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-32px_rgba(15,23,42,0.5)]">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <BlogImage
            src={post.coverImageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 33vw"
            priority={priority}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-col justify-between p-2.5 sm:p-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold tracking-[0.06em] text-slate-400">
              {post.category ? (
                <Link
                  href={`/blog/category/${createSlugCandidate(post.category)}`}
                  className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[8px] tracking-[0.06em] text-orange-700 hover:bg-orange-100"
                >
                  {formatCategoryLabel(post.category)}
                </Link>
              ) : (
                <span className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[8px] tracking-[0.06em] text-orange-700">Blog</span>
              )}
              <span>{formatArabicDate(post.publishedAt || post.createdAt)}</span>
              <span>{readingTime} دقائق قراءة</span>
            </div>
            <h2 className="mt-1.5 line-clamp-2 text-[13px] font-black leading-[1.2] text-slate-950 sm:text-[15px]">{post.title}</h2>
            <p className="mt-1 line-clamp-2 text-[10px] leading-[1.55] text-slate-600 sm:text-[11px]">{post.excerpt}</p>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {(post.tags || []).slice(0, 2).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${createSlugCandidate(tag)}`}
                  className="rounded-full border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 hover:border-orange-200 hover:text-orange-700"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <span className="text-[10px] font-semibold text-orange-700 transition group-hover:text-orange-800">قراءة المزيد</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPostsPaginatedGrid({
  posts,
  total = null,
  initialPage = 1,
  initialPerPage = 9,
  initialQuery = "",
  initialCategory = "",
  initialTag = "",
  availableCategories = null,
  availableTags = null,
  serverMode = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const queryRaw = String(searchParams.get("q") ?? initialQuery).trim();
  const query = queryRaw.toLowerCase();
  const categoryFilter = String(searchParams.get("category") ?? initialCategory).trim();
  const tagFilter = String(searchParams.get("tag") ?? initialTag).trim();

  const perFromQuery = Number.parseInt(searchParams.get("per") || "", 10);
  const perPage = Number.isFinite(perFromQuery)
    ? Math.max(1, Math.min(perFromQuery, 40))
    : serverMode
      ? initialPerPage
      : isDesktop
        ? DESKTOP_PER_PAGE
        : MOBILE_PER_PAGE;

  useEffect(() => {
    if (!serverMode) return;

    const desiredPer = isDesktop ? DESKTOP_PER_PAGE : MOBILE_PER_PAGE;
    const currentPer = Number.parseInt(searchParams.get("per") || "", 10);
    if (currentPer === desiredPer) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("per", String(desiredPer));
    nextParams.delete("page");

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }, [isDesktop, pathname, router, searchParams, serverMode]);

  const categories = useMemo(() => {
    if (Array.isArray(availableCategories) && availableCategories.length) return availableCategories;
    return [...new Set(posts.map((post) => String(post.category || "").trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
  }, [availableCategories, posts]);

  const tags = useMemo(() => {
    if (Array.isArray(availableTags) && availableTags.length) return availableTags;
    const set = new Set();
    for (const post of posts) {
      for (const tag of post.tags || []) {
        const value = String(tag || "").trim();
        if (value) set.add(value);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "ar")).slice(0, 30);
  }, [availableTags, posts]);

  const locallyFilteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (categoryFilter && String(post.category || "") !== categoryFilter) return false;
      if (tagFilter && !(post.tags || []).includes(tagFilter)) return false;
      if (!query) return true;

      const haystack = [post.title, post.excerpt, post.content, post.category, ...(post.tags || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [categoryFilter, posts, query, tagFilter]);

  const filteredPosts = serverMode ? posts : locallyFilteredPosts;

  function updateParams(next) {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, String(value));
    }

    if ("q" in next || "category" in next || "tag" in next) {
      nextParams.delete("page");
    }

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  const totalCount = serverMode ? Number(total || 0) : filteredPosts.length;
  const filteredTotalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const pageFromQuery = Number.parseInt(searchParams.get("page") || String(initialPage), 10);
  const currentPage = Number.isFinite(pageFromQuery) ? Math.min(Math.max(pageFromQuery, 1), filteredTotalPages) : 1;

  const visiblePosts = useMemo(() => {
    if (serverMode) return filteredPosts;
    const start = (currentPage - 1) * perPage;
    return filteredPosts.slice(start, start + perPage);
  }, [currentPage, filteredPosts, perPage, serverMode]);

  const paginationItems = useMemo(() => buildPagination(currentPage, filteredTotalPages), [currentPage, filteredTotalPages]);

  function goToPage(page) {
    const target = Math.min(Math.max(page, 1), filteredTotalPages);
    const nextParams = new URLSearchParams(searchParams.toString());

    if (target <= 1) nextParams.delete("page");
    else nextParams.set("page", String(target));

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            defaultValue={queryRaw}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              updateParams({ q: event.currentTarget.value.trim() });
            }}
            placeholder="ابحث في المقالات..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-300 focus:bg-white"
          />
          <select
            value={categoryFilter}
            onChange={(event) => updateParams({ category: event.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-300 focus:bg-white"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={(event) => updateParams({ tag: event.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-300 focus:bg-white"
          >
            <option value="">كل الوسوم</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>
        {(query || categoryFilter || tagFilter) && (
          <div className="mt-2 text-[11px] font-semibold text-slate-500">النتائج: {totalCount}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {visiblePosts.map((post, index) => (
          <PostCard key={post.slug} post={post} priority={index === 0} />
        ))}
      </div>

      {!visiblePosts.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          لا توجد نتائج مطابقة للفلاتر الحالية.
        </div>
      ) : null}

      {filteredTotalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            السابق
          </button>

          {paginationItems.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item)}
                className={[
                  "rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                  item === currentPage
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:text-orange-700",
                ].join(" ")}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="px-1 text-xs font-semibold text-slate-400">
                ...
              </span>
            )
          )}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= filteredTotalPages}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            التالي
          </button>
        </div>
      ) : null}
    </div>
  );
}

