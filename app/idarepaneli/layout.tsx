import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

// A separate root layout from app/[locale]/layout.tsx — /idarepaneli is a
// fixed-language admin section entirely outside the storefront's i18n
// routing (see proxy.ts), so it needs its own <html>/<body> shell rather
// than sharing next-intl's. app/layout.tsx (the actual top-level layout)
// renders nothing but `children`, so this is the only html/body either
// tree gets.
export const metadata: Metadata = {
  title: "İdarəetmə Paneli — WearTry",
  robots: { index: false, follow: false },
};

// The whole admin section is session-gated, live data, never meant to be
// cached or prerendered — this also keeps `next build` from attempting to
// statically render these pages (and their direct Prisma calls) without a
// real DATABASE_URL available locally.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az" className="h-full">
      <body className="h-full bg-neutral-50 text-neutral-900 antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
