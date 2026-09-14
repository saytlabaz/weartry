import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { routing } from "@/i18n/routing";
import { locales, defaultLocale } from "@/i18n/locales";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import CartDrawer from "@/components/layout/CartDrawer";
import PageTransition from "@/components/layout/PageTransition";
import CustomCursor from "@/components/motion/CustomCursor";
import HeroSplash from "@/components/home/HeroSplash";
import { MarketProvider } from "@/lib/market-context";
import { StoreProvider } from "@/lib/store-context";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = l === defaultLocale ? "/" : `/${l}`;
  }

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-background text-foreground">
        <NextIntlClientProvider>
          {/* No server-fetched session is passed here — doing so would call
              auth() in the root layout, which reads cookies and forces every
              page under it (including static storefront pages) into dynamic
              rendering. SessionProvider fetches the session client-side
              instead, which is the standard next-auth App Router pattern
              when only a few routes (checkout, account) need it server-side. */}
          <SessionProvider>
            <MarketProvider>
              <StoreProvider>
                <HeroSplash />
                <Header />
                <main className="flex-1">
                  <PageTransition>{children}</PageTransition>
                </main>
                <Footer />
                <CookieConsent />
                <CartDrawer />
                <CustomCursor />
              </StoreProvider>
            </MarketProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
