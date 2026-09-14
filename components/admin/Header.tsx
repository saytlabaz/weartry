"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu as MenuIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminNav } from "./Sidebar";
import { adminLogoutAction } from "@/app/idarepaneli/actions";

export default function Header({ unreadCount }: { unreadCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <MenuIcon className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Naviqasiya</SheetTitle>
          <AdminNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Link
          href="/idarepaneli/bildirisler"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <form action={adminLogoutAction}>
          <Button type="submit" variant="ghost" size="sm" className="gap-1.5 text-neutral-500">
            <LogOut className="h-4 w-4" />
            Çıxış
          </Button>
        </form>
      </div>
    </header>
  );
}
