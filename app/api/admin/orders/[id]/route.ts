import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

const VALID_STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_RECEIVED",
  "AWAITING_TRANSFER",
  "TRANSFER_COMPLETE",
  "SENT_TO_CJ",
  "CJ_CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

/** GET /api/admin/orders/[id] — full order detail + status history. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ order });
}

/** PATCH /api/admin/orders/[id] — manual status override, for when the automated flow needs a human to step in. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const { status, note } = body as { status?: string; note?: string };

  if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [order] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: status as (typeof VALID_STATUSES)[number] },
    }),
    prisma.orderStatusLog.create({
      data: {
        orderId: id,
        status: status as (typeof VALID_STATUSES)[number],
        note: note ?? "Manually overridden by admin",
      },
    }),
  ]);

  return NextResponse.json({ order });
}
