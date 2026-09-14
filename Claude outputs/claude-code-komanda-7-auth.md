# Claude Code Komandası — Auth.js + Google Login + Email OTP (Resend) + Supabase Database

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsi (`weartry`). Bu komanda əvvəlki UI-only login/register səhifəsini (`claude-code-komanda-6.md`-də təsvir olunan) REAL işləyən autentifikasiya sistemi ilə birləşdirir: Google ilə giriş, email OTP (birdəfəlik kod) girişi, və Supabase-də saxlanan istifadəçi/sifariş məlumatları.

Sonda `npm run lint` və `npm run build` xətasız keçməlidir, sonra ÖZÜN (soruşmadan) commit + push et.

---

## 0. ENV DƏYİŞƏNLƏRİ — bunları SƏN (istifadəçi) əlavə edəcəksən, Claude Code deyil

> **VAXT MƏSƏLƏSİ:** Bu addımı (Vercel-ə key-ləri əlavə etmək) İNDİ, Claude Code-a bu komandanı verməzdən ƏVVƏL də edə bilərsən, YA DA Claude Code kodu yazıb bitirdikdən, amma sən "deploy et" deməzdən əvvəl də edə bilərsən — sıra önəmli deyil, TƏK VACİB OLAN: kod production-a (weartry.shop-a) push olunub deploy olunmazdan ƏVVƏL bu 8 dəyər Vercel-də mövcud olmalıdır, yoxsa sayt "Internal Server Error" verər (çünki kod `process.env.RESEND_API_KEY` kimi dəyərləri tapa bilməyəcək). Ən sadəsi: İNDİ, bu mesajı oxuyandan sonra, Vercel Dashboard-a keçib 8 dəyəri əlavə et, sonra Claude Code-a komandanı ver.

Claude Code-a bu qeydi olduğu kimi göstər:

> Mən (istifadəçi) aşağıdakı 8 environment variable-ı artıq **Vercel Dashboard → Project → Settings → Environment Variables** bölməsinə ƏLAVƏ ETMİŞƏM (həm "Production", həm "Preview", həm "Development" mühitləri üçün işarələnib):
>
> ```
> RESEND_API_KEY
> NEXT_PUBLIC_SUPABASE_URL
> NEXT_PUBLIC_SUPABASE_ANON_KEY
> SUPABASE_SERVICE_ROLE_KEY
> DATABASE_URL
> GOOGLE_CLIENT_ID
> GOOGLE_CLIENT_SECRET
> AUTH_SECRET
> ```
>
> Sən (Claude Code) bu dəyərlərin HƏQİQİ məzmununu bilmirsən və bilməməlisən — kodda YALNIZ `process.env.RESEND_API_KEY` kimi referanslarla istifadə et, heç bir yerdə həqiqi key dəyərini hardcode etmə.
>
> Lokal test üçün, layihənin kök qovluğunda `.env.local` faylı yarat (bu fayl artıq `.gitignore`-dadır, commit olunmayacaq) və bu 8 dəyişəni oraya öz həqiqi dəyərlərinlə əlavə et — bu addımı SƏN (istifadəçi) əl ilə edəcəksən, Claude Code-un bunu görməsinə ehtiyac yoxdur, sadəcə kodun bu adlarla `process.env`-dən oxuduğuna əmin ol.

**QEYD:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` dəyəri Supabase-in yeni interfeysindəki "Publishable key"-dir (əvvəlki "anon public" key-in yeni adı) — funksionallıq eynidir, sadəcə adı dəyişib.

---

## 1. Paketləri quraşdır

```bash
npm install next-auth@beta @auth/supabase-adapter @supabase/supabase-js resend
```

- `next-auth@beta` — Auth.js v5 (Next.js App Router üçün rəsmi versiya).
- `@auth/supabase-adapter` — Auth.js-in istifadəçi/sessiya datasını Supabase-də saxlaması üçün adapter.
- `@supabase/supabase-js` — Supabase client.
- `resend` — email göndərmək üçün rəsmi SDK.

**QEYD:** Resend-in dashboard-unda AYRICA "Email Template" yaratmağa EHTİYAC YOXDUR — OTP email-inin HTML görünüşü aşağıda (4-cü addımda) birbaşa kodun içində (`send-otp-email.ts` faylında) yazılıb, kod özü email-i formatlayıb göndərir. Resend tərəfində yalnız domen təsdiqi və API Key kifayətdir (bunlar artıq hazırdır).

---

## 2. Supabase-də cədvəlləri yarat

`@auth/supabase-adapter`-in tələb etdiyi standart cədvəlləri (users, accounts, sessions, verification_tokens) YARADIN. Bunun üçün layihənin kök qovluğunda `supabase/migrations/001_auth_tables.sql` faylı yarat, məzmunu:

```sql
-- Auth.js Supabase Adapter tələb etdiyi standart sxem
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  gender text,
  "emailVerified" timestamptz,
  image text,
  created_at timestamptz default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique(provider, "providerAccountId")
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  expires timestamptz not null,
  "sessionToken" text not null unique
);

