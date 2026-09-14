import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { safeAuth } from "@/lib/auth/safe-auth";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import AccountView, { type AccountProfile } from "@/components/account/AccountView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account");
  return { title: `${t("myAccount")} — WearTry` };
}

export default async function AccountInfoPage() {
  const session = await safeAuth();
  // Layout already redirects when there's no session; this only guards
  // against a race where safeAuth() resolves differently between calls.
  if (!session?.user) return null;

  const [{ data: userRow }, { data: googleAccount }] = await Promise.all([
    supabaseNextAuth
      .from("users")
      .select("first_name, last_name, email, phone, gender, password_hash")
      .eq("id", session.user.id)
      .maybeSingle(),
    supabaseNextAuth.from("accounts").select("id").eq("userId", session.user.id).eq("provider", "google").maybeSingle(),
  ]);

  const profile: AccountProfile = {
    firstName: userRow?.first_name ?? "",
    lastName: userRow?.last_name ?? "",
    email: userRow?.email ?? session.user.email ?? "",
    phone: userRow?.phone ?? "",
    gender: userRow?.gender ?? "",
    hasPassword: Boolean(userRow?.password_hash),
    isGoogleAccount: Boolean(googleAccount),
  };

  return <AccountView profile={profile} />;
}
