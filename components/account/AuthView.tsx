"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

type Mode = "login" | "register";

export default function AuthView() {
  const t = useTranslations("Auth");
  const [mode, setMode] = useState<Mode>("login");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: connect to auth backend
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

      <div className="mt-10 rounded-xl border border-border bg-background p-6 sm:p-8">
        {submitted ? (
          <BlurFadeUp className="py-4 text-center text-sm text-neutral-600">
            {mode === "login" ? t("loginPlaceholderMessage") : t("registerPlaceholderMessage")}
          </BlurFadeUp>
        ) : mode === "login" ? (
          <form onSubmit={handleSubmit}>
            <StaggerGroup className="space-y-5">
              <StaggerItem>
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {t("emailLabel")}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
              </StaggerItem>
              <StaggerItem>
                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {t("passwordLabel")}
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder={t("passwordPlaceholder")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
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
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <StaggerGroup className="space-y-5">
              <StaggerItem>
                <div>
                  <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {t("nameLabel")}
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    required
                    placeholder={t("namePlaceholder")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
              </StaggerItem>
              <StaggerItem>
                <div>
                  <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {t("emailLabel")}
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
              </StaggerItem>
              <StaggerItem>
                <div>
                  <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {t("passwordLabel")}
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    required
                    placeholder={t("passwordPlaceholder")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
              </StaggerItem>
              <StaggerItem>
                <div>
                  <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-medium text-neutral-700">
                    {t("confirmPasswordLabel")}
                  </label>
                  <input
                    id="register-confirm"
                    type="password"
                    required
                    placeholder={t("passwordPlaceholder")}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
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
          </form>
        )}
      </div>
    </div>
  );
}
