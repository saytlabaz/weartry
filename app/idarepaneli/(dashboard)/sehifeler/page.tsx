import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HomepageContentForm from "./HomepageContentForm";
import FeaturedProductsPicker from "./FeaturedProductsPicker";

export default async function SiteContentPage() {
  const [contentRows, products] = await Promise.all([
    prisma.siteContent.findMany({ where: { locale: "az" } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, isFeatured: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const values = Object.fromEntries(contentRows.map((r) => [r.key, r.value]));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Səhifə Məzmunu</h1>

      <Tabs defaultValue="homepage">
        <TabsList>
          <TabsTrigger value="homepage">Ana Səhifə</TabsTrigger>
        </TabsList>
        <TabsContent value="homepage" className="mt-6 space-y-8">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Hero Mətnləri</h2>
            <HomepageContentForm values={values} />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Seçilmiş Məhsullar</h2>
            <p className="mb-3 text-sm text-neutral-500">
              Ana səhifədə &quot;Seçilmiş Məhsullar&quot; bölməsində göstərilməsini istədiyiniz məhsulları seçin.
            </p>
            <FeaturedProductsPicker products={products} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
