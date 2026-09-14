"use client";

import { useState, forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7-10.5-7-10.5-7Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a15.5 15.5 0 0 1-3.2 4.1M6.6 6.6C3.7 8.4 1.5 12 1.5 12s3.5 7 10.5 7c1.4 0 2.7-.28 3.9-.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-11 text-sm outline-none focus:border-neutral-400";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showLabel: string;
  hideLabel: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { id, name, label, placeholder, required, autoComplete, defaultValue, value, onChange, showLabel, hideLabel },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
        />
        <motion.button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={visible ? "on" : "off"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              className="block"
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
});

export default PasswordInput;
