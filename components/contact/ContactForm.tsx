"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    // Wire this up to the store's support inbox / helpdesk (e.g. Zendesk, Gorgias) before launch.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="rounded-2xl border border-border bg-muted/40 px-6 py-8 text-center text-neutral-700">
        ✓ {t("submitted")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-semibold">{t("formHeading")}</h2>
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-neutral-700">
          {t("nameLabel")}
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-neutral-700">
          {t("emailFieldLabel")}
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-neutral-700">
          {t("messageLabel")}
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white sm:w-auto sm:px-8"
      >
        {t("submit")}
      </button>
    </form>
  );
}
