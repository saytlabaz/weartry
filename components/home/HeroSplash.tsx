"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "weartry_splash_seen";

// Same external-store shape as CookieConsent's cookie store: the server
// snapshot always matches what gets rendered on the client's first paint
// (splash visible), so there's no hydration flash — it only ever
// disappears in response to a real user click.
let dismissed = false;
let hydrated = false;
const listeners = new Set<() => void>();

function readDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true; // storage unavailable — don't block the site behind a splash we can't remember dismissing
  }
}

function getSnapshot() {
  if (!hydrated) {
    hydrated = true;
    dismissed = readDismissed();
  }
  return dismissed;
}

function getServerSnapshot() {
  return true;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function dismiss() {
  dismissed = true;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // sessionStorage unavailable — state stays in-memory only, splash won't reappear this page load.
  }
  listeners.forEach((listener) => listener());
}

export default function HeroSplash() {
  const t = useTranslations("Hero");
  const shouldReduceMotion = useReducedMotion();
  const isDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          key="hero-splash"
          initial={false}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden bg-neutral-900"
          onClick={dismiss}
          role="button"
          aria-label={t("cta")}
        >
          <Image
            src="/banner-hero.png"
            alt="WearTry"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/15" />

          <motion.button
            type="button"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className="relative z-10 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 shadow-xl sm:text-base"
          >
            {t("cta")}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
