import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import FaqItemDialog from "./FaqItemDialog";
import FaqRowActions from "./FaqRowActions";

const DEFAULT_CATEGORIES = ["Sifariş və Ödəniş", "Çatdırılma", "Qaytarma və Refund", "Ölçü və Məhsul"];

export default async function AdminFaqPage() {
  const items = await prisma.faqItem.findMany({
    where: { locale: "az" },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...items.map((i) => i.category)]));
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    grouped.set(item.category, [...(grouped.get(item.category) ?? []), item]);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">FAQ</h1>
        <FaqItemDialog
          categories={categories}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Yeni Sual
            </Button>
          }
        />
      </div>

      {items.length === 0 && <p className="text-sm text-neutral-500">Hələ sual yoxdur.</p>}

      {Array.from(grouped.entries()).map(([category, categoryItems]) => (
        <div key={category} className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="font-semibold">{category}</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {categoryItems.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{item.question}</p>
                    {!item.isActive && <Badge variant="secondary">Deaktiv</Badge>}
                  </div>
                  <p className="truncate text-sm text-neutral-500">{item.answer}</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaqItemDialog
                    categories={categories}
                    initial={item}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <FaqRowActions id={item.id} isFirst={i === 0} isLast={i === categoryItems.length - 1} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
