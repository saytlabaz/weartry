"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(id: string) {
  await prisma.adminNotification.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/idarepaneli/bildirisler");
  revalidatePath("/idarepaneli", "layout");
}
