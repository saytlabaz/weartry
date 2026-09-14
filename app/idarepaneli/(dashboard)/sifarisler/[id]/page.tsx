import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "../StatusBadge";
import OrderActions from "./OrderActions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">{order.createdAt.toLocaleString("az-AZ")}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <OrderActions orderId={order.id} status={order.status} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Müştəri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-neutral-500">{order.customerEmail}</p>
            <p className="text-neutral-500">{order.customerPhone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Çatdırılma Ünvanı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-neutral-600">
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}, {order.shippingProvince}
            </p>
            <p>
              {order.shippingCountry} — {order.shippingPostalCode}
            </p>
          </CardContent>
        </Card>
      </div>

      {(order.cjOrderId || order.trackingNumber) && (
        <Card>
          <CardHeader>
            <CardTitle>Çatdırılma / CJ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-neutral-600">
            {order.cjOrderId && <p>CJ Sifariş ID: {order.cjOrderId}</p>}
            {order.trackingNumber && <p>Tracking №: {order.trackingNumber}</p>}
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                İzləmə linki
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sifariş Elementləri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-neutral-100 py-2 text-sm last:border-0">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-neutral-500">
                  {[item.variantColor, item.variantSize].filter(Boolean).join(" / ")} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">${item.unitPrice.toString()}</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 text-sm font-semibold">
            <span>Cəmi</span>
            <span>
              ${order.total.toString()} {order.currency}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Tarixçəsi</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 border-l border-neutral-200 pl-4">
            {order.statusHistory.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-neutral-400" />
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge status={log.status} />
                  <span className="text-neutral-400">{log.createdAt.toLocaleString("az-AZ")}</span>
                </div>
                {log.note && <p className="mt-0.5 text-sm text-neutral-500">{log.note}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
