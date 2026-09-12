import { useTranslations } from "next-intl";
import { testimonials } from "@/lib/data";
import Marquee from "@/components/motion/Marquee";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.7 7.1-.6L12 2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
              className="flex w-80 shrink-0 gap-4 rounded-2xl border border-border bg-background p-6"
            >
              <div className={`h-14 w-14 shrink-0 rounded-full bg-gradient-to-br ${item.gradient}`} />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex gap-0.5 text-amber-400" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < item.rating} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-neutral-700">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <span aria-hidden>{item.flag}</span>
                    {item.name}
                  </p>
                  <p className="shrink-0 text-xs font-semibold text-neutral-400">${item.relatedPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
