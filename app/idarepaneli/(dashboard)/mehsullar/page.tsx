import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import ProductFilters from "./ProductFilters";
import ProductRowActions from "./ProductRowActions";

const CATEGORY_LABEL: Record<string, string> = { MEN: "Kişi", WOMEN: "Qadın", KIDS: "Uşaq" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const where: Prisma.ProductWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (category) where.category = category as Prisma.ProductWhereInput["category"];

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Məhsullar</h1>
        <Button render={<Link href="/idarepaneli/mehsullar/yeni" />}>
          <Plus className="h-4 w-4" />
          Yeni Məhsul Əlavə Et
        </Button>
      </div>

      <ProductFilters />

      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Ad</TableHead>
              <TableHead>Kateqoriya</TableHead>
              <TableHead>Qiymət</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-neutral-500">
                  Məhsul tapılmadı.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary Blob URLs, admin-only table thumbnail
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-10 w-10 rounded-md border border-neutral-200 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-neutral-100" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{CATEGORY_LABEL[product.category] ?? product.category}</TableCell>
                <TableCell>${product.price.toString()}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Aktiv" : "Deaktiv"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ProductRowActions productId={product.id} isActive={product.isActive} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
