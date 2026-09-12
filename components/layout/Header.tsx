"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PromoBar from "./PromoBar";
import LanguageMarketSwitcher from "./LanguageMarketSwitcher";

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 20s-7-4.35-9.5-8.5C.7 8 2.2 4.5 5.8 4c2-.3 3.7.7 6.2 3 2.5-2.3 4.2-3.3 6.2-3 3.6.5 5.1 4 3.3 7.5C19 15.65 12 20 12 20Z" strokeLinejoin="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 6Z" strokeLinejoin="round" />
      <path d="M8 6V5a4 4 0 0 1 8 0v1" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const t = useTranslations("Nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/#new-arrivals", label: t("shop") },
    { href: "/#categories", label: t("men") },
    { href: "/#categories", label: t("women") },
    { href: "/#categories", label: t("kids") },
    { href: "/#journal", label: t("journal") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background">
      <PromoBar />
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              <MenuIcon open={mobileOpen} />
            </button>
            <Link href="/" className="flex items-center gap-1 text-xl font-bold tracking-tight">
              WEARTRY <span aria-hidden>✳</span>
            </Link>
            <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className="transition-colors hover:text-neutral-500">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <button type="button" aria-label={t("search")} className="hidden sm:block">
              <SearchIcon />
            </button>
            <button type="button" aria-label={t("account")} className="hidden sm:block">
              <AccountIcon />
            </button>
            <button type="button" aria-label={t("wishlist")} className="relative hidden sm:block">
              <HeartIcon />
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white">
                0
              </span>
            </button>
            <button type="button" aria-label={t("cart")} className="relative">
              <CartIcon />
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white">
                0
              </span>
            </button>
            <LanguageMarketSwitcher />
          </div>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 text-sm font-medium lg:hidden">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-md px-2 py-2 hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
