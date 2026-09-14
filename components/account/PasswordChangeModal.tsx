"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import PasswordInput from "@/components/ui/PasswordInput";
import OtpInput from "@/components/ui/OtpInput";

type Step = "request" | "code";

const tapHover = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };

export default function PasswordChangeModal({
  open,
  onClose,
  hasPassword,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  hasPassword: boolean;
  onSuccess: () => void;
}) {
  const t = useTranslations("Account");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("request");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMinutes, setBlockedMinutes] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [errorTick, setErrorTick] = useState(0);

  function reset() {
    setStep("request");
    setCode("");
    setError(null);
    setLoading(false);
    setErrorTick(0);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function errorMessage(code: string | null) {
    if (!code) return null;
    if (code === "invalid_code") {
      return attemptsLeft !== null
        ? `${tAuth("otpInvalidCode")} ${tAuth("attemptsLeftWarning", { count: attemptsLeft })}`
        : tAuth("otpInvalidCode");
    }
    if (code === "code_expired") return tAuth("otpCodeExpired");
    if (code === "weak_password") return tAuth("weakPassword");
    if (code === "password_mismatch") return tAuth("passwordMismatch");
    if (code === "blocked") return tAuth("blockedError", { minutes: blockedMinutes ?? 60 });
    return tAuth("otpGenericError");
  }

  async function handleRequestCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
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

  async function handleSubmitNewPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setError("weak_password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("password_mismatch");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, newPassword }),
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
        // Only the code field needs clearing — a wrong code doesn't mean the
        // new password the user typed was bad, so leave those untouched.
        if (body.error === "invalid_code" || body.error === "code_expired" || body.error === "blocked") {
          setErrorTick((n) => n + 1);
        }
        return;
      }
      onSuccess();
      handleClose();
    } catch {
      setError("unknown");
    } finally {
      setLoading(false);
    }
  }

  const displayError = errorMessage(error);
  const title = hasPassword ? t("changePasswordModalTitle") : t("addPasswordModalTitle");

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <AnimatePresence mode="wait" initial={false}>
        {step === "request" ? (
          <motion.div
            key="request"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">
              {hasPassword ? t("changePasswordIntro") : t("addPasswordIntro")}
            </p>
            {displayError && <p className="text-sm text-red-600">{displayError}</p>}
            <motion.button
              type="button"
              onClick={handleRequestCode}
              disabled={loading}
              {...tapHover}
              className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? tAuth("otpSending") : tAuth("otpSendCode")}
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="code"
            onSubmit={handleSubmitNewPassword}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">{t("codeSentToYourEmail")}</p>
            <OtpInput
              id="password-otp-code"
              label={tAuth("otpCodeLabel")}
              placeholder={tAuth("otpCodePlaceholder")}
              value={code}
              onChange={setCode}
              loading={loading}
              errorTick={errorTick}
            />
            <PasswordInput
              id="new-password"
              name="newPassword"
              label={tAuth("newPasswordLabel")}
              placeholder={tAuth("passwordPlaceholder")}
              required
              autoComplete="new-password"
              showLabel={tAuth("showPassword")}
              hideLabel={tAuth("hidePassword")}
            />
            <PasswordInput
              id="confirm-new-password"
              name="confirmPassword"
              label={tAuth("confirmPasswordLabel")}
              placeholder={tAuth("passwordPlaceholder")}
              required
              autoComplete="new-password"
              showLabel={tAuth("showPassword")}
              hideLabel={tAuth("hidePassword")}
            />
            {displayError && <p className="text-sm text-red-600">{displayError}</p>}
            <motion.button
              type="submit"
              disabled={loading}
              {...tapHover}
              className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? tAuth("otpVerifying") : t("saveButton")}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
