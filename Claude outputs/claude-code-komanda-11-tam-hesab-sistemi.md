# Claude Code Komandası — Tam Hesab Sistemi (Şifrə əsaslı auth + Hesabım paneli)

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsi (`weartry`). Bu komanda mövcud auth sistemini (yalnız email-OTP idi) **email + şifrə əsaslı** sistemə çevirir və tam bir "Hesabım" idarəetmə paneli əlavə edir. Google OAuth toxunulmadan qalır.

Sonda `npm run lint` və `npm run build` xətasız keçməlidir, sonra ÖZÜN (soruşmadan) commit + push et.

---

## 0. Konsepsiya (bunu tam başa düş, sonra kodla)

- **Qeydiyyat (Create Account):** Ad, Soyad (ayrı-ayrı sahələr), Email, Şifrə, Şifrə təkrarı → "Kod göndər" → email-ə 6 rəqəmli OTP gəlir → kod təsdiqlənir → hesab yaranır (şifrə hash-lənmiş şəkildə saxlanır) → avtomatik giriş edilir.
- **Giriş (Login):** Email + Şifrə. OTP YOXDUR bu axında. Səhv şifrə → xəbərdarlıq + cəhd sayğacı artır.
- **Google ilə giriş/qeydiyyat:** Dəyişmir, mövcud `signIn("google")` axını qalır. Google ilə yaranan hesabın şifrəsi olmur (`password_hash = null`).
- **Şifrəni unutdum:** Email daxil et → OTP kod gələr → kod təsdiqlənəndə yeni şifrə təyin etmə formu açılır → şifrə yenilənir.
- **Mövcud hesab yoxlaması:** Register formunda istifadəçi artıq mövcud email yazıbsa (istər adi qeydiyyatla, istərsə Google ilə yaranmış olsun), OTP göndərmədən DAYANDIR, yaşıl fonda tick-işarəli animasiyalı bildiriş göstər: "Bu email artıq qeydiyyatdan keçib" + "Daxil ol" düyməsi ilə Login-ə yönləndir.
- **Session müddəti:** Çox uzun (30 gün rolling, "remember me" effekti — hər ziyarətdə yenilənsin ki, faktiki olaraq müddətsiz kimi hiss olunsun). İstifadəçi özü "Çıxış" etmədikcə sayt yenidən açılanda hesabı görünməlidir.
- **Rate-limit / blok:** Login şifrə cəhdi VƏ OTP kod cəhdi hər ikisi üçün ayrı-ayrı: 5 səhv cəhddən sonra 1 saatlıq blok (email və ya IP əsaslı, Supabase-də cədvəldə saxlanır — server yenidən başlasa belə itməsin).
- **Hesabım paneli (Account Dashboard):** Header-də istifadəçi ikonuna klikləyəndə (daxil olubsa) dropdown/panel açılır:
  - **Hesab Məlumatlarım:** Ad, Soyad, Email göstərilir, "Bu hesab ... ilə yaradılıb" (Email/Şifrə və ya Google) statusu göstərilir.
  - **Ad/Soyad dəyişmək** — birbaşa (kodsuz) yenilənə bilər.
  - **Email dəyişmək** — yeni email yazılır, YENİ email ünvanına təsdiq kodu göndərilir, kod təsdiqlənəndə email dəyişir.
  - **Şifrə dəyişmək** — kodla (cari email-ə OTP göndərilir, təsdiqlənəndə yeni şifrə təyin edilir). Google-la yaranmış hesablarda əvvəlcə "Google hesabınıza şifrə əlavə edin" axını kimi işləsin (mövcud şifrə tələb olunmadan, sadəcə OTP təsdiqi ilə ilk şifrə təyin edilə bilsin).
  - **Cinsiyyət dəyişmək** — sadə seçim (dropdown), kodsuz.
  - **Telefon nömrəsi əlavə etmək** — İSTƏYƏ BAĞLI sahə, kodsuz, sadə yenilənmə.
  - **Sifarişlərim** — ayrıca, kənarda bir bölmə/tab kimi (bax aşağı, bölmə 7).
