"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditorField from "@/components/blog/RichTextEditorField";
import BlogImage from "@/components/blog/BlogImage";
import { createSlugCandidate } from "@/lib/blog/slug";
import { prepareBlogContentForEditor } from "@/lib/blog/content";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SECRET_ADMIN_BASE_PATH } from "@/lib/admin/paths";

const EMPTY_CONTENT = "<p></p>";
const BLOG_MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BLOG_BUCKET || "blog-media";
const INITIAL_VISIBLE_POSTS = 3;
const LOAD_MORE_STEP = 6;

function createEmptyForm() {
  return {
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    coverImageUrl: "",
    category: "",
    tagsInput: "",
    status: "published",
    publishedAt: "",
    adminToken: "",
    content: EMPTY_CONTENT,
  };
}

function SubmitButton({ pending, editing }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-[var(--blog-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[var(--blog-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Ø¬Ø§Ø±Ù Ø­ÙØ¸ Ø§Ù„Ù…Ù‚Ø§Ù„..." : editing ? "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª" : "Ù†Ø´Ø± Ø§Ù„Ù…Ù‚Ø§Ù„"}
    </button>
  );
}

function StatusBadge({ status }) {
  const current = status || "published";
  const tone =
    current === "published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : current === "draft"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : current === "scheduled"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-slate-100 text-slate-700 border-slate-200";

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{current}</span>;
}

function DeletePostModal({ post, pending, errorMessage, onCancel, onConfirm }) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">ØªØ£ÙƒÙŠØ¯ Ø­Ø°Ù Ø§Ù„Ù…Ù‚Ø§Ù„</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Ø³ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù‚Ø§Ù„ <span className="font-semibold text-slate-900">{post.title}</span> Ù…Ù† Ù„ÙˆØ­Ø© Ø§Ù„Ù†Ø´Ø±. Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù†Ù‡.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Ø¥ØºÙ„Ø§Ù‚
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ù…Ø®ØªØµØ± Ø§Ù„Ø­Ø§Ù„ÙŠ: <span className="font-semibold">/{post.slug}</span>
        </div>
        {errorMessage ? (
          <div className="mt-3 rounded-[1.1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Ø³Ø¨Ø¨ Ø§Ù„ÙØ´Ù„: {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Ø¥Ù„ØºØ§Ø¡
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­Ø°Ù..." : "ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø°Ù"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkDeleteModal({ count, pending, errorMessage, onCancel, onConfirm }) {
  if (!count) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">ØªØ£ÙƒÙŠØ¯ Ø­Ø°Ù Ø¬Ù…Ø§Ø¹ÙŠ</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Ø³ÙŠØªÙ… Ø­Ø°Ù
              {" "}
              <span className="font-semibold text-slate-900">{count}</span>
              {" "}
              Ù…Ù‚Ø§Ù„(Ø§Øª) Ø¯ÙØ¹Ø© ÙˆØ§Ø­Ø¯Ø©. Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù†Ù‡.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Ø¥ØºÙ„Ø§Ù‚
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-[1.1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Ø³Ø¨Ø¨ Ø§Ù„ÙØ´Ù„: {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Ø¥Ù„ØºØ§Ø¡
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­Ø°Ù..." : "ØªØ£ÙƒÙŠØ¯ Ø­Ø°Ù Ø§Ù„Ù…Ø­Ø¯Ø¯"}
          </button>
        </div>
      </div>
    </div>
  );
}

function mapPostToForm(post, adminToken) {
  return {
    id: post.id || "",
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    coverImageUrl: post.coverImageUrl || "",
    category: post.category || "",
    tagsInput: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    status: post.status || "published",
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "",
    adminToken: adminToken || "",
    content: prepareBlogContentForEditor(post.content),
  };
}

export default function AdminBlogDashboard({
  posts = [],
  saveAction,
  deleteAction,
  deleteManyAction,
  publishingEnabled,
  requiresToken,
  adminListError,
}) {
  const router = useRouter();
  const coverInputRef = useRef(null);
  const [form, setForm] = useState(createEmptyForm);
  const [manualSlug, setManualSlug] = useState(false);
  const [flash, setFlash] = useState({ type: "", message: "", slug: "" });
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visiblePostsCount, setVisiblePostsCount] = useState(INITIAL_VISIBLE_POSTS);
  const [lastExpandedCount, setLastExpandedCount] = useState(INITIAL_VISIBLE_POSTS);
  const [coverUpload, setCoverUpload] = useState({ message: "", error: false });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState([]);
  const [bulkDeleteError, setBulkDeleteError] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [hiddenDeletedIds, setHiddenDeletedIds] = useState(() => new Set());
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const editing = Boolean(form.id);
  const visibleSlug = manualSlug ? form.slug : createSlugCandidate(form.title);

  const localPosts = useMemo(() => posts.filter((post) => !hiddenDeletedIds.has(post.id)), [hiddenDeletedIds, posts]);

  const categories = useMemo(() => {
    return [...new Set(localPosts.map((post) => post.category).filter(Boolean))];
  }, [localPosts]);

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return localPosts.filter((post) => {
      const matchesCategory = categoryFilter === "all" ? true : post.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!term) return true;

      const haystack = [post.title, post.excerpt, post.slug, post.category, ...(post.tags || [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [categoryFilter, localPosts, query]);

  const effectiveVisiblePostsCount = useMemo(() => {
    if (filteredPosts.length === 0) return 0;
    if (visiblePostsCount <= INITIAL_VISIBLE_POSTS) return Math.min(INITIAL_VISIBLE_POSTS, filteredPosts.length);
    return Math.min(visiblePostsCount, filteredPosts.length);
  }, [filteredPosts.length, visiblePostsCount]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, effectiveVisiblePostsCount);
  }, [effectiveVisiblePostsCount, filteredPosts]);

  const visiblePostIds = useMemo(() => visiblePosts.map((post) => post.id), [visiblePosts]);
  const filteredPostIds = useMemo(() => filteredPosts.map((post) => post.id), [filteredPosts]);
  const selectedCount = selectedIds.size;
  const selectedVisibleCount = useMemo(() => visiblePostIds.filter((id) => selectedIds.has(id)).length, [selectedIds, visiblePostIds]);
  const selectedFilteredCount = useMemo(() => filteredPostIds.filter((id) => selectedIds.has(id)).length, [filteredPostIds, selectedIds]);

  const canLoadMore = effectiveVisiblePostsCount < filteredPosts.length;
  const canCollapse = effectiveVisiblePostsCount > INITIAL_VISIBLE_POSTS;
  const canReopenFold =
    effectiveVisiblePostsCount <= INITIAL_VISIBLE_POSTS && lastExpandedCount > INITIAL_VISIBLE_POSTS && filteredPosts.length > INITIAL_VISIBLE_POSTS;

  function toggleSelectPost(id) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisiblePosts() {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of visiblePostIds) next.add(id);
      return next;
    });
  }

  function clearVisibleSelection() {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of visiblePostIds) next.delete(id);
      return next;
    });
  }

  function selectAllFilteredPosts() {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of filteredPostIds) next.add(id);
      return next;
    });
  }

  function clearAllSelection() {
    setSelectedIds(new Set());
  }

  function showMorePosts() {
    setVisiblePostsCount((current) => {
      const base = Math.max(current, INITIAL_VISIBLE_POSTS);
      const next = Math.min(base + LOAD_MORE_STEP, filteredPosts.length);
      setLastExpandedCount(next);
      return next;
    });
  }

  function collapsePostsList() {
    setLastExpandedCount((prev) => Math.max(prev, effectiveVisiblePostsCount));
    setVisiblePostsCount(Math.min(INITIAL_VISIBLE_POSTS, filteredPosts.length));
  }

  function reopenFoldedPostsList() {
    setVisiblePostsCount(Math.min(lastExpandedCount, filteredPosts.length));
  }

  const tagsPreview = useMemo(
    () =>
      form.tagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),
    [form.tagsInput]
  );

  const titleWords = useMemo(() => form.title.trim().split(/\s+/).filter(Boolean).length, [form.title]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadCoverFile(file) {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase ØºÙŠØ± Ù…ÙØ¹Ø¯. Ø£Ø¶Ù Ø§Ù„Ù…ÙØ§ØªÙŠØ­ Ø£ÙˆÙ„Ù‹Ø§.");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `covers/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BLOG_MEDIA_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      throw new Error(
        `ØªØ¹Ø°Ø± Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù Ø¥Ù„Ù‰ bucket "${BLOG_MEDIA_BUCKET}". Ø´ØºÙ‘Ù„ supabase/blog_storage.sql Ø£Ùˆ ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø³Ù… Ø§Ù„Ù€ bucket ÙÙŠ .env.local.`
      );
    }

    const { data } = supabase.storage.from(BLOG_MEDIA_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      throw new Error("ØªÙ… Ø§Ù„Ø±ÙØ¹ Ù„ÙƒÙ† ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ø¹Ø§Ù… Ù„ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù.");
    }

    return data.publicUrl;
  }

  async function handleCoverSelection(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setCoverUpload({ message: "Ø¬Ø§Ø±Ù Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù...", error: false });
      const publicUrl = await uploadCoverFile(file);
      updateField("coverImageUrl", publicUrl);
      setCoverUpload({ message: "ØªÙ… Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù Ø¨Ù†Ø¬Ø§Ø­.", error: false });
    } catch (error) {
      setCoverUpload({
        message: error instanceof Error ? error.message : "ØªØ¹Ø°Ø± Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù.",
        error: true,
      });
    }
  }

  function resetForm(keepToken = true) {
    setForm((current) => ({
      ...createEmptyForm(),
      adminToken: keepToken ? current.adminToken : "",
    }));
    setManualSlug(false);
  }

  function handleEdit(post) {
    setForm((current) => mapPostToForm(post, current.adminToken));
    setManualSlug(true);
    setFlash({ type: "", message: "", slug: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("id", form.id);
    formData.set("title", form.title);
    formData.set("slug", visibleSlug);
    formData.set("excerpt", form.excerpt);
    formData.set("coverImageUrl", form.coverImageUrl);
    formData.set("category", form.category);
    formData.set("tags", form.tagsInput);
    formData.set("status", form.status);
    formData.set("publishedAt", form.publishedAt);
    formData.set("content", form.content);
    formData.set("adminToken", form.adminToken);

    startSaveTransition(() => {
      saveAction(formData).then((result) => {
        if (!result?.ok) {
          setFlash({
            type: "error",
            message: result?.error || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù…Ù‚Ø§Ù„.",
            slug: "",
          });
          return;
        }

        setFlash({
          type: "success",
          message: editing ? "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù‚Ø§Ù„ Ø¨Ù†Ø¬Ø§Ø­." : "ØªÙ… Ù†Ø´Ø± Ø§Ù„Ù…Ù‚Ø§Ù„ Ø¨Ù†Ø¬Ø§Ø­.",
          slug: result.slug || "",
        });
        resetForm();
        router.refresh();
      });
    });
  }

  function handleDelete(post) {
    setDeleteError("");
    setDeleteTarget(post);
  }

  function handleBulkDelete(ids) {
    const normalizedIds = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))];
    if (!normalizedIds.length) {
      setFlash({
        type: "error",
        message: "Ø­Ø¯Ø¯ Ù…Ù‚Ø§Ù„Ù‹Ø§ ÙˆØ§Ø­Ø¯Ù‹Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ Ù‚Ø¨Ù„ Ø§Ù„Ø­Ø°Ù Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠ.",
        slug: "",
      });
      return;
    }

    setBulkDeleteError("");
    setBulkDeleteTargetIds(normalizedIds);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError("");
    startDeleteTransition(() => {
      deleteAction({ id: deleteTarget.id, adminToken: form.adminToken })
        .then((result) => {
          if (!result?.ok) {
            const reason = result?.error || "ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ù…Ù‚Ø§Ù„.";
            setDeleteError(reason);
            setFlash({
              type: "error",
              message: reason,
              slug: "",
            });
            return;
          }

          if (form.id === deleteTarget.id) {
            resetForm();
          }

          setHiddenDeletedIds((current) => {
            const next = new Set(current);
            next.add(deleteTarget.id);
            return next;
          });
          setSelectedIds((current) => {
            const next = new Set(current);
            next.delete(deleteTarget.id);
            return next;
          });
          setVisiblePostsCount((current) => Math.max(Math.min(current, filteredPosts.length - 1), 0));
          setDeleteError("");
          setFlash({
            type: "success",
            message: "ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù‚Ø§Ù„ Ø¨Ù†Ø¬Ø§Ø­.",
            slug: "",
          });
          setDeleteTarget(null);
          router.refresh();
        })
        .catch((error) => {
          const reason = error instanceof Error ? error.message : "Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­Ø°Ù.";
          setDeleteError(reason);
          setFlash({
            type: "error",
            message: reason,
            slug: "",
          });
        });
    });
  }

  function confirmBulkDelete() {
    if (!bulkDeleteTargetIds.length) return;
    setBulkDeleteError("");
    startDeleteTransition(() => {
      deleteManyAction({ ids: bulkDeleteTargetIds, adminToken: form.adminToken })
        .then((result) => {
          const deletedIds = Array.isArray(result?.deletedIds)
            ? [...new Set(result.deletedIds.map((id) => String(id || "").trim()).filter(Boolean))]
            : [];

          if (deletedIds.length) {
            setHiddenDeletedIds((current) => {
              const next = new Set(current);
              for (const id of deletedIds) next.add(id);
              return next;
            });
            setSelectedIds((current) => {
              const next = new Set(current);
              for (const id of deletedIds) next.delete(id);
              return next;
            });
          }

          if (!result?.ok) {
            const reason = result?.error || "ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©.";
            const unresolvedIds = bulkDeleteTargetIds.filter((id) => !deletedIds.includes(id));
            setBulkDeleteError(reason);
            setBulkDeleteTargetIds(unresolvedIds);
            setFlash({
              type: "error",
              message: reason,
              slug: "",
            });
            router.refresh();
            return;
          }

          setBulkDeleteError("");
          setBulkDeleteTargetIds([]);
          setVisiblePostsCount((current) => Math.max(Math.min(current, filteredPosts.length - deletedIds.length), 0));
          setFlash({
            type: "success",
            message: `ØªÙ… Ø­Ø°Ù ${deletedIds.length} Ù…Ù‚Ø§Ù„(Ø§Øª) Ø¨Ù†Ø¬Ø§Ø­.`,
            slug: "",
          });
          router.refresh();
        })
        .catch((error) => {
          const reason = error instanceof Error ? error.message : "Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­Ø°Ù Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠ.";
          setBulkDeleteError(reason);
          setFlash({
            type: "error",
            message: reason,
            slug: "",
          });
        });
    });
  }

  return (
    <div className="space-y-8">
      <DeletePostModal
        post={deleteTarget}
        pending={isDeleting}
        errorMessage={deleteError}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteError("");
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
      <BulkDeleteModal
        count={bulkDeleteTargetIds.length}
        pending={isDeleting}
        errorMessage={bulkDeleteError}
        onCancel={() => {
          if (isDeleting) return;
          setBulkDeleteError("");
          setBulkDeleteTargetIds([]);
        }}
        onConfirm={confirmBulkDelete}
      />
      <section className="rounded-[1.35rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_52%,#f8fafc_100%)] px-4 py-3 shadow-[0_22px_60px_-48px_rgba(15,23,42,0.35)] sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
            >
              Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„Ù…Ø¯ÙˆÙ†Ø©
            </Link>
            <Link
              href={SECRET_ADMIN_BASE_PATH}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Ù„ÙˆØ­Ø© Ø§Ù„Ø£Ø¯Ù…Ù†
            </Link>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            <span className="text-slate-500">Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª</span>
            <span className="font-black text-slate-950">{localPosts.length}</span>
          </div>
        </div>
      </section>

      {!publishingEnabled ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-950">
          Ø§Ù„Ù†Ø´Ø± Ø§Ù„Ù…Ø¨Ø§Ø´Ø± ÙŠØ­ØªØ§Ø¬ Ø³ÙŠØ§Ø³Ø§Øª `insert` ÙˆÙŠÙØ¶Ù‘Ù„ Ø£ÙŠØ¶Ù‹Ø§ Ø³ÙŠØ§Ø³Ø§Øª `update/delete` Ø£Ùˆ Service Role Ø¥Ø°Ø§ ÙƒÙ†Øª ØªØ±ÙŠØ¯ Ø¥Ø¯Ø§Ø±Ø© ÙƒØ§Ù…Ù„Ø© Ù…Ù† Ù‡Ø°Ù‡ Ø§Ù„Ù„ÙˆØ­Ø©.
        </div>
      ) : null}

      {adminListError ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-950">
          ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª ÙƒØ§Ù…Ù„Ø©: {adminListError}
        </div>
      ) : null}

      {flash.message ? (
        <div
          className={[
            "rounded-[2rem] px-6 py-5",
            flash.type === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-900"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900",
          ].join(" ")}
        >
          {flash.message}
          {flash.slug ? (
            <>
              {" "}
              <Link href={`/blog/${flash.slug}`} className="font-semibold underline underline-offset-4">
                Ø§ÙØªØ­ Ø§Ù„Ù…Ù‚Ø§Ù„
              </Link>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_360px]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] sm:p-8">
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelection} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-500">Ù…Ø­Ø±Ø± Ø§Ù„Ù…Ù‚Ø§Ù„</div>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{editing ? "ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„" : "Ø¥Ø¶Ø§ÙØ© Ù…Ù‚Ø§Ù„ Ø¬Ø¯ÙŠØ¯"}</h2>
            </div>
            {editing ? (
              <button
                type="button"
                onClick={() => resetForm()}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                Ù…Ù‚Ø§Ù„ Ø¬Ø¯ÙŠØ¯
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù‚Ø§Ù„</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="Ù…Ø«Ø§Ù„: ÙƒÙŠÙ ØªØ¨Ù†ÙŠ ØºØ±ÙØ© Ø£Ø®Ø¨Ø§Ø± Ø±Ù‚Ù…ÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªÙˆØ³Ø¹ØŸ"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Slug</span>
              <input
                value={visibleSlug}
                onChange={(event) => {
                  setManualSlug(true);
                  updateField("slug", createSlugCandidate(event.target.value));
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                dir="ltr"
                placeholder="auto-generated-post-slug"
              />
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">Ø§Ù„Ù…Ù„Ø®Øµ</span>
            <textarea
              value={form.excerpt}
              onChange={(event) => updateField("excerpt", event.target.value)}
              required
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="Ù…Ù„Ø®Øµ Ù‚ØµÙŠØ± ÙˆØ§Ø­ØªØ±Ø§ÙÙŠ ÙŠØ¸Ù‡Ø± ÙÙŠ Ø¨Ø·Ø§Ù‚Ø§Øª Ø§Ù„Ù…Ù‚Ø§Ù„ ÙˆÙ†ØªØ§Ø¦Ø¬ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©."
            />
          </label>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù</span>
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù
                  </button>
                  {form.coverImageUrl ? (
                    <button
                      type="button"
                      onClick={() => updateField("coverImageUrl", "")}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                    >
                      Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØµÙˆØ±Ø©
                    </button>
                  ) : null}
                  <span className="text-sm text-slate-500">Ù…Ù† Ø¬Ù‡Ø§Ø²Ùƒ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø¯Ù„ Ø¥Ø¯Ø®Ø§Ù„ Ø±Ø§Ø¨Ø· ÙŠØ¯ÙˆÙŠ.</span>
                </div>

                {coverUpload.message ? (
                  <div className={coverUpload.error ? "px-4 py-3 text-sm text-rose-700" : "px-4 py-3 text-sm text-emerald-700"}>
                    {coverUpload.message}
                  </div>
                ) : null}

                <div className="px-4 pb-4">
                  {form.coverImageUrl ? (
                    <div className="relative mt-4 h-52 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                      <BlogImage
                        src={form.coverImageUrl}
                        alt={form.title || "Cover preview"}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                      Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø© ØºÙ„Ø§Ù Ø¨Ø¹Ø¯.
                    </div>
                  )}
                </div>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Ø§Ù„ØªØµÙ†ÙŠÙ</span>
              <input
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="ØªÙ‚Ø§Ø±ÙŠØ±ØŒ Ø£Ø®Ø¨Ø§Ø±ØŒ Ø£Ø¯Ù„Ø©ØŒ Ù…Ù†ØªØ¬"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø´Ø±</span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
              >
                <option value="published">Ù…Ù†Ø´ÙˆØ±</option>
                <option value="draft">Ù…Ø³ÙˆØ¯Ø©</option>
                <option value="archived">Ù…Ø¤Ø±Ø´Ù</option>
              </select>
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">Ø§Ù„ÙˆØ³ÙˆÙ…</span>
            <input
              value={form.tagsInput}
              onChange={(event) => updateField("tagsInput", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="ØªØ­Ù„ÙŠÙ„Ø§ØªØŒ DribdoØŒ Ù…Ø¬ØªÙ…Ø¹ØŒ ØªØ­Ø¯ÙŠØ«Ø§Øª"
            />
          </label>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-900">ØªØ§Ø±ÙŠØ®/ÙˆÙ‚Øª Ø§Ù„Ù†Ø´Ø±</span>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => updateField("publishedAt", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
            />
          </label>

          {requiresToken ? (
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">Ø±Ù…Ø² Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©</span>
              <input
                type="password"
                value={form.adminToken}
                onChange={(event) => updateField("adminToken", event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
                placeholder="BLOG_ADMIN_TOKEN"
              />
            </label>
          ) : null}

          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØºÙ†ÙŠ</div>
                <div className="mt-1 text-sm text-slate-500">Ø¹Ù†Ø§ÙˆÙŠÙ†ØŒ Ø£Ù„ÙˆØ§Ù†ØŒ Ø¬Ø¯Ø§ÙˆÙ„ØŒ ÙˆØ³Ø§Ø¦Ø·ØŒ Ø£Ø²Ø±Ø§Ø±ØŒ embeds ÙˆÙ…Ø­Ø§Ø°Ø§Ø© ÙƒØ§Ù…Ù„Ø©.</div>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                Rich Text / HTML
              </div>
            </div>
            <RichTextEditorField value={form.content} onChange={(html) => updateField("content", html)} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <SubmitButton pending={isSaving} editing={editing} />
            <p className="text-sm text-slate-500">
              Ø³ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ù‚Ø§Ù„ Ø¨Ø­Ø§Ù„Ø©
              {" "}
              <span className="font-semibold text-slate-900">{form.status || "published"}</span>
              {" "}
              Ù…Ø¹
              {" "}
              <code>published_at</code>
              {" "}
              ÙˆØªØ­Ø¯ÙŠØ«
              {" "}
              <code>updated_at</code>
              {" "}
              ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ Ù…Ù† trigger Ø§Ù„Ø­Ø§Ù„ÙŠ.
            </p>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)]">
            <div className="text-sm font-semibold text-slate-500">Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø©</div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">
              {form.title || "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù‚Ø§Ù„ Ø³ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {form.excerpt || "Ø£Ø¶Ù Ù…Ù„Ø®ØµÙ‹Ø§ Ù…Ù‚Ù†Ø¹Ù‹Ø§ ÙŠØ´Ø±Ø­ Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ù‚Ø§Ù„ Ø®Ù„Ø§Ù„ Ø³Ø·Ø±ÙŠÙ† Ø¥Ù„Ù‰ Ø«Ù„Ø§Ø«Ø© Ø£Ø³Ø·Ø±."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(tagsPreview.length ? tagsPreview : ["featured", "analysis"]).map((tag) => (
                <span key={tag} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-4 text-sm text-slate-300" dir="ltr">
              /blog/{visibleSlug || "your-story-slug"}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.5)]">
            <div className="text-sm font-semibold text-slate-500">Ø¬ÙˆØ¯Ø© Ø§Ù„ØªØ­Ø±ÙŠØ±</div>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold text-slate-500">Ø¹Ø¯Ø¯ ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ø¹Ù†ÙˆØ§Ù†</div>
                <div className="mt-1 text-xl font-bold text-slate-950">{titleWords}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold text-slate-500">Ø·ÙˆÙ„ Ø§Ù„Ù…Ù„Ø®Øµ</div>
                <div className="mt-1 text-xl font-bold text-slate-950">{form.excerpt.trim().length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                ÙŠÙ…ÙƒÙ† ØªØ­Ø±ÙŠØ± Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø© Ø£ÙŠØ¶Ù‹Ø§. Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù…Ø®Ø²Ù‘Ù†Ù‹Ø§ Ø¨Ù€ Markdown ÙØ³ÙŠØªÙ… ØªØ­ÙˆÙŠÙ„Ù‡ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ Ø¥Ù„Ù‰ HTML Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø­Ø±Ø± Ù‚Ø¨Ù„ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-500">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª</div>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª Ø§Ù„Ø­Ø§Ù„ÙŠØ©</h2>
          </div>
          <div className="flex w-full flex-wrap gap-3 lg:w-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-64 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              placeholder="Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø£Ùˆ slug Ø£Ùˆ Ø§Ù„ÙˆØ³ÙˆÙ…"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-orange-300 focus:bg-white"
            >
              <option value="all">ÙƒÙ„ Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="text-xs font-semibold text-slate-600">
              Ø§Ù„Ù…Ø­Ø¯Ø¯ Ø§Ù„Ø¢Ù†: {selectedCount} / {filteredPosts.length}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllVisiblePosts}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¸Ø§Ù‡Ø± ({visiblePosts.length})
              </button>
              {selectedVisibleCount > 0 ? (
                <button
                  type="button"
                  onClick={clearVisibleSelection}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                >
                  Ø¥Ù„ØºØ§Ø¡ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¸Ø§Ù‡Ø±
                </button>
              ) : null}
              <button
                type="button"
                onClick={selectAllFilteredPosts}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ÙƒÙ„ ({filteredPosts.length})
              </button>
              {selectedFilteredCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAllSelection}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                >
                  Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ÙƒÙ„
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => handleBulkDelete([...selectedIds])}
                disabled={isDeleting || selectedCount === 0}
                className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Ø­Ø°Ù Ø§Ù„Ù…Ø­Ø¯Ø¯
              </button>
            </div>
          </div>
        ) : null}

        {filteredPosts.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
            Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‚Ø§Ù„Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„ÙÙ„Ø§ØªØ± Ø§Ù„Ø­Ø§Ù„ÙŠØ©.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {visiblePosts.map((post) => (
              <article key={post.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(post.id)}
                      onChange={() => toggleSelectPost(post.id)}
                      className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    ØªØ­Ø¯ÙŠØ¯
                  </label>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={post.workflowStatus || post.status} />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{post.category || "General"}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-slate-950">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(post.tags || []).map((tag) => (
                        <span key={`${post.id}-${tag}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-slate-400" dir="ltr">
                      /blog/{post.slug}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                    >
                      Ø¹Ø±Ø¶
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(post)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                    >
                      ØªØ¹Ø¯ÙŠÙ„
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      disabled={isDeleting}
                      className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Ø­Ø°Ù
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {filteredPosts.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-500">
              Ø¹Ø±Ø¶ {visiblePosts.length} Ù…Ù† {filteredPosts.length} Ù…Ù‚Ø§Ù„Ø©
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canReopenFold ? (
                <button
                  type="button"
                  onClick={reopenFoldedPostsList}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                >
                  ÙØªØ­ Ø§Ù„Ø·ÙŠ
                </button>
              ) : null}
              {canLoadMore ? (
                <button
                  type="button"
                  onClick={showMorePosts}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                >
                  Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø²ÙŠØ¯
                </button>
              ) : null}
              {canCollapse ? (
                <button
                  type="button"
                  onClick={collapsePostsList}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                >
                  Ø·ÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}




