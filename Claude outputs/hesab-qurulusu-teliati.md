# Hesab Qurulumu — Resend, Supabase, Google OAuth

Bu addımları SƏN özün (browser-də) edəcəksən — bunlar hesab yaratma və API key əldə etmə əməliyyatlarıdır. Hər addımın sonunda əldə etdiyin key/secret-i qeyd et, çünki hamısını ən sonda bir yerə (`.env.local` faylına) yazacağıq.

---

## 1-Ci Addım: Resend hesabı (email göndərmək üçün)

> **QEYD:** İndi `weartry.shop` domenin var — buna görə birbaşa öz domenini təsdiqləyib peşəkar göndərən ünvanından (`support@weartry.shop`) istifadə edə bilərsən.
>
> **VACIB — real inbox məsələsi:** Resend sənə `support@weartry.shop` adından email GÖNDƏRMƏYƏ icazə verir, amma bu, avtomatik olaraq real bir gələn-qutusu (inbox) demək DEYİL. Əgər müştəri bu ünvana cavab yazsa və ya birbaşa sual göndərsə, həmin email-i haradasa oxumaq lazımdır. Bunun üçün Hostinger-in öz **Email Hosting** xidmətindən (hPanel → Emails → "Create email account" → `support@weartry.shop`, pulsuz/ucuz plan adətən domenlə birlikdə gəlir) istifadə edib bu qutunu yarat, sonra istəsən Gmail-ə "forward" (yönləndirmə) qura bilərsən ki, hər şeyi öz Gmail-indən idarə edəsən.



1. https://resend.com ünvanına get, **"Sign Up"** ilə pulsuz hesab yarat (Google hesabınla da qeydiyyatdan keçə bilərsən).
2. Sol menyudan **"Domains"** bölməsinə keç, **"Add Domain"** bas, `weartry.shop` yaz.
3. Resend sənə bir neçə DNS qeydi (adətən 1 TXT — SPF üçün, 2-3 CNAME — DKIM üçün, bəzən 1 MX) göstərəcək. Bunları Hostinger-in DNS Zone Editor-ində (Domains → weartry.shop → DNS / Nameservers) dəqiq göstərildiyi kimi əlavə et.
4. Bir neçə dəqiqə gözlə (əvvəlki A/CNAME qeydləri kimi, doğrulama bəzən keçici gecikə bilər — lazım gələrsə Resend-in "Verify DNS Records" düyməsini bir neçə dəfə bas), domen "Verified" (yaşıl) statusuna keçəcək.
5. Sol menyudan **"API Keys"** bölməsinə keç, **"Create API Key"** bas, ada `weartry-production` kimi bir şey ver, icazəni **"Sending access"** (Full access da olar) seç.
6. Yaranan key `re_` ilə başlayacaq — BUNU DƏRHAL KOPYALAYIB TƏHLÜKƏSİZ YERƏ QEYD ET (bir daha göstərilməyəcək).

**Nəticədə əldə edəcəyin:** `RESEND_API_KEY=re_xxxxxxxxxxxx`

Kodda göndərən ünvan hər yerdə **`support@weartry.shop`** olaraq təyin ediləcək (OTP email-ləri, sifariş bildirişləri, əlaqə/contact cavabları və s. — hamısı bu tək ünvandan göndəriləcək). Bunu növbəti kod komandasında qeyd edəcəm.

---

## 2-ci Addım: Supabase hesabı (verilənlər bazası üçün)

1. https://supabase.com ünvanına get, **"Start your project"** ilə pulsuz hesab yarat (GitHub hesabınla qeydiyyat ən sürətlisidir).
2. **"New Project"** bas:
   - Layihə adı: `weartry`
   - Verilənlər bazası şifrəsi: güclü bir şifrə seç və QEYD ET (bu, Supabase dashboard şifrəsi deyil, verilənlər bazasının öz şifrəsidir).
   - Region: Avropaya ən yaxın regionu seç (məs. `eu-central-1` və ya `eu-west-1`) — müştərilərin əksəriyyəti Avropadadırsa sürət üçün vacibdir.
