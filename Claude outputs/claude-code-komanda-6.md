# Claude Code Komandası — Header/Footer layout, Login/Register, Wishlist, Cart & Checkout

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsi (`weartry`). Canlı deploy-un (`weartry.vercel.app`) hazırkı görünüşünə əsaslanan düzəlişlərdir. Hər maddəni ardıcıl, DİQQƏTLƏ et — bu, "logo sol/sağ" mövzusunda artıq bir neçə dəfə natamam icra edilmiş tapşırıqdır, buna görə addım-addım YOXLA. Sonda `npm run lint` və `npm run build` xətasız keçməlidir, sonra ÖZÜN (soruşmadan) commit + push et.

---

## 1. HEADER — logo ƏN SOLA, ikonlar ƏN SAĞA, naviqasiya ORTAYA (ƏN VACİB MADDƏ)

Bu, dəfələrlə tələb edilib və hələ tam düzgün icra edilməyib. `components/layout/Header.tsx`-i (və varsa onu saran hər hansı wrapper/container) SIFIRDAN diqqətlə yoxla:

### 1a. Logo (sol)
- Header-in ən xarici konteyneri `flex` olmalıdır, `justify-between` yox — **3 aydın bölgü** istifadə et: `grid grid-cols-3` (sol / orta / sağ) VƏ YA `flex` + logo blokunu `flex-shrink-0` edib mərkəzi naviqasiyanı `absolute left-1/2 -translate-x-1/2` ilə mütləq mərkəzləşdir. Bu yanaşma logo/ikonların "yarım yolda qalmasının" (ortalanmamış görünməsinin) əsas səbəbidir — indiyə qədər ehtimal ki, sadə `justify-between` flex istifadə olunub və içindəki elementlərin öz eni (`width`) fərqli olduğu üçün vizual olaraq "ortalanmır" kimi görünüb.
- Logo şəklinin (`/weartry-logo-black.png`) ölçüsünü BÖYÜT: hazırkı `h-8` (32px) əvəzinə **`h-10 md:h-12`** (40px mobil, 48px desktop) et.
- Logo konteynerinin ÖZÜNDƏ və ya valideynində olan HƏR CÜR sol boşluq/padding/margin-i (`pl-4`, `ml-6`, `px-4` və s. — header-in özündəki ÜMUMİ container padding-dən başqa) axtar və sil. Logo header-in ümumi kənar padding-i (`px-4 md:px-6` kimi ümumi container padding, bu qalsın) daxilində, sol kənara MÜMKÜN QƏDƏR yaxın olmalıdır — əlavə heç bir sol boşluq elementi olmamalıdır.
- Əgər logo `<Link>` daxilindədirsə və həmin `<Link>`-ə ya da valideyninə `justify-center`, `mx-auto`, `text-center` kimi mərkəzləşdirici class-lar səhvən düşübsə, onları sil.

### 1b. Sağ ikonlar (account/wishlist/cart/search)
- Bu qrupu böyüt: hər ikonun ölçüsünü hazırkı ölçüdən (məsələn `w-5 h-5`) **`w-6 h-6`**-a qaldır, ikonlar arası `gap`-i də mütənasib artır (`gap-3` və ya `gap-4`).
- Bu qrup header-in ƏN SAĞ kənarına yapışmalıdır — valideyn konteynerdə bu qrupdan sonra əlavə boş `div`, `flex-1`, artıq padding/margin varsa sil. Ümumi header container padding-dən (`px-4 md:px-6`) başqa sağ tərəfdə heç bir əlavə boşluq olmamalıdır.
- Əgər bu ikon qrupu ayrı bir `<nav>` və ya `<div>` daxilindədirsə, onun `flex-shrink-0` olduğuna əmin ol (sıxılıb kiçilməsin).

### 1c. Orta naviqasiya (Men/Women/Kids)
- Bu bloku BÖYÜT: mətn ölçüsünü hazırkı `text-sm`-dən **`text-base`**-ə qaldır, elementlər arası `gap`-i artır (`gap-6` və ya `gap-8`).
- Mütləq həqiqi mərkəzdə olmalıdır (header-in tam ortasında, sol logo və ya sağ ikonların enindən asılı olmadan) — buna görə yuxarıda deyilən `grid-cols-3` və ya `absolute left-1/2 -translate-x-1/2` texnikasından mütləq istifadə et, sadə `flex justify-between` YARARSIZDIR bu tələb üçün.

