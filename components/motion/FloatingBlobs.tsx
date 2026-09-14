/**
 * Purely decorative background motion — 2-3 soft gradient blobs that
 * drift and breathe in an infinite loop, completely independent of
 * scroll position. Pure CSS (`@keyframes float1/2/3` in globals.css),
 * so this stays a Server Component: no JS, no "use client" needed.
 * `prefers-reduced-motion` is handled globally in globals.css.
 */
export default function FloatingBlobs({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="decor-blob-1 absolute -left-16 -top-24 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="decor-blob-2 absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="decor-blob-3 absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
    </div>
  );
}
