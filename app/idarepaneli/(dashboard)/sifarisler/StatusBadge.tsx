const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Ödəniş Gözlənilir",
  PAYMENT_RECEIVED: "Ödəniş Alındı",
  AWAITING_TRANSFER: "Köçürmə Gözlənilir",
  TRANSFER_COMPLETE: "Köçürmə Tamamlandı",
  SENT_TO_CJ: "CJ-yə Göndərildi",
  CJ_CONFIRMED: "CJ Təsdiqlədi",
  SHIPPED: "Göndərildi",
  DELIVERED: "Çatdırıldı",
  CANCELLED: "Ləğv edildi",
  REFUNDED: "Geri Ödənildi",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAYMENT_RECEIVED: "bg-lime-100 text-lime-800",
  AWAITING_TRANSFER: "bg-orange-100 text-orange-800",
  TRANSFER_COMPLETE: "bg-teal-100 text-teal-800",
  SENT_TO_CJ: "bg-blue-100 text-blue-800",
  CJ_CONFIRMED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-sky-100 text-sky-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-neutral-200 text-neutral-800",
};

export const ORDER_STATUSES = Object.keys(STATUS_LABEL);

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_CLASS[status] ?? "bg-neutral-100 text-neutral-700"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