- **Şifrə görünürlük düyməsi:** Bütün şifrə input-larında (login, register, yeni şifrə təyini) göz-ikonu ilə göstər/gizlət funksionallığı.
- **Animasiyalar:** Bütün düymələrdə hover/tap animasiyası (`whileHover`, `whileTap` framer-motion ilə), bütün panel açılış/bağlanışları `AnimatePresence` ilə, bildirişlər (uğur/xəta) slide-in/fade animasiyalı olsun. Trendyol/peşəkar səviyyəli, səliqəli, boşluqları düzgün paylanmış dizayn.

---

## 1. Paketlər

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

(`resend`, `@supabase/supabase-js`, `next-auth@beta`, `@auth/supabase-adapter` artıq quraşdırılıb, toxunma.)

---

## 2. Supabase sxem yeniləməsi

Yeni bir migrasiya faylı yarat: `supabase/migrations/002_password_auth.sql`:

```sql
-- users cədvəlinə şifrə sahəsi əlavə et
alter table public.users add column if not exists password_hash text;
alter table public.users add column if not exists phone text;

-- Rate-limit / blok cədvəli (login şifrə cəhdləri VƏ OTP cəhdləri üçün ortaq)
create table if not exists public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  identifier text not null, -- email
  attempt_type text not null, -- 'login_password' | 'otp_verify'
  failed_count int not null default 1,
  blocked_until timestamptz,
  updated_at timestamptz default now(),
  unique(identifier, attempt_type)
);

alter table public.auth_attempts enable row level security;
drop policy if exists "Service role full access auth_attempts" on public.auth_attempts;
create policy "Service role full access auth_attempts" on public.auth_attempts for all using (true) with check (true);

-- Email/şifrə dəyişikliyi üçün gözləyən (pending) dəyişiklikləri saxlamaq
create table if not exists public.pending_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  change_type text not null, -- 'email' | 'password'
  new_value text, -- email üçün: yeni email; şifrə üçün: null (kod təsdiqindən sonra ayrıca göndərilir)
  code text not null,
  expires timestamptz not null,
  created_at timestamptz default now()
);

alter table public.pending_changes enable row level security;
drop policy if exists "Service role full access pending_changes" on public.pending_changes;
create policy "Service role full access pending_changes" on public.pending_changes for all using (true) with check (true);
```

Bu faylı yalnız YARAT (Claude Code icra edə bilmir) — istifadəçiyə (mənə) SQL Editor-də işə salmağı xatırlat.

---

## 3. Şifrə hash yardımçı funksiyaları

`lib/auth/password.ts`:

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

---

## 4. Rate-limit yardımçı funksiyası

`lib/auth/rate-limit.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 saat

export async function checkBlocked(identifier: string, attemptType: string): Promise<{ blocked: boolean; minutesLeft?: number }> {
  const { data } = await supabase
    .from("auth_attempts")
    .select("*")
    .eq("identifier", identifier)
    .eq("attempt_type", attemptType)
    .maybeSingle();

  if (data?.blocked_until && new Date(data.blocked_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(data.blocked_until).getTime() - Date.now()) / 60000);
    return { blocked: true, minutesLeft };
  }
  return { blocked: false };
}

export async function recordFailedAttempt(identifier: string, attemptType: string): Promise<void> {
  const { data } = await supabase
    .from("auth_attempts")
    .select("*")
    .eq("identifier", identifier)
    .eq("attempt_type", attemptType)
    .maybeSingle();

  const newCount = (data?.failed_count ?? 0) + 1;
  const blockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + BLOCK_DURATION_MS).toISOString() : null;

  await supabase.from("auth_attempts").upsert(
    {
      identifier,
      attempt_type: attemptType,
      failed_count: newCount,
      blocked_until: blockedUntil,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "identifier,attempt_type" }
  );
}

export async function clearAttempts(identifier: string, attemptType: string): Promise<void> {
  await supabase.from("auth_attempts").delete().eq("identifier", identifier).eq("attempt_type", attemptType);
}
```

---

## 5. `auth.ts` — Credentials provider əlavə et

