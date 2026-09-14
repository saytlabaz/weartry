import { prisma } from "@/lib/prisma";
import { cjFetch } from "@/lib/cj/auth";

interface CjCreateOrderResponse {
  code: number;
  message?: string;
  data?: {
    orderId: string;
    orderNumber: string;
    shipmentOrderId?: string;
  };
}

export interface SendOrderToCjResult {
  success: boolean;
  cjOrderId?: string;
  error?: string;
}

/**
 * Sends a confirmed order to CJ Dropshipping and updates it in place —
 * not an API route, since this is meant to be *called* (once a payment
 * webhook exists to call it automatically; for now, only the admin panel's
 * "Send to CJ" button calls it).
 *
 * CJ's v2 API folds the consignee/address step into the order-creation
 * call itself (no separate "create consignee" endpoint to call first —
 * confirmed against their docs), so this is a single request.
 */
export async function sendOrderToCJ(orderId: string): Promise<SendOrderToCjResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return { success: false, error: "order_not_found" };
  }

  try {
    const res = await cjFetch("/v1/shopping/order/createOrderV2", {
      method: "POST",
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        shippingCountryCode: order.shippingCountry,
        shippingProvince: order.shippingProvince,
        shippingCity: order.shippingCity,
        shippingAddress: order.shippingAddress,
        shippingCustomerName: order.customerName,
        shippingPhone: order.customerPhone,
        // 3 = "create only", doesn't trigger CJ's own payment flow — we
        // pay CJ separately (Payoneer), CJ order creation here is just
        // fulfillment, not payment.
        payType: 3,
        products: order.items.map((item) => ({
          // NOTE: this assumes `productId` is a CJ sku/vid, which is only
          // true once the catalog is migrated into the Product table with
          // real `cjProductId` values (see prisma/schema.prisma). Today's
          // storefront still uses the static placeholder catalog in
          // lib/data.ts, so this will need that mapping wired in before it
          // can succeed against CJ for real — the shape of the call is
          // otherwise complete and ready for that.
          vid: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    const body = (await res.json()) as CjCreateOrderResponse;

    if (!res.ok || body.code !== 200 || !body.data) {
      const errorMessage = body.message ?? res.statusText;
      await logCjFailure(orderId, errorMessage);
      return { success: false, error: errorMessage };
    }

    const cjOrderId = body.data.orderId;

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "SENT_TO_CJ", cjOrderId },
      }),
      prisma.orderStatusLog.create({
        data: { orderId, status: "SENT_TO_CJ", note: `CJ order created: ${cjOrderId}` },
      }),
    ]);

    return { success: true, cjOrderId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    await logCjFailure(orderId, message);
    return { success: false, error: message };
  }
}

/** Order.status is deliberately left unchanged on failure — a human needs to look at it. */
async function logCjFailure(orderId: string, reason: string) {
  await prisma.adminNotification.create({
    data: {
      type: "CJ_ORDER_FAILED",
      title: "CJ order creation failed",
      message: reason,
      orderId,
    },
  });
}
