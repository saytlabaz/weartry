"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function revalidateNav() {
  revalidatePath("/[locale]", "layout");
}

export async function createNavItem(data: { label: string; url: string; parentId: string | null }) {
  const maxOrder = await prisma.navItem.aggregate({
    where: { parentId: data.parentId },
    _max: { order: true },
  });
  await prisma.navItem.create({ data: { ...data, order: (maxOrder._max.order ?? -1) + 1 } });
  revalidateNav();
}

export async function updateNavItem(id: string, data: { label: string; url: string; isActive: boolean }) {
  await prisma.navItem.update({ where: { id }, data });
  revalidateNav();
}

export async function deleteNavItem(id: string) {
  await prisma.navItem.delete({ where: { id } });
  revalidateNav();
}

export async function createCustomPage(data: { slug: string; title: string; content: string }) {
  await prisma.customPage.create({ data: { ...data, isActive: true } });
  revalidatePath(`/[locale]/${data.slug}`, "page");
}

export async function updateCustomPage(
  id: string,
  data: { slug: string; title: string; content: string; isActive: boolean }
) {
  await prisma.customPage.update({ where: { id }, data });
  revalidatePath(`/[locale]/${data.slug}`, "page");
}

export async function deleteCustomPage(id: string) {
  await prisma.customPage.delete({ where: { id } });
}
