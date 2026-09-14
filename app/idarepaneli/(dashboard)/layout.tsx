import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const unreadCount = await prisma.adminNotification.count({ where: { isRead: false } });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header unreadCount={unreadCount} />
        <main className="min-w-[640px] flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
