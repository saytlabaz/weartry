"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";

type Step = "email" | "code";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";
const tapHover = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };

export default function EmailChangeModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}) {
  const t = useTranslations("Account");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("email");
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMinutes, setBlockedMinutes] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  function reset() {
    setStep("email");
    setNewEmail("");
    setCode("");
    setError(null);
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function errorMessage(code: string | null) {
    if (!code) return null;
    if (code === "invalid_email") return tAuth("otpInvalidEmail");
    if (code === "same_email") return t("sameEmailError");
    if (code === "email_taken") return t("emailTakenError");
    if (code === "invalid_code") {
      return attemptsLeft !== null
        ? `${tAuth("otpInvalidCode")} ${tAuth("attemptsLeftWarning", { count: attemptsLeft })}`
        : tAuth("otpInvalidCode");
    }
    if (code === "code_expired") return tAuth("otpCodeExpired");
    if (code === "blocked") return tAuth("blockedError", { minutes: blockedMinutes ?? 60 });
    return tAuth("otpGenericError");
  }

  async function handleRequestCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const emailValue = String(data.get("newEmail") ?? "").trim();
    setNewEmail(emailValue);
    setLoading(true);
    try {
      const res = await fetch("/api/account/change-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: emailValue, locale }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "unknown");
        return;
      }
      setStep("code");
    } catch {
      setError("unknown");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/change-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "blocked") {
          setBlockedMinutes(body.minutesLeft ?? 60);
          setAttemptsLeft(null);
        } else {
          setAttemptsLeft(typeof body.attemptsLeft === "number" ? body.attemptsLeft : null);
        }
        setError(body.error ?? "unknown");
        return;
      }
      onSuccess(newEmail);
      handleClose();
    } catch {
      setError("unknown");
    } finally {
      setLoading(false);
    }
  }

  const displayError = errorMessage(error);

  return (
    <Modal open={open} onClose={handleClose} title={t("changeEmailModalTitle")}>
      <AnimatePresence mode="wait" initial={false}>
        {step === "email" ? (
          <motion.form
            key="email"
            onSubmit={handleRequestCode}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="new-email" className={labelClass}>
                {t("newEmailLabel")}
              </label>
              <input
                id="new-email"
                name="newEmail"
                type="email"
                required
                placeholder={tAuth("emailPlaceholder")}
                className={inputClass}
              />
            </div>
            {displayError && <p className="text-sm text-red-600">{displayError}</p>}
            <motion.button
              type="submit"
              disabled={loading}
              {...tapHover}
              className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? tAuth("otpSending") : tAuth("otpSendCode")}
            </motion.button>
          </motion.form>
        ) : (
          <motion.form
            key="code"
            onSubmit={handleVerify}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">{tAuth("otpCodeSentTo", { email: newEmail })}</p>
            <div>
              <label htmlFor="email-otp-code" className={labelClass}>
                {tAuth("otpCodeLabel")}
              </label>
              <input
                id="email-otp-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder={tAuth("otpCodePlaceholder")}
                className={`${inputClass} text-center text-lg tracking-[0.5em]`}
              />
            </div>
            {displayError && <p className="text-sm text-red-600">{displayError}</p>}
            <motion.button
              type="submit"
              disabled={loading}
              {...tapHover}
              className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? tAuth("otpVerifying") : tAuth("otpVerifyButton")}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
