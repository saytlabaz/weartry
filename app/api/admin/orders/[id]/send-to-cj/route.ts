import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { sendOrderToCJ } from "@/lib/cj/createOrder";

/** POST /api/admin/orders/[id]/send-to-cj — manually triggers sendOrderToCJ, for testing the CJ integration before any payment flow calls it automatically. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const result = await sendOrderToCJ(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "cj_send_failed" }, { status: 502 });
  }
  return NextResponse.json(result);
}
