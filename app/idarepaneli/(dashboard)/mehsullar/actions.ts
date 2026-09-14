"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export interface VariantInput {
  color: string;
  size: string;
  stock: number;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  description: string;
  category: "MEN" | "WOMEN" | "KIDS";
  price: number;
  compareAtPrice: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  cjProductId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  variants: VariantInput[];
}

/** Storefront paths that read the product catalog — revalidated after any product mutation so changes show up immediately, no redeploy. */
function revalidateStorefront() {
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/products", "page");
  revalidatePath("/[locale]/products/[slug]", "page");
  revalidatePath("/[locale]/category/[slug]", "page");
}

export async function createProduct(input: ProductFormInput) {
  await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      category: input.category,
      price: new Prisma.Decimal(input.price.toFixed(2)),
      compareAtPrice: input.compareAtPrice !== null ? new Prisma.Decimal(input.compareAtPrice.toFixed(2)) : null,
      images: input.images,
      sizes: input.sizes,
      colors: input.colors,
      stock: input.stock,
      cjProductId: input.cjProductId,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      variants: { create: input.variants },
    },
  });
  revalidateStorefront();
}

export async function updateProduct(id: string, input: ProductFormInput) {
  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        category: input.category,
        price: new Prisma.Decimal(input.price.toFixed(2)),
        compareAtPrice: input.compareAtPrice !== null ? new Prisma.Decimal(input.compareAtPrice.toFixed(2)) : null,
        images: input.images,
        sizes: input.sizes,
        colors: input.colors,
        stock: input.stock,
        cjProductId: input.cjProductId,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        variants: { create: input.variants },
      },
    }),
  ]);
  revalidateStorefront();
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidateStorefront();
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidateStorefront();
}

export async function approveReview(id: string) {
  await prisma.productReview.update({ where: { id }, data: { isApproved: true } });
  revalidateStorefront();
}

export async function deleteReview(id: string) {
  await prisma.productReview.delete({ where: { id } });
  revalidateStorefront();
}
