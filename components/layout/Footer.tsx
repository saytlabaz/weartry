import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NewsletterForm from "@/components/home/NewsletterForm";

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
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 pb-12 md:grid-cols-6">
          <div className="col-span-2">
            <p className="text-xl font-bold tracking-tight">
              WEARTRY <span aria-hidden>✳</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-neutral-500">{t("tagline")}</p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-neutral-500">
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

        <div className="border-t border-border pt-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-sm font-semibold">{t("newsletterHeading")}</h3>
            <div className="mt-4">
              <NewsletterForm compact />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>{t("copyright", { year })}</p>
          <div className="flex items-center gap-4">
            <span aria-hidden>🇪🇺 🇬🇧 🇺🇸</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