### 1d. Yoxlama addımı (vacib)
Kodu yazdıqdan sonra, brauzerdə 1440px (desktop) enində header-ə bax:
- Logo header-in SOL kənarına (ümumi container padding-i çıxmaqla) demək olar ki, sıfır məsafədə olmalıdır.
- Sağ ikon qrupu header-in SAĞ kənarına eyni şəkildə yaxın olmalıdır.
- Men/Women/Kids header-in üfüqi tam ortasında olmalıdır (sol/sağ kənarlardan bərabər məsafədə), logo və ikon qrupunun enləri fərqli olsa belə.
- Hər üç blok (logo, naviqasiya, ikonlar) EYNİ vertikal xəttdə (üfüqi mərkəzdə, `items-center`) olmalıdır.

---

## 2. Footer-dəki WEARTRY logosu — böyüt

`components/layout/Footer.tsx`-də logo şəkli çox kiçikdir. Ölçüsünü hazırkı dəyərdən **`h-10 md:h-12`**-yə qaldır (header-dəki yeni ölçü ilə mütənasib), `w-auto` ilə nisbəti qoru.

---

## 3. "Loved by Thousands" (Testimonials) bölməsi — müştəri şəkillərini sil

`components/home/Testimonials.tsx`-də hər testimonial kartındakı müştəri şəkli/avatarı (placeholder gradient dairə və ya şəkil elementi) TAM ÇIXAR. Kartın qalan hissəsi (bayraq, ad, reytinq/ulduzlar, qiymət, rəy mətni) olduğu kimi qalsın — sadəcə şəkil/avatar hissəsini sil, lazımsız boşluq qalmasın (layout-u yenidən düzült ki, şəkil boşluğunun yeri hiss olunmasın).

---

## 4. Login səhifəsi — sadələşdir, arxa plan sil, Google Sign-In, Register sahələri

`app/[locale]/account/login/page.tsx` (və ya müvafiq komponent, məs. `components/account/LoginForm.tsx`) tam yenidən qur:

### 4a. Arxa plan
- Səhifənin arxa planında olan hər hansı dekorativ element, şəkil, gradient, blur-shape və s. SİL. Sadə, təmiz fon (`bg-background`) olsun. Səhifədə YALNIZ ortada bir login/register kartı olsun (mərkəzləşdirilmiş, məhdud enli — məs. `max-w-md`).

### 4b. Login forması
- Email + Şifrə sahələri (hazırkı kimi qalsın).
- Email/Şifrə formasının ALTINDA (və ya "OR" ayırıcısından sonra) **"Google ilə daxil ol"** düyməsi əlavə et — Google loqosu ilə (SVG icon, `lib/icons` və ya inline SVG), tam-enli, ağ fon/boz border ilə standart Google-button görünüşündə. Bu düymənin `onClick` funksiyası hələlik boş/placeholder olsun (`// TODO: Google OAuth — API key veriləndə tamamlanacaq`), console-a log yazsın, XƏTA VERMƏSİN.

### 4c. "Hesab yarat" (Register/Create Account) bölməsi
Login/Register arasında keçid (tab və ya link) olan bölmədə, Register formasına bu sahələri əlavə et:
- **Ad** (Ad Soyad — bir sahədə tam ad, `İstifadəçi adı`/`Full Name` label-i ilə, ya da iki ayrı sahə: Ad / Soyad — hansı daha rahat inteqrasiya olarsa)
- **Cinsiyyət** (`select` dropdown: Kişi / Qadın / Bildirmək istəmirəm)
- **Şifrə** (artıq olmalıdır, yoxsa əlavə et)
- Bu sahələrin ALTINDA, formanın son elementi kimi: bir **checkbox** (fərqli, seçilmiş/aktiv görünüşdə dizayn olunmuş — məs. brend rəngində vurğulanmış border/fon) və yanında mətn: **"Bütün siyasətləri (Məxfilik Siyasəti, İstifadə Şərtləri) qəbul edirəm"** — bu mətndəki "Məxfilik Siyasəti" və "İstifadə Şərtləri" sözləri müvafiq səhifələrə (`/privacy-policy`, `/terms-of-service`) klikə bilən link olsun. Checkbox defolt olaraq **DAİMİ İŞARƏLİ (checked) və DƏYİŞDİRİLƏ BİLMƏZ (disabled, həmişə true)** olsun — istifadəçi onu söndürə bilməsin (checkbox görünsün, işarəli görünsün, amma klikləmə ilə söndürülməsin).
- Register düyməsinin (`Hesab Yarat`) ALTINDA burada da **"Google ilə qeydiyyatdan keç"** düyməsi əlavə et (4b-dəki eyni Google düyməsi komponentini `Register` üçün də istifadə et, eyni placeholder `onClick`).

