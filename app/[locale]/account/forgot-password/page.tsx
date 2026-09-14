import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ForgotPasswordView from "@/components/account/ForgotPasswordView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: `${t("forgotPasswordTitle")} — WearTry` };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
