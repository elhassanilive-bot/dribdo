import MomentsFeed from "@/components/moments/MomentsFeed";
import { site } from "@/config/site";

export const metadata = {
  title: "لحظات دريبدو",
  description: "تابع منشورات المستخدمين وانشر نصوصًا وصورًا وفيديوهات وتفاعل معها داخل قسم اللحظات.",
  keywords: ["لحظات", "منشورات", "صور", "فيديو", "تفاعل"],
  alternates: { canonical: "/moments" },
  openGraph: {
    title: "لحظات دريبدو",
    description: "تابع منشورات المستخدمين وانشر نصوصًا وصورًا وفيديوهات وتفاعل معها داخل قسم اللحظات.",
    url: "/moments",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "لحظات دريبدو" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "لحظات دريبدو",
    description: "تابع منشورات المستخدمين وانشر نصوصًا وصورًا وفيديوهات وتفاعل معها داخل قسم اللحظات.",
    images: ["/icon.png"],
  },
};

export default function MomentsPage() {
  const momentsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "لحظات دريبدو",
    description: metadata.description,
    url: `${site.url}/moments`,
    inLanguage: "ar",
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(momentsJsonLd) }} />

      <header className="rounded-[2.2rem] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_40%),linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-8 text-center shadow-[0_25px_70px_-55px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-orange-400">Dribdo Moments</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">قسم اللحظات</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
          هنا تظهر منشورات المستخدمين، ويمكنك نشر نصوص وصور وفيديو والتفاعل مباشرة.
        </p>
      </header>

      <MomentsFeed />
    </div>
  );
}
