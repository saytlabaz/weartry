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

function sumInventory(inventories: unknown): number {
  if (!Array.isArray(inventories)) return 0;
  return inventories.reduce((sum: number, inv) => {
    const rec = inv as Record<string, unknown> | null;
    const n = Number(rec?.totalInventory ?? rec?.inventoryNum ?? 0);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

/** Fetches a single CJ product's full detail via GET /v1/product/query. */
export async function getCjProductDetail(pid: string): Promise<CjProductDetail> {
  const qs = new URLSearchParams({ pid });
  const res = await cjFetch(`/v1/product/query?${qs.toString()}`);
  const body = (await res.json()) as CjDetailResponse;

  if (!res.ok || body.code !== 200 || !body.data) {
    throw new Error(body.message ?? `CJ product detail failed (${res.status})`);
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
      const sellPrice = v.variantSellPrice;
      return {
        vid: vid != null ? String(vid) : "",
        key,
        color,
        size,
        image: typeof v.variantImage === "string" && v.variantImage ? v.variantImage : bigImage,
        sellPrice: sellPrice != null ? Number(sellPrice) : null,
        stock: sumInventory(v.inventories),
      };
    })
    .filter((v) => v.vid);

  const rawImages = Array.isArray(data.productImageSet) ? (data.productImageSet as unknown[]) : [];
  const images = rawImages.length > 0 ? rawImages.map(String) : bigImage ? [bigImage] : [];

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
