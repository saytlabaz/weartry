"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleFeatured } from "./actions";

interface ProductRow {
  id: string;
  name: string;
  isFeatured: boolean;
}

export default function FeaturedProductsPicker({ products }: { products: ProductRow[] }) {
  const [pending, startTransition] = useTransition();

  function handleToggle(id: string, checked: boolean) {
    startTransition(async () => {
      await toggleFeatured(id, checked);
    });
  }

  return (
    <div className="max-w-md space-y-2">
      {products.map((product) => (
        <label key={product.id} className="flex items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
          <Checkbox
            checked={product.isFeatured}
            disabled={pending}
            onCheckedChange={(checked) => handleToggle(product.id, checked === true)}
          />
          {product.name}
        </label>
      ))}
    </div>
  );
}
