"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { findProductById } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import { markets } from "@/i18n/markets";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import Image from "next/image";

type PaymentMethod = "apple" | "google" | "card";

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

function SuccessCheck() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12.5 2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CheckoutPageView({ user }: { user: CheckoutUser | null }) {
  const t = useTranslations("Checkout");
  const tProducts = useTranslations("Products");
  const shouldReduceMotion = useReducedMotion();
  const { cartItems, clearCart } = useStore();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const items = cartItems
    .map((entry) => {
      const product = findProductById(entry.id);
      return product ? { product, quantity: entry.quantity } : null;
    })
    .filter((item): item is { product: NonNullable<ReturnType<typeof findProductById>>; quantity: number } =>
      Boolean(item)
    );

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee: number = 0;
  const total = subtotal + shippingFee;

  async function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    setSubmitting(true);
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map(({ product, quantity }) => ({ id: product.id, quantity, price: product.price })),
          shippingAddress: {
            fullName: data.get("fullName"),
            phone: data.get("phone"),
            country: data.get("country"),
            city: data.get("city"),
            addressLine1: data.get("addressLine1"),
            addressLine2: data.get("addressLine2"),
            postalCode: data.get("postalCode"),
          },
          paymentMethod: method,
          subtotal,
          shippingCost: shippingFee,
          total,
        }),
      });
    } finally {
      setSubmitting(false);
      setPlaced(true);
      clearCart();
    }
  }

  if (placed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <BlurFadeUp className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <SuccessCheck />
        </BlurFadeUp>
        <BlurFadeUp delay={0.1} as="h1" className="mt-6 text-2xl font-bold tracking-tight">
          {t("successHeading")}
        </BlurFadeUp>
        <BlurFadeUp delay={0.15} className="mt-3 text-sm leading-relaxed text-neutral-500">
          {t("successMessage")}
        </BlurFadeUp>
        <BlurFadeUp delay={0.2} className="mt-8">
          <Link href="/" className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white">
            {t("continueShopping")}
          </Link>
        </BlurFadeUp>
      </div>
    );
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <BlurFadeUp as="h1" className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </BlurFadeUp>

      <form
        key={user?.email ?? "guest"}
        onSubmit={handlePlaceOrder}
        className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]"
      >
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
            <div>
              <h2 className="text-lg font-semibold">{t("paymentHeading")}</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {(
                  [
                    {
                      key: "apple",
                      icon: <Image src="/payment/apple-pay.webp" alt="Apple Pay" width={40} height={20} className="h-4 w-auto object-contain" />,
                      label: t("paymentApplePay"),
                    },
                    {
                      key: "google",
                      icon: <Image src="/payment/google-pay.webp" alt="Google Pay" width={40} height={20} className="h-4 w-auto object-contain" />,
                      label: t("paymentGooglePay"),
                    },
                    {
                      key: "card",
                      icon: <Image src="/payment/bank-card.png" alt="Card" width={20} height={20} className="h-5 w-auto object-contain" />,
                      label: t("paymentCard"),
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setMethod(option.key)}
                    className={`flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                      method === option.key ? "border-neutral-900 bg-muted/50" : "border-border hover:border-neutral-400"
                    }`}
                  >
                    <span className="flex h-5 items-center justify-center">{option.icon}</span>
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {method === "card" ? (
                  <motion.div
                    key="card"
                    initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="checkout-card-name" className={labelClass}>
                          {t("cardNameLabel")}
                          <Required />
                        </label>
                        <input id="checkout-card-name" name="cardName" type="text" required className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="checkout-card-number" className={labelClass}>
                          {t("cardNumberLabel")}
                          <Required />
                        </label>
                        <input
                          id="checkout-card-number"
                          name="cardNumber"
                          type="text"
                          inputMode="numeric"
                          placeholder="•••• •••• •••• ••••"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-card-expiry" className={labelClass}>
                          {t("cardExpiryLabel")}
                          <Required />
                        </label>
                        <input
                          id="checkout-card-expiry"
                          name="cardExpiry"
                          type="text"
                          placeholder="MM/YY"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-card-cvv" className={labelClass}>
                          {t("cardCvvLabel")}
                          <Required />
                        </label>
                        <input
                          id="checkout-card-cvv"
                          name="cardCvv"
                          type="text"
                          inputMode="numeric"
                          placeholder="•••"
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={method}
                    initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 rounded-xl bg-muted/50 px-4 py-3 text-sm text-neutral-600">
                      {method === "apple" ? t("applePayNote") : t("googlePayNote")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </StaggerItem>
        </StaggerGroup>

        <BlurFadeUp delay={0.1} className="h-fit rounded-2xl border border-border p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">{t("orderSummaryHeading")}</h2>
          <ul className="mt-4 space-y-3">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className={`h-14 w-11 shrink-0 rounded-lg bg-gradient-to-br ${product.gradient}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tProducts(product.nameKey)}</p>
                  <p className="text-xs text-neutral-500">×{quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-medium">${(product.price * quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between text-neutral-500">
              <span>{t("subtotalLabel")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-500">
              <span>{t("shippingFeeLabel")}</span>
              <span>{shippingFee === 0 ? t("freeLabel") : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
              <span>{t("totalLabel")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full min-h-11 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {t("placeOrderButton")}
          </button>
        </BlurFadeUp>
      </form>
    </div>
  );
}
