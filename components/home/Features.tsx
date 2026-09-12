import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

function TruckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7h11v9H3z" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v3h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.7" />
      <circle cx="17" cy="18" r="1.7" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 4c-9 0-16 6-16 16 10 0 16-7 16-16Z" strokeLinejoin="round" />
      <path d="M5 19 15 9" strokeLinecap="round" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 14a8 8 0 1 0 2-9.5L4 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l8 3v6c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V6l8-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Features() {
  const t = useTranslations("Sections.features");

  const items = [
    { icon: <TruckIcon />, title: t("shippingTitle"), desc: t("shippingDesc") },
    { icon: <LeafIcon />, title: t("sustainableTitle"), desc: t("sustainableDesc") },
    { icon: <ReturnIcon />, title: t("returnsTitle"), desc: t("returnsDesc") },
    { icon: <ShieldIcon />, title: t("secureTitle"), desc: t("secureDesc") },
  ];

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <BlurFadeUp as="h2" className="mb-10 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </BlurFadeUp>

        <StaggerGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <StaggerItem key={item.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background text-neutral-800 shadow-sm">
                {item.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.desc}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
