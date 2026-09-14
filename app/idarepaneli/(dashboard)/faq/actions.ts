"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const FAQ_LOCALE = "az";

function revalidateFaq() {
  revalidatePath("/[locale]/faq", "page");
  revalidatePath("/[locale]", "page");
}

export async function createFaqItem(data: { category: string; question: string; answer: string }) {
  const maxOrder = await prisma.faqItem.aggregate({
    where: { locale: FAQ_LOCALE, category: data.category },
    _max: { order: true },
  });
  await prisma.faqItem.create({
    data: { ...data, locale: FAQ_LOCALE, order: (maxOrder._max.order ?? -1) + 1 },
  });
  revalidateFaq();
}

export async function updateFaqItem(
  id: string,
  data: { category: string; question: string; answer: string; isActive: boolean }
) {
  await prisma.faqItem.update({ where: { id }, data });
  revalidateFaq();
}

export async function deleteFaqItem(id: string) {
  await prisma.faqItem.delete({ where: { id } });
  revalidateFaq();
}

export async function moveFaqItem(id: string, direction: "up" | "down") {
  const item = await prisma.faqItem.findUnique({ where: { id } });
  if (!item) return;

  const neighbor = await prisma.faqItem.findFirst({
    where: {
      locale: item.locale,
      category: item.category,
      order: direction === "up" ? { lt: item.order } : { gt: item.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.faqItem.update({ where: { id: item.id }, data: { order: neighbor.order } }),
    prisma.faqItem.update({ where: { id: neighbor.id }, data: { order: item.order } }),
  ]);
  revalidateFaq();
}