create table if not exists public.verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);

-- WearTry-a məxsus əlavə cədvəllər
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  email text not null,
  status text not null default 'pending',
  items jsonb not null,
  shipping_address jsonb not null,
  payment_method text not null,
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Row Level Security aktivləşdir
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.wishlists enable row level security;

-- Service role tam giriş (server-side, Auth.js adapter üçün)
create policy "Service role full access users" on public.users for all using (true) with check (true);
create policy "Service role full access orders" on public.orders for all using (true) with check (true);
create policy "Service role full access wishlists" on public.wishlists for all using (true) with check (true);
```

Bu SQL-i Claude Code AVTOMATIK icra edə bilmir (Supabase-ə birbaşa girişi yoxdur) — buna görə bu faylı yalnız YARAT (layihədə saxlanılsın), sonra mənə (istifadəçiyə) bunu Supabase Dashboard-un **"SQL Editor"** bölməsində əl ilə işə salmağı xatırlat (bir xəbərdarlıq mesajı ilə: "Bu SQL-i Supabase SQL Editor-də işə sal: supabase/migrations/001_auth_tables.sql").

---

## 3. Auth.js konfiqurasiyası

`auth.ts` (layihənin kök qovluğunda) yarat:

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { SupabaseAdapter } from "@auth/supabase-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "WearTry <support@weartry.shop>",
      // OTP-yə bənzər davranış üçün aşağıda 4-cü addımda göstərilən sendVerificationRequest override edilir
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/account/login",
  },
  secret: process.env.AUTH_SECRET,
});
```

`app/api/auth/[...nextauth]/route.ts` yarat:

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

---

## 4. Email OTP (6 rəqəmli kod) — Resend Provider-i özəlləşdir

Auth.js-in default `Resend` provider-i "magic link" (klikləmə linki) göndərir, biz isə 6 RƏQƏMLİ KOD istəyirik. Bunun üçün Resend provider-i özəlləşdirilmiş `sendVerificationRequest` funksiyası ilə qur:

