import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { sanitizeCjDescription } from "@/lib/cj/sanitizeDescription";
import { reuploadCjImages } from "@/lib/cj/reuploadImages";
import { getMaxShippingCost } from "@/lib/cj/getMaxShippingCost";

// The import flow now includes the ~10s Max-of-Mins shipping sweep
// (29 countries × parallel chunks) — declare maxDuration so Vercel
// doesn't cut it off at the default 10-15 s limit.
export const maxDuration = 60;

interface ImportVariantInput {
  vid: string;
  color: string;
  size: string;
  stock: number;
}

interface ImportBody {
  cjProductId: string;
  name: string;
  description: string;
  category: "MEN" | "WOMEN" | "KIDS";
  price: number;
  images: string[];
  variants: ImportVariantInput[];
  /** Optional — set only if the admin already ran "Çatdırılma Qiymətini Hesabla" in the detail modal; never recomputed here (that's a ~30s, 29-request CJ sweep). */
  maxShippingCost?: number | null;
  maxShippingCountry?: string | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Storefront paths that read the product catalog — same set actions.ts revalidates after any product mutation. */
function revalidateStorefront() {
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/products", "page");
  revalidatePath("/[locale]/products/[slug]", "page");
  revalidatePath("/[locale]/category/[slug]", "page");
}

/** POST /api/admin/cj/import — creates a Product + ProductVariant rows from a chosen CJ product, tagged with cjProductId/cjVariantId for later order fulfillment. */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  let body: ImportBody;
  try {
    body = (await req.json()) as ImportBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const price = Number(body.price);
  if (
    !body.name?.trim() ||
    !body.cjProductId ||
    !["MEN", "WOMEN", "KIDS"].includes(body.category) ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Array.isArray(body.variants) ||
    body.variants.length === 0
  ) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const baseSlug = slugify(body.name) || "mehsul";
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop -- sequential by necessity, only runs on a real name collision
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const variants = body.variants.map((v) => ({
    color: v.color?.trim() || "Standart",
    size: v.size?.trim() || "Standart",
    stock: Number.isFinite(Number(v.stock)) ? Math.max(0, Math.trunc(Number(v.stock))) : 0,
    cjVariantId: v.vid || null,
  }));
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const images = await reuploadCjImages(Array.isArray(body.images) ? body.images : []);

  // ─── 1-dəfəlik Çatdırılma Qiyməti Hesablanması ──────────────────────────
  // Əgər admin artıq "Çatdırılma Qiymətini Hesabla" düyməsini sıxıbsa,
  // gələn dəyəri istifadə edirik. Sıxmayıbsa — birinci variantın vid-ini
  // götürüb Max-of-Mins alqoritmini burada 1 dəfə işlədirik və nəticəni
  // bazaya yazırıq. Beləcə qiymət hər səhifə açılanda dəyişmir.
  let finalShippingCost: number | null = body.maxShippingCost ?? null;
  let finalShippingCountry: string | null = body.maxShippingCountry ?? null;

  if (finalShippingCost == null) {
    const firstVid = body.variants.find((v) => v.vid)?.vid;
    if (firstVid) {
      try {
        const shippingResult = await getMaxShippingCost({ vid: firstVid, quantity: 1 });
        finalShippingCost = shippingResult.cost;
        finalShippingCountry = shippingResult.countryCode;
        console.log(
          `[import] Auto-calculated shipping: $${finalShippingCost} via ${shippingResult.methodName} (${finalShippingCountry})`
        );
      } catch (shippingErr) {
        // Çatdırılma hesablaması uğursuz olsa da məhsul yaradılır —
        // admin sonradan admin panelindən hesablatdıra bilər.
        console.error("[import] Auto shipping cost calculation failed:", shippingErr);
      }
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        slug,
        description: sanitizeCjDescription(body.description ?? ""),
        category: body.category,
        price: new Prisma.Decimal(price.toFixed(2)),
        images,
        sizes,
        colors,
        stock: totalStock,
        cjProductId: body.cjProductId,
        cjMaxShippingCost:
          finalShippingCost != null ? new Prisma.Decimal(finalShippingCost.toFixed(2)) : null,
        cjMaxShippingCountry: finalShippingCountry ?? null,
        isActive: true,
        isFeatured: false,
        variants: { create: variants },
      },
      select: { id: true },
    });

    revalidateStorefront();
    return NextResponse.json({ success: true, productId: product.id, slug });
  } catch (err) {
    console.error("CJ import failed:", err);
    return NextResponse.json({ error: "Məhsul yaradıla bilmədi. Yenidən cəhd edin." }, { status: 500 });
  }
}
