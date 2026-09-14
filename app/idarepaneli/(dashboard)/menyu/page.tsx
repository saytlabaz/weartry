import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import NavItemDialog from "./NavItemDialog";
import CustomPageDialog from "./CustomPageDialog";
import DeleteButton from "./DeleteButton";
import { deleteNavItem, deleteCustomPage } from "./actions";

export default async function MenuPage() {
  const [navItems, customPages] = await Promise.all([
    prisma.navItem.findMany({ orderBy: { order: "asc" } }),
    prisma.customPage.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const topLevel = navItems.filter((item) => !item.parentId);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Naviqasiya Menyusu</h1>

      <Tabs defaultValue="nav">
        <TabsList>
          <TabsTrigger value="nav">Naviqasiya Elementləri</TabsTrigger>
          <TabsTrigger value="pages">Statik Səhifələr</TabsTrigger>
        </TabsList>

        <TabsContent value="nav" className="mt-4 space-y-4">
          <NavItemDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Yeni Element
              </Button>
            }
          />
          <div className="rounded-lg border border-neutral-200 bg-white">
            {topLevel.length === 0 && <p className="p-4 text-sm text-neutral-500">Hələ naviqasiya elementi yoxdur.</p>}
            <div className="divide-y divide-neutral-100">
              {topLevel.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-2 text-sm text-neutral-400">{item.url}</span>
                    {!item.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Deaktiv
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <NavItemDialog
                      initial={item}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteButton onDelete={deleteNavItem.bind(null, item.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="mt-4 space-y-4">
          <CustomPageDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Yeni Səhifə
              </Button>
            }
          />
          <div className="rounded-lg border border-neutral-200 bg-white">
            {customPages.length === 0 && <p className="p-4 text-sm text-neutral-500">Hələ statik səhifə yoxdur.</p>}
            <div className="divide-y divide-neutral-100">
              {customPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <span className="font-medium">{page.title}</span>
                    <span className="ml-2 text-sm text-neutral-400">/{page.slug}</span>
                    {!page.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        Deaktiv
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <CustomPageDialog
                      initial={page}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteButton onDelete={deleteCustomPage.bind(null, page.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
