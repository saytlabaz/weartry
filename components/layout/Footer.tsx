import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageMarketSwitcher from "./LanguageMarketSwitcher";

function VisaIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-label="Visa" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" stroke="currentColor" strokeOpacity="0.25" />
      <path
        d="M13.5 13.6h-1.7l1.1-6.7h1.7l-1.1 6.7Zm7.3-6.5a4.4 4.4 0 0 0-1.6-.3c-1.8 0-3 .9-3 2.2 0 1 .9 1.5 1.6 1.8.7.3.9.5.9.8 0 .5-.6.7-1.1.7-.7 0-1.1-.1-1.7-.4l-.2-.1-.3 1.4c.4.2 1.2.4 2 .4 1.9 0 3.1-.9 3.1-2.3 0-.8-.5-1.4-1.5-1.8-.6-.3-1-.5-1-.8 0-.3.3-.6 1-.6.6 0 1 .1 1.3.3l.2.1.3-1.4Zm4.3-.2h-1.3c-.4 0-.7.1-.9.5l-2.5 6.2h1.9l.4-1.1h2.3l.2 1.1h1.7l-1.8-6.7Zm-2.1 4.3.9-2.5.5 2.5h-1.4ZM10.8 6.9 9 11.4l-.2-.9c-.3-1.1-1.3-2.2-2.5-2.8l1.7 6.9h1.9l2.9-7.7h-1.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-label="Mastercard" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="13" cy="10" r="5.2" stroke="currentColor" />
      <circle cx="19" cy="10" r="5.2" stroke="currentColor" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-label="American Express" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" stroke="currentColor" strokeOpacity="0.25" />
      <path
        d="M6 13.5v-7h4.6l1 1.3 1-1.3H26v1.7l-1.1 1.2 1.1 1.2v1.7h-2.6l-.9-1-.9 1H6Zm14.2-3.4-.9-1v2l.9-1Z"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
      />
    </svg>
  );
}

function PayPalIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-label="PayPal" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" stroke="currentColor" strokeOpacity="0.25" />
      <path
        d="M12.7 14h-1.9l1.4-8h3.1c1.7 0 2.7.9 2.4 2.4-.3 1.7-1.6 2.6-3.3 2.6h-1.1l-.6 3Zm1-4.5h.8c.8 0 1.4-.3 1.5-1 .1-.6-.3-1-1.1-1h-.7l-.5 2Z"
        fill="currentColor"
      />
      <path
        d="M18.9 14H17l1.4-8h3.1c1.7 0 2.7.9 2.4 2.4-.3 1.7-1.6 2.6-3.3 2.6h-1.1l-.6 3Zm1-4.5h.8c.8 0 1.4-.3 1.5-1 .1-.6-.3-1-1.1-1h-.7l-.5 2Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-label="Apple Pay" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" stroke="currentColor" strokeOpacity="0.25" />
      <path
        d="M11.1 8.3c.3-.4.5-1 .5-1.5-.5 0-1 .3-1.4.7-.3.3-.6.9-.5 1.4.5 0 1-.3 1.4-.6Zm.5.8c-.7 0-1.4.4-1.7.4-.4 0-.9-.4-1.5-.4-.8 0-1.5.5-1.9 1.2-.8 1.4-.2 3.5.6 4.6.4.6.8 1.2 1.4 1.2.6 0 .8-.4 1.5-.4s.9.4 1.5.4c.6 0 1-.6 1.4-1.1.4-.6.6-1.2.6-1.2s-1.2-.5-1.2-1.8c0-1.1.9-1.7 1-1.7-.5-.8-1.3-.9-1.6-.9-.7-.1-1.1-.3-1.1-.3Z"
        fill="currentColor"
      />
      <path
        d="M17.5 6.8v7.1h1.1v-2.4h1.5c1.4 0 2.4-1 2.4-2.4 0-1.4-1-2.3-2.3-2.3h-2.7Zm1.1.9h1.3c1 0 1.5.5 1.5 1.4 0 .9-.6 1.4-1.5 1.4h-1.3V7.7Z"
        fill="currentColor"
      />
      <path
        d="M24.9 14c.7 0 1.3-.3 1.6-.9h0v.8h1v-3.4c0-1-.8-1.6-2-1.6-1.1 0-2 .6-2 1.5h1c.1-.4.4-.6 1-.6.6 0 1 .3 1 .8v.4l-1.3.1c-1.2.1-1.9.6-1.9 1.5 0 .9.7 1.4 1.6 1.4Zm.3-.8c-.5 0-.8-.2-.8-.6 0-.4.3-.6.9-.7l1.1-.1v.4c0 .6-.5 1-1.2 1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: t("shopHeading"),
      links: [
        { href: "/#new-arrivals", label: t("shopNewArrivals") },
        { href: "/#categories", label: t("shopMen") },
        { href: "/#categories", label: t("shopWomen") },
        { href: "/#categories", label: t("shopKids") },
      ],
    },
    {
      heading: t("helpHeading"),
      links: [
        { href: "/contact", label: t("helpContact") },
        { href: "/returns-policy", label: t("helpShipping") },
        { href: "/returns-policy", label: t("helpReturns") },
        { href: "/contact", label: t("helpFaq") },
      ],
    },
    {
      heading: t("companyHeading"),
      links: [
        { href: "/#journal", label: t("companyJournal") },
        { href: "/contact", label: t("companyAbout") },
        { href: "/contact", label: t("companyCareers") },
      ],
    },
    {
      heading: t("legalHeading"),
      links: [
        { href: "/privacy-policy", label: t("legalPrivacy") },
        { href: "/terms-of-service", label: t("legalTerms") },
        { href: "/returns-policy", label: t("legalReturns") },
        { href: "/cookie-policy", label: t("legalCookies") },
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

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
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
          <div className="flex items-center gap-3 text-neutral-400">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <PayPalIcon />
            <ApplePayIcon />
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
