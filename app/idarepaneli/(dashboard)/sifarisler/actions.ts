"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@/lib/generated/prisma/client";
import { sendOrderToCJ } from "@/lib/cj/createOrder";

export async function updateOrderStatusAction(orderId: string, status: $Enums.OrderStatus, note?: string) {
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusLog.create({
      data: { orderId, status, note: note ?? "Admin tərəfindən əl ilə dəyişdirildi" },
    }),
  ]);
  revalidatePath(`/idarepaneli/sifarisler/${orderId}`);
  revalidatePath("/idarepaneli/sifarisler");
}

export async function sendToCjAction(orderId: string) {
  const result = await sendOrderToCJ(orderId);
  revalidatePath(`/idarepaneli/sifarisler/${orderId}`);
  return result;
}
