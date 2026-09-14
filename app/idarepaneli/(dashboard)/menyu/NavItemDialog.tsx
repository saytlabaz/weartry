"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createNavItem, updateNavItem } from "./actions";

interface NavItemValues {
  id?: string;
  label: string;
  url: string;
  isActive: boolean;
}

export default function NavItemDialog({
  trigger,
  initial,
  parentId = null,
}: {
  trigger: ReactElement;
  initial?: NavItemValues;
  parentId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (initial?.id) {
        await updateNavItem(initial.id, { label, url, isActive });
        toast.success("Element yeniləndi");
      } else {
        await createNavItem({ label, url, parentId });
        toast.success("Element əlavə edildi");
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initial?.id ? "Elementi Düzəlt" : "Yeni Element"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nav-label">Ad</Label>
              <Input id="nav-label" required value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nav-url">URL</Label>
              <Input id="nav-url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/haqqimizda" />
            </div>
            {initial?.id && (
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="nav-active" />
                <Label htmlFor="nav-active">Aktiv</Label>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={pending}>
              {pending ? "Saxlanılır..." : "Saxla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
