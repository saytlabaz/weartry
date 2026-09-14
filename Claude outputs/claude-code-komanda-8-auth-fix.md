# Claude Code Komandası — Auth axını düzəlişləri (OTP qaydası, panel açılmaması)

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Bu, `claude-code-komanda-7-auth.md`-də qurulmuş auth sisteminin davamıdır, iki konkret bugu düzəldir.

---

## Problem 1: Login zamanı email yazanda, qeydiyyatdan keçməmiş istifadəçiyə də kod göndərilir

`app/api/auth/otp/request/route.ts`-i tap. İndi bu route HƏR email üçün kod göndərir, amma LOGİN (giriş) axınında YALNIZ artıq mövcud olan istifadəçilərə kod göndərilməlidir — yeni istifadəçi "Hesab Yarat" (Register) axınından keçməlidir.

Bunu düzəltmək üçün `request` body-yə bir `mode` sahəsi əlavə et (`"login"` və ya `"register"`), route-u belə dəyiş:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, locale, mode } = await req.json();
  if (!email || typeof email !== "string" || !mode) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (mode === "login" && !existingUser) {
    return NextResponse.json(
      { error: "NO_ACCOUNT", message: "Bu email ilə qeydiyyatdan keçilməyib. Əvvəlcə hesab yaradın." },
      { status: 404 }
    );
  }

  if (mode === "register" && existingUser) {
    return NextResponse.json(
      { error: "ACCOUNT_EXISTS", message: "Bu email artıq qeydiyyatdan keçib. Daxil olun." },
      { status: 409 }
    );
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from("verification_tokens").delete().eq("identifier", email);
  await supabase.from("verification_tokens").insert({
    identifier: email,
    token: code,
    expires,
  });

  await sendOtpEmail(email, code, locale ?? "az");

  return NextResponse.json({ success: true });
}
```

Login/Register UI-larında (`app/[locale]/account/login/page.tsx` və ya müvafiq komponentlər) "Kod göndər" düyməsi basılanda `POST /api/auth/otp/request`-ə `mode: "login"` (Login tab-ında) və ya `mode: "register"` (Register tab-ında) ötür. Əgər cavab `404` (`NO_ACCOUNT`) və ya `409` (`ACCOUNT_EXISTS`) qaytarırsa, formada AYDIN bir xəbərdarlıq mesajı göstər (məsələn "Bu email ilə hesab tapılmadı, qeydiyyatdan keçin" / "Bu email artıq mövcuddur, daxil olun" — uyğun tab-a keçid linki ilə birlikdə), OTP kod ekranına KEÇMƏ.

---

## Problem 2: "Hesab Yarat" (Register) və Google girişindən sonra istifadəçi paneli açılmır, səhifə həmin yerdə qalır

Bunun səbəbi: `POST /api/auth/otp/verify` uğurlu cavab qaytarır və cookie qoyur, AMMA frontend bu cavabdan sonra heç bir yönləndirmə (`router.push`) etmir, YA DA server-side `auth()` funksiyası bu custom cookie-ni tanımır (çünki Auth.js-in öz session strukturu ilə bizim custom `sessions` insert-imiz arasında uyğunsuzluq var).

Bunu düzəltmək üçün EN ETİBARLI yol — OTP təsdiqindən sonra server-side redirect etmək əvəzinə, client-side-da uğurlu cavabı aldıqdan sonra tam səhifə yenilənməsi ilə ana səhifəyə keçid etməkdir (bu, server-in yeni qoyulan session cookie-ni növbəti sorğuda tanımasını təmin edir):

`components/account/LoginForm.tsx` (və ya faktiki OTP-təsdiq componentində) bu məntiqi tap/əlavə et:

```tsx
async function handleVerifyOtp(email: string, code: string, extra?: { fullName?: string; gender?: string }) {
  const res = await fetch("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, ...extra }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.error ?? "Kod yanlışdır");
    return;
  }

  // VACİB: router.push YOX — tam səhifə yüklənməsi ilə get ki, server
  // yeni cookie-ni dərhal tanısın və Header-də "daxil olmuş" vəziyyəti görünsün.
  window.location.href = "/";
}
```

`router.push("/")` və ya `router.replace("/")` istifadə EDİLMİR bilərəkdən — Next.js-in client-side naviqasiyası bəzən təzə qoyulmuş cookie-ni server component-lərin növbəti render-ində görməyə bilir, `window.location.href` isə tam browser naviqasiyası edərək bu problemi aradan qaldırır.

### Google girişi üçün əlavə yoxlama

`signIn("google", { callbackUrl: "/" })` çağırışının özü artıq tam səhifə redirect-i edir (Auth.js-in daxili davranışı budur), buna görə Google girişində bu problem NORMALDA olmamalıdır. Əgər Google girişindən sonra da panel açılmırsa (yəni Header hələ "Daxil ol" göstərir), bunun səbəbi çox güman ki, YUXARIDAKI `AUTH_URL` environment variable-ının əskik olmasıdır (bu, `.md` faylında ayrıca izah olunub, istifadəçi bunu əlavə edəcək) — kodda əlavə dəyişikliyə ehtiyac yoxdur, YALNIZ `auth.ts`-də `trustHost: true` sətrini əlavə et (Vercel kimi proxy arxasında işləyən mühitlərdə Auth.js-ə hostu etibar etməyi bildirir):

`auth.ts`-də `NextAuth({...})` çağırışına bu sətri əlavə et:

```ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: SupabaseAdapter({
    // ...
  }),
  // ... qalan hissə dəyişməz
});
```

---

## Problem 3 (əlaqəli): Header-də "daxil olmuş" vəziyyətinin göstərilməsi üçün auth() yoxlaması

Header-in server component olub-olmadığını yoxla (`components/layout/Header.tsx`). Əgər "use client" işarəsi yoxdursa (yəni server component-dirsə), bu şəkildə istifadəçi statusunu yoxla:

```tsx
import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();
  // session?.user varsa istifadəçi daxil olub, yoxdursa deyil
  // ...
}
```

Əgər Header artıq "use client" component-dirsə (animasiya/scroll-hide üçün lazım ola bilər), bu halda `useSession()` hook-unu istifadə et (`next-auth/react`-dan) VƏ layihənin kök tərəfində (`app/[locale]/layout.tsx`) `<SessionProvider>` ilə uşaqları sarmaladığına əmin ol:

`app/[locale]/layout.tsx`-də:
```tsx
import { SessionProvider } from "next-auth/react";
// ...
<SessionProvider>
  {/* mövcud header, children, footer və s. */}
</SessionProvider>
```

Header komponentində:
```tsx
"use client";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  // ...
}
```

---

## Ümumi tələblər

- `npm run lint` və `npm run build` xətasız keçməlidir.
- Login/Register formalarında bütün yeni xəta mesajlarını (`NO_ACCOUNT`, `ACCOUNT_EXISTS`) `useTranslations` ilə tərcümə et (ən azı `en`/`az`).
- Dəyişiklikləri mobil (390px) və desktop (1440px) enlərində test et: (1) qeydiyyatsız email ilə "Daxil ol" — xəbərdarlıq göstərməli, kod GÖNDƏRMƏMƏLİ; (2) yeni email ilə "Hesab Yarat" — kod göndərməli, təsdiqdən sonra ana səhifəyə keçməli VƏ Header-də istifadəçinin daxil olduğu görünməli; (3) mövcud email ilə "Hesab Yarat" — xəbərdarlıq göstərməli.

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Fix OTP flow to require registration before login, and fix post-auth redirect and session detection"
git push origin main
```
