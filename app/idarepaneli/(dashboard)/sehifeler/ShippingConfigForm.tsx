"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSiteContent } from "./actions";
import { EU_ORDER_LIMIT_KEY, USD_TO_EUR_RATE_KEY } from "@/lib/shipping/constants";

export default function ShippingConfigForm({ values }: { values: Record<string, string> }) {
  const [euLimit, setEuLimit] = useState(values[EU_ORDER_LIMIT_KEY] ?? "150");
  const [rate, setRate] = useState(values[USD_TO_EUR_RATE_KEY] ?? "0.92");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    const limitNum = Number(euLimit);
    const rateNum = Number(rate);
    if (!Number.isFinite(limitNum) || limitNum <= 0 || !Number.isFinite(rateNum) || rateNum <= 0) {
      toast.error("Düzgün rəqəmlər daxil edin.");
      return;
    }
    startTransition(async () => {
      await saveSiteContent([
        { key: EU_ORDER_LIMIT_KEY, value: String(limitNum) },
        { key: USD_TO_EUR_RATE_KEY, value: String(rateNum) },
      ]);
      toast.success("Çatdırılma tənzimləmələri yadda saxlanıldı");
    });
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eu-limit">AB Sifariş Limiti (EUR)</Label>
        <Input id="eu-limit" type="number" step="1" value={euLimit} onChange={(e) => setEuLimit(e.target.value)} />
        <p className="text-xs text-neutral-500">
          AB ölkələrinə göndərilən sifarişlərin ümumi (məhsul) dəyəri bu məbləği keçə bilməz (IOSS gömrük qaydası).
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="usd-eur-rate">USD → EUR Məzənnə</Label>
        <Input id="usd-eur-rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
        <p className="text-xs text-neutral-500">
          Səbət dəyəri USD-dən EUR-a təxmini çevrilmək üçün. Vaxtaşırı yeniləyin.
        </p>
      </div>
      <Button onClick={handleSave} disabled={pending}>
        {pending ? "Saxlanılır..." : "Yadda Saxla"}
      </Button>
    </div>
  );
}
