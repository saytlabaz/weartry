import { useTranslations } from "next-intl";
import Marquee from "@/components/motion/Marquee";

export default function PromoBar() {
  const t = useTranslations("PromoBar");

  const item = (
    <div className="flex items-center gap-10 text-xs font-medium uppercase tracking-wider text-white">
      <span>{t("message1")}</span>
      <span aria-hidden>✦</span>
      <span>{t("message2")}</span>
      <span aria-hidden>✦</span>
    </div>
  );

  return (
    <div className="bg-neutral-900 py-2.5">
      <Marquee duration={22} gap="2.5rem">
        {item}
      </Marquee>
    </div>
  );
}