### 4d. Ümumi
- Bütün yeni mətnləri (Cinsiyyət, checkbox mətni, Google düymələri) `useTranslations` ilə et, ən azı `en`/`az` tam tərcümə, digər 23 dildə İngiliscə fallback qəbul edilir (bu mətnlər qısadır, mümkünsə hamısını tərcümə et, vaxt azdırsa ən azı az/en kifayətdir).
- Bütün forma keçidləri/açılmaları animasiyalı olsun (`BlurFadeUp` və ya uyğun framer-motion keçidi login/register tab-ları arasında).

---

## 5. Wishlist drawer/panel — boş olanda tövsiyə məhsullar göstər

`components/cart/WishlistDrawer.tsx` (və ya faktiki fayl adı hər nə olsa — mövcud wishlist açılan panel komponentini tap):

- Wishlist BOŞ olduğu halda (heç bir məhsul əlavə edilməyibsə), hazırkı boş mesajın ALTINDA/ƏVƏZİNDƏ bir **"Tövsiyə olunanlar"** bölməsi göstər: "İstədiyiniz məhsulu əlavə edə bilərsiniz" kimi qısa mətn + `lib/data.ts`-dəki `bestSellers` və ya `newArrivals` massivindən 3-4 məhsulu kiçik kart formatında (şəkil, ad, qiymət, "Wishlist-ə əlavə et" düyməsi ilə) göstər.
- Bu tövsiyə bölməsi animasiyalı görünsün (`StaggerGroup`/`StaggerItem`).
- Wishlist-də artıq məhsul(lar) VARSA, bu tövsiyə bölməsini mövcud siyahının altında əlavə bölmə kimi ("Bunlar da xoşunuza gələ bilər") göstərməyə davam et.

---

## 6. Səbət (Cart) — say artırma/azaltma, sil, birbaşa ödəniş + tam Checkout səhifəsi

### 6a. Cart drawer-də funksional düymələr
`components/cart/CartDrawer.tsx` (faktiki fayl adı nə olsa) - hər məhsul sətrində:
- **Say artır/azalt** düymələri (`+`/`−`) əlavə et — kliklədikdə məhsulun sayını dəyişsin (cart state-də, mövcud `CartContext`/`useCart` hook-u və ya oxşar state idarəetməsini tap və istifadə et; əgər belə context yoxdursa, sadə bir `CartContext` (React Context + `useReducer` və ya `useState`) yarat ki, say/silmə əməliyyatları qlobal işləsin).
- **Sil (X/zibil qutusu ikonu)** düyməsi — məhsulu səbətdən tam çıxarsın.
- Cart-ın ALT hissəsində CƏMİ (subtotal) məbləğinin altında İKİ düymə: **"Səbətə bax"** (mövcud, cart səhifəsinə aparır) VƏ **"Birbaşa Ödəniş"** (`Buy Now` — birbaşa aşağıdakı checkout səhifəsinə yönləndirir, `Link href="/checkout"`).

### 6b. Checkout səhifəsi — tam yenidən qur
`app/[locale]/checkout/page.tsx` yeni yarat (yoxdursa) və ya mövcud olanı tam yenidən qur. Minimalist, səliqəli, PEŞƏKAR checkout dizaynı:

**Struktur (2 sütun, desktop-da yan-yana, mobil-də alt-alta):**

Sol sütun — Məlumat forması:
1. **Hesab statusu**: Əgər istifadəçi "daxil olmuşdursa" (sadə bir mock/local auth state, məs. `localStorage`/context ilə simulyasiya — real backend hələ yoxdursa fake/mock istifadəçi state-i kifayətdir) — Ad/Email/Ünvan sahələri ƏVVƏLCƏDƏN DOLU göstərilsin (mock data ilə). Daxil olmayıbsa, boş forma göstərilsin + "Hesabınız var? Daxil olun" linki yuxarıda.
2. **Əlaqə məlumatı**: Ad Soyad, Email, Telefon.
3. **Çatdırılma ünvanı** (DETALLI, mütləq bu sahələrin hamısı olsun):
   - Ölkə (`select` dropdown — layihədəki mövcud 29 market/ölkə siyahısından istifadə et, `lib/` qovluğunda market/locale data varsa oradan)
   - Şəhər
   - Ünvan sətri 1 (küçə/ev ünvanı)
   - Ünvan sətri 2 (mənzil/blok — məcburi deyil)
   - Poçt kodu / Zip
   - Telefon nömrəsi (əgər yuxarıda əlaqə hissəsində yoxdursa)
