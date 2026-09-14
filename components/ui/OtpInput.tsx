"use client";

import { useEffect, useId, useRef, type ChangeEvent } from "react";

interface OtpInputProps {
  id?: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /**
   * Called once with the completed code the instant the field reaches
   * `length` digits — lets the caller auto-verify without waiting for an
   * explicit submit. Omit when the step has other required fields (e.g. a
   * new password) or should never auto-submit (e.g. account deletion).
   */
  onComplete?: (value: string) => void;
  length?: number;
  /** Disables the field and shows a spinner while a verify request is in flight. */
  loading?: boolean;
  /**
   * Bump this (e.g. a counter incremented on every failed verify) to clear
   * the field and return focus to it. 0/undefined is treated as "no error
   * yet" so it doesn't fire on mount.
   */
  errorTick?: number;
  autoFocus?: boolean;
}

export default function OtpInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  onComplete,
  length = 6,
  loading = false,
  errorTick,
  autoFocus = true,
}: OtpInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!errorTick) return;
    onChange("");
    firedRef.current = false;
    inputRef.current?.focus();
    // Only the error counter should re-trigger this — onChange is stable
    // from the caller's perspective (a useState setter).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorTick]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(digits);
    if (digits.length === length) {
      if (!firedRef.current) {
        firedRef.current = true;
        onComplete?.(digits);
      }
    } else {
      firedRef.current = false;
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          required
          autoFocus={autoFocus}
          disabled={loading}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-neutral-400 disabled:opacity-60"
        />
        {loading && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"
          />
        )}
      </div>
    </div>
  );
}
