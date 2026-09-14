"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VariantInput } from "./actions";

export default function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantInput[];
  onChange: (variants: VariantInput[]) => void;
}) {
  function update(index: number, field: keyof VariantInput, value: string) {
    const next = variants.map((v, i) =>
      i === index ? { ...v, [field]: field === "stock" ? Number(value) || 0 : value } : v
    );
    onChange(next);
  }

  function add() {
    onChange([...variants, { color: "", size: "", stock: 0 }]);
  }

  function remove(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {variants.map((variant, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Rəng"
            value={variant.color}
            onChange={(e) => update(i, "color", e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Razmer"
            value={variant.size}
            onChange={(e) => update(i, "size", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Stok"
            value={variant.stock}
            onChange={(e) => update(i, "stock", e.target.value)}
            className="w-24"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Kombinasiya Əlavə Et
      </Button>
    </div>
  );
}
