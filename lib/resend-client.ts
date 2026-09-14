import { Resend } from "resend";

// Constructed on first send rather than at module scope — Resend's
// constructor throws synchronously when the API key is missing, which would
// otherwise break `next build`'s page-data collection before env vars are
// necessarily available.
let resend: Resend | undefined;

export function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}
