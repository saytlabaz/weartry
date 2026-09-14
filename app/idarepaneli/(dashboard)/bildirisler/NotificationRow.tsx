"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationRead } from "./actions";

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationRow({ notification }: { notification: NotificationData }) {
  const [pending, startTransition] = useTransition();
  const isUrgent = notification.type === "PAYMENT_PENDING_TRANSFER";

  function handleMarkRead() {
    startTransition(async () => {
      await markNotificationRead(notification.id);
    });
  }

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${
        isUrgent && !notification.isRead
          ? "border-amber-300 bg-amber-50"
          : notification.isRead
            ? "border-neutral-200 bg-white opacity-60"
            : "border-neutral-200 bg-white"
      }`}
    >
      <div className="min-w-0">
        <p className="font-medium">{notification.title}</p>
        <p className="mt-0.5 text-sm text-neutral-600">{notification.message}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-400">
          <span>{notification.createdAt.toLocaleString("az-AZ")}</span>
          {notification.orderId && (
            <Link href={`/idarepaneli/sifarisler/${notification.orderId}`} className="text-blue-600 hover:underline">
              Sifarişə bax
            </Link>
          )}
        </div>
      </div>
      {!notification.isRead && (
        <Button variant="ghost" size="icon" disabled={pending} onClick={handleMarkRead}>
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
