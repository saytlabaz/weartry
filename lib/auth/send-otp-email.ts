import { Resend } from "resend";

// Constructed on first send rather than at module scope — Resend's
// constructor throws synchronously when the API key is missing, which would
// otherwise break `next build`'s page-data collection before env vars are
// necessarily available.
let resend: Resend | undefined;
function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, code: string, locale: string = "az") {
  const subject = locale === "az" ? "WearTry giriş kodunuz" : "Your WearTry login code";
  await getResend().emails.send({
    from: "WearTry <support@weartry.shop>",
    to: email,
    subject,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 20px; color: #111;">WearTry</h1>
        <p style="font-size: 16px; color: #333;">${locale === "az" ? "Giriş kodunuz" : "Your login code"}:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f5f5f5; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 16px 0;">
          ${code}
        </div>
        <p style="font-size: 13px; color: #888;">${locale === "az" ? "Bu kod 10 dəqiqə ərzində etibarlıdır." : "This code expires in 10 minutes."}</p>
      </div>
    `,
  });
}
