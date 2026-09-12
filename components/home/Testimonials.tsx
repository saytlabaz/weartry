import { useTranslations } from "next-intl";
import { testimonials } from "@/lib/data";
import Marquee from "@/components/motion/Marquee";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

export default function Testimonials() {
  const t = useTranslations("Sections.testimonials");

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </BlurFadeUp>
        <BlurFadeUp delay={0.1} className="mt-4 text-neutral-500">
          {t("subtitle")}
        </BlurFadeUp>
      </div>

      <div className="mt-12">
        <Marquee duration={40} gap="1.25rem">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="w-72 shrink-0 rounded-2xl border border-border bg-background p-6"
            >
              <div className="mb-3 flex gap-0.5 text-amber-400" aria-hidden>
                {"★★★★★"}
              </div>
              <p className="text-sm leading-relaxed text-neutral-700">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-xs font-medium text-neutral-400">By {item.author}</p>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
