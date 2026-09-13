"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useStore } from "@/lib/store-context";
import PromoBar from "./PromoBar";
import SearchModal from "./SearchModal";
import LanguageMarketSwitcher from "./LanguageMarketSwitcher";

const MOBILE_BREAKPOINT = 768;
const SCROLL_HIDE_THRESHOLD = 80;

function SearchIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function AccountIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7-4.35-9.5-8.5C.7 8 2.2 4.5 5.8 4c2-.3 3.7.7 6.2 3 2.5-2.3 4.2-3.3 6.2-3 3.6.5 5.1 4 3.3 7.5C19 15.65 12 20 12 20Z" strokeLinejoin="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

function useHideOnMobileScrollDown() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
      const currentScrollY = window.scrollY;

      if (!isMobile || currentScrollY < SCROLL_HIDE_THRESHOLD) {
        setHidden(false);
      } else if (currentScrollY > lastScrollY.current) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return hidden;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Header() {
  const t = useTranslations("Nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, wishlistIds, openCart } = useStore();
  const hidden = useHideOnMobileScrollDown();
  const shouldReduceMotion = useReducedMotion();

  const navLinks = [
    { href: "/category/men", label: t("men") },
    { href: "/category/women", label: t("women") },
    { href: "/category/kids", label: t("kids") },
  ];

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 z-40 bg-background"
    >
      <PromoBar />
      <div className="border-b border-border">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={t("menu")}
              aria-expanded={mobileOpen}
            >
              <MenuIcon open={mobileOpen} />
            </button>
            <Link href="/" onClick={scrollToTop} className="block">
              <Image
                src="/weartry-logo-black.png"
                alt="WearTry"
                width={168}
                height={85}
                priority
                className="block h-10 w-auto md:h-12"
              />
            </Link>
          </div>

          {/* Absolutely centered on the FULL header width, independent of the
              logo/icon blocks' widths — a grid's middle 1fr track only
              centers within the leftover space between them, which drifts
              off-center whenever those two blocks aren't equally wide. */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-base font-medium lg:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-neutral-500">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-4">
            <Link href="/account/login" aria-label={t("account")}>
              <AccountIcon />
            </Link>
            <Link href="/wishlist" aria-label={t("wishlist")} className="relative">
              <HeartIcon />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <button type="button" aria-label={t("cart")} className="relative" onClick={openCart}>
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-900 text-[9px] text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label={t("search")}
              className="hidden sm:block"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1 overflow-hidden border-t border-border px-4 text-sm font-medium lg:hidden"
            >
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted"
              >
                <SearchIcon />
                {t("search")}
              </button>
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-2 py-2 hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-1 border-t border-border" />
              <LanguageMarketSwitcher variant="inline" />
              <div className="h-2" />
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
