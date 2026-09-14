"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Star, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approveReview, deleteReview } from "../actions";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
}

export default function ReviewsPanel({ reviews }: { reviews: Review[] }) {
  const [pending, startTransition] = useTransition();

  if (reviews.length === 0) {
    return <p className="text-sm text-neutral-500">Bu məhsul üçün rəy yoxdur.</p>;
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveReview(id);
      toast.success("Rəy təsdiqləndi");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteReview(id);
      toast.success("Rəy silindi");
    });
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.customerName}</span>
              <span className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current" : ""}`} />
                ))}
              </span>
              <Badge variant={review.isApproved ? "default" : "secondary"}>
                {review.isApproved ? "Təsdiqlənib" : "Gözləyir"}
              </Badge>
            </div>
            <div className="flex gap-1">
              {!review.isApproved && (
                <Button variant="ghost" size="icon" disabled={pending} onClick={() => handleApprove(review.id)}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
              )}
              <Button variant="ghost" size="icon" disabled={pending} onClick={() => handleDelete(review.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
          <p className="mt-1.5 text-sm text-neutral-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
