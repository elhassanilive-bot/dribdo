import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ShortVideoPage({ params }) {
  const resolved = await params;
  const id = String(resolved?.id || "").trim();
  if (!id) redirect("/moments");
  redirect(`/video/${encodeURIComponent(id)}`);
}
