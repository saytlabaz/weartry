"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/locales";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import GoogleButton from "./GoogleButton";

type Mode = "login" | "register";
type Step = "form" | "code";

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

export default function AuthView() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function errorMessage(code: string | null) {
    if (!code) return null;
    if (code === "invalid_code") return t("otpInvalidCode");
    if (code === "code_expired") return t("otpCodeExpired");
    if (code === "invalid_email") return t("otpInvalidEmail");
    if (code === "no_account") return t("otpNoAccount");
    if (code === "account_exists") return t("otpAccountExists");
    // "server_error" and anything unrecognized both fall back to a generic
    // message — the specifics are logged server-side (see otp/verify's
    // console.error calls), not something the user needs to parse.
    return t("otpGenericError");
  }

  /** Which tab the error implies the user should switch to, if any. */
  function errorSwitchTarget(code: string | null): Mode | null {
    if (code === "no_account") return "register";
    if (code === "account_exists") return "login";
    return null;
  }

  function renderError() {
    if (!displayError) return null;
    const target = errorSwitchTarget(error);
    return (
      <StaggerItem>
        <p className="text-center text-sm text-red-600">
          {displayError}
          {target && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => switchMode(target)}
                className="font-medium underline underline-offset-2"
              >
                {target === "register" ? t("switchToRegister") : t("switchToLogin")}
              </button>
            </>
          )}
        </p>
      </StaggerItem>
    );
  }

  async function handleRequestCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const emailValue = String(data.get("email") ?? "").trim();
    if (mode === "register") {
      setFullName(String(data.get("name") ?? "").trim());
      setGender(String(data.get("gender") ?? ""));
    }
    setEmail(emailValue);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, locale, mode }),
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

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          ...(mode === "register" ? { fullName, gender } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "unknown");
        setLoading(false);
        return;
      }
      // A full page load (not client-side navigation) so the browser sends
      // the just-set session cookie on the very next request — otherwise
      // useSession()/Header can keep showing "logged out" until a manual
      // reload, since router.refresh() only re-runs server components, not
      // next-auth's client-side session cache.
      window.location.href = locale === defaultLocale ? "/" : `/${locale}`;
    } catch {
      setError("unknown");
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStep("form");
    setError(null);
    setCode("");
  }

  function backToForm() {
    setStep("form");
    setError(null);
    setCode("");
  }

  const displayError = errorMessage(error);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <BlurFadeUp as="h1" className="text-center text-3xl font-bold tracking-tight">
        {mode === "login" ? t("loginTitle") : t("registerTitle")}
      </BlurFadeUp>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-background p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {step === "code" ? (
            <motion.form
              key="code"
              onSubmit={handleVerifyCode}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <StaggerGroup className="space-y-5">
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">
                    {t("otpCodeSentTo", { email })}
                  </p>
                </StaggerItem>
                <StaggerItem>
                  <div>
                    <label htmlFor="otp-code" className={labelClass}>
                      {t("otpCodeLabel")}
                    </label>
                    <input
                      id="otp-code"
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
                {renderError()}
                <StaggerItem>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? t("otpVerifying") : t("otpVerifyButton")}
                  </button>
                </StaggerItem>
                <StaggerItem>
                  <p className="text-center text-sm text-neutral-500">
                    {t("otpResendText")}{" "}
                    <button
                      type="button"
                      onClick={backToForm}
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
              onSubmit={handleRequestCode}
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
                      placeholder={t("emailPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>
                {renderError()}
                <StaggerItem>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? t("otpSending") : t("otpSendCode")}
                  </button>
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
              onSubmit={handleRequestCode}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <StaggerGroup className="space-y-5">
                <StaggerItem>
                  <div>
                    <label htmlFor="register-name" className={labelClass}>
                      {t("nameLabel")}
                    </label>
                    <input
                      id="register-name"
                      name="name"
                      type="text"
                      required
                      placeholder={t("namePlaceholder")}
                      className={inputClass}
                    />
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
                      placeholder={t("emailPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div>
                    <label htmlFor="register-gender" className={labelClass}>
                      {t("genderLabel")}
                    </label>
                    <select id="register-gender" name="gender" defaultValue="" className={inputClass}>
                      <option value="" disabled>
                        {t("genderLabel")}
                      </option>
                      <option value="male">{t("genderMale")}</option>
                      <option value="female">{t("genderFemale")}</option>
                      <option value="prefer-not">{t("genderPreferNot")}</option>
                    </select>
                  </div>
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
                {renderError()}
                <StaggerItem>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? t("otpSending") : t("registerButton")}
                  </button>
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
