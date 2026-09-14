import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_EMAIL = "support@weartry.shop";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof message !== "string" ||
    !message.trim() ||
    typeof email !== "string" ||
    !EMAIL_RE.test(email)
  ) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  try {
    await getResend().emails.send({
      from: "WearTry Contact Form <support@weartry.shop>",
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 18px; color: #111;">New contact form message</h1>
          <p style="font-size: 14px; color: #333;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="font-size: 14px; color: #333;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="font-size: 14px; color: #333; white-space: pre-wrap;"><strong>Message:</strong><br />${escapeHtml(message)}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[contact] send error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
