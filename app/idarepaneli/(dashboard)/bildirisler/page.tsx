import { prisma } from "@/lib/prisma";
import NotificationRow from "./NotificationRow";

export default async function NotificationsPage() {
  const notifications = await prisma.adminNotification.findMany({
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Bildirişlər</h1>
      {notifications.length === 0 && <p className="text-sm text-neutral-500">Bildiriş yoxdur.</p>}
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationRow key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}
