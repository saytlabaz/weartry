"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const COOKIE_NAME = "weartry_cookie_consent";

// Modeled on lib/persisted-store.ts's cookie store: getServerSnapshot always
// returns the same value the server rendered (banner hidden), so reading the
// real cookie on the client can never cause a hydration mismatch here.
let hasConsent = false;
let hydrated = false;
const listeners = new Set<() => void>();

function readConsent() {
  return document.cookie.split("; ").some((row) => row.startsWith(`${COOKIE_NAME}=`));
}

function getSnapshot() {
  if (!hydrated) {
    hydrated = true;
    hasConsent = readConsent();
  }
  return hasConsent;
}

function getServerSnapshot() {
  return true;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setConsent(value: "accepted" | "declined") {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
  hasConsent = true;
  listeners.forEach((listener) => listener());
}

export default function CookieConsent() {
  const t = useTranslations("Legal.cookieBanner");
  const shouldReduceMotion = useReducedMotion();
  const hasConsentValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <AnimatePresence>
      {!hasConsentValue && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur sm:p-5"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-600">
              {t("message")}{" "}
              <Link href="/cookie-policy" className="font-medium underline underline-offset-2">
                {t("learnMore")}
              </Link>
            </p>
            <div className="flex w-full shrink-0 gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setConsent("declined")}
                className="flex-1 rounded-full border border-border px-4 py-2 text-xs font-medium sm:flex-none"
              >
                {t("decline")}
              </button>
              <button
                type="button"
                onClick={() => setConsent("accepted")}
                className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white sm:flex-none"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
