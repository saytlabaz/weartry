"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("Sections.newsletter");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Wire this up to the store's email provider (Klaviyo, Mailchimp, etc.) before launch.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className={`text-sm ${compact ? "text-neutral-500" : "text-white/80"}`}>
        ✓ {t("cta")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        className={`min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none ${
          compact
            ? "border-border bg-background"
            : "border-white/20 bg-white/10 text-white placeholder:text-white/60"
        }`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium ${
          compact ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
        }`}
      >
        {t("cta")}
      </button>
    </form>
  );
}
