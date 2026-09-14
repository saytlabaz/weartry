import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageMarketSwitcher from "./LanguageMarketSwitcher";
import { PAYMENT_ICONS } from "./PaymentIcons";

export default function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: t("helpHeading"),
      links: [
        { href: "/contact", label: t("helpContact") },
        { href: "/shipping-info", label: t("helpShipping") },
        { href: "/#faq", label: t("helpFaq") },
      ],
    },
    {
      heading: t("legalHeading"),
      links: [
        { href: "/about", label: t("companyAbout") },
        { href: "/privacy-policy", label: t("legalPrivacy") },
        { href: "/terms-of-service", label: t("legalTerms") },
        { href: "/returns-policy", label: t("legalReturns") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 pb-8 sm:flex-row">
          <div className="mt-2 max-w-xs shrink-0">
            <Image
              src="/weartry-logo-black.png"
              alt="WearTry"
              width={210}
              height={107}
              className="block h-14 w-auto md:h-20"
            />
            <p className="mt-3 text-sm text-neutral-500">{t("slogan")}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:gap-x-14">
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
          <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {PAYMENT_ICONS.map((Icon, i) => (
              <span key={i} className="flex h-6 w-full items-center justify-center p-1 sm:w-auto">
                <Icon />
              </span>
            ))}
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
