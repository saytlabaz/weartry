# Claude Code Komandası — Auth sisteminin BÜTÜN buglarının kökdən düzəlişi

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Bu, `komanda-7-auth.md` ilə qurulan auth sistemindəki BÜTÜN bilinən problemləri (AdapterError, OTP verify 400 xətası, login/register-dən sonra panelin açılmaması, qeydiyyatsız istifadəçiyə OTP göndərilməsi) tək komandada həll edir.

**VACİB ÖN ŞƏRT:** Bu komandanı verməzdən əvvəl `1-SUPABASE-SQL-ISHE-SAL.md`-dəki SQL-i Supabase SQL Editor-də mütləq işə salmış olmalısan (cədvəllər yaradılmayıbsa, aşağıdakı kod düzəlişləri də işləməyəcək).

---

## Problem 0 (KÖK SƏBƏB): `SupabaseAdapter`-in `secret` parametri yanlışdır

`auth.ts` faylını tap. Hazırda `SupabaseAdapter({ url, secret: process.env.SUPABASE_SERVICE_ROLE_KEY })` şəklindədir. Bu SƏHVDIR — `@auth/supabase-adapter` paketinin `secret` parametri Supabase-in **service_role key**-i yox, Supabase-in **JWT Secret**-idir (fərqli bir dəyər).

Bunu düzəlt:

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { SupabaseAdapter } from "@auth/supabase-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_JWT_SECRET!,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "WearTry <support@weartry.shop>",
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/account/login",
  },
  secret: process.env.AUTH_SECRET,
});
```

Diqqət: `SUPABASE_SERVICE_ROLE_KEY` env dəyişəni hələ də LAZIMDIR (custom OTP route-ları bunu istifadə edir, aşağıda dəyişməz qalır) — sadəcə `auth.ts`-dəki `SupabaseAdapter`-in `secret` sahəsi indi YENİ bir env dəyişəni (`SUPABASE_JWT_SECRET`) istifadə edir.

Bunu Claude Code-a da bildir (kommentə əlavə et və ya README-yə yaz):
> İSTİFADƏÇİYƏ XATIRLATMA: Vercel-ə YENİ bir environment variable əlavə edilməlidir: `SUPABASE_JWT_SECRET`. Dəyəri Supabase Dashboard → Project Settings → **Data API** (və ya **API**) → **JWT Keys** bölməsindən götürülür ("Legacy JWT Secret" adlanan sahə). Bu, `SUPABASE_SERVICE_ROLE_KEY`-dən FƏRQLİ bir dəyərdir.

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

## Problem 2: OTP `verify` sorğusu 400 (Bad Request) qaytarır, hesab yaradılsa belə səhifə açılmır

`app/api/auth/otp/verify/route.ts`-i tap. Hazırkı kodda `.single()` istifadə olunur — əgər sətir tapılmasa (kod səhvdirsə, vaxtı bitibsə, YA DA `verification_tokens` cədvəli boşdursa/mövcud deyilsə) bu, Supabase-dən xəta atır və route düzgün 400 mesajı qaytarmadan çökür. Bunu daha etibarlı et və hər addımda konkret xəta mesajları qaytar:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code, fullName, gender } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: tokenRow, error: tokenError } = await supabase
    .from("verification_tokens")
    .select("*")
    .eq("identifier", email)
    .eq("token", code)
    .maybeSingle();

  if (tokenError) {
    console.error("[otp/verify] token lookup error:", tokenError);
    return NextResponse.json({ error: "SERVER_ERROR", message: tokenError.message }, { status: 500 });
  }

  if (!tokenRow) {
    return NextResponse.json({ error: "INVALID_CODE", message: "Kod yanlışdır" }, { status: 400 });
  }

  if (new Date(tokenRow.expires) < new Date()) {
    return NextResponse.json({ error: "CODE_EXPIRED", message: "Kodun vaxtı bitib" }, { status: 400 });
  }

  await supabase.from("verification_tokens").delete().eq("identifier", email);

  // İstifadəçini tap və ya yarat
  let { data: user, error: userLookupError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (userLookupError) {
    console.error("[otp/verify] user lookup error:", userLookupError);
    return NextResponse.json({ error: "SERVER_ERROR", message: userLookupError.message }, { status: 500 });
  }

  if (!user) {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        full_name: fullName ?? null,
        gender: gender ?? null,
        emailVerified: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[otp/verify] user insert error:", insertError);
      return NextResponse.json({ error: "SERVER_ERROR", message: insertError.message }, { status: 500 });
    }
    user = newUser;
  }

  // Sessiya yarat (Auth.js-in sessions cədvəlinə uyğun)
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error: sessionError } = await supabase.from("sessions").insert({
    userId: user!.id,
    sessionToken: sessionToken,
    expires: sessionExpires,
  });

  if (sessionError) {
    console.error("[otp/verify] session insert error:", sessionError);
    return NextResponse.json({ error: "SERVER_ERROR", message: sessionError.message }, { status: 500 });
  }

  const response = NextResponse.json({ success: true, user });
  response.cookies.set("authjs.session-token", sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(sessionExpires),
  });
  return response;
}
```

