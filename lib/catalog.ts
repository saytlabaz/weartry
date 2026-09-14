import { prisma } from "@/lib/prisma";
import { dbSafe } from "@/lib/db-safe";
import type { Product } from "@/lib/data";

const CATEGORY_TO_AUDIENCE: Record<string, Product["audience"]> = {
  MEN: "men",
  WOMEN: "women",
  KIDS: "kids",
};

interface DbProductRow {
  id: string;
  slug: string;
  name: string;
  price: unknown; // Prisma.Decimal, stringified via .toString()
  compareAtPrice: unknown;
  category: string;
  images: string[];
  colors: string[];
  cjProductId: string | null;
}

/**
 * Maps a Prisma `Product` row into the static catalogue's `Product`
 * shape so every existing storefront component (ProductCard,
 * CategoryPageView, ProductFilterGrid, ...) can render it without
 * knowing it came from the database.
 *
 * Known gap: the static catalogue's `category` field is a garment type
 * (jacket/hoodie/...) with no DB equivalent — the schema only tracks
 * MEN/WOMEN/KIDS (audience). DB products default to "hoodie" so they
 * still show under "All" and one filter tab on /products, rather than
 * skip garment-type filtering support entirely.
 */
function toDisplayProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    nameKey: "",
    name: row.name,
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice != null ? Number(row.compareAtPrice) : undefined,
    category: "hoodie",
    audience: CATEGORY_TO_AUDIENCE[row.category] ?? "men",
    colors: row.colors,
    gradient: "from-neutral-200 to-neutral-300",
    isDbProduct: true,
    images: row.images,
    isCjImport: row.cjProductId != null,
  };
}

const SELECT = {
  id: true,
  slug: true,
  name: true,
  price: true,
  compareAtPrice: true,
  category: true,
  images: true,
  colors: true,
  cjProductId: true,
} as const;

/** Every active, admin-managed (including CJ-imported) product, newest first — for the storefront's catalogue/category pages. */
export async function getActiveDbProducts(): Promise<Product[]> {
  const rows = await dbSafe(
    () => prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, select: SELECT }),
    []
  );
  return rows.map(toDisplayProduct);
}

/** A single active DB product by slug, or null — checked as a fallback after the static catalogue on the product detail page. */
export async function getActiveDbProductBySlug(slug: string): Promise<Product | null> {
  const row = await dbSafe(
    () => prisma.product.findFirst({ where: { slug, isActive: true }, select: SELECT }),
    null
  );
  return row ? toDisplayProduct(row) : null;
}
