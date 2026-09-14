import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getMaxShippingCost } from "@/lib/cj/getMaxShippingCost";

// The 29-country sweep takes ~30-35s at CJ's rate limit — well under
// Vercel's default function timeout, but worth being explicit about.
export const maxDuration = 60;

/** POST /api/admin/cj/freight — sweeps every supported market for the highest 8-15 day CJ freight quote for one variant. Manual/on-demand only, never automatic. */
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