4. **Ödəniş metodu seçimi** (radio/tab formatında 3 seçim, hər birinin öz ikonu ilə):
   - **Apple Pay** (Apple loqosu ilə)
   - **Google Pay** (Google Pay loqosu ilə)
   - **Bank kartı / Hesabı** (Visa/Mastercard tipli kart nömrəsi sahələri: kart nömrəsi, son istifadə tarixi, CVV, kart üzərindəki ad)
   - Seçilən metoda görə müvafiq forma sahələri aşağıda AÇILIB-BAĞLANSIN (accordion tipli, animasiyalı — `AnimatePresence` ilə).

Sağ sütun — Sifariş xülasəsi (order summary):
- Səbətdəki məhsulların siyahısı (kiçik şəkil + ad + say + qiymət).
- Ara cəm, çatdırılma haqqı (sabit/simulyasiya dəyər, məs. pulsuz və ya $5), CƏMİ.
- "Sifarişi Tamamla" (Place Order) düyməsi — kliklədikdə sadə bir təsdiq/uğur ekranına keçid (real ödəniş inteqrasiyası YOXDUR hələ, sadəcə frontend flow simulyasiyası, `alert` YOX, gözəl bir "Sifarişiniz qəbul edildi" səhifəsi/state göstər).

**Dizayn tələbləri:**
- Minimalist, təmiz, sayta uyğun neytral rəng palette (mövcud sayt rənglərini istifadə et, yeni brend rəngi əlavə etmə).
- HƏR bölmə (forma sahələri, ödəniş metodu seçimi, sifariş xülasəsi) `BlurFadeUp`/`StaggerGroup` ilə animasiyalı görünsün — "Animasyalar əksik olmasın qətiyyən" tələbinə uyğun, səhifəyə giriş, bölmələr arası keçid, ödəniş metodu dəyişəndə forma sahələrinin açılıb-bağlanması BÜTÜN keçidlər animasiyalı olmalıdır.
- Mobil (390px) enində sütunlar alt-alta düzülsün, forma sahələri tam-enli, düymələr toxunma üçün rahat ölçüdə (`min-h-11`) olsun.

---

## Ümumi tələblər

- Bütün yeni mətnləri `useTranslations`/`getTranslations` ilə et, `Checkout`, `Login`, `Register`, `Wishlist` kimi yeni namespace-lər `messages/*.json`-a əlavə et (ən azı `en`/`az` tam tərcümə).
- `npm run lint` və `npm run build` xətasız keçməlidir, bütün 25 locale route-u compile olmalıdır.
- Cart/Wishlist state idarəetməsi üçün əgər mövcud Context/hook yoxdursa, sadə React Context yarat — real backend/API tələb olunmur, hələlik frontend-only state (localStorage ilə persist edilə bilər).
- Google Sign-In düymələri və real ödəniş inteqrasiyası HƏLƏLIK placeholder/mock olsun — API key-lər sonradan veriləcək, bu underlying funksionallıq YOX, sadəcə UI+düymə strukturu tələb olunur.
- Mobil (390px) və desktop (1440px) enlərində hər dəyişikliyi vizual yoxla.

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Fix header/footer logo-nav-icon layout, redesign login/register, add wishlist recommendations, cart quantity controls, and full checkout page"
git push origin main
```

Vercel GitHub inteqrasiyası ilə `main`-ə push avtomatik production deploy tetikləyir — ayrıca `vercel` əmri lazım deyil.

---

## QEYD (mənim üçün, sonrakı iş üçün — indi ETMƏ, sadəcə oxu)

Bu tapşırıqdan sonra növbəti mərhələdə aşağıdakılar üzərində işləyəcəyik, HƏLƏ BAŞLAMA:
1. Login zamanı email-ə birdəfəlik kod (OTP) göndərmə funksionallığı (email provider seçimi, API inteqrasiyası tələb edəcək).
2. Müştəri məlumatlarının (ad, email, ünvan, sifariş tarixçəsi) təhlükəsiz saxlanması üçün verilənlər bazası seçimi (məs. Vercel Postgres, Supabase, PlanetScale və s.) və Next.js-ə inteqrasiyası.

Bu iki mövzu ayrıca müzakirə ediləcək, bu komandaya daxil DEYİL.
