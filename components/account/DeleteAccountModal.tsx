"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import Modal from "@/components/ui/Modal";
import PasswordInput from "@/components/ui/PasswordInput";

type Step = "confirm" | "code";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";
const tapHover = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };

export default function DeleteAccountModal({
  open,
  onClose,
  hasPassword,
}: {
  open: boolean;
  onClose: () => void;
  hasPassword: boolean;
}) {
  const t = useTranslations("Account");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("confirm");
  const [code, setCode] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMinutes, setBlockedMinutes] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  function reset() {
    setStep("confirm");
    setCode("");
    setUnderstood(false);
    setError(null);
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function errorMessage(code: string | null) {
    if (!code) return null;
    if (code === "invalid_password") {
      return attemptsLeft !== null
        ? `${t("invalidPasswordError")} ${tAuth("attemptsLeftWarning", { count: attemptsLeft })}`
        : t("invalidPasswordError");
    }
    if (code === "invalid_code") {
      return attemptsLeft !== null
        ? `${tAuth("otpInvalidCode")} ${tAuth("attemptsLeftWarning", { count: attemptsLeft })}`
        : tAuth("otpInvalidCode");
    }
    if (code === "code_expired") return tAuth("otpCodeExpired");
    if (code === "blocked") return tAuth("blockedError", { minutes: blockedMinutes ?? 60 });
    return tAuth("otpGenericError");
  }

  function handleFailure(body: { error?: string; minutesLeft?: number; attemptsLeft?: number }) {
    if (body.error === "blocked") {
      setBlockedMinutes(body.minutesLeft ?? 60);
      setAttemptsLeft(null);
    } else {
      setAttemptsLeft(typeof body.attemptsLeft === "number" ? body.attemptsLeft : null);
    }
    setError(body.error ?? "unknown");
  }

  async function handleRequestCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/delete/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        handleFailure(body);
        return;
      }
      setStep("code");
    } catch {
      setError("unknown");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");

    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hasPassword ? { password } : { code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        handleFailure(body);
        setLoading(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("unknown");
      setLoading(false);
    }
  }

  const displayError = errorMessage(error);

  return (
    <Modal open={open} onClose={handleClose} title={t("deleteAccountModalTitle")}>
      <AnimatePresence mode="wait" initial={false}>
        {!hasPassword && step === "confirm" ? (
          <motion.div
            key="request"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <p className="text-sm text-red-600">{t("deleteAccountWarning")}</p>
            <p className="text-sm text-neutral-500">{t("deleteAccountGoogleIntro")}</p>
            {displayError && <p className="text-sm text-red-600">{displayError}</p>}
            <motion.button
              type="button"
              onClick={handleRequestCode}
              disabled={loading}
              {...tapHover}
              className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? tAuth("otpSending") : tAuth("otpSendCode")}
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="confirm"
            onSubmit={handleDelete}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <p className="text-sm text-red-600">{t("deleteAccountWarning")}</p>

            {hasPassword ? (
              <PasswordInput
                id="delete-password"
                name="password"
                label={tAuth("passwordLabel")}
                placeholder={tAuth("passwordPlaceholder")}
                required
                autoComplete="current-password"
                showLabel={tAuth("showPassword")}
                hideLabel={tAuth("hidePassword")}
              />
            ) : (
              <div>
                <p className="mb-3 text-sm text-neutral-500">{t("codeSentToYourEmail")}</p>
                <label htmlFor="delete-otp-code" className={labelClass}>
                  {tAuth("otpCodeLabel")}
                </label>
                <input
                  id="delete-otp-code"
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
            )}

            <label className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
              />
              <span className="text-xs leading-relaxed text-red-700">{t("deleteAccountConfirmCheckbox")}</span>
            </label>

            {displayError && <p className="text-sm text-red-600">{displayError}</p>}

            <motion.button
              type="submit"
              disabled={loading || !understood}
              {...tapHover}
              className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? t("deleting") : t("deleteAccountButton")}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
