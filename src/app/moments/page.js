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
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 bg-slate-100 px-2 pb-16 pt-4 sm:px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(momentsJsonLd) }} />
      <MomentsFeed />
    </div>
  );
}
