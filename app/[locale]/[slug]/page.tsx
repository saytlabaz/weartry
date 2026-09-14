import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dbSafe } from "@/lib/db-safe";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

async function getPage(slug: string) {
  return dbSafe(() => prisma.customPage.findUnique({ where: { slug } }), null);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return { title: page?.title ?? "Səhifə tapılmadı" };
}

// Admin-created static content pages (/idarepaneli/menyu) — simple text
// pages like "About" or "Campaigns", not tied to next-intl (they render
// the same content regardless of locale, by design — see CustomPage in
// prisma/schema.prisma).
export default async function CustomContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page || !page.isActive) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <BlurFadeUp as="h1" immediate className="text-4xl font-bold tracking-tight">
        {page.title}
      </BlurFadeUp>
      <div className="mt-6 whitespace-pre-wrap leading-relaxed text-neutral-700">{page.content}</div>
    </article>
  );
}
