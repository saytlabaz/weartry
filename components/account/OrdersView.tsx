"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

export interface OrderRow {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const style = STATUS_STYLES[status] ?? "bg-muted text-neutral-600";
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{label}</span>;
}

export default function OrdersView({ orders }: { orders: OrderRow[] }) {
  const t = useTranslations("Account");

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-border p-12 text-center"
      >
        <p className="text-sm text-neutral-500">{t("noOrders")}</p>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link href="/" className="inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white">
            {t("startShoppingButton")}
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <StaggerGroup className="space-y-3">
      {orders.map((order) => (
        <StaggerItem key={order.id}>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4 sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
              <p className="mt-1 text-xs text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</p>
              <div className="mt-2">
                <StatusBadge status={order.status} label={t(`orderStatus.${order.status}`)} />
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold">${order.total.toFixed(2)}</p>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
