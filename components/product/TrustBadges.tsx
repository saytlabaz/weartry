import { useTranslations } from "next-intl";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

function TruckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7h11v9H3z" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v3h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.7" />
      <circle cx="17" cy="18" r="1.7" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l8 3v6c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V6l8-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 14a8 8 0 1 0 2-9.5L4 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      <path d="m8.5 11 1.8 1.8L14 9.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TrustBadges() {
  const t = useTranslations("TrustBadges");

  const items = [
    { icon: <TruckIcon />, label: t("freeShipping") },
    { icon: <ShieldIcon />, label: t("securedPayment") },
    { icon: <ReturnIcon />, label: t("dayReturn") },
    { icon: <CheckIcon />, label: t("productCheck") },
  ];

  return (
    <StaggerGroup className="grid grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-4">
      {items.map((item) => (
        <StaggerItem key={item.label} className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-neutral-700">
            {item.icon}
          </div>
          <p className="text-xs font-medium text-neutral-600">{item.label}</p>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