`lib/auth/send-otp-email.ts` yarat:

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, code: string, locale: string = "az") {
  const subject = locale === "az" ? "WearTry giriş kodunuz" : "Your WearTry login code";
  await resend.emails.send({
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
```

Bu OTP kodlarını Supabase-in `verification_tokens` cədvəlində (identifier=email, token=6-rəqəmli-kod, expires=10 dəqiqə sonra) saxlamaq üçün ayrı bir API route yarat, ÇÜNKİ Auth.js-in standart Email provider axını magic-link-ə uyğunlaşdırılıb, tam OTP-forma axını üçün CUSTOM API route-lar daha etibarlıdır:

`app/api/auth/otp/request/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, locale } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // köhnə token-ları təmizlə
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

`app/api/auth/otp/verify/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: tokenRow } = await supabase
    .from("verification_tokens")
    .select("*")
    .eq("identifier", email)
    .eq("token", code)
    .single();

  if (!tokenRow || new Date(tokenRow.expires) < new Date()) {
    return NextResponse.json({ error: "Kod yanlış və ya vaxtı bitib" }, { status: 400 });
  }

  await supabase.from("verification_tokens").delete().eq("identifier", email);

  // İstifadəçini tap və ya yarat
  let { data: user } = await supabase.from("users").select("*").eq("email", email).single();
  if (!user) {
    const { data: newUser } = await supabase
      .from("users")
      .insert({ email, "emailVerified": new Date().toISOString() })
      .select()
      .single();
    user = newUser;
  }

  // Sadə sessiya yarat (Auth.js-in sessions cədvəlinə uyğun)
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("sessions").insert({
    "userId": user!.id,
    "sessionToken": sessionToken,
    expires: sessionExpires,
  });

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

---

## 5. Login/Register səhifəsini real funksionallıqla birləşdir

`claude-code-komanda-6.md`-də yaradılmış login/register UI-nı tap (`app/[locale]/account/login/page.tsx` və ya `components/account/LoginForm.tsx`) və bunları et:

- **"Google ilə daxil ol"** düyməsinin `onClick`-indəki placeholder-i əvəz et: `import { signIn } from "next-auth/react"` istifadə edərək `signIn("google", { callbackUrl: "/" })` çağır.
- Email input sahəsinin altındakı "Daxil ol" axınını dəyişdir: istifadəçi email yazıb "Kod göndər" düyməsinə basanda `POST /api/auth/otp/request` çağırılsın (email + cari locale ilə), uğurlu cavabdan sonra forma 6-rəqəmli kod daxiletmə ekranına keçsin (animasiyalı keçid, `AnimatePresence`).
- 6-rəqəmli kod daxil edilib "Təsdiqlə" basılanda `POST /api/auth/otp/verify` çağırılsın, uğurlu olarsa istifadəçini ana səhifəyə (`/`) yönləndir və session-storage/context-də "daxil olmuş istifadəçi" state-ini yenilə.
- Register formasındakı Google düyməsi eyni `signIn("google", { callbackUrl: "/" })` çağırışını istifadə etsin.
- Register formasındakı digər sahələr (Ad, Cinsiyyət, Şifrə) — Google/OTP girişi ilə şifrəyə ehtiyac YOXDUR, buna görə "Şifrə" sahəsini HƏLƏLİK gizli et (`hidden` və ya render etmə) VƏ formanın "Hesab Yarat" düyməsi basılanda: email OTP axınının eynisini işə sal (yəni "hesab yaratmaq" = email təsdiqi + Ad/Cinsiyyət-i `users` cədvəlinə yazmaq). Bunun üçün `POST /api/auth/otp/verify`-a əlavə optional `fullName` və `gender` sahələri ötür, backend-də istifadəçi yeni yaradılırsa bu sahələri də `users` cədvəlinə yaz.

---

## 6. Header-də istifadəçi vəziyyətini göstər

`components/layout/Header.tsx`-də account ikonu klik ediləndə: əgər istifadəçi daxil OLMAYIBSA `/account/login`-ə aparır (hazırkı davranış), əgər daxil OLUBSA kiçik bir dropdown açılsın ("Hesabım", "Sifarişlərim", "Çıxış"). Çıxış düyməsi `signOut()` (next-auth/react-dan) çağırsın.

---

## 7. Checkout səhifəsində real istifadəçi datası

`claude-code-komanda-6.md`-də yaradılan checkout səhifəsində mock/fake istifadəçi datası əvəzinə, əgər istifadəçi giriş edibsə (`auth()` server-side funksiyası ilə) onun `email`/`full_name` sahələrini formaya əvvəlcədən doldur. Sifariş tamamlananda (`POST /api/checkout` yeni route yarat) sifarişi `orders` cədvəlinə yaz (user_id, email, items, shipping_address, payment_method, subtotal, shipping_cost, total).

---

## Ümumi tələblər

- Bütün yeni UI mətnlərini (OTP ekranı, "Kod göndər", "Kodu daxil edin" və s.) `useTranslations` ilə et, ən azı `en`/`az` tam tərcümə.
- `npm run lint` və `npm run build` xətasız keçməlidir.
- HEÇ BİR yerdə (kod, commit mesajı, README) real API key/secret dəyərini yazma — yalnız `process.env.X` referansları.
- Mobil (390px) və desktop (1440px) enlərində OTP giriş axınını vizual yoxla, bütün keçidlər animasiyalı olsun.

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Add Google OAuth and email OTP authentication via Auth.js, Resend, and Supabase"
git push origin main
```

Vercel GitHub inteqrasiyası ilə `main`-ə push avtomatik production deploy tetikləyir.

---

## SƏNDƏN (istifadəçidən) TƏLƏB OLUNAN SON ADDIM (kod bitdikdən sonra)

Claude Code işini bitirdikdən sonra MÜTLƏQ bunu et:
1. Supabase Dashboard → SQL Editor-ə get, `supabase/migrations/001_auth_tables.sql` faylının məzmununu yapışdır və işə sal (cədvəlləri yaradır).
2. Vercel Dashboard → Settings → Environment Variables-da yuxarıda sadalanan 8 dəyərin hamısının doğru yazıldığını yoxla.
3. Deploy bitdikdən sonra `https://weartry.shop/account/login` səhifəsinə get, həm "Google ilə daxil ol", həm də email OTP axınını test et.
