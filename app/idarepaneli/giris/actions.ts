"use server";

import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/lib/admin/auth";

export async function adminLoginAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/idarepaneli" });
  } catch (err) {
    if (err instanceof CredentialsSignin) {
      return err.code === "blocked"
        ? "Çox sayda yanlış cəhd. 1 saat sonra yenidən cəhd edin."
        : "Email və ya parol yanlışdır.";
    }
    // Auth.js's signIn throws a NEXT_REDIRECT "error" on success to perform
    // the redirect — must be rethrown, not swallowed as a login failure.
    throw err;
  }

  redirect("/idarepaneli");
}
