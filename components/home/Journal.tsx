import { useTranslations } from "next-intl";
import { journalPosts } from "@/lib/data";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

export default function Journal() {
  const t = useTranslations("Sections.journal");

  return (
    <section id="journal" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </BlurFadeUp>
        <BlurFadeUp delay={0.1} className="mt-3 text-neutral-500">
          {t("subtitle")}
        </BlurFadeUp>
      </div>

      <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {journalPosts.map((post) => (
          <StaggerItem key={post.id}>
            <article>
              <div className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${post.gradient}`} />
              <h3 className="mt-4 text-base font-semibold">{post.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-500">{post.excerpt}</p>
              <a
                href="#journal"
                className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
              >
                {t("readMore")}
              </a>
            </article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
