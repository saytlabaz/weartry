import { auth } from "@/lib/admin/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { adminLogoutAction } from "../../actions";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Hesab / Ayarlar</h1>
      <AccountForm email={session?.user?.email ?? ""} />
      <form action={adminLogoutAction}>
        <Button type="submit" variant="outline" className="gap-1.5">
          <LogOut className="h-4 w-4" />
          Çıxış Et
        </Button>
      </form>
    </div>
  );
}
