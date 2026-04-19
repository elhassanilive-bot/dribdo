import { NextResponse } from "next/server";
import { listMarketProducts } from "@/lib/market/products";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const cursor = String(request.nextUrl.searchParams.get("cursor") || "").trim();
    const limit = Math.min(24, Math.max(6, Number(request.nextUrl.searchParams.get("limit") || 12)));

    const items = await listMarketProducts({ limit, cursor });
    const nextCursor = items.length ? String(items[items.length - 1].createdAt || "") : "";

    return NextResponse.json(
      {
        items: items.map((item) => ({
          ...item,
          productPath: `/product/${item.id}`,
        })),
        nextCursor,
        hasMore: items.length >= limit,
      },
      { status: 200, headers: { "cache-control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "failed_to_build_market_feed" }, { status: 500 });
  }
}
