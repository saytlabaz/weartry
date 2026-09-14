"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 6Z" strokeLinejoin="round" />
      <path d="M8 6V5a4 4 0 0 1 8 0v1" strokeLinecap="round" />
    </svg>
  );
}

export default function AccountShell({ children }: { children: ReactNode }) {
  const t = useTranslations("Account");
  const pathname = usePathname();

  const tabs = [
    { href: "/account", label: t("accountInfoTab"), icon: <InfoIcon /> },
    { href: "/account/orders", label: t("myOrders"), icon: <BagIcon /> },
  ] as const;

  const isActive = (href: string) => pathname === href;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
      <BlurFadeUp as="h1" className="text-3xl font-bold tracking-tight">
        {t("myAccount")}
      </BlurFadeUp>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto border-b border-border pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:pb-0">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className="relative shrink-0">
                {active && (
                  <motion.span
                    layoutId="account-tab-highlight"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-neutral-900"
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active ? "text-white" : "text-neutral-600 hover:bg-muted"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
