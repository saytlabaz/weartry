import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrdersChart from "./OrdersChart";

const LOW_STOCK_THRESHOLD = 5;

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const chartStart = new Date(todayStart);
  chartStart.setDate(chartStart.getDate() - 29);

  const [todayCount, weekCount, pendingCount, unreadCount, lowStockProducts, recentOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.adminNotification.count({ where: { isRead: false } }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lt: LOW_STOCK_THRESHOLD } },
      select: { id: true, name: true, stock: true },
      take: 10,
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { createdAt: true },
    }),
  ]);

  const byDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of recentOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const chartData = Array.from(byDay.entries()).map(([date, count]) => ({
    date: date.slice(5),
    count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Bugünkü Sifarişlər</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{todayCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Həftəlik Sifarişlər</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{weekCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Gözləyən Ödənişlər</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-amber-600">{pendingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Oxunmamış Bildiriş</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{unreadCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son 30 Günün Sifarişləri</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersChart data={chartData} />
        </CardContent>
      </Card>

      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Aşağı Stok Xəbərdarlığı</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-amber-900">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className="font-semibold">{p.stock} ədəd</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
