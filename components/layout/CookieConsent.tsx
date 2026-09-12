"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const COOKIE_NAME = "weartry_cookie_consent";

function hasStoredConsent() {
  if (typeof document === "undefined") return true;
  return document.cookie
    .split("; ")
    .some((row) => row.startsWith(`${COOKIE_NAME}=`));
}

export default function CookieConsent() {
  const t = useTranslations("Legal.cookieBanner");
  const [visible, setVisible] = useState(() => !hasStoredConsent());

  function setConsent(value: "accepted" | "declined") {
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur sm:p-5">
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
    </div>
  );
}
