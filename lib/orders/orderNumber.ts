import { prisma } from "@/lib/prisma";

/**
 * Generates the next WT-<year>-NNNNN order number. Not a dedicated
 * sequence table — counts this year's orders and retries the insert on a
 * collision (unique constraint), which the caller (checkout route) does.
 * Fine at this store's order volume; would need a real atomic counter if
 * that ever changes.
 */
export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: `WT-${year}-` } },
  });
  return `WT-${year}-${String(count + 1).padStart(5, "0")}`;
}
