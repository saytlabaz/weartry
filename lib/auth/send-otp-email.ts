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

export type OtpEmailPurpose = "register" | "password_reset" | "password_change" | "email_change" | "account_delete";

const COPY: Record<OtpEmailPurpose, { subject: { az: string; en: string }; heading: { az: string; en: string }; warning?: { az: string; en: string } }> = {
  register: {
    subject: { az: "WearTry hesabınızı təsdiqləyin", en: "Verify your WearTry account" },
    heading: { az: "Hesabınızı təsdiqləmək üçün kod", en: "Your account verification code" },
  },
  password_reset: {
    subject: { az: "WearTry şifrə sıfırlama kodu", en: "Your WearTry password reset code" },
    heading: { az: "Şifrənizi sıfırlamaq üçün kod", en: "Your password reset code" },
  },
  password_change: {
    subject: { az: "WearTry şifrə dəyişikliyi təsdiqi", en: "Confirm your WearTry password change" },
    heading: { az: "Şifrənizi dəyişmək üçün kod", en: "Your password change code" },
  },
  email_change: {
    subject: { az: "WearTry yeni email təsdiqi", en: "Confirm your new WearTry email" },
    heading: { az: "Yeni email ünvanınızı təsdiqləyin", en: "Confirm your new email address" },
  },
  account_delete: {
    subject: { az: "WearTry hesab silmə təsdiqi", en: "Confirm your WearTry account deletion" },
    heading: { az: "Hesabınızı silmək üçün kod", en: "Your account deletion code" },
    warning: {
      az: "Diqqət: bu əməliyyat hesabınızı və ona bağlı bütün məlumatları həmişəlik siləcək. Geri qaytarılması mümkün deyil.",
      en: "Warning: this will permanently delete your account and all associated data. This cannot be undone.",
    },
  },
};

const LOGO_URL = `${process.env.AUTH_URL ?? "https://weartry.shop"}/weartry-logo-black.png`;

export async function sendOtpEmail(
  email: string,
  code: string,
  locale: string = "az",
  purpose: OtpEmailPurpose = "register"
) {
  const lang = locale === "az" ? "az" : "en";
  const copy = COPY[purpose];

  await getResend().emails.send({
    from: "WearTry <support@weartry.shop>",
    to: email,
    subject: copy.subject[lang],
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <img src="${LOGO_URL}" alt="WearTry" width="120" style="display: block; height: auto; margin-bottom: 24px;" />
        <p style="font-size: 16px; color: #333;">${copy.heading[lang]}:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f5f5f5; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 16px 0;">
          ${code}
        </div>
        <p style="font-size: 13px; color: #888;">${lang === "az" ? "Bu kod 10 dəqiqə ərzində etibarlıdır." : "This code expires in 10 minutes."}</p>
        ${copy.warning ? `<p style="font-size: 13px; color: #b42318; margin-top: 16px;">${copy.warning[lang]}</p>` : ""}
      </div>
    `,
  });
}
