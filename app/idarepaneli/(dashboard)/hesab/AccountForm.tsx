"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAdminAccount } from "./actions";

type ActionResult = { error?: string; success?: string };

async function submit(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return updateAdminAccount(formData);
}

export default function AccountForm({ email }: { email: string }) {
  const [result, formAction, pending] = useActionState<ActionResult, FormData>(submit, {});

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="acc-email">Email</Label>
        <Input id="acc-email" name="email" type="email" defaultValue={email} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="acc-new-password">Yeni Parol (opsional)</Label>
        <Input id="acc-new-password" name="newPassword" type="password" autoComplete="new-password" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="acc-current-password">Cari Parol (təsdiq üçün)</Label>
        <Input id="acc-current-password" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      {result.error && <p className="text-sm text-red-600">{result.error}</p>}
      {result.success && <p className="text-sm text-green-600">{result.success}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saxlanılır..." : "Yadda Saxla"}
      </Button>
    </form>
  );
}
