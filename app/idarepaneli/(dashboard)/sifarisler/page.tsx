import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge, { ORDER_STATUSES } from "./StatusBadge";
import OrderStatusFilter from "./OrderStatusFilter";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (status && ORDER_STATUSES.includes(status)) {
    where.status = status as Prisma.OrderWhereInput["status"];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sifarişlər</h1>

      <OrderStatusFilter />

      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sifariş №</TableHead>
              <TableHead>Müştəri</TableHead>
              <TableHead>Tarix</TableHead>
              <TableHead>Məbləğ</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-neutral-500">
                  Sifariş tapılmadı.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-neutral-50">
                <TableCell>
                  <Link href={`/idarepaneli/sifarisler/${order.id}`} className="font-medium hover:underline">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.createdAt.toLocaleDateString("az-AZ")}</TableCell>
                <TableCell>
                  ${order.total.toString()} {order.currency}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