**QEYD:** `insert`-dəki sütun adları Supabase-də tərnırnşəkildə (`"userId"`, `"sessionToken"`) yaradılıb (böyük hərflə, dırnaqlı) — Supabase JS client-i JS obyekt açarlarını olduğu kimi göndərir, buna görə kodda `userId`/`sessionToken` yazmaq kifayətdir, JS client bunları avtomatik dırnaqlı sütun adına uyğunlaşdırır. Əgər `npm run build` zamanı sütun adı ilə bağlı xəta çıxsa, bu sahələri `"userId"` / `"sessionToken"` (dırnaqlı string açar) şəklinə çevir.

Frontend tərəfdə (`components/account/LoginForm.tsx` və ya faktiki OTP-təsdiq componentində) `verify` sorğusunun cavabındakı `error` sahəsini oxuyub istifadəçiyə göstər (indiyə qədər sükutla uğursuz olurdu, indi konkret mesaj göstərilməlidir):

```tsx
async function handleVerifyOtp(email: string, code: string, extra?: { fullName?: string; gender?: string }) {
  const res = await fetch("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, ...extra }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.message ?? data.error ?? "Kod yanlışdır");
    return;
  }

  // VACİB: router.push YOX — tam səhifə yüklənməsi ilə get ki, server
  // yeni cookie-ni dərhal tanısın və Header-də "daxil olmuş" vəziyyəti görünsün.
  window.location.href = "/";
}
```

`router.push("/")` və ya `router.replace("/")` istifadə EDİLMİR bilərəkdən — Next.js-in client-side naviqasiyası bəzən təzə qoyulmuş cookie-ni server component-lərin növbəti render-ində görməyə bilir, `window.location.href` isə tam browser naviqasiyası edərək bu problemi aradan qaldırır.

---

## Problem 3: Header-də "daxil olmuş" vəziyyətinin göstərilməsi

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
- Login/Register formalarında bütün yeni xəta mesajlarını (`NO_ACCOUNT`, `ACCOUNT_EXISTS`, `INVALID_CODE`, `CODE_EXPIRED`, `SERVER_ERROR`) `useTranslations` ilə tərcümə et (ən azı `en`/`az`).
- Dəyişiklikləri mobil (390px) və desktop (1440px) enlərində test et: (1) qeydiyyatsız email ilə "Daxil ol" — xəbərdarlıq göstərməli, kod GÖNDƏRMƏMƏLİ; (2) yeni email ilə "Hesab Yarat" — kod göndərməli, təsdiqdən sonra ana səhifəyə keçməli VƏ Header-də istifadəçinin daxil olduğu görünməli; (3) mövcud email ilə "Hesab Yarat" — xəbərdarlıq göstərməli; (4) Google ilə giriş — birbaşa uğurlu olmalı.
- Kod bitdikdən sonra Claude Code istifadəçiyə (mənə) aydın şəkildə xatırlatsın: "Vercel-ə YENİ env variable əlavə et: `SUPABASE_JWT_SECRET` (Supabase → Project Settings → Data API → JWT Keys → Legacy JWT Secret), sonra Redeploy et."

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Fix Supabase adapter secret, OTP verify error handling, registration gating, and post-auth redirect"
git push origin main
```