Mövcud `auth.ts`-ə (Google + Resend provider-ləri saxlayaraq) bir `Credentials` provider əlavə et, session strategiyasını uzun müddətli et:

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "@/lib/auth/password";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const { blocked } = await checkBlocked(email, "login_password");
        if (blocked) {
          throw new Error("BLOCKED");
        }

        const { data: user } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!user || !user.password_hash) {
          await recordFailedAttempt(email, "login_password");
          throw new Error("INVALID_CREDENTIALS");
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
          await recordFailedAttempt(email, "login_password");
          throw new Error("INVALID_CREDENTIALS");
        }

        await clearAttempts(email, "login_password");
        return { id: user.id, email: user.email, name: user.full_name, image: user.image };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Credentials provider ilə database strategiyası dəstəklənmir, JWT istifadə olunur
    maxAge: 30 * 24 * 60 * 60, // 30 gün, hər ziyarətdə yenilənir (rolling)
  },
  pages: {
    signIn: "/account/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
```

**VACİB QEYD:** `session.strategy` `"database"`-dan `"jwt"`-ə dəyişir, çünki `Credentials` provider Auth.js-də yalnız JWT strategiyası ilə işləyir. Google OAuth da eyni NextAuth instansiyasında olduğu üçün o da avtomatik JWT strategiyasına keçəcək — bu normaldır, funksionallıq itmir, sessiyalar `sessions` cədvəli əvəzinə imzalanmış cookie-də saxlanılır. `maxAge: 30 gün` + Auth.js-in defolt rolling-refresh davranışı ("update age" defolt 24 saatdır) sayəsində aktiv istifadəçi üçün sessiya faktiki olaraq müddətsiz davam edir.

---

## 6. API route-lar

### 6.1 `app/api/auth/register/route.ts` (yeni)

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";
import { hashPassword } from "@/lib/auth/password";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password, locale } = await req.json();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 });
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json({ error: "ACCOUNT_EXISTS" }, { status: 409 });
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const passwordHash = await hashPassword(password);

  // Qeydiyyat məlumatlarını müvəqqəti saxla (verification_tokens-un "token" sahəsinə JSON kodlanmış şəkildə deyil,
  // ayrıca bir pending_registrations məntiqi əvəzinə sadəlik üçün verification_tokens + ayrıca müvəqqəti saxlama)
  await supabase.from("verification_tokens").delete().eq("identifier", email);
  await supabase.from("verification_tokens").insert({
    identifier: email,
    token: code,
    expires,
  });

  // Müvəqqəti qeydiyyat datasını pending_changes cədvəlində saxla (change_type: 'register')
  await supabase.from("pending_changes").delete().eq("user_id", "00000000-0000-0000-0000-000000000000").eq("change_type", "register_" + email);
  await supabase.from("pending_changes").insert({
    user_id: "00000000-0000-0000-0000-000000000000",
    change_type: `register_${email}`,
    new_value: JSON.stringify({ firstName, lastName, email, passwordHash }),
    code,
    expires,
  });

  await sendOtpEmail(email, code, locale ?? "az");

  return NextResponse.json({ success: true });
}
```

**QEYD Claude Code üçün:** `pending_changes.user_id` NOT NULL FOREIGN KEY olduğu üçün yuxarıdakı `"00000000-0000-0000-0000-000000000000"` placeholder-i işləməyəcək. Bunun əvəzinə, `002_auth_password.sql`-də `pending_changes.user_id`-ni **nullable** et (`references public.users(id) on delete cascade` saxla, amma sütunun özünü `not null` ETMƏ — yuxarıdakı SQL-də artıq `not null` yazılmayıb, diqqətlə yoxla) və registration zamanı `user_id` sahəsini `null` olaraq göndər, `change_type`-ı isə `register` et, identifikasiya üçün AYRICA bir `identifier` (email) sütunu əlavə et `pending_changes` cədvəlinə. Yəni `002_password_auth.sql`-i bu şəkildə DÜZƏLT (yuxarıdakı versiyanı əvəz et):

```sql
create table if not exists public.pending_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade, -- register üçün NULL ola bilər
  identifier text not null, -- email (register/email-dəyişimi/şifrə-bərpası hamısı üçün açar)
  change_type text not null, -- 'register' | 'email' | 'password_reset' | 'password_change'
  new_value text,
  code text not null,
  expires timestamptz not null,
  created_at timestamptz default now()
);
```

Və bütün route-larda `pending_changes`-ə yazarkən `identifier: email` sahəsini istifadə et, `change_type`-ı sadə saxla (`register`, `email`, `password_reset`, `password_change`), axtarışları `identifier` + `change_type` ilə et.

### 6.2 `app/api/auth/register/verify/route.ts` (yeni)

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const { blocked, minutesLeft } = await checkBlocked(email, "otp_verify");
  if (blocked) {
    return NextResponse.json({ error: "BLOCKED", minutesLeft }, { status: 429 });
  }

  const { data: pending } = await supabase
    .from("pending_changes")
    .select("*")
    .eq("identifier", email)
    .eq("change_type", "register")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pending || pending.code !== code) {
    await recordFailedAttempt(email, "otp_verify");
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
  }
  if (new Date(pending.expires) < new Date()) {
    return NextResponse.json({ error: "CODE_EXPIRED" }, { status: 400 });
  }

  await clearAttempts(email, "otp_verify");

  const regData = JSON.parse(pending.new_value!);
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      email: regData.email,
      full_name: `${regData.firstName} ${regData.lastName}`,
      password_hash: regData.passwordHash,
      emailVerified: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "SERVER_ERROR", message: insertError.message }, { status: 500 });
  }

  await supabase.from("pending_changes").delete().eq("id", pending.id);
  await supabase.from("verification_tokens").delete().eq("identifier", email);

  return NextResponse.json({ success: true, email: newUser.email });
}
```

Qeyd: qeydiyyat OTP-si təsdiqləndikdən sonra frontend avtomatik `signIn("credentials", { email, password, redirect: false })` çağırıb, sonra `window.location.href = "/"` etsin (şifrəni frontend-də müvəqqəti state-də saxla, submit zamanı istifadə et, sonra təmizlə).

### 6.3 `app/api/auth/forgot-password/route.ts` (yeni)

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
  if (!email) return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });

  const { data: user } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (!user) {
    return NextResponse.json({ error: "NO_ACCOUNT" }, { status: 404 });
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from("pending_changes").delete().eq("identifier", email).eq("change_type", "password_reset");
  await supabase.from("pending_changes").insert({
    identifier: email,
    change_type: "password_reset",
    code,
    expires,
  });

  await sendOtpEmail(email, code, locale ?? "az");
  return NextResponse.json({ success: true });
}
```

