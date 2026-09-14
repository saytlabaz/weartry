"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createCustomPage, updateCustomPage } from "./actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface CustomPageValues {
  id?: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
}

export default function CustomPageDialog({ trigger, initial }: { trigger: ReactElement; initial?: CustomPageValues }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [content, setContent] = useState(initial?.content ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (initial?.id) {
        await updateCustomPage(initial.id, { slug, title, content, isActive });
        toast.success("Səhifə yeniləndi");
      } else {
        await createCustomPage({ slug, title, content });
        toast.success("Səhifə yaradıldı");
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initial?.id ? "Səhifəni Düzəlt" : "Yeni Səhifə"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="page-title">Başlıq</Label>
              <Input
                id="page-title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="page-slug">Slug (URL: /az/{slug || "..."})</Label>
              <Input
                id="page-slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="page-content">Məzmun</Label>
              <Textarea id="page-content" required rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            {initial?.id && (
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="page-active" />
                <Label htmlFor="page-active">Aktiv</Label>
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
