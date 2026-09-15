import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getMaxShippingCost } from "@/lib/cj/getMaxShippingCost";

// Parallel chunked sweep over 29 markets takes ~8-10s — explicit maxDuration
// so Vercel doesn't cut it at the default 10-15s limit.
export const maxDuration = 60;

/** POST /api/admin/cj/freight — runs the Max-of-Mins sweep over 29 markets (US, GB, 27 EU states), returning the highest standard (≤15 day, non-premium) freight quote. Manual/on-demand only; auto-runs at import time too. */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  let body: { vid?: string; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.vid) {
    return NextResponse.json({ error: "vid_required" }, { status: 400 });
  }

  try {
    const result = await getMaxShippingCost({ vid: body.vid, quantity: body.quantity });
    return NextResponse.json(result);
  } catch (err) {
    console.error("CJ freight calculation failed:", err);
    return NextResponse.json(
      { error: "CJ ilə əlaqə qurula bilmədi, bir az sonra yenidən cəhd edin." },
      { status: 502 }
    );
  }
}
