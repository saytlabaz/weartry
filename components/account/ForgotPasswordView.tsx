"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import PasswordInput from "@/components/ui/PasswordInput";

type Step = "email" | "reset";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";
const tapHover = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };

export default function ForgotPasswordView() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMinutes, setBlockedMinutes] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  function errorMessage(code: string | null) {
    if (!code) return null;
    if (code === "no_account") return t("otpNoAccount");
    if (code === "invalid_code") {
      return attemptsLeft !== null
        ? `${t("otpInvalidCode")} ${t("attemptsLeftWarning", { count: attemptsLeft })}`
        : t("otpInvalidCode");
    }
    if (code === "code_expired") return t("otpCodeExpired");
    if (code === "weak_password") return t("weakPassword");
    if (code === "password_mismatch") return t("passwordMismatch");
    if (code === "blocked") return t("blockedError", { minutes: blockedMinutes ?? 60 });
    return t("otpGenericError");
  }

  async function handleRequestCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const emailValue = String(data.get("email") ?? "").trim();
    setEmail(emailValue);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, locale }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "unknown");
        return;
      }
      setStep("reset");
    } catch {
      setError("unknown");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent<HTMLFormElement>) {
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
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
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
        setLoading(false);
        return;
      }
      router.push({ pathname: "/account/login", query: { resetSuccess: "1" } });
    } catch {
      setError("unknown");
      setLoading(false);
    }
  }

  const displayError = errorMessage(error);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <BlurFadeUp as="h1" className="text-center text-3xl font-bold tracking-tight">
        {t("forgotPasswordTitle")}
      </BlurFadeUp>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-background p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {step === "email" ? (
            <motion.form
              key="email"
              onSubmit={handleRequestCode}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <StaggerGroup className="space-y-5">
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">{t("forgotPasswordIntro")}</p>
                </StaggerItem>
                <StaggerItem>
                  <div>
                    <label htmlFor="forgot-email" className={labelClass}>
                      {t("emailLabel")}
                    </label>
                    <input
                      id="forgot-email"
                      name="email"
                      type="email"
                      required
                      placeholder={t("emailPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>
                {displayError && (
                  <StaggerItem>
                    <p className="text-center text-sm text-red-600">{displayError}</p>
                  </StaggerItem>
                )}
                <StaggerItem>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    {...tapHover}
                    className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? t("otpSending") : t("otpSendCode")}
                  </motion.button>
                </StaggerItem>
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">
                    <Link href="/account/login" className="font-medium text-foreground underline underline-offset-2">
                      {t("backToLogin")}
                    </Link>
                  </p>
                </StaggerItem>
              </StaggerGroup>
            </motion.form>
          ) : (
            <motion.form
              key="reset"
              onSubmit={handleReset}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <StaggerGroup className="space-y-5">
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">{t("otpCodeSentTo", { email })}</p>
                </StaggerItem>
                <StaggerItem>
                  <div>
                    <label htmlFor="reset-code" className={labelClass}>
                      {t("otpCodeLabel")}
                    </label>
                    <input
                      id="reset-code"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder={t("otpCodePlaceholder")}
                      className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                    />
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput
                    id="reset-new-password"
                    name="newPassword"
                    label={t("newPasswordLabel")}
                    placeholder={t("passwordPlaceholder")}
                    required
                    autoComplete="new-password"
                    showLabel={t("showPassword")}
                    hideLabel={t("hidePassword")}
                  />
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput
                    id="reset-confirm-password"
                    name="confirmPassword"
                    label={t("confirmPasswordLabel")}
                    placeholder={t("passwordPlaceholder")}
                    required
                    autoComplete="new-password"
                    showLabel={t("showPassword")}
                    hideLabel={t("hidePassword")}
                  />
                </StaggerItem>
                {displayError && (
                  <StaggerItem>
                    <p className="text-center text-sm text-red-600">{displayError}</p>
                  </StaggerItem>
                )}
                <StaggerItem>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    {...tapHover}
                    className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? t("otpVerifying") : t("resetPasswordButton")}
                  </motion.button>
                </StaggerItem>
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">
                    {t("otpResendText")}{" "}
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="font-medium text-foreground underline underline-offset-2"
                    >
                      {t("otpChangeEmail")}
                    </button>
                  </p>
                </StaggerItem>
              </StaggerGroup>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
