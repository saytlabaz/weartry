"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import StarRating from "./StarRating";

// Placeholder review data — swap for real customer reviews once available.
const RATING_DISTRIBUTION = [
  { stars: 5, percent: 68 },
  { stars: 4, percent: 21 },
  { stars: 3, percent: 6 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 2 },
];

const ALL_REVIEWS = [
  { name: "Priya Nair", date: "2026-08-14", rating: 5, text: "Fits exactly as described and the fabric feels premium. Ordering another color already." },
  { name: "Lucas Meyer", date: "2026-08-02", rating: 5, text: "Great quality for the price. Shipping was quick too." },
  { name: "Sofia Conti", date: "2026-07-22", rating: 4, text: "Nice piece overall, runs slightly large so consider sizing down." },
  { name: "Daniel Osei", date: "2026-07-10", rating: 5, text: "Exactly like the photos. Very happy with this purchase." },
  { name: "Mia Larsson", date: "2026-06-28", rating: 4, text: "Comfortable and well made. Would recommend." },
  { name: "Noah Fischer", date: "2026-06-15", rating: 5, text: "Second time ordering this — consistent quality every time." },
  { name: "Isabela Rocha", date: "2026-06-03", rating: 3, text: "Good product but delivery took a bit longer than expected." },
  { name: "Ethan Walsh", date: "2026-05-20", rating: 5, text: "Perfect fit and the color is even better in person." },
];

const PAGE_SIZE = 4;

export default function ProductReviews() {
  const t = useTranslations("ProductReviews");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showWriteReview, setShowWriteReview] = useState(false);

  const totalReviews = 1284;
  const averageRating = 4.6;

  return (
    <div>
      <BlurFadeUp as="h2" className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("headline")}
      </BlurFadeUp>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,280px)_1fr]">
        <BlurFadeUp delay={0.05}>
          <div className="rounded-2xl border border-border p-6">
            <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
            <div className="mt-2">
              <StarRating rating={averageRating} size={16} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">{t("summaryBasedOn", { count: totalReviews })}</p>

            <div className="mt-5 space-y-2">
              {RATING_DISTRIBUTION.map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-8 shrink-0">{row.stars}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${row.percent}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right">{row.percent}%</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowWriteReview((v) => !v)}
              className="mt-6 w-full rounded-full border border-neutral-900 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-900 hover:text-white"
            >
              {t("writeReview")}
            </button>
            {showWriteReview && (
              <BlurFadeUp className="mt-3 rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-neutral-600">
                {t("writeReviewPlaceholder")}
              </BlurFadeUp>
            )}
          </div>
        </BlurFadeUp>

        <StaggerGroup className="space-y-5">
          {ALL_REVIEWS.slice(0, visibleCount).map((review) => (
            <StaggerItem key={review.name + review.date}>
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{review.name}</p>
                  <p className="text-xs text-neutral-400">{review.date}</p>
                </div>
                <div className="mt-1.5">
                  <StarRating rating={review.rating} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{review.text}</p>
              </div>
            </StaggerItem>
          ))}

          {visibleCount < ALL_REVIEWS.length && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((v) => Math.min(v + PAGE_SIZE, ALL_REVIEWS.length))}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-400"
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </StaggerGroup>
      </div>
    </div>
  );
}
