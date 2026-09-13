"use client";

import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

interface AccountViewUser {
  name?: string | null;
  email?: string | null;
}

export default function AccountView({ user }: { user: AccountViewUser }) {
  const t = useTranslations("Account");

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <BlurFadeUp as="h1" className="text-center text-3xl font-bold tracking-tight">
        {t("myAccount")}
      </BlurFadeUp>

      <div className="mt-10 space-y-5 rounded-xl border border-border bg-background p-6 sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{t("nameField")}</p>
          <p className="mt-1 text-sm font-medium">{user.name || t("noName")}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{t("emailField")}</p>
          <p className="mt-1 text-sm font-medium">{user.email}</p>
        </div>

        <Link
          href="/account/orders"
          className="block w-full rounded-full border border-border px-5 py-3 text-center text-sm font-medium hover:bg-muted"
        >
          {t("myOrders")}
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
        >
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}
