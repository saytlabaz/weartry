import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { dbSafe } from "@/lib/db-safe";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

/**
 * The only homepage section backed by the new Prisma `Product` table —
 * admin-managed via /idarepaneli/sehifeler ("isFeatured" toggle). Every
 * other homepage section (NewArrivals, BestSellers, Categories, ...)
 * still reads from the static placeholder catalog in lib/data.ts; moving
 * those to the DB too is a separate, much larger migration (every product
 * page, cart, and wishlist reads that same static catalog) than this
 * command's admin-panel scope covers.
 */
export default async function FeaturedProducts() {
  const products = await dbSafe(
    () =>
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    []
  );

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
        Seçilmiş Məhsullar
      </BlurFadeUp>

      <StaggerGroup className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6">
        {products.map((product) => (
          <StaggerItem key={product.id} className="group">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-100">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300" />
              )}
              {product.compareAtPrice && (
                <span className="absolute left-3 top-3 rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-white">
                  ENDİRİM
                </span>
              )}
            </div>
            <p className="mt-3 text-sm font-medium text-neutral-900">{product.name}</p>
            <p className="mt-0.5 text-sm text-neutral-500">
              ${product.price.toString()}
              {product.compareAtPrice && (
                <span className="ml-2 text-neutral-400 line-through">${product.compareAtPrice.toString()}</span>
              )}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
