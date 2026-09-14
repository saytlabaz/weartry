import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";

/** GET /api/admin/notifications — unread admin notifications, newest first. */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const notifications = await prisma.adminNotification.findMany({
    where: { isRead: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notifications });
}
