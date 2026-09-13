import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { safeAuth } from "@/lib/auth/safe-auth";
import { redirect } from "@/i18n/navigation";
import AccountView from "@/components/account/AccountView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account");
  return { title: `${t("myAccount")} — WearTry` };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await safeAuth();
  if (!session?.user) {
    redirect({ href: "/account/login", locale });
  }

  return <AccountView user={session!.user} />;
}
