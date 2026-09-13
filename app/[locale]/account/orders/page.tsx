import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { safeAuth } from "@/lib/auth/safe-auth";
import { redirect } from "@/i18n/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import OrdersView, { type OrderRow } from "@/components/account/OrdersView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account");
  return { title: `${t("myOrders")} — WearTry` };
}

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await safeAuth();
  if (!session?.user) {
    redirect({ href: "/account/login", locale });
  }

  const { data } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", session!.user.id)
    .order("created_at", { ascending: false });

  return <OrdersView orders={(data ?? []) as OrderRow[]} />;
}
