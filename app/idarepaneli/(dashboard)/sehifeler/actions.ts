"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const SITE_CONTENT_LOCALE = "az";

export async function saveSiteContent(entries: { key: string; value: string }[]) {
  await prisma.$transaction(
    entries.map(({ key, value }) =>
      prisma.siteContent.upsert({
        where: { key_locale: { key, locale: SITE_CONTENT_LOCALE } },
        update: { value },
        create: { key, locale: SITE_CONTENT_LOCALE, value, type: "TEXT" },
      })
    )
  );
  revalidatePath("/[locale]", "page");
}

export async function toggleFeatured(productId: string, isFeatured: boolean) {
  await prisma.product.update({ where: { id: productId }, data: { isFeatured } });
  revalidatePath("/[locale]", "page");
}
