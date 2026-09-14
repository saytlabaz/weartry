"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CjSearchItem } from "@/lib/cj/searchProducts";
import type { CjProductDetail, CjVariantDetail } from "@/lib/cj/getProductDetail";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("MEN");
  const [price, setPrice] = useState("");
  const [importPending, startImport] = useTransition();

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
  }

  function updateVariant(index: number, patch: Partial<SelectedVariant>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
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
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Məhsulu Sayta Əlavə Et</DialogTitle>
          </DialogHeader>

          {detailLoading && (
            <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Yüklənir...
            </div>
          )}

          {detailError && <p className="py-4 text-sm text-red-600">{detailError}</p>}

          {detail && !detailLoading && (
            <div className="space-y-5">
              {detail.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {detail.images.slice(0, 8).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary CJ CDN URLs, admin-only preview
                    <img key={i} src={src} alt="" className="h-20 w-20 shrink-0 rounded-md border border-neutral-200 object-cover" />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cj-name">Ad</Label>
                  <Input id="cj-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cj-desc">Təsvir</Label>
                  <Textarea id="cj-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
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

              <div className="space-y-1.5">
                <Label>Variantlar ({variants.filter((v) => v.selected).length} / {variants.length} seçili)</Label>
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
          )}

          <DialogFooter>
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
