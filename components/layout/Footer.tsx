import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageMarketSwitcher from "./LanguageMarketSwitcher";

function CardBadge({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-label={label} role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      {children}
    </svg>
  );
}

function VisaIcon() {
  return (
    <CardBadge label="Visa">
      <text x="16" y="14" textAnchor="middle" fontSize="9" fontStyle="italic" fontWeight="800" fill="#1A1F71">
        VISA
      </text>
    </CardBadge>
  );
}

function MastercardIcon() {
  return (
    <CardBadge label="Mastercard">
      <circle cx="13.5" cy="10" r="5.5" fill="#EB001B" />
      <circle cx="18.5" cy="10" r="5.5" fill="#F79E1B" fillOpacity="0.85" />
    </CardBadge>
  );
}

function AmexIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-label="American Express" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="#2E77BC" />
      <text x="16" y="13.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" letterSpacing="0.5">
        AMEX
      </text>
    </svg>
  );
}

function PayPalIcon() {
  return (
    <CardBadge label="PayPal">
      <path
        d="M12.7 14h-1.9l1.4-8h3.1c1.7 0 2.7.9 2.4 2.4-.3 1.7-1.6 2.6-3.3 2.6h-1.1l-.6 3Zm1-4.5h.8c.8 0 1.4-.3 1.5-1 .1-.6-.3-1-1.1-1h-.7l-.5 2Z"
        fill="#003087"
      />
      <path
        d="M18.9 14H17l1.4-8h3.1c1.7 0 2.7.9 2.4 2.4-.3 1.7-1.6 2.6-3.3 2.6h-1.1l-.6 3Zm1-4.5h.8c.8 0 1.4-.3 1.5-1 .1-.6-.3-1-1.1-1h-.7l-.5 2Z"
        fill="#009cde"
      />
    </CardBadge>
  );
}

function ApplePayIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Apple Pay" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="#000" />
      <path
        d="M11.1 8.3c.3-.4.5-1 .5-1.5-.5 0-1 .3-1.4.7-.3.3-.6.9-.5 1.4.5 0 1-.3 1.4-.6Zm.5.8c-.7 0-1.4.4-1.7.4-.4 0-.9-.4-1.5-.4-.8 0-1.5.5-1.9 1.2-.8 1.4-.2 3.5.6 4.6.4.6.8 1.2 1.4 1.2.6 0 .8-.4 1.5-.4s.9.4 1.5.4c.6 0 1-.6 1.4-1.1.4-.6.6-1.2.6-1.2s-1.2-.5-1.2-1.8c0-1.1.9-1.7 1-1.7-.5-.8-1.3-.9-1.6-.9-.7-.1-1.1-.3-1.1-.3Z"
        fill="white"
      />
      <path
        d="M17.5 6.8v7.1h1.1v-2.4h1.5c1.4 0 2.4-1 2.4-2.4 0-1.4-1-2.3-2.3-2.3h-2.7Zm1.1.9h1.3c1 0 1.5.5 1.5 1.4 0 .9-.6 1.4-1.5 1.4h-1.3V7.7Z"
        fill="white"
      />
      <path
        d="M24.9 14c.7 0 1.3-.3 1.6-.9h0v.8h1v-3.4c0-1-.8-1.6-2-1.6-1.1 0-2 .6-2 1.5h1c.1-.4.4-.6 1-.6.6 0 1 .3 1 .8v.4l-1.3.1c-1.2.1-1.9.6-1.9 1.5 0 .9.7 1.4 1.6 1.4Zm.3-.8c-.5 0-.8-.2-.8-.6 0-.4.3-.6.9-.7l1.1-.1v.4c0 .6-.5 1-1.2 1Z"
        fill="white"
      />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Discover" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      <clipPath id="discover-clip">
        <rect x="1" y="1" width="30" height="18" rx="2" />
      </clipPath>
      <circle cx="30" cy="16" r="7" fill="#FF6000" clipPath="url(#discover-clip)" />
      <text x="14" y="13" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#1a1a1a">
        DISCOVER
      </text>
    </svg>
  );
}

function JCBIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-label="JCB" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      <rect x="4" y="4" width="7" height="12" rx="1.5" fill="#0E4C96" />
      <rect x="12.5" y="4" width="7" height="12" rx="1.5" fill="#B01F2C" />
      <rect x="21" y="4" width="7" height="12" rx="1.5" fill="#00944E" />
      <text x="7.5" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">
        J
      </text>
      <text x="16" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">
        C
      </text>
      <text x="24.5" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">
        B
      </text>
    </svg>
  );
}

function DinersClubIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Diners Club" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      <circle cx="16" cy="10" r="6.5" fill="#0079BE" />
      <path d="M16 4.5a5.5 5.5 0 0 0 0 11" fill="none" stroke="white" strokeWidth="1.2" />
      <path d="M13 10h6" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

function UnionPayIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-label="UnionPay" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      <rect x="4" y="4" width="7.3" height="12" rx="1.5" fill="#E21836" />
      <rect x="12.3" y="4" width="7.3" height="12" rx="1.5" fill="#00447C" />
      <rect x="20.7" y="4" width="7.3" height="12" rx="1.5" fill="#007B84" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: t("helpHeading"),
      links: [
        { href: "/contact", label: t("helpContact") },
        { href: "/shipping-info", label: t("helpShipping") },
        { href: "/returns-policy", label: t("helpReturns") },
        { href: "/#faq", label: t("helpFaq") },
      ],
    },
    {
      heading: t("companyHeading"),
      links: [{ href: "/contact", label: t("companyAbout") }],
    },
    {
      heading: t("legalHeading"),
      links: [
        { href: "/privacy-policy", label: t("legalPrivacy") },
        { href: "/terms-of-service", label: t("legalTerms") },
        { href: "/returns-policy", label: t("legalReturns") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 pb-8 sm:flex-row">
          <div className="max-w-xs shrink-0">
            <p className="text-xl font-bold tracking-tight">WEARTRY</p>
            <p className="mt-2 text-sm text-neutral-500">{t("tagline")}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3 sm:gap-x-14">
            {columns.map((col) => (
              <div key={col.heading} className="w-auto">
                <h3 className="text-sm font-semibold">{col.heading}</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-500">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="transition-colors hover:text-foreground">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-neutral-500 sm:flex-row">
          <div className="flex flex-wrap items-center gap-2.5">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <PayPalIcon />
            <ApplePayIcon />
            <DiscoverIcon />
            <JCBIcon />
            <DinersClubIcon />
            <UnionPayIcon />
          </div>
          <div className="flex items-center gap-4">
            <p>{t("copyright", { year })}</p>
            <LanguageMarketSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
