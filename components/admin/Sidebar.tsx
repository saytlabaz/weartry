"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  HelpCircle,
  FileText,
  Bell,
  Settings,
  Menu as MenuIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/idarepaneli", label: "Dashboard", icon: LayoutDashboard },
  { href: "/idarepaneli/mehsullar", label: "Məhsullar", icon: Package },
  { href: "/idarepaneli/sifarisler", label: "Sifarişlər", icon: ShoppingCart },
  { href: "/idarepaneli/faq", label: "FAQ", icon: HelpCircle },
  { href: "/idarepaneli/sehifeler", label: "Səhifə Məzmunu", icon: FileText },
  { href: "/idarepaneli/menyu", label: "Naviqasiya Menyusu", icon: MenuIcon },
  { href: "/idarepaneli/bildirisler", label: "Bildirişlər", icon: Bell },
  { href: "/idarepaneli/hesab", label: "Hesab", icon: Settings },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.href === "/idarepaneli" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-neutral-200 bg-white md:block">
      <div className="flex h-14 items-center border-b border-neutral-200 px-4">
        <span className="text-sm font-bold tracking-tight">WEAR TRY</span>
        <span className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500">
          ADMIN
        </span>
      </div>
      <AdminNav />
    </aside>
  );
}
