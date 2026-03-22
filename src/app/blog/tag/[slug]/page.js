import Link from "next/link";
import BlogPostsPaginatedGrid from "@/components/blog/BlogPostsPaginatedGrid";
import { listPostsDetailed, listTagSummaries } from "@/lib/blog/posts";
import { createSlugCandidate } from "@/lib/blog/slug";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }) {
  const resolved = await params;
  const tags = await listTagSummaries({ limit: 200 });
  const tag = tags.find((item) => item.slug === resolved.slug);
  const title = tag ? `وسم: #${tag.name}` : "وسم غير موجود";

  return {
    title,
    description: `صفحة الوسم #${tag?.name || ""} في المدونة`,
    alternates: { canonical: `/blog/tag/${resolved.slug}` },
  };
}

export default async function BlogTagPage({ params }) {
  const resolved = await params;
  const tags = await listTagSummaries({ limit: 200 });
  const tag = tags.find((item) => item.slug === resolved.slug);

  if (!tag) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-black text-slate-900">الوسم غير موجود</h1>
        <Link href="/blog" className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          العودة للمدونة
        </Link>
      </div>
    );
  }

  const { posts } = await listPostsDetailed({ limit: 1200 });
  const filtered = posts.filter((post) => (post.tags || []).some((tagValue) => createSlugCandidate(tagValue) === tag.slug));

  return (
    <div className="blog-pages-compact w-full bg-[linear-gradient(180deg,#fff7ed_0%,#fff 35%,#f8fafc_100%)]">
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 text-sm text-slate-500">
            <Link href="/blog" className="font-semibold hover:text-orange-700">
              المدونة
            </Link>{" "}
            / <span>#{tag.name}</span>
          </div>
          <h1 className="mb-6 text-2xl font-black text-slate-950">وسم: #{tag.name}</h1>
          <BlogPostsPaginatedGrid posts={filtered} />
        </div>
      </section>
    </div>
  );
}
