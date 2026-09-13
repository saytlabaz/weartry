"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

export interface OrderRow {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

export default function OrdersView({ orders }: { orders: OrderRow[] }) {
  const t = useTranslations("Account");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
      <BlurFadeUp as="h1" className="text-center text-3xl font-bold tracking-tight">
        {t("myOrders")}
      </BlurFadeUp>

      {orders.length === 0 ? (
        <BlurFadeUp delay={0.1} className="mt-10 text-center text-sm text-neutral-500">
          {t("noOrders")}
        </BlurFadeUp>
      ) : (
        <StaggerGroup className="mt-10 space-y-3">
          {orders.map((order) => (
            <StaggerItem key={order.id}>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString()} · {t(`orderStatus.${order.status}`)}
                  </p>
                </div>
                <p className="text-sm font-semibold">${order.total.toFixed(2)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <BlurFadeUp delay={0.15} className="mt-8 text-center">
        <Link href="/account" className="text-sm font-medium text-foreground underline underline-offset-2">
          {t("myAccount")}
        </Link>
      </BlurFadeUp>
    </div>
  );
}
