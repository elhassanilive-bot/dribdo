import { NextResponse } from "next/server";
import { trackPostView } from "@/lib/blog/posts";

export async function POST(request) {
  try {
    const body = await request.json();
    const postId = String(body?.postId || "").trim();
    const viewerId = String(body?.viewerId || "").trim();

    if (!postId || !viewerId) {
      return NextResponse.json({ ok: false, error: "postId و viewerId مطلوبان" }, { status: 400 });
    }

    const result = await trackPostView({ postId, viewerId });
    if (!result.ok) {
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذر تتبع المشاهدة" },
      { status: 500 }
    );
  }
}