3. Layihə yaradılana qədər 1-2 dəqiqə gözlə.
4. Sol menyudan **"Project Settings" → "API"** bölməsinə keç:
   - **"Project URL"** dəyərini qeyd et (məs. `https://xxxxx.supabase.co`)
   - **"anon public"** key-i qeyd et
   - **"service_role"** key-i də qeyd et (BU GİZLİ QALMALIDIR, heç vaxt frontend kodunda və ya GitHub-da paylaşma)
5. Sol menyudan **"Project Settings" → "Database"** bölməsinə keç, **"Connection string"** hissəsindən **"URI"** formatını kopyala (bura verilənlər bazası şifrəni əvəz edəcəksən).

**Nəticədə əldə edəcəyin:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxx
DATABASE_URL=postgresql://postgres:[ŞİFRƏN]@xxxxx.supabase.co:5432/postgres
```

---

## 3-cü Addım: Google OAuth Client (Google ilə giriş üçün)

1. https://console.cloud.google.com ünvanına get, Google hesabınla daxil ol.
2. Yuxarıda layihə seçicisindən **"New Project"** yarat, adı `WearTry` qoy.
3. Sol menyudan (və ya axtarış çubuğundan) **"APIs & Services" → "OAuth consent screen"** bölməsinə keç:
   - User Type: **"External"** seç.
   - App name: `WearTry`
   - User support email: `support@weartry.shop` (Resend-də bu ünvanı təsdiqləyəndən sonra istifadə et — hələ Resend domen təsdiqi bitməyibsə, müvəqqəti öz şəxsi email-ini (`karimlifaig11@gmail.com`) yaz, Resend hazır olduqdan sonra bura qayıdıb dəyişərsən)
   - Developer contact: `support@weartry.shop` (və ya yenə eyni müvəqqəti qeyd)
   - Digər sahələri boş buraxıb "Save and Continue" ilə davam et (Scopes və Test users addımlarını da default olaraq keç).
4. Sol menyudan **"APIs & Services" → "Credentials"** bölməsinə keç.
5. **"Create Credentials" → "OAuth client ID"** bas:
   - Application type: **"Web application"**
   - Name: `WearTry Web`
   - **Authorized JavaScript origins**-ə əlavə et:
     - `https://weartry.shop`
     - `https://www.weartry.shop`
     - `https://weartry.vercel.app` (ehtiyat olaraq saxla)
     - (lokal test üçün) `http://localhost:3000`
   - **Authorized redirect URIs**-ə əlavə et:
     - `https://weartry.shop/api/auth/callback/google`
     - `https://www.weartry.shop/api/auth/callback/google`
     - `https://weartry.vercel.app/api/auth/callback/google` (ehtiyat olaraq saxla)
     - (lokal test üçün) `http://localhost:3000/api/auth/callback/google`
6. **"Create"** bas — açılan pəncərədə **Client ID** və **Client Secret** görünəcək, hər ikisini qeyd et.

**Nəticədə əldə edəcəyin:**
```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxx
```

---

## 4-cü Addım: Auth.js üçün bir "Secret" yarat

Terminal-da (Mac-də Terminal tətbiqini aç) bu əmri işə sal:
```bash
openssl rand -base64 32
```
Çıxan nəticəni qeyd et:
```
AUTH_SECRET=xxxxxxxxxxxx
```

---

## Yekun — Hamısını bir yerə topla

Yuxarıdakı 4 addımdan sonra əlində bu 8 dəyər olmalıdır:

```
RESEND_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
```

Bunları mənə göndərmə (mən sənin adından key-ləri daxil edə bilmərəm, təhlükəsizlik qaydasıdır) — bunun əvəzinə, sənə verəcəyim növbəti Claude Code komandası bu 8 dəyəri `.env.local` (lokal test üçün) və Vercel-in **"Environment Variables"** bölməsinə (production üçün, Vercel dashboard → Project → Settings → Environment Variables) ƏLAVƏ ETMƏYİ SƏNDƏN xahiş edəcək — Claude Code sənin təsdiqinlə bu key-ləri təhlükəsiz şəkildə əlavə edə bilər, YA DA sən özün Vercel dashboard-a əl ilə daxil edərsən (daha təhlükəsiz yoldur).

Bu addımları etdikdən sonra mənə xəbər ver, kod inteqrasiyası komandasını (Auth.js + Resend OTP + Supabase database schema) dərhal hazırlayıb göndərəcəm.
