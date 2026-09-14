import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { safeAuth } from "@/lib/auth/safe-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import OrdersView, { type OrderRow } from "@/components/account/OrdersView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account");
  return { title: `${t("myOrders")} — WearTry` };
}

export default async function OrdersPage() {
  const session = await safeAuth();
  if (!session?.user) return null;

  const { data } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return <OrdersView orders={(data ?? []) as OrderRow[]} />;
}
