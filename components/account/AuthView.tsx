"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/locales";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import PasswordInput from "@/components/ui/PasswordInput";
import OtpInput from "@/components/ui/OtpInput";
import GoogleButton from "./GoogleButton";

type Mode = "login" | "register";
type RegisterStep = "form" | "code";

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function CheckBadge() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12.5 2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";
const tapHover = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };

export default function AuthView() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const showResetSuccess = searchParams.get("resetSuccess") === "1";

  const [mode, setMode] = useState<Mode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [accountExists, setAccountExists] = useState(false);
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMinutes, setBlockedMinutes] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [errorTick, setErrorTick] = useState(0);

  function homeHref() {
    return locale === defaultLocale ? "/" : `/${locale}`;
  }

  function errorMessage(code: string | null) {
    if (!code) return null;
    if (code === "invalid_credentials") {
      return attemptsLeft !== null
        ? `${t("invalidCredentials")} ${t("attemptsLeftWarning", { count: attemptsLeft })}`
        : t("invalidCredentials");
    }
    if (code === "blocked") return t("blockedError", { minutes: blockedMinutes ?? 60 });
    if (code === "weak_password") return t("weakPassword");
    if (code === "password_mismatch") return t("passwordMismatch");
    if (code === "invalid_code") {
      return attemptsLeft !== null
        ? `${t("otpInvalidCode")} ${t("attemptsLeftWarning", { count: attemptsLeft })}`
        : t("otpInvalidCode");
    }
    if (code === "code_expired") return t("otpCodeExpired");
    return t("otpGenericError");
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const emailValue = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setEmail(emailValue);
    setLoading(true);
    try {
      const res = await signIn("credentials", { email: emailValue, password, redirect: false });
      if (res?.error) {
        if (res.code === "blocked") {
          setBlockedMinutes(60);
          setAttemptsLeft(null);
          setError("blocked");
        } else {
          const match = res.code?.match(/^invalid_credentials_(\d+)$/);
          setAttemptsLeft(match ? Number(match[1]) : null);
          setError("invalid_credentials");
        }
        setLoading(false);
        return;
      }
      window.location.href = homeHref();
    } catch {
      setError("unknown");
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const emailValue = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setError("weak_password");
      return;
    }
    if (password !== confirmPassword) {
      setError("password_mismatch");
      return;
    }

    setEmail(emailValue);
    setRegisterPassword(password);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email: emailValue, password, locale }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "account_exists") {
          setAccountExists(true);
        } else {
          setError(body.error ?? "unknown");
        }
        return;
      }
      setRegisterStep("code");
    } catch {
      setError("unknown");
    } finally {
      setLoading(false);
    }
  }

  async function verifyRegisterCode(codeValue: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeValue }),
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
        setErrorTick((n) => n + 1);
        setLoading(false);
        return;
      }
      // Hesab yaradıldı — indi eyni məlumatlarla avtomatik daxil ol.
      const signInRes = await signIn("credentials", { email, password: registerPassword, redirect: false });
      if (signInRes?.error) {
        // Çox nadir hal: hesab yarandı, amma avtomatik giriş alınmadı — istifadəçi login-ə keçsin.
        setMode("login");
        setAccountExists(false);
        setRegisterStep("form");
        return;
      }
      window.location.href = homeHref();
    } catch {
      setError("unknown");
      setErrorTick((n) => n + 1);
      setLoading(false);
    }
  }

  async function handleVerifyRegisterCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await verifyRegisterCode(code);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setRegisterStep("form");
    setAccountExists(false);
    setError(null);
    setCode("");
    setErrorTick(0);
  }

  function goToLoginFromExists() {
    setAccountExists(false);
    setMode("login");
    setError(null);
  }

  const displayError = errorMessage(error);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <BlurFadeUp as="h1" immediate className="text-center text-3xl font-bold tracking-tight">
        {accountExists ? t("accountExistsTitle") : mode === "login" ? t("loginTitle") : t("registerTitle")}
      </BlurFadeUp>

      <AnimatePresence>
        {showResetSuccess && mode === "login" && !accountExists && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 overflow-hidden rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-800"
          >
            {t("resetSuccessMessage")}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-background p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {accountExists ? (
            <motion.div
              key="exists"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4 rounded-xl bg-green-50 p-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckBadge />
              </div>
              <p className="text-sm font-medium text-green-800">{t("accountExistsMessage")}</p>
              <motion.button
                type="button"
                onClick={goToLoginFromExists}
                {...tapHover}
                className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
              >
                {t("goToLoginButton")}
              </motion.button>
            </motion.div>
          ) : mode === "register" && registerStep === "code" ? (
            <motion.form
              key="register-code"
              onSubmit={handleVerifyRegisterCode}
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
                  <OtpInput
                    id="register-otp-code"
                    label={t("otpCodeLabel")}
                    placeholder={t("otpCodePlaceholder")}
                    value={code}
                    onChange={setCode}
                    onComplete={verifyRegisterCode}
                    loading={loading}
                    errorTick={errorTick}
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
                    {loading ? t("otpVerifying") : t("otpVerifyButton")}
                  </motion.button>
                </StaggerItem>
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">
                    {t("otpResendText")}{" "}
                    <button
                      type="button"
                      onClick={() => setRegisterStep("form")}
                      className="font-medium text-foreground underline underline-offset-2"
                    >
                      {t("otpChangeEmail")}
                    </button>
                  </p>
                </StaggerItem>
              </StaggerGroup>
            </motion.form>
          ) : mode === "login" ? (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <StaggerGroup className="space-y-5">
                <StaggerItem>
                  <div>
                    <label htmlFor="login-email" className={labelClass}>
                      {t("emailLabel")}
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      defaultValue={email}
                      placeholder={t("emailPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput
                    id="login-password"
                    name="password"
                    label={t("passwordLabel")}
                    placeholder={t("passwordPlaceholder")}
                    required
                    autoComplete="current-password"
                    showLabel={t("showPassword")}
                    hideLabel={t("hidePassword")}
                  />
                </StaggerItem>
                <StaggerItem>
                  <div className="text-right">
                    <Link
                      href="/account/forgot-password"
                      className="text-sm font-medium text-neutral-500 underline underline-offset-2 hover:text-foreground"
                    >
                      {t("forgotPasswordLink")}
                    </Link>
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
                    {loading ? t("loggingIn") : t("loginButton")}
                  </motion.button>
                </StaggerItem>
                <StaggerItem>
                  <Divider label={t("orDivider")} />
                </StaggerItem>
                <StaggerItem>
                  <GoogleButton label={t("googleLogin")} />
                </StaggerItem>
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">
                    {t("noAccountText")}{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="font-medium text-foreground underline underline-offset-2"
                    >
                      {t("switchToRegister")}
                    </button>
                  </p>
                </StaggerItem>
              </StaggerGroup>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              onSubmit={handleRegisterSubmit}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <StaggerGroup className="space-y-5">
                <StaggerItem>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="register-first-name" className={labelClass}>
                        {t("firstNameLabel")}
                      </label>
                      <input
                        id="register-first-name"
                        name="firstName"
                        type="text"
                        required
                        placeholder={t("firstNamePlaceholder")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="register-last-name" className={labelClass}>
                        {t("lastNameLabel")}
                      </label>
                      <input
                        id="register-last-name"
                        name="lastName"
                        type="text"
                        required
                        placeholder={t("lastNamePlaceholder")}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div>
                    <label htmlFor="register-email" className={labelClass}>
                      {t("emailLabel")}
                    </label>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      required
                      defaultValue={email}
                      placeholder={t("emailPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput
                    id="register-password"
                    name="password"
                    label={t("passwordLabel")}
                    placeholder={t("passwordPlaceholder")}
                    required
                    autoComplete="new-password"
                    showLabel={t("showPassword")}
                    hideLabel={t("hidePassword")}
                  />
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput
                    id="register-confirm-password"
                    name="confirmPassword"
                    label={t("confirmPasswordLabel")}
                    placeholder={t("passwordPlaceholder")}
                    required
                    autoComplete="new-password"
                    showLabel={t("showPassword")}
                    hideLabel={t("hidePassword")}
                  />
                </StaggerItem>
                <StaggerItem>
                  <label className="flex items-start gap-2.5 rounded-lg border border-neutral-900 bg-neutral-50 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      readOnly
                      className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900"
                    />
                    <span className="text-xs leading-relaxed text-neutral-600">
                      {t.rich("acceptPoliciesText", {
                        privacy: (chunks) => (
                          <Link href="/privacy-policy" className="font-medium text-foreground underline underline-offset-2">
                            {chunks}
                          </Link>
                        ),
                        terms: (chunks) => (
                          <Link href="/terms-of-service" className="font-medium text-foreground underline underline-offset-2">
                            {chunks}
                          </Link>
                        ),
                      })}
                    </span>
                  </label>
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
                    {loading ? t("otpSending") : t("registerButton")}
                  </motion.button>
                </StaggerItem>
                <StaggerItem>
                  <Divider label={t("orDivider")} />
                </StaggerItem>
                <StaggerItem>
                  <GoogleButton label={t("googleRegister")} />
                </StaggerItem>
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">
                    {t("haveAccountText")}{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-medium text-foreground underline underline-offset-2"
                    >
                      {t("switchToLogin")}
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
