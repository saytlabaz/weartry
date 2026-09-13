"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { mockAuthStore, createMockUser } from "@/lib/mock-auth";
import GoogleButton from "./GoogleButton";

type Mode = "login" | "register";

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
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: connect to auth backend
    const data = new FormData(e.currentTarget);
    const email = data.get("email");
    const fullName = data.get("name");
    mockAuthStore.set(
      createMockUser({
        ...(typeof email === "string" && email ? { email } : {}),
        ...(typeof fullName === "string" && fullName ? { fullName } : {}),
      })
    );
    setSubmitted(true);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setSubmitted(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <BlurFadeUp as="h1" className="text-center text-3xl font-bold tracking-tight">
        {mode === "login" ? t("loginTitle") : t("registerTitle")}
      </BlurFadeUp>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-background p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="submitted"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="py-4 text-center text-sm text-neutral-600"
            >
              {mode === "login" ? t("loginPlaceholderMessage") : t("registerPlaceholderMessage")}
            </motion.div>
          ) : mode === "login" ? (
            <motion.form
              key="login"
              onSubmit={handleSubmit}
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
                <StaggerItem>
                  <div>
                    <label htmlFor="login-password" className={labelClass}>
                      {t("passwordLabel")}
                    </label>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      placeholder={t("passwordPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
                  >
                    {t("loginButton")}
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
              onSubmit={handleSubmit}
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
                  <div>
                    <label htmlFor="register-password" className={labelClass}>
                      {t("passwordLabel")}
                    </label>
                    <input
                      id="register-password"
                      name="password"
                      type="password"
                      required
                      placeholder={t("passwordPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div>
                    <label htmlFor="register-confirm" className={labelClass}>
                      {t("confirmPasswordLabel")}
                    </label>
                    <input
                      id="register-confirm"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder={t("passwordPlaceholder")}
                      className={inputClass}
                    />
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
                <StaggerItem>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
                  >
                    {t("registerButton")}
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
