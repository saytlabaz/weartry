"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { moveFaqItem, deleteFaqItem } from "./actions";

export default function FaqRowActions({ id, isFirst, isLast }: { id: string; isFirst: boolean; isLast: boolean }) {
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      await moveFaqItem(id, direction);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteFaqItem(id);
      toast.success("Sual silindi");
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" disabled={pending || isFirst} onClick={() => move("up")}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={pending || isLast} onClick={() => move("down")}>
        <ArrowDown className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bu sualı silmək istədiyinizə əminsiniz?</AlertDialogTitle>
            <AlertDialogDescription>Bu əməliyyat geri qaytarıla bilməz.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
