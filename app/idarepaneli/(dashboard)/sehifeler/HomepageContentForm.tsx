"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveSiteContent } from "./actions";

const FIELDS = [
  { key: "hero_eyebrow", label: "Kiçik Başlıq (Eyebrow)", multiline: false },
  { key: "hero_title", label: "Əsas Başlıq", multiline: false },
  { key: "hero_subtitle", label: "Alt Başlıq", multiline: true },
  { key: "hero_cta", label: "CTA Düymə Mətni", multiline: false },
];

export default function HomepageContentForm({ values }: { values: Record<string, string> }) {
  const [state, setState] = useState<Record<string, string>>(values);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await saveSiteContent(Object.entries(state).map(([key, value]) => ({ key, value })));
      toast.success("Ana səhifə mətnləri yadda saxlanıldı");
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      {FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.multiline ? (
            <Textarea
              id={field.key}
              rows={3}
              value={state[field.key] ?? ""}
              onChange={(e) => setState((s) => ({ ...s, [field.key]: e.target.value }))}
            />
          ) : (
            <Input
              id={field.key}
              value={state[field.key] ?? ""}
              onChange={(e) => setState((s) => ({ ...s, [field.key]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <Button onClick={handleSave} disabled={pending}>
        {pending ? "Saxlanılır..." : "Yadda Saxla"}
      </Button>
    </div>
  );
}
