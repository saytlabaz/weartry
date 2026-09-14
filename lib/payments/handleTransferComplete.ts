import { prisma } from "@/lib/prisma";
import { sendOrderToCJ } from "@/lib/cj/createOrder";

/**
 * Skeleton for the Skrill → Payoneer transfer flow. Nothing calls this yet
 * — there's no Skrill or Payoneer API access wired up. Once there is, a
 * Payoneer webhook route should call this the moment it confirms funds
 * landed, and a separate Skrill webhook route should be responsible for
 * moving an order from PENDING_PAYMENT to AWAITING_TRANSFER (with an
 * AdminNotification, mirroring the shape below) when Skrill confirms
 * payment.
 *
 * Runs once the Skrill → Payoneer transfer (which can take 1-2 days) is
 * confirmed complete: marks the order TRANSFER_COMPLETE, sends it to CJ,
 * and notifies the admin either way.
 */
export async function handleTransferComplete(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "TRANSFER_COMPLETE" } }),
    prisma.orderStatusLog.create({
      data: { orderId, status: "TRANSFER_COMPLETE", note: "Payoneer transfer confirmed" },
    }),
  ]);

  const result = await sendOrderToCJ(orderId);

  await prisma.adminNotification.create({
    data: {
      type: result.success ? "GENERAL" : "CJ_ORDER_FAILED",
      title: result.success
        ? `Order #${order.orderNumber} auto-sent to CJ`
        : `Order #${order.orderNumber} failed to send to CJ`,
      message: result.success
        ? `Transfer confirmed and the order was automatically sent to CJ (CJ order ${result.cjOrderId}).`
        : `Transfer confirmed, but sending to CJ failed: ${result.error}. Use the admin panel's "Send to CJ" button once resolved.`,
      orderId,
    },
  });
}
