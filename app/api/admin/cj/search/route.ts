import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { searchCjProducts } from "@/lib/cj/searchProducts";

/** GET /api/admin/cj/search?keyword=...&page=1 — proxies CJ's catalog search for the admin panel's "CJ-dən Məhsul Axtar" screen. */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword")?.trim();
  const page = Number(searchParams.get("page") ?? "1") || 1;

  if (!keyword) {
    return NextResponse.json({ error: "keyword_required" }, { status: 400 });
  }

  try {
    const result = await searchCjProducts({ keyword, page });
    return NextResponse.json(result);
  } catch (err) {
    console.error("CJ search failed:", err);
    return NextResponse.json(
      { error: "CJ ilə əlaqə qurula bilmədi, bir az sonra yenidən cəhd edin." },
      { status: 502 }
    );
  }
}
