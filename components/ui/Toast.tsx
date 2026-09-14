"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12.5 2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Toast({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] sm:right-6">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 24, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <CheckIcon />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
