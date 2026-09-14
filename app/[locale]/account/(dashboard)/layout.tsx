import type { ReactNode } from "react";
import { safeAuth } from "@/lib/auth/safe-auth";
import { redirect } from "@/i18n/navigation";
import AccountShell from "@/components/account/AccountShell";

export default async function AccountDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await safeAuth();
  if (!session?.user) {
    redirect({ href: "/account/login", locale });
  }

  return <AccountShell>{children}</AccountShell>;
}
