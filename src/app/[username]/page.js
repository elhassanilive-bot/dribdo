import { redirect } from "next/navigation";
import UserProfileShell from "@/components/profile/UserProfileShell";

export const dynamic = "force-dynamic";

export default async function PublicUserProfilePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  let username = String(resolvedParams?.username || "").trim();
  try {
    username = decodeURIComponent(username);
  } catch {}
  username = username.trim();

  if (!username) {
    redirect("/profile");
  }

  if (resolvedSearchParams?.uid) {
    redirect(`/${encodeURIComponent(username)}`);
  }

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 bg-slate-100 px-2 pb-16 pt-4 sm:px-4">
      <UserProfileShell key={`u:${username}`} username={username} />
    </div>
  );
}
