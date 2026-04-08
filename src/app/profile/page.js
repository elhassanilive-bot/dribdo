import UserProfileShell from "@/components/profile/UserProfileShell";

export const metadata = {
  title: "الملف الشخصي",
  description: "عرض نسخة ويب مختصرة من الملف الشخصي للمستخدم في دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/profile" },
};

export default async function ProfilePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const uid = String(resolvedSearchParams?.uid || "").trim();

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 bg-slate-100 px-2 pb-16 pt-4 sm:px-4">
      <UserProfileShell key={`id:${uid || "self"}`} userId={uid} />
    </div>
  );
}
