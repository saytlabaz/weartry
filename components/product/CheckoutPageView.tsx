"use client";

import { type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { findProductById } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import { markets } from "@/i18n/markets";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { saveCheckoutInfo, type CheckoutInfo } from "@/lib/checkout-info";

interface CheckoutUser {
  name?: string | null;
  email?: string | null;
}

const inputClass =
  "w-full min-h-11 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

function Required() {
  return (
    <span className="text-red-500" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export default function CheckoutPageView({ user }: { user: CheckoutUser | null }) {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const { cartItems } = useStore();

  const items = cartItems
    .map((entry) => {
      const product = findProductById(entry.id);
      return product ? { product, quantity: entry.quantity } : null;
    })
    .filter((item): item is { product: NonNullable<ReturnType<typeof findProductById>>; quantity: number } =>
      Boolean(item)
    );

  function handleContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const info: CheckoutInfo = {
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      country: String(data.get("country") ?? ""),
      city: String(data.get("city") ?? ""),
      province: String(data.get("province") ?? ""),
      addressLine1: String(data.get("addressLine1") ?? ""),
      addressLine2: String(data.get("addressLine2") ?? ""),
      postalCode: String(data.get("postalCode") ?? ""),
    };
    saveCheckoutInfo(info);
    router.push("/payment");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <BlurFadeUp className="text-sm text-neutral-500">{t("emptyCartMessage")}</BlurFadeUp>
        <BlurFadeUp delay={0.1} className="mt-6">
          <Link href="/" className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white">
            {t("continueShopping")}
          </Link>
        </BlurFadeUp>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <BlurFadeUp as="h1" className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </BlurFadeUp>
      <BlurFadeUp delay={0.05} className="mt-2 text-sm text-neutral-500">
        {t("stepOneOfTwo")}
      </BlurFadeUp>

      <form key={user?.email ?? "guest"} onSubmit={handleContinue} className="mt-8">
        <StaggerGroup className="space-y-8">
          {!user && (
            <StaggerItem>
              <p className="text-sm text-neutral-500">
                {t("loginPrompt")}{" "}
                <Link href="/account/login" className="font-medium text-foreground underline underline-offset-2">
                  {t("loginLink")}
                </Link>
              </p>
            </StaggerItem>
          )}

          <StaggerItem>
            <div>
              <h2 className="text-lg font-semibold">{t("contactHeading")}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-name" className={labelClass}>
                    {t("fullNameLabel")}
                    <Required />
                  </label>
                  <input
                    id="checkout-name"
                    name="fullName"
                    type="text"
                    required
                    defaultValue={user?.name ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-email" className={labelClass}>
                    {t("emailLabel")}
                    <Required />
                  </label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    required
                    defaultValue={user?.email ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className={labelClass}>
                    {t("phoneLabel")}
                    <Required />
                  </label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    required
                    defaultValue={""}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <h2 className="text-lg font-semibold">{t("shippingHeading")}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-country" className={labelClass}>
                    {t("countryLabel")}
                    <Required />
                  </label>
                  <select
                    id="checkout-country"
                    name="country"
                    required
                    defaultValue={""}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      {t("countryLabel")}
                    </option>
                    {markets.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="checkout-city" className={labelClass}>
                    {t("cityLabel")}
                    <Required />
                  </label>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    required
                    defaultValue={""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-province" className={labelClass}>
                    {t("provinceLabel")}
                  </label>
                  <input
                    id="checkout-province"
                    name="province"
                    type="text"
                    defaultValue={""}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-address1" className={labelClass}>
                    {t("addressLine1Label")}
                    <Required />
                  </label>
                  <input
                    id="checkout-address1"
                    name="addressLine1"
                    type="text"
                    required
                    defaultValue={""}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-address2" className={labelClass}>
                    {t("addressLine2Label")}
                  </label>
                  <input
                    id="checkout-address2"
                    name="addressLine2"
                    type="text"
                    defaultValue={""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-postal" className={labelClass}>
                    {t("postalCodeLabel")}
                    <Required />
                  </label>
                  <input
                    id="checkout-postal"
                    name="postalCode"
                    type="text"
                    required
                    defaultValue={""}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <button
              type="submit"
              className="w-full min-h-11 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              {t("continueToPaymentButton")}
            </button>
          </StaggerItem>
        </StaggerGroup>
      </form>
    </div>
  );
}
