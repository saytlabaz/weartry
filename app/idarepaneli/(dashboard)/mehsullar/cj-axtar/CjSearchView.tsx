"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Loader2, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CjSearchItem } from "@/lib/cj/searchProducts";
import type { CjProductDetail, CjVariantDetail } from "@/lib/cj/getProductDetail";
import type { MaxShippingResult } from "@/lib/cj/getMaxShippingCost";

const DEBOUNCE_MS = 500;
type Category = "MEN" | "WOMEN" | "KIDS";

interface SelectedVariant extends CjVariantDetail {
  selected: boolean;
}

export default function CjSearchView() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CjSearchItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detail modal state
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [detail, setDetail] = useState<CjProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [variants, setVariants] = useState<SelectedVariant[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("MEN");
  const [price, setPrice] = useState("");
  const [importPending, startImport] = useTransition();

  // Shipping reference (freight sweep) state — manual, never automatic
  const [shipping, setShipping] = useState<MaxShippingResult | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Debounced search — CJ rate-limits requests per minute, so we wait
  // until the admin stops typing rather than firing on every keystroke.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!keyword.trim()) {
      setItems([]);
      setTotalPages(0);
      setSearchError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void runSearch(keyword.trim(), 1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runSearch is stable enough for this debounce, re-running on keyword alone is intentional
  }, [keyword]);

  async function runSearch(kw: string, targetPage: number) {
    setLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/admin/cj/search?keyword=${encodeURIComponent(kw)}&page=${targetPage}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "search_failed");
      setItems(body.items ?? []);
      setTotalPages(body.totalPages ?? 0);
      setPage(targetPage);
    } catch {
      setSearchError("CJ ilə əlaqə qurula bilmədi, bir az sonra yenidən cəhd edin.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function goToPage(next: number) {
    if (!keyword.trim() || next < 1) return;
    void runSearch(keyword.trim(), next);
  }

  async function openDetail(pid: string) {
    setSelectedPid(pid);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    setShipping(null);
    setShippingError(null);
    setActiveImage(0);
    try {
      const res = await fetch(`/api/admin/cj/detail?pid=${encodeURIComponent(pid)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "detail_failed");
      const d = body as CjProductDetail;
      setDetail(d);
      setVariants(d.variants.map((v) => ({ ...v, selected: true })));
      setName(d.name);
      setDescription(d.description);
      setCategory("MEN");
      setPrice(d.sellPrice != null ? String(d.sellPrice) : "");
    } catch {
      setDetailError("CJ ilə əlaqə qurula bilmədi, bir az sonra yenidən cəhd edin.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedPid(null);
    setDetail(null);
    setVariants([]);
    setShipping(null);
    setShippingError(null);
  }

  function updateVariant(index: number, patch: Partial<SelectedVariant>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  async function handleCalculateShipping() {
    // Uses the first selected variant as the reference — CJ's freight
    // calculator prices per-variant (weight-dependent), but the product
    // only has one sell price, so one representative variant's quote
    // stands in for the whole product rather than sweeping all of them.
    const reference = variants.find((v) => v.selected) ?? variants[0];
    if (!reference?.vid) {
      toast.error("Hesablamaq üçün ən azı bir variant seçin.");
      return;
    }
    setShippingLoading(true);
    setShippingError(null);
    try {
      const res = await fetch("/api/admin/cj/freight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vid: reference.vid, quantity: 1 }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "freight_failed");
      setShipping(body as MaxShippingResult);
    } catch (err) {
      setShippingError(
        err instanceof Error && err.message ? err.message : "CJ ilə əlaqə qurula bilmədi, bir az sonra yenidən cəhd edin."
      );
    } finally {
      setShippingLoading(false);
    }
  }

  function handleImport() {
    if (!detail) return;
    const chosen = variants.filter((v) => v.selected);
    if (chosen.length === 0) {
      toast.error("Ən azı bir variant seçin.");
      return;
    }
    const priceNum = Number(price);
    if (!name.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Ad və düzgün satış qiyməti daxil edin.");
      return;
    }

    startImport(async () => {
      try {
        const res = await fetch("/api/admin/cj/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cjProductId: detail.pid,
            name: name.trim(),
            description,
            category,
            price: priceNum,
            images: detail.images,
            variants: chosen.map((v) => ({ vid: v.vid, color: v.color, size: v.size, stock: v.stock })),
            maxShippingCost: shipping?.cost ?? null,
            maxShippingCountry: shipping?.countryName ?? null,
          }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "import_failed");
        toast.success("Məhsul sayta əlavə edildi");
        closeDetail();
        router.push("/idarepaneli/mehsullar");
      } catch (err) {
        toast.error(err instanceof Error && err.message ? err.message : "Məhsul əlavə edilmədi. Yenidən cəhd edin.");
      }
    });
  }

  const cjPrice = detail?.sellPrice ?? null;
  const totalCost = cjPrice != null && shipping ? cjPrice + shipping.cost : null;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="CJ kataloqunda axtar (məs. hoodie, jacket)..."
          className="pl-9"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Axtarılır...
        </div>
      )}

      {searchError && <p className="text-sm text-red-600">{searchError}</p>}

      {!loading && !searchError && keyword.trim() && items.length === 0 && (
        <p className="text-sm text-neutral-500">Nəticə tapılmadı.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.pid} className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="aspect-square bg-neutral-100">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary CJ CDN URLs, admin-only search result thumbnail
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
              <p className="text-sm text-neutral-500">{item.sellPrice != null ? `$${item.sellPrice.toFixed(2)}` : "—"}</p>
              <Button type="button" size="sm" variant="outline" className="mt-auto" onClick={() => openDetail(item.pid)}>
                Ətraflı Bax
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="icon" disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-neutral-500">
            Səhifə {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={page >= totalPages || loading}
            onClick={() => goToPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={selectedPid !== null} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="flex h-[95vh] w-[95vw] max-w-none max-h-none flex-col overflow-hidden p-0 sm:max-w-none">
          <DialogHeader className="shrink-0 border-b border-neutral-200 px-6 py-4">
            <DialogTitle>Məhsulu Sayta Əlavə Et</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {detailLoading && (
              <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Yüklənir...
              </div>
            )}

            {detailError && <p className="py-4 text-sm text-red-600">{detailError}</p>}

            {detail && !detailLoading && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
                {/* Left: images, description, variants */}
                <div className="space-y-6">
                  {detail.images.length > 0 && (
                    <div className="space-y-2">
                      <div className="aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary CJ CDN URLs, admin-only preview */}
                        <img
                          src={detail.images[activeImage] ?? detail.images[0]}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {detail.images.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                          {detail.images.map((src, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setActiveImage(i)}
                              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-colors ${
                                i === activeImage ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-400"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary CJ CDN URLs, admin-only thumbnail */}
                              <img src={src} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="cj-desc">Təsvir</Label>
                    <Textarea id="cj-desc" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <Label>
                      Variantlar ({variants.filter((v) => v.selected).length} / {variants.length} seçili)
                    </Label>
                    <div className="rounded-lg border border-neutral-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Rəng</TableHead>
                            <TableHead>Razmer</TableHead>
                            <TableHead>CJ Qiyməti</TableHead>
                            <TableHead>Stok</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variants.map((v, i) => (
                            <TableRow key={v.vid || i}>
                              <TableCell>
                                <Checkbox
                                  checked={v.selected}
                                  onCheckedChange={(checked) => updateVariant(i, { selected: checked === true })}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={v.color}
                                  onChange={(e) => updateVariant(i, { color: e.target.value })}
                                  className="h-8 w-28"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={v.size}
                                  onChange={(e) => updateVariant(i, { size: e.target.value })}
                                  className="h-8 w-20"
                                />
                              </TableCell>
                              <TableCell>{v.sellPrice != null ? `$${v.sellPrice.toFixed(2)}` : "—"}</TableCell>
                              <TableCell>{v.stock}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Right: form fields + pricing reference */}
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="cj-name">Ad</Label>
                    <Input id="cj-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Kateqoriya</Label>
                      <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEN">Kişi</SelectItem>
                          <SelectItem value="WOMEN">Qadın</SelectItem>
                          <SelectItem value="KIDS">Uşaq</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cj-price">Satış Qiyməti ($)</Label>
                      <Input id="cj-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">CJ məhsul qiyməti</span>
                      <span className="font-medium">{cjPrice != null ? `$${cjPrice.toFixed(2)}` : "—"}</span>
                    </div>

                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-neutral-500">Ən yüksək çatdırılma (8-15 gün)</span>
                      {shipping ? (
                        <span className="text-right font-medium">
                          ${shipping.cost.toFixed(2)} — {shipping.countryName}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Hesablanmayıb</span>
                      )}
                    </div>

                    {totalCost != null && (
                      <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-semibold">
                        <span>Ümumi maya dəyəri</span>
                        <span>${totalCost.toFixed(2)}</span>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={handleCalculateShipping}
                      disabled={shippingLoading}
                    >
                      {shippingLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Hesablanır (~30 saniyə, 29 ölkə)...
                        </>
                      ) : (
                        <>
                          <Truck className="h-3.5 w-3.5" />
                          {shipping ? "Yenidən Hesabla" : "Çatdırılma Qiymətini Hesabla"}
                        </>
                      )}
                    </Button>

                    {shippingError && <p className="text-xs text-red-600">{shippingError}</p>}
                    {shipping && shipping.skipped.length > 0 && (
                      <p className="text-xs text-neutral-400">
                        {shipping.skipped.length} ölkə üçün 8-15 gün aralığında metod tapılmadı.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t border-neutral-200 px-6 py-4">
            <Button type="button" variant="outline" onClick={closeDetail}>
              Ləğv et
            </Button>
            <Button type="button" onClick={handleImport} disabled={!detail || importPending}>
              {importPending ? "Əlavə edilir..." : "Sayta Əlavə Et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
