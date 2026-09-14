# Vercel-ə Environment Variable-ları Əlavə Etmə

## Addımlar

1. https://vercel.com ünvanına get, `weartry` layihəsinə daxil ol.
2. Yuxarıda **"Settings"** tab-ına keç.
3. Sol menyudan **"Environment Variables"** seç.
4. Aşağıdakı 8 dəyəri BİR-BİR əlavə et. Hər biri üçün:
   - **Key** sahəsinə adını yaz (məs. `RESEND_API_KEY`)
   - **Value** sahəsinə öz həqiqi dəyərini yapışdır
   - **Environment** seçimində HƏR ÜÇÜNÜ işarələ: **Production**, **Preview**, **Development**
   - **"Save"** bas
5. Növbəti key üçün təkrarla.

## Əlavə edəcəyin 8 key (adları DƏQİQ bu cür yaz, hərf-hərf eyni olmalıdır)

| Key adı | Haradan götürürsən |
|---|---|
| `RESEND_API_KEY` | Resend → API Keys → yaratdığın key (`re_...`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → General → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → **Publishable key** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → **Secret key** |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (URI) — `[YOUR-PASSWORD]` yerinə öz DB şifrəni yaz |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials → OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials → OAuth Client Secret |
| `AUTH_SECRET` | Terminalda `openssl rand -base64 32` ilə aldığın dəyər |

## Vacib qeydlər

- Key adlarında böyük/kiçik hərf FƏRQ EDİR — məsələn `RESEND_API_KEY` yazmalısan, `resend_api_key` yox.
- `NEXT_PUBLIC_` ilə başlayanlar (ikisi var) frontend-ə (brauzerə) görünəcək — bu, normaldır, çünki Supabase-in "Publishable key"-i məhz bunun üçün nəzərdə tutulub, təhlükəsizdir.
- `SUPABASE_SERVICE_ROLE_KEY` (Secret key) HEÇ VAXT `NEXT_PUBLIC_` prefiksi ilə YAZILMAMALIDIR — yalnız server-tərəfli kod bunu görməlidir.
- Bütün 8-ni əlavə etdikdən sonra, əgər layihə artıq bir dəfə deploy olunubsa, Vercel-də **"Deployments"** bölməsindən son deployment-in yanındakı "..." menyusundan **"Redeploy"** et ki, yeni environment variable-lar aktiv olsun (yeni push da eyni işi görəcək).

Bunu bitirdikdən sonra mənə xəbər ver, email OTP şablonu mövzusuna keçək.