### 6.4 `app/api/auth/forgot-password/reset/route.ts` (yeni)

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "@/lib/auth/password";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();
  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 });
  }

  const { blocked, minutesLeft } = await checkBlocked(email, "otp_verify");
  if (blocked) {
    return NextResponse.json({ error: "BLOCKED", minutesLeft }, { status: 429 });
  }

  const { data: pending } = await supabase
    .from("pending_changes")
    .select("*")
    .eq("identifier", email)
    .eq("change_type", "password_reset")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pending || pending.code !== code) {
    await recordFailedAttempt(email, "otp_verify");
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
  }
  if (new Date(pending.expires) < new Date()) {
    return NextResponse.json({ error: "CODE_EXPIRED" }, { status: 400 });
  }

  await clearAttempts(email, "otp_verify");

  const passwordHash = await hashPassword(newPassword);
  await supabase.from("users").update({ password_hash: passwordHash }).eq("email", email);
  await supabase.from("pending_changes").delete().eq("id", pending.id);

  return NextResponse.json({ success: true });
}
```

### 6.5 `app/api/account/update-profile/route.ts` (yeni) — Ad/Soyad/Cinsiyyət/Telefon (kodsuz)

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { fullName, gender, phone } = await req.json();
  const updates: Record<string, string> = {};
  if (fullName !== undefined) updates.full_name = fullName;
  if (gender !== undefined) updates.gender = gender;
  if (phone !== undefined) updates.phone = phone;

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", (session.user as { id: string }).id);

  if (error) return NextResponse.json({ error: "SERVER_ERROR", message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

### 6.6 `app/api/account/change-email/request/route.ts` və `app/api/account/change-email/verify/route.ts` (yeni)

`request`: giriş etmiş istifadəçi yeni email yazır → yeni email-ə kod göndərilir (`pending_changes`, `change_type: 'email'`, `identifier: cari_email`, `new_value: yeni_email`). Yeni email artıq başqa hesabda mövcuddursa → `409 EMAIL_TAKEN` qaytar.

`verify`: kod təsdiqlənəndə `users.email`-i `new_value`-ya yenilə, `pending_changes` sətrini sil.

(Claude Code: yuxarıdakı `register`/`forgot-password` route-larının eyni nümunəsi ilə tikilməlidir — `auth()` ilə session yoxlanılır, kod OTP eyni `generateOtpCode`/`sendOtpEmail` funksiyaları ilə göndərilir.)

### 6.7 `app/api/account/change-password/request/route.ts` və `.../verify/route.ts` (yeni)

`request`: giriş etmiş istifadəçinin öz email-inə OTP göndərilir (`change_type: 'password_change'`).
`verify`: kod + yeni şifrə göndərilir, təsdiqlənəndə `password_hash` yenilənir. (Google-la yaranmış, hələ şifrəsi olmayan hesablar üçün eyni axın "ilk şifrəni təyin et" kimi işləyir — kodda fərq yoxdur, sadəcə UI mətni fərqli olsun: "Şifrə əlavə et" vs "Şifrəni dəyiş".)

---

## 7. Login/Register/Şifrə-unutdum UI

`app/[locale]/account/login/page.tsx` (və komponentləri) tam yenidən qur:

- **Login formu:** Email, Şifrə (göz-ikonu ilə göstər/gizlət), "Daxil ol" düyməsi, altında "Şifrəni unutdum?" linki. `signIn("credentials", { email, password, redirect: false })` çağır. Xəta halında: `INVALID_CREDENTIALS` → "Email və ya şifrə yanlışdır", `BLOCKED` → "Çox sayda səhv cəhd. 1 saat sonra yenidən cəhd edin."
- **Register formu:** Ad, Soyad (2 ayrı input), Email, Şifrə, Şifrə təkrarı (hər ikisi göz-ikonu ilə). Submit-də əvvəlcə frontend-də şifrələrin uyğunluğunu və minimum 8 simvol olduğunu yoxla, sonra `POST /api/auth/register`. `409 ACCOUNT_EXISTS` cavabında: OTP ekranına KEÇMƏ, əvəzinə yaşıl fonlu, tick-ikonlu, animasiyalı (`scale`+`fade` ilə) bir bildiriş kartı göstər: "Bu email artıq qeydiyyatdan keçib" + "Daxil olun" düyməsi (Login tab-ına keçirir, email-i doldurulmuş saxlayır).
- **OTP təsdiq ekranı (register üçün):** 6 xanəli kod inputu, təsdiqləndikdə `POST /api/auth/register/verify`, uğurlu olarsa arxa planda `signIn("credentials", {...})` çağırıb `window.location.href = "/"`.
- **"Şifrəni unutdum" axını (ayrı bir kiçik modal və ya səhifə, `/account/forgot-password`):** 1) Email daxil et → `POST /api/auth/forgot-password`. `404 NO_ACCOUNT` → "Bu email ilə hesab tapılmadı". 2) OTP kod ekranı. 3) Yeni şifrə + təkrarı (göz-ikonu ilə) → `POST /api/auth/forgot-password/reset`. Uğurlu olduqda avtomatik Login-ə yönləndir, "Şifrəniz yeniləndi, indi daxil ola bilərsiniz" bildirişi göstər.
- **Bütün keçidlər** `AnimatePresence` + `motion.div` ilə slide/fade animasiyalı olsun, bütün düymələr `whileHover={{ scale: 1.02 }}` `whileTap={{ scale: 0.97 }}` istifadə etsin.
- Şifrə göz-ikonu üçün ortaq kiçik komponent yarat: `components/ui/PasswordInput.tsx` (input type toggle `password`/`text`, sağda göz/göz-bağlı SVG ikonu, klikləyəndə animasiyalı dəyişsin).

---

## 8. Hesabım Paneli (`/account` və ya Header dropdown → "Hesabım" səhifəsi)

Yeni səhifə: `app/[locale]/account/page.tsx` (giriş edilməyibsə `/account/login`-ə redirect, server-side `auth()` ilə yoxla).

Dizayn: sol tərəfdə (və ya mobil üçün üstdə tab formasında) naviqasiya menyusu, sağda seçilmiş bölmənin içəriyi — trend/peşəkar e-ticarət sayt (Trendyol-vari) "Hesabım" panel görünüşü, animasiyalı tab keçidləri:

1. **Hesab Məlumatlarım** (default aktiv tab):
   - Ad, Soyad, Email göstərilir (kart şəklində, səliqəli).
   - "Bu hesab **Email və Şifrə** ilə yaradılıb" və ya "Bu hesab **Google** ilə yaradılıb" — kiçik badge/etiket (fərqli ikonla: zərf ikonu / Google logosu).
   - Hər sahənin yanında "Dəyişdir" düyməsi:
     - Ad/Soyad → inline edit (kodsuz, birbaşa "Yadda saxla" ilə `POST /api/account/update-profile`).
     - Email → kiçik modal açılır, yeni email inputu + "Kod göndər" → OTP inputu → "Təsdiqlə".
     - Şifrə → kiçik modal, "Kod göndər" (cari email-ə) → OTP inputu → yeni şifrə + təkrarı (göz-ikonu ilə) → "Yadda saxla".
     - Cinsiyyət → dropdown (Kişi/Qadın/Bildirmək istəmirəm), birbaşa yadda saxlanır.
     - Telefon nömrəsi → input (İSTƏYƏ BAĞLI yazısı ilə), birbaşa yadda saxlanır.
   - Bütün uğurlu əməliyyatlardan sonra yaşıl, tick-ikonlu, animasiyalı bir "toast" bildirişi göstər (sağ üst küncdə, 3 saniyə sonra fade-out).

2. **Sifarişlərim** (ayrıca tab, kənarda görünsün — istifadəçinin qeyd etdiyi kimi "orada kənarda olsun"):
   - `orders` cədvəlindən `user_id`-ə görə sifarişləri çək, kart şəklində göstər (sifariş nömrəsi, tarix, status badge-i — rəngli: gözləyir/sarı, göndərildi/mavi, çatdırıldı/yaşıl, ləğv/qırmızı — məhsul sayı, cəmi məbləğ). Boş olduqda animasiyalı empty-state ("Hələ sifarişiniz yoxdur" + "Alış-verişə başla" düyməsi, `/` səhifəsinə aparır).

Header-dəki hesab ikonu klikləndikdə (daxil olub-olunmamasından asılı olmayaraq): daxil OLUBSA kiçik bir dropdown (framer-motion `AnimatePresence` ilə) açılır — "Hesabım", "Sifarişlərim" (birbaşa həmin tab-a keçid), "Çıxış" seçimləri; daxil OLMAYIBSA birbaşa `/account/login`-ə aparır.

---

## 9. Ümumi tələblər

- `npm run lint` və `npm run build` xətasız keçməlidir.
- BÜTÜN yeni UI mətnlərini (`WEAK_PASSWORD`, `INVALID_CREDENTIALS`, `BLOCKED`, `ACCOUNT_EXISTS`, `NO_ACCOUNT`, `EMAIL_TAKEN`, "Kod göndər", "Şifrəni unutdum", "Hesab Məlumatlarım", "Sifarişlərim" və s.) `useTranslations` ilə tərcümə et, ən azı `en`/`az` tam.
- Şifrələr HEÇ VAXT açıq mətn kimi loglanmasın və ya console.log edilməsin.
- Mobil (390px) və desktop (1440px) enlərində bütün yeni axınları vizual test et: (1) yeni email ilə qeydiyyat (Ad/Soyad/Şifrə/OTP) → uğurlu giriş; (2) mövcud email ilə qeydiyyat cəhdi → yaşıl bildiriş + Login-ə yönləndirmə; (3) email+şifrə ilə giriş; (4) səhv şifrə ilə 5 cəhd → blok mesajı; (5) "Şifrəni unutdum" tam axını; (6) Hesabım panelində email dəyişimi, şifrə dəyişimi, ad/soyad/cinsiyyət/telefon yenilənməsi; (7) Sifarişlərim tab-ı.
- Bütün interaktiv elementlərdə (düymələr, tab-lar, kartlar) animasiya olsun — statik/animasiyasız heç bir yeni komponent qalmasın.

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Replace OTP-only auth with email+password auth, add forgot-password flow, and build full account management panel"
git push origin main
```

---

## SƏNDƏN (istifadəçidən) TƏLƏB OLUNAN SON ADDIM

Kod bitdikdən sonra:
1. Supabase SQL Editor-də `supabase/migrations/002_password_auth.sql` faylının məzmununu işə sal (cədvəl/sütun yeniləmələri).
2. Deploy bitdikdən sonra bütün 7 ssenarini (yuxarıda bölmə 9-da sadalanıb) `https://weartry.shop` üzərində sına.
