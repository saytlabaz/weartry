import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";
import ReviewsPanel from "./ReviewsPanel";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, reviews: { orderBy: { createdAt: "desc" } } },
  });

  if (!product) notFound();

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Məhsulu Düzəlt</h1>
        <ProductForm
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            category: product.category,
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
            images: product.images,
            sizes: product.sizes,
            colors: product.colors,
            stock: product.stock,
            cjProductId: product.cjProductId,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            variants: product.variants.map((v) => ({ color: v.color, size: v.size, stock: v.stock })),
          }}
        />
      </div>

      <div className="max-w-3xl space-y-3">
        <h2 className="text-lg font-semibold">Müştəri Rəyləri</h2>
        <ReviewsPanel reviews={product.reviews} />
      </div>
    </div>
  );
}
