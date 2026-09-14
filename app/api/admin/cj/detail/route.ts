import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getCjProductDetail } from "@/lib/cj/getProductDetail";

/** GET /api/admin/cj/detail?pid=... — full product detail (images, variants, stock) for the "Ətraflı Bax" modal. */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("pid")?.trim();

  if (!pid) {
    return NextResponse.json({ error: "pid_required" }, { status: 400 });
  }

  try {
    const detail = await getCjProductDetail(pid);
    return NextResponse.json(detail);
  } catch (err) {
    console.error("CJ product detail failed:", err);
    return NextResponse.json(
      { error: "CJ ilə əlaqə qurula bilmədi, bir az sonra yenidən cəhd edin." },
      { status: 502 }
    );
  }
}
