"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <BlurFadeUp
        as="p"
        className="rounded-2xl border border-border bg-muted/40 px-6 py-8 text-center text-neutral-700"
      >
        ✓ {t("submitted")}
      </BlurFadeUp>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <StaggerGroup className="space-y-5">
        <StaggerItem>
          <h2 className="text-lg font-semibold">{t("formHeading")}</h2>
        </StaggerItem>
        <StaggerItem>
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
        </StaggerItem>
        <StaggerItem>
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
        </StaggerItem>
        <StaggerItem>
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
        </StaggerItem>
        {error && (
          <StaggerItem>
            <p className="text-sm text-red-600">{t("submitError")}</p>
          </StaggerItem>
        )}
        <StaggerItem>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {submitting ? t("submitting") : t("submit")}
          </button>
        </StaggerItem>
      </StaggerGroup>
    </form>
  );
}
