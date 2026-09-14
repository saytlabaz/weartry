import { cjFetch } from "./auth";

export interface CjVariantDetail {
  vid: string;
  /** CJ's raw combined attribute string, e.g. "Black-XXL" — kept for display even after color/size are split out. */
  key: string;
  color: string;
  size: string;
  image: string;
  sellPrice: number | null;
  stock: number;
}

export interface CjProductDetail {
  pid: string;
  name: string;
  description: string;
  images: string[];
  sellPrice: number | null;
  weight: number | null;
  variants: CjVariantDetail[];
}

interface CjDetailResponse {
  code: number;
  message?: string;
  data?: Record<string, unknown>;
}

/**
 * Splits CJ's combined "Color-Size" attribute string into a best-guess
 * color/size pair — CJ's docs describe `variantKey` as "multiple options,
 * joined by -" with no fixed count, so this is only a starting point; the
 * admin panel lets the admin correct either field before importing.
 */
function splitVariantKey(key: string): { color: string; size: string } {
  const parts = key
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return { color: parts[0], size: parts.slice(1).join("-") };
  return { color: "", size: parts[0] ?? "" };
}

interface CjInventoryResponse {
  code: number;
  message?: string;
  data?: unknown[];
}

/**
 * The general /product/query response's embedded `variants[].inventories`
 * is unreliable (frequently empty/zero) — CJ's dedicated inventory
 * endpoint (GET /v1/product/inventory/query) is the real, live source.
 * One call returns every variant's stock for the whole product, so this
 * is a single extra request per detail view, not per variant. Returns
 * vid -> summed totalInventory across every warehouse/country CJ reports.
 */
async function getRealStockByVid(pid: string): Promise<Map<string, number>> {
  const qs = new URLSearchParams({ pid });
  const res = await cjFetch(`/v1/product/inventory/query?${qs.toString()}`);
  const body = (await res.json()) as CjInventoryResponse;

  const stockByVid = new Map<string, number>();
  if (!res.ok || body.code !== 200 || !Array.isArray(body.data)) return stockByVid;

  for (const entry of body.data) {
    const rec = entry as Record<string, unknown>;
    const vid = rec.vid != null ? String(rec.vid) : null;
    if (!vid) continue;
    const n = Number(rec.totalInventory ?? 0);
    if (!Number.isFinite(n)) continue;
    stockByVid.set(vid, (stockByVid.get(vid) ?? 0) + n);
  }
  return stockByVid;
}

/** Fetches a single CJ product's full detail via GET /v1/product/query, plus real stock via GET /v1/product/inventory/query. */
export async function getCjProductDetail(pid: string): Promise<CjProductDetail> {
  const qs = new URLSearchParams({ pid });
  const [detailRes, stockByVid] = await Promise.all([cjFetch(`/v1/product/query?${qs.toString()}`), getRealStockByVid(pid)]);
  const body = (await detailRes.json()) as CjDetailResponse;

  if (!detailRes.ok || body.code !== 200 || !body.data) {
    throw new Error(body.message ?? `CJ product detail failed (${detailRes.status})`);
  }

  const data = body.data;
  const bigImage = typeof data.bigImage === "string" ? data.bigImage : "";
  const rawVariants = Array.isArray(data.variants) ? data.variants : [];

  const variants: CjVariantDetail[] = rawVariants
    .map((raw) => {
      const v = raw as Record<string, unknown>;
      const key = String(v.variantKey ?? v.variantNameEn ?? "");
      const { color, size } = splitVariantKey(key);
      const vid = v.vid ?? v.id;
      const vidStr = vid != null ? String(vid) : "";
      const sellPrice = v.variantSellPrice;
      return {
        vid: vidStr,
        key,
        color,
        size,
        image: typeof v.variantImage === "string" && v.variantImage ? v.variantImage : bigImage,
        sellPrice: sellPrice != null ? Number(sellPrice) : null,
        stock: stockByVid.get(vidStr) ?? 0,
      };
    })
    .filter((v) => v.vid);

  const rawImages = Array.isArray(data.productImageSet) ? (data.productImageSet as unknown[]) : [];
  const galleryImages = rawImages.length > 0 ? rawImages.map(String) : bigImage ? [bigImage] : [];
  // Fold in any per-variant images the gallery doesn't already have, so
  // every color's photo ends up in the product's image set even though
  // ProductVariant has no image field of its own to keep them separate.
  const variantImages = variants.map((v) => v.image).filter(Boolean);
  const images = Array.from(new Set([...galleryImages, ...variantImages]));

  return {
    pid: String(data.pid ?? pid),
    name: String(data.productNameEn ?? data.nameEn ?? ""),
    description: String(data.description ?? ""),
    images,
    sellPrice: data.sellPrice != null ? Number(data.sellPrice) : null,
    weight: data.productWeight != null ? Number(data.productWeight) : null,
    variants,
  };
}
