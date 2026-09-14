"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { findProductById } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import {
  clearCheckoutInfo,
  getCheckoutInfoServerSnapshot,
  getCheckoutInfoSnapshot,
  subscribeCheckoutInfo,
} from "@/lib/checkout-info";

type PaymentMethod = "apple" | "google" | "card";

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

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

const PAYMENT_METHODS = [
  { key: "apple" as const, src: "/payment/apple-pay.webp", alt: "Apple Pay", w: 64, h: 26 },
  { key: "google" as const, src: "/payment/google-pay.webp", alt: "Google Pay", w: 64, h: 26 },
  { key: "card" as const, src: "/payment/bank-card.png", alt: "Card", w: 30, h: 30 },
];

export default function PaymentPageView() {
  const t = useTranslations("Checkout");
  const tProducts = useTranslations("Products");
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { cartItems, clearCart } = useStore();

  const info = useSyncExternalStore(subscribeCheckoutInfo, getCheckoutInfoSnapshot, getCheckoutInfoServerSnapshot);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardKey, setCardKey] = useState(0);
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

  useEffect(() => {
    if (info === null) {
      router.replace("/checkout");
    }
  }, [info, router]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee: number = 0;
  const total = subtotal + shippingFee;

  async function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!info) return;
    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: info.email,
          items: items.map(({ product, quantity }) => ({ id: product.id, quantity, price: product.price })),
          shippingAddress: {
            fullName: info.fullName,
            phone: info.phone,
            country: info.country,
            city: info.city,
            province: info.province,
            addressLine1: info.addressLine1,
            addressLine2: info.addressLine2,
            postalCode: info.postalCode,
          },
          paymentMethod: method,
          cardName: data.get("cardName"),
          subtotal,
          shippingCost: shippingFee,
          total,
        }),
      });
    } finally {
      setSubmitting(false);
      setPlaced(true);
      clearCart();
      clearCheckoutInfo();
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

  if (info === null || items.length === 0) {
    return <div className="min-h-[50vh]" />; // redirecting to /checkout, or nothing to pay for
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Link
        href="/checkout"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 underline underline-offset-2 hover:text-foreground"
      >
        ← {t("backToShipping")}
      </Link>

      <BlurFadeUp as="h1" immediate className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {t("paymentHeading")}
      </BlurFadeUp>
      <BlurFadeUp delay={0.05} className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
        <LockIcon />
        {t("securePaymentNote")}
      </BlurFadeUp>

      <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((option) => (
              <motion.button
                key={option.key}
                type="button"
                onClick={() => setMethod(option.key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex min-h-24 flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl border p-4 text-center transition-colors"
                style={{ borderColor: method === option.key ? "var(--foreground)" : undefined }}
              >
                {method === option.key && (
                  <motion.span
                    layoutId="payment-method-highlight"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-muted/60"
                  />
                )}
                <span className="relative z-10 flex h-7 items-center justify-center">
                  <Image src={option.src} alt={option.alt} width={option.w} height={option.h} className="h-6 w-auto object-contain" />
                </span>
                <span className="relative z-10 text-xs font-medium">
                  {option.key === "apple" ? t("paymentApplePay") : option.key === "google" ? t("paymentGooglePay") : t("paymentCard")}
                </span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {method === "card" ? (
              <motion.div
                key={`card-${cardKey}`}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-border p-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <button
                  type="button"
                  onClick={() => setCardKey((k) => k + 1)}
                  className="mt-4 text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-foreground"
                >
                  + {t("addAnotherCardButton")}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={method}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl bg-muted/50 p-5 text-sm text-neutral-600"
              >
                {method === "apple" ? t("applePayNote") : t("googlePayNote")}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            className="mt-5 flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {submitting && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {submitting ? t("placingOrder") : t("placeOrderButton")}
          </motion.button>
        </BlurFadeUp>
      </form>
    </div>
  );
}
