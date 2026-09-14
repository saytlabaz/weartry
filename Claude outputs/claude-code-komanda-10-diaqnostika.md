# Claude Code Komandası — Auth xətasının dəqiq diaqnostikası

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Məqsəd: `error=Configuration` / `AdapterError` və OTP-nin 400 qaytarmasının HƏQİQİ səbəbini tapmaq (indiyədək edilən düzəlişlərdən sonra da xəta davam edir, Supabase logларında bütün sorğular 406 görünür).

---

## 1. `auth.ts` faylını tam göstər

Əvvəlcə mənə (Claude Code-a): layihədəki hazırkı `auth.ts` faylının TAM məzmununu göstər (heç nə dəyişmə, yalnız oxu və göstər), çünki əvvəlki tapşırıqların hamısının düzgün tətbiq olunub-olunmadığını yoxlamaq lazımdır.

## 2. Supabase bağlantısını təcrid olunmuş şəkildə test et

Layihənin kökündə müvəqqəti bir test route yarat: `app/api/debug/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const usersTest = await supabase.from("users").select("id").limit(1);
    results.usersTest = {
      error: usersTest.error,
      status: usersTest.status,
      statusText: usersTest.statusText,
      count: usersTest.data?.length ?? 0,
    };

    const accountsTest = await supabase.from("accounts").select("id").limit(1);
    results.accountsTest = {
      error: accountsTest.error,
      status: accountsTest.status,
      statusText: accountsTest.statusText,
    };

    const sessionsTest = await supabase.from("sessions").select("id").limit(1);
    results.sessionsTest = {
      error: sessionsTest.error,
      status: sessionsTest.status,
      statusText: sessionsTest.statusText,
    };

    results.envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET,
      jwtSecretLength: process.env.SUPABASE_JWT_SECRET?.length ?? 0,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasAuthUrl: !!process.env.AUTH_URL,
      authUrlValue: process.env.AUTH_URL ?? null,
    };
  } catch (e) {
    results.fatalError = e instanceof Error ? { message: e.message, stack: e.stack } : String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
```

Bunu commit + push et (soruşmadan), Vercel deploy bitəndən sonra istifadəçiyə (mənə) bildir ki, `https://weartry.shop/api/debug` ünvanına getsin və JSON nəticəsinin TAMAMINI (screenshot və ya mətn kimi) geri göndərsin.

**BU FAYL MÜVƏQQƏTİDİR** — məlumat toplandıqdan sonra (istifadəçi nəticəni paylaşandan sonra) bu route-u SİLMƏK lazım olacaq, çünki `env` haqqında məlumat (uzunluqlar, mövcudluq) production-da açıq qalmamalıdır. Bunu Claude Code-a da bildir: "Bu debug route-u yalnız müvəqqətidir, nəticə alındıqdan sonra sənə onu silmək üçün ayrıca xəbər veriləcək."

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Add temporary debug route to diagnose Supabase adapter error"
git push origin main
```
