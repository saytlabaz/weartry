# Domen Qurulumu — weartry.shop (Hostinger → Vercel)

Bu addımları SƏN özün edəcəksən (Vercel dashboard və Hostinger DNS panelində). Hər addım aydın izah olunub.

---

## 1-ci Addım: Vercel-də domeni layihəyə əlavə et

1. https://vercel.com ünvanına get, `weartry` layihənə daxil ol.
2. Yuxarıda **"Settings"** tab-ına keç, sol menyudan **"Domains"** seç.
3. Yuxarıdakı boş sahəyə `weartry.shop` yaz və **"Add"** bas.
4. Vercel iki seçim təklif edəcək:
   - **`weartry.shop`** (əsas domen, "www"-siz) — BUNU ƏSAS (Primary) et.
   - Vercel avtomatik **`www.weartry.shop`**-u da əlavə etməyi təklif edəcək — "Redirect to weartry.shop" seçimini seç (yəni `www.weartry.shop`-a girən `weartry.shop`-a yönləndirilsin).
5. Vercel sənə DNS qeydləri göstərəcək, təxminən bu formada:
   - **A Record**: `@` → `76.76.21.21` (Vercel-in IP-si, dəqiq dəyəri Vercel dashboard-da göstəriləcək)
   - **CNAME Record**: `www` → `cname.vercel-dns.com`
   
   Bu dəyərləri DƏQİQ Vercel-in göstərdiyi kimi qeyd et (bəzən fərqli ola bilər), çünki 2-ci addımda bunları Hostinger-ə əlavə edəcəyik.

---

## 2-ci Addım: Hostinger-də DNS qeydlərini əlavə et

1. https://hpanel.hostinger.com ünvanına daxil ol.
2. **"Domains"** bölməsindən `weartry.shop` domenini tap, üzərinə klik et.
3. **"DNS / Nameservers"** (və ya **"DNS Zone Editor"**) bölməsinə keç.
4. Əgər mövcud A və ya CNAME qeydləri `@` və `www` üçün varsa (Hostinger-in default parking-səhifə qeydləri ola bilər), onları SİL.
5. Yeni qeyd əlavə et:
   - **Type**: `A`, **Name/Host**: `@` (və ya boş saxla), **Points to/Value**: Vercel-in verdiyi IP (məs. `76.76.21.21`), **TTL**: default (14400 və ya "Auto").
6. İkinci qeyd əlavə et:
   - **Type**: `CNAME`, **Name/Host**: `www`, **Points to/Value**: `cname.vercel-dns.com`, **TTL**: default.
7. Dəyişiklikləri saxla (**"Save"**).

**Gözləmə vaxtı:** DNS dəyişiklikləri adətən 10 dəqiqə–2 saat arasında yayılır (bəzən 24 saata qədər çəkə bilər, amma Hostinger adətən sürətlidir). Vercel dashboard-da "Domains" bölməsinə qayıdıb yoxlaya bilərsən — status "Valid Configuration" (yaşıl) olduqda hazırdır.

---

## 3-cü Addım: Yoxlama

DNS yayıldıqdan sonra:
1. Brauzerdə `https://weartry.shop` yaz — saytın açıldığını yoxla.
2. `https://www.weartry.shop` yaz — `weartry.shop`-a yönləndirildiyini yoxla.
3. Vercel avtomatik SSL sertifikatı (HTTPS kilidi) quraşdıracaq — bu adətən domen təsdiqləndikdən bir neçə dəqiqə sonra hazır olur.

---

## Bundan sonra nə edəcəyik

Domen tam işə düşdükdən sonra mənə xəbər ver, aşağıdakıları edəcəyik:

1. **Resend-də domen təsdiqi**: "Domains" → "Add Domain" → `weartry.shop` → verilən DNS qeydlərini (yenə Hostinger-ə) əlavə et → email göndərən ünvan `noreply@weartry.shop` olacaq (`onboarding@resend.dev`-dən daha peşəkar görünüş).
2. **Google OAuth-da domeni əlavə et**: Authorized origins/redirect URI-lərə `https://weartry.shop` və `https://weartry.shop/api/auth/callback/google` əlavə edəcəyik (əvvəlki `weartry.vercel.app` qeydlərini silmək məcburi deyil).
3. Bundan sonra əvvəlki təlimatda (`hesab-qurulusu-teliati.md`) qalan Supabase və AUTH_SECRET addımlarını tamamlayarsan (bunlar domendən asılı deyil, indi də edə bilərsən).

İstəsən, Resend/Google OAuth hesablarını domen DNS-i yayılmasını gözləmədən İNDİ də yarada bilərsən (paralel işləyə bilər) — yalnız domen-spesifik DNS qeydlərini domen aktiv olandan sonra əlavə edərsən.
