"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUSES } from "./StatusBadge";
import StatusBadge from "./StatusBadge";

export default function OrderStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setStatus(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete("status");
    else params.set("status", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select defaultValue={searchParams.get("status") ?? "all"} onValueChange={setStatus}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Status üzrə filtr" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Bütün statuslar</SelectItem>
        {ORDER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <StatusBadge status={status} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
