"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/components/admin/ImageUploader";
import VariantEditor from "./VariantEditor";
import { createProduct, updateProduct, type ProductFormInput, type VariantInput } from "./actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ProductFormValues extends ProductFormInput {
  id?: string;
}

export default function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ProductFormInput["category"]>(initial?.category ?? "MEN");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice != null ? String(initial.compareAtPrice) : ""
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [sizes, setSizes] = useState(initial?.sizes.join(", ") ?? "");
  const [colors, setColors] = useState(initial?.colors.join(", ") ?? "");
  const [stock, setStock] = useState(String(initial?.stock ?? "0"));
  // Not editable from this manual form — CJ ids are only ever set by the
  // CJ import flow (app/api/admin/cj/import); carried through unchanged
  // here so editing a CJ-sourced product doesn't accidentally clear it.
  const cjProductId = initial?.cjProductId ?? null;
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [variants, setVariants] = useState<VariantInput[]>(initial?.variants ?? []);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: ProductFormInput = {
      name,
      slug,
      description,
      category,
      price: Number(price) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      images,
      sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
      stock: Number(stock) || 0,
      cjProductId,
      isActive,
      isFeatured,
      variants: variants.filter((v) => v.color && v.size),
    };

    startTransition(async () => {
      try {
        if (initial?.id) {
          await updateProduct(initial.id, input);
          toast.success("Məhsul yeniləndi");
        } else {
          await createProduct(input);
          toast.success("Məhsul əlavə edildi");
        }
        router.push("/idarepaneli/mehsullar");
      } catch {
        toast.error("Xəta baş verdi. Yenidən cəhd edin.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="p-name">Ad</Label>
          <Input id="p-name" required value={name} onChange={(e) => handleNameChange(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="p-slug">Slug</Label>
          <Input
            id="p-slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="p-desc">Təsvir</Label>
          <Textarea id="p-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Kateqoriya</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ProductFormInput["category"])}>
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
          <Label htmlFor="p-price">Qiymət ($)</Label>
          <Input id="p-price" type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-compare">Endirimli Qiymət ($, opsional)</Label>
          <Input
            id="p-compare"
            type="number"
            step="0.01"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-sizes">Razmerlər (vergüllə ayrılmış)</Label>
          <Input id="p-sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-colors">Rənglər (vergüllə ayrılmış)</Label>
          <Input id="p-colors" value={colors} onChange={(e) => setColors(e.target.value)} placeholder="#1a1a1a, #ffffff" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-stock">Ümumi Stok</Label>
          <Input id="p-stock" type="number" required value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Şəkillər</Label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="space-y-1.5">
        <Label>Rəng + Razmer üzrə Stok (opsional)</Label>
        <VariantEditor variants={variants} onChange={setVariants} />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} id="p-active" />
          <Label htmlFor="p-active">Aktiv</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="p-featured" />
          <Label htmlFor="p-featured">Seçilmiş Məhsul (ana səhifədə göstər)</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saxlanılır..." : initial?.id ? "Dəyişiklikləri Saxla" : "Məhsulu Əlavə Et"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/idarepaneli/mehsullar")}>
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
