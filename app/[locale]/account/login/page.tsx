import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import AuthView from "@/components/account/AuthView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: `${t("loginTitle")} — WearTry` };
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthView />
    </Suspense>
  );
}
