"use server";

import { signOut } from "@/lib/admin/auth";

export async function adminLogoutAction() {
  await signOut({ redirectTo: "/idarepaneli/giris" });
}
