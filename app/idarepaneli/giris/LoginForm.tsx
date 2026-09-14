"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLoginAction } from "./actions";

export default function LoginForm() {
  const [error, formAction, pending] = useActionState(adminLoginAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input id="admin-email" name="email" type="email" required autoFocus autoComplete="username" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">Parol</Label>
        <Input id="admin-password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Daxil olunur..." : "Daxil ol"}
      </Button>
    </form>
  );
}
