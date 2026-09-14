"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/admin/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const MIN_PASSWORD_LENGTH = 8;

export async function updateAdminAccount(formData: FormData): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sessiya tapılmadı, yenidən daxil olun." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("newPassword") ?? "");

  const admin = await prisma.adminUser.findUnique({ where: { id: session.user.id } });
  if (!admin) return { error: "Admin tapılmadı." };

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) return { error: "Cari parol yanlışdır." };

  if (newPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Yeni parol minimum ${MIN_PASSWORD_LENGTH} simvol olmalıdır.` };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      email: newEmail || admin.email,
      passwordHash: newPassword ? await hashPassword(newPassword) : admin.passwordHash,
    },
  });

  return { success: "Hesab məlumatları yeniləndi." };
}
