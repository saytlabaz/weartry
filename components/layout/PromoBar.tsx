"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Marquee from "@/components/motion/Marquee";

const PERCENT_START = 10;
const PERCENT_TARGET = 30;
const PERCENT_STEP_MS = 150;

const DURATION_START = 22;
const DURATION_FLOOR = 10;
const DURATION_DECAY = 0.995; // ~0.5% shorter per completed loop

export default function PromoBar() {
  const t = useTranslations("PromoBar");
  const [percent, setPercent] = useState(PERCENT_START);
  const [duration, setDuration] = useState(DURATION_START);

  useEffect(() => {
    if (percent >= PERCENT_TARGET) return;
    const id = setTimeout(() => setPercent((p) => Math.min(p + 1, PERCENT_TARGET)), PERCENT_STEP_MS);
    return () => clearTimeout(id);
  }, [percent]);

  const handleIteration = useCallback(() => {
    setDuration((d) => Math.max(DURATION_FLOOR, d * DURATION_DECAY));
  }, []);

  const item = (
    <div className="flex items-center gap-10 text-xs font-medium uppercase tracking-wider text-white">
      <span>{t("message1")}</span>
      <span aria-hidden>✦</span>
      <span>{t("message2", { percent })}</span>
      <span aria-hidden>✦</span>
    </div>
  );

  return (
    <div className="bg-neutral-900 py-2.5">
      <Marquee duration={duration} gap="2.5rem" copies={4} onIteration={handleIteration}>
        {item}
      </Marquee>
    </div>
  );
}
