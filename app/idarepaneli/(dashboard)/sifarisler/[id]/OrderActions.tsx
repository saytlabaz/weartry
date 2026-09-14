"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { updateOrderStatusAction, sendToCjAction } from "../actions";
import { ORDER_STATUSES } from "../StatusBadge";
import StatusBadge from "../StatusBadge";
import type { $Enums } from "@/lib/generated/prisma/client";

export default function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function handleStatusChange(next: string | null) {
    if (!next) return;
    startTransition(async () => {
      await updateOrderStatusAction(orderId, next as $Enums.OrderStatus);
      toast.success("Status yeniləndi");
    });
  }

  function handleSendToCj() {
    startTransition(async () => {
      const result = await sendToCjAction(orderId);
      if (result.success) {
        toast.success(`CJ-yə göndərildi (CJ sifariş: ${result.cjOrderId})`);
      } else {
        toast.error(`CJ-yə göndərilmədi: ${result.error}`);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={status} onValueChange={handleStatusChange} disabled={pending}>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              <StatusBadge status={s} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSendToCj} disabled={pending} variant="outline" className="gap-1.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        CJ-yə Göndər
      </Button>
    </div>
  );
}
