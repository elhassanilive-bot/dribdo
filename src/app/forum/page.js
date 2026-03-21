import ForumComposer from "@/components/forum/ForumComposer";
import ForumPostCardActions from "@/components/forum/ForumPostCardActions";
import { listPostsDetailed } from "@/lib/blog/posts";
import { estimateReadingTime } from "@/lib/blog/render";
import { buildPermalink } from "@/lib/blog/permalinks";
import Link from "next/link";

export const metadata = {
  title: "???????",
  description: "???? ???? ?? ?????? ?? ????? Dribdo? ????? ?? ????? ???????.",
};

function extractAuthor(excerpt) {
  if (!excerpt) return { author: "", summary: "" };
  const parts = String(excerpt).split("|");
  if (parts.length < 2) return { author: "", summary: excerpt };
  return {
    author: parts[0].replace("????", "").trim(),
    summary: parts.slice(1).join("|").trim(),
  };
}

export default async function ForumPage() {
  const { posts, error } = await listPostsDetailed({ limit: 200 });
  const forumPosts = (posts || []).filter((post) => post.category === "forum");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <header className="rounded-[2.5rem] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-10 text-center shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-orange-400">Dribdo Forum</p>
        <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
          ??????? ??????? ???????? ?????? ??????????
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          ?????? ???? ?? ??????? ???? ???????? ?????? ??????? ??? ??? ??????? ?????? ????? ??????.
        </p>
      </header>

      <ForumComposer />

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-slate-950">??? ??????? ???????</h2>
          <Link href="/blog" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            ????? ???? ???????
          </Link>
        </div>

        {error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-900">
            ???? ????? ??????? ???????: {error}
          </div>
        ) : forumPosts.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 text-center text-slate-600">
            ?? ???? ??????? ???. ?? ??? ?? ???? ????? ?? ?????.
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {forumPosts.map((post) => {
              const { author, summary } = extractAuthor(post.excerpt);
              return (
                <article
                  key={post.id}
                  className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-[0_16px_45px_-45px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold text-slate-500">
                    {post.tags?.length ? (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">
                        {post.tags[0]}
                      </span>
                    ) : null}
                    {author ? <span>??????: {author}</span> : null}
                    <span>{estimateReadingTime(post.content)} ????? ?????</span>
                  </div>

                  <h3 className="mt-2 text-sm font-black text-slate-950">{post.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-5 text-slate-600">{summary || post.excerpt}</p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <Link href={buildPermalink(post)} className="text-[11px] font-semibold text-orange-600 hover:text-orange-700">
                      ????? ????????
                    </Link>
                    <span className="text-[9px] text-slate-400">??????: {buildPermalink(post)}</span>
                  </div>

                  <ForumPostCardActions postId={post.id} viewCount={post.viewCount || 0} />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
