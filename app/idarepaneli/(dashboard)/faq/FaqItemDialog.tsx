"use client";

import { useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createFaqItem, updateFaqItem } from "./actions";

interface FaqItemValues {
  id?: string;
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
}

export default function FaqItemDialog({
  trigger,
  initial,
  categories,
}: {
  trigger: ReactElement;
  initial?: FaqItemValues;
  categories: string[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? "");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (initial?.id) {
        await updateFaqItem(initial.id, { category, question, answer, isActive });
        toast.success("Sual yeniləndi");
      } else {
        await createFaqItem({ category, question, answer });
        toast.success("Sual əlavə edildi");
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
            <DialogTitle>{initial?.id ? "Sualı Düzəlt" : "Yeni Sual Əlavə Et"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="faq-category">Kateqoriya</Label>
              <Input id="faq-category" required value={category} onChange={(e) => setCategory(e.target.value)} list="faq-categories" />
              <datalist id="faq-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="faq-question">Sual</Label>
              <Input id="faq-question" required value={question} onChange={(e) => setQuestion(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="faq-answer">Cavab</Label>
              <Textarea id="faq-answer" required rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
            </div>
            {initial?.id && (
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="faq-active" />
                <Label htmlFor="faq-active">Aktiv</Label>
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
