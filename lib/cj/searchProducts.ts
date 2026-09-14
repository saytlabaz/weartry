import { cjFetch } from "./auth";

export interface CjSearchItem {
  pid: string;
  name: string;
  image: string;
  sellPrice: number | null;
}

export interface CjSearchResult {
  items: CjSearchItem[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface CjListResponse {
  code: number;
  message?: string;
  data?: {
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
    totalRecords?: number;
    content?: unknown[];
  };
}

/**
 * CJ's docs (developers.cjdropshipping.com/en/api/api2/api/product.html)
 * describe `data.content[]` as the product list itself, but some doc
 * revisions nest a further `productList[]` inside each content entry —
 * this normalizes both shapes rather than assuming one.
 */
function flattenContent(content: unknown[]): unknown[] {
  return content.flatMap((entry) => {
    const productList = (entry as { productList?: unknown[] } | null)?.productList;
    return Array.isArray(productList) ? productList : [entry];
  });
}

function normalizeItem(raw: unknown): CjSearchItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pid = r.pid ?? r.id;
  if (pid == null) return null;
  const sellPrice = r.sellPrice ?? r.nowPrice;

  return {
    pid: String(pid),
    name: String(r.nameEn ?? r.productNameEn ?? r.name ?? "Adsız məhsul"),
    image: String(r.bigImage ?? r.productImage ?? r.image ?? ""),
    sellPrice: sellPrice != null ? Number(sellPrice) : null,
  };
}

/** Searches CJ's catalog via GET /v1/product/listV2 (CJ's Elasticsearch-backed product search). */
export async function searchCjProducts(params: {
  keyword: string;
  page?: number;
  pageSize?: number;
}): Promise<CjSearchResult> {
  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 20, 100);
  const qs = new URLSearchParams({
    keyWord: params.keyword,
    page: String(page),
    size: String(pageSize),
  });

  const res = await cjFetch(`/v1/product/listV2?${qs.toString()}`);
  const body = (await res.json()) as CjListResponse;

  if (!res.ok || body.code !== 200 || !body.data) {
    throw new Error(body.message ?? `CJ search failed (${res.status})`);
  }

  const items = flattenContent(body.data.content ?? [])
    .map(normalizeItem)
    .filter((item): item is CjSearchItem => item !== null);

  return {
    items,
    page: body.data.pageNumber ?? page,
    pageSize: body.data.pageSize ?? pageSize,
    totalPages: body.data.totalPages ?? 0,
    totalRecords: body.data.totalRecords ?? 0,
  };
}
