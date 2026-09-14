import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Giriş — İdarəetmə Paneli" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">WearTry İdarəetmə Paneli</h1>
        <p className="mt-1 text-sm text-neutral-500">Davam etmək üçün daxil olun</p>
        <LoginForm />
      </div>
    </div>
  );
}
