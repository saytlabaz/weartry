"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProduct, toggleProductActive } from "./actions";

export default function ProductRowActions({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleToggle(next: boolean) {
    startTransition(async () => {
      await toggleProductActive(productId, next);
      toast.success(next ? "Məhsul aktivləşdirildi" : "Məhsul deaktiv edildi");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProduct(productId);
      toast.success("Məhsul silindi");
      setOpen(false);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Switch checked={isActive} onCheckedChange={handleToggle} disabled={pending} />
      <Button render={<Link href={`/idarepaneli/mehsullar/${productId}`} />} variant="ghost" size="icon">
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bu məhsulu silmək istədiyinizə əminsiniz?</AlertDialogTitle>
            <AlertDialogDescription>Bu əməliyyat geri qaytarıla bilməz.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={pending} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
