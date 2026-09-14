# Claude Code Komandası — Header/Footer düzəlişləri, PDP-lər, FAQ, mobil qruplaşdırma

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsi (`weartry`). 17 maddə — hər birini ardıcıl et, sonda `npm run lint` və `npm run build` xətasız keçməlidir, sonra ÖZÜN (soruşmadan) commit + push et.

---

## 1. Promo bar — sürət tədricən artsın, arxası boş qalmasın

Canlı saytda (`weartry.vercel.app`) görünür ki, promo bar-ın son elementindən sonra boşluq var (marquee döngəsi tam davamlı deyil). `components/motion/Marquee.tsx`-i yoxla:
- Uşaq elementlərini (children) HAZIRKI 2 dəfə təkrarlama əvəzinə YETƏRLİ SAYDA (dinamik: konteynerin faktiki enini `ResizeObserver`/`getBoundingClientRect` ilə ölç, ekran genişliyinin ən azı 3 qatına çatana qədər təkrarla, minimum 3 təkrar) təkrarla — beləliklə hər ekran genişliyində sonsuz axın kəsintisiz görünsün, sona çatanda boşluq/"arxası kəsilir" hissi olmasın.
- `PromoBar.tsx`-dəki sürət-artırma məntiqini (əvvəlki tapşırıqda əlavə edilmişdisə) YOXLA: CSS `--marquee-duration`-ın tədricən (məs. hər tam dövrədən sonra 0.5-1%) azaldığını təsdiqlə, aşağı hədd (məs. 10-12s) təyin et ki, sonsuza qədər sürətlənməsin.

## 2. Header-dəki "WEARTRY" — ən aşağı-sol küncə, klikləyəndə yuxarı qaytarsın

`components/layout/Header.tsx`:
- `WEARTRY` loqosunu header daxilində DİKEY olaraq ƏN AŞAĞI (header-in alt kənarına, mövcud padding-in ən dibinə) yerləşdir — header çoxsətirli/hündür görünüşdənsə, loqonu onun ən alt xəttinə "sink" et (`items-end`/`self-end` kimi flex alignment ilə), üfüqi olaraq isə ƏN SOLDA qalsın.
- Loqoya klik → `Link href="/"` olaraq qalsın, AMMA əlavə olaraq bir `onClick` handler qoy ki, kliklənəndə səhifə YUXARI (scroll position 0) qaytarılsın (`window.scrollTo({ top: 0, behavior: "smooth" })`), xüsusilə istifadəçi səhifədə aşağı scroll edibsə.

## 3. Header naviqasiyası — Men/Women/Kids-i sola çək, WEARTRY-nin yanına

- `Header.tsx`-də mövcud struktur (WEARTRY sol, Men/Women/Kids ORTADA, ikonlar sağda) — bunu dəyiş: **Men/Women/Kids linklərini WEARTRY loqosunun DƏRHAL SAĞINA (bitişik, ortada yox, sol qrupun daxilində) yerləşdir**, beləliklə sol tərəfdə "WEARTRY  Men  Women  Kids" bir qrup kimi görünsün, sağ tərəfdə isə yalnız ikonlar (account/wishlist/cart/search) qalsın. Loqo maddə 2-dəki kimi "ən aşağı" olduğundan, bu link qrupu da onunla eyni üfüqi xəttdə (aşağı-sol) yerləşsin.

## 4. Wishlist ayrıca səhifə, Cart açılanda arxa fon bulanıq

`components/layout/` daxilində (əvvəlki tapşırıqda `CartDrawer`/`WishlistDrawer` yaradılıbsa, onları uyğunlaşdır, yoxdursa yarat):
- **Wishlist**: sağdan açılan panel (drawer) DEYİL, ayrıca tam səhifə: `app/[locale]/wishlist/page.tsx` yarat. Header-dəki wishlist ikonuna klik → bu səhifəyə `router.push`/`Link` ilə keçid (drawer yox, tam navigation). Səhifə boş olduqda "İstək siyahınız boşdur" mesajı, dolu olduqda grid-də kartlar göstərsin (BlurFadeUp/StaggerGroup ilə).
- **Cart**: DAVAM ET drawer kimi (sağdan sürüşən panel), AMMA açıldığında SƏHİFƏNİN QALAN HİSSƏSİ (arxa fon) BULANIQ olsun — bunun üçün bir overlay/backdrop əlavə et: `backdrop-filter: blur(8px)` (Tailwind `backdrop-blur-md` sinfi) + yarı-şəffaf qara overlay (`bg-black/30`), drawer açıq olanda `<body>` scroll-unu kilidlə (`overflow: hidden`), overlay-ə klik → drawer bağlansın.

## 5. Footer — "Join Our Newsletter" qara bölməni sil, yerinə FAQ qoy (bax maddə 17)

`components/home/NewsletterSection.tsx` (və ya bu qara bölməni render edən hər hansı komponent) — homepage-dən TAM ÇIXAR. Bu bölmənin yerinə maddə 17-də təsvir olunan FAQ komponentini yerləşdir (eyni mövqedə, homepage-in bu hissəsində).

## 6. Footer sütunları — Shop-u təmizlə, Company-də yalnız About Us qalsın

`components/layout/Footer.tsx`:
- **"Shop" sütununu TAM SİL** (New Arrivals/Men/Women/Kids linkləri buradan çıxsın — bu naviqasiya artıq header-də var).
- **"Company" sütununda YALNIZ "About Us" qalsın** — "Journal" və "Careers" linklərini bu sütundan sil (Journal-ın homepage-dəki taleyi üçün bax maddə 9).
- "Help" və "Legal" sütunları OLDUĞU KİMİ qalsın (məzmununu dəyişmə, YALNIZ maddə 16-dakı Cookie Policy istisna olmaqla).
- Sütun sayı azaldığından, qalan sütunları (Company, Help, Legal) məntiqli boşluqla yenidən düzeniyi et ki, footer boş/köşəli görünməsin.

## 7. Ödəniş loqoları — rəngli et, əlavə kartlar əlavə et

`Footer.tsx`-dəki ödəniş metodu SVG-lərini:
- Rəngli (brend rənglərinə uyğun: Visa mavi, Mastercard qırmızı/narıncı overlap dairələr, PayPal mavi, Apple Pay qara/ağ) inline SVG-lərlə əvəz et — hazırkı monoxrom/outline versiyanı rəngli versiya ilə dəyiş.
- ƏLAVƏ ET: 2Checkout (indiki adı **Verifone**) və Skrill-in dəstəklədiyi əsas kart şəbəkələri üçün loqolar da əlavə et: **Discover**, **JCB**, **Diners Club**, **UnionPay** (bunlar 2Checkout/Verifone və Skrill-in beynəlxalq alıcılar üçün ümumi qəbul etdiyi əlavə kart şəbəkələridir — CJ Dropshipping kimi beynəlxalq dropshipping tərəfdaşları ilə işləyən saytlarda tez-tez görünür). Bütün loqo inline SVG olaraq yaz (xarici şəkil yükləməsi yox).

## 8. Men/Women/Kids klikləndikdə ayrıca kateqoriya səhifəsi

- `app/[locale]/category/[slug]/page.tsx` yarat (`slug`: `men`, `women`, `kids`).
- Hər kateqoriya səhifəsi: başlıq (BlurFadeUp ilə), filtr/sıralama üçün sadə placeholder toolbar, və `lib/data.ts`-dəki məhsul massivlərini `category`-ə görə filtrləyib grid şəklində göstərsin (StaggerGroup/StaggerItem ilə, ProductCard-ları təkrar istifadə et).
- Əgər `lib/data.ts`-dəki `Product` interface-ində hazırda `category` sahəsi yoxdursa, əlavə et (`"men" | "women" | "kids"` tipli) və mövcud placeholder məhsullara məntiqli kateqoriyalar təyin et.
- `Header.tsx`-dəki Men/Women/Kids linklərini bu yeni route-lara yönləndir (`/category/men`, `/category/women`, `/category/kids`) — hazırkı `#categories` anchor-larını əvəz et.

## 9. "Journal" bölməsini təmizlə

- Homepage-dən `components/home/Journal.tsx`-in render olunduğu yeri (`app/[locale]/page.tsx`) SİL.
- Header/Footer-də Journal-a istinad qalıbsa (Footer-in Company sütunu artıq maddə 6-da təmizlənib), başqa yerlərdə də axtar (`grep -rn "Journal"`) və bütün istinadları təmizlə. `Journal.tsx` faylının özünü silməyə bilərsən (istifadə olunmasın kifayətdir), AMMA lint-in "unused" xətası verməməsi üçün importu da sil.

## 10. "Minlərlə Müştərinin Sevimlisi" (Testimonials) — bayraq, şəkil, ulduz, qiymət, ad

`components/home/Testimonials.tsx` və `lib/data.ts`-dəki `testimonials` massivi:
- Hər testimonial elementinə **müştərinin ölkəsinin bayrağı** (emoji və ya kiçik SVG bayraq — bu, ölkə göstəricisidir, ÜMUMİ dil/market seçicisindəki bayraq siyasətindən fərqlidir, silinməsin) əlavə et.
- Hər elementə **bir ədəd placeholder şəkil** (kvadrat, gradient placeholder, real şəkil deyil — sayt daxilində istifadə olunan mövcud placeholder üslubuna uyğun) əlavə et.
- **Ulduz reytinqi** əlavə et: hər testimonial üçün 4-5 arası (yəni 4 və ya 5, təsadüfi/sabit) ulduz sayı, inline SVG ulduz ikonları ilə (dolu/boş ulduz).
- **Qiymət** göstər — testimonial-ın aid olduğu məhsulun placeholder qiymətini (`lib/data.ts`-dəki mövcud qiymətlərdən birini istinad et və ya yeni sahə `relatedPrice` əlavə et).
- **Ad formatını dəyiş**: hazırkı "By [ad]" formatını SİL, əvəzinə sadəcə tam ad-soyad (random, müxtəlif millətlərdən — məs. "Elena Rossi", "Marcus Weber", "Aisha Khan", "Tomás García" və s., ölkə bayrağı ilə uyğunlaşan) göstər, "By" sözü olmadan.
- Bütün 25 dil faylında `testimonials`-a aid tərcümə mətnlərini (əgər `messages/*.json`-da saxlanılırsa) uyğunlaşdır, əks halda `lib/data.ts`-dəki statik massivdə saxla (bu, artıq belədirsə dəyişmə).

## 11. Mobildə "Mövsümi Yeniliklər" (SeasonalDrop) — 2-li qruplaşdırma, səliqəli rəng paletləri

`components/home/SeasonalDrop.tsx` (və oxşar grid istifadə edən digər bölmələr, `NewArrivals.tsx`, `BestSellers.tsx` daxil olmaqla, əgər eyni problem varsa):
- Mobil enində (`< 640px`) grid-i **2 sütunlu** et (`grid-cols-2`, hazırda 1 sütun və ya səliqəsiz sarma varsa düzəlt).
- Hər kartın daxilindəki **rəng palet seçicisini** (əgər `ProductCard.tsx`-də rəng dairələri/swatch-lar varsa) kart enini aşmayacaq şəkildə, `flex-wrap` ilə səliqəli sıraya düz, kart konteynerindən kənara çıxmasın (`overflow: hidden` və ya `max-width: 100%` ilə məhdudlaşdır), dairələrin ölçüsünü mobil üçün bir az kiçilt (`w-4 h-4` kimi) ki, "kobud" görünməsin.

## 12. "Yeni Kolleksiya" bölməsi — mobildə 4 sütun, brauzerdə yan-yana səliqəli, rəng paletləri sığsın

Bu, çox güman ki `NewArrivals.tsx` və ya `Categories.tsx`-dir (hansı bölmənin "Yeni Kolleksiya" başlıqlı olduğunu tərcümə açarlarından (`Sections.newArrivals` və ya oxşar) tap):
- **Mobildə 4 sütunlu grid** et (`grid-cols-4`) — kiçik kartlar, mətn/qiymət ölçüsünü mütənasib kiçilt ki, oxunaqlı qalsın.
- **Desktop-da (brauzerdə) yan-yana, balanslı** görünüş (`sm:grid-cols-4` və ya uyğun say, kartlar bərabər enli, boşluqlar simmetrik).
- Rəng palet seçicilərini (maddə 11-dəki kimi) mobil 4-sütunlu kiçik kartlara sığacaq ölçüdə et (`flex-wrap`, kiçik `w-3 h-3` swatch-lar, lazım gələrsə 3-dən çox rəng varsa "+2" kimi bir sayğac göstər ki, kart daşmasın).

## 13. Mobil menyu açılanda "Journal" linki olmasın

- Mobil hamburger menyusunun (`Header.tsx`-in mobil naviqasiya hissəsi) siyahısından Journal linkini (əgər maddə 9-dan sonra hələ qalıbsa) sil.

## 14. Mobildə login/qeydiyyat ikonu yox idi — bərpa et; hər iki header-dən köynək ikonunu sil

- **Mobil header-də "account" (login/qeydiyyat) ikonunun görünmədiyi** problemi düzəlt — `Header.tsx`-də account ikonuna `hidden md:flex` kimi bir sinif tətbiq olunubsa (yalnız desktop-da göstərir), bunu düzəlt ki, mobil enində DƏ görünsün (əvvəlki tapşırıqda cart/wishlist üçün edilən düzəlişin eynisini account ikonuna da tətbiq et).
- **WEARTRY yazısının qarşısındakı köynək/paltar ikonunu (maddə 9-da əvvəlki tapşırıqda ✳ əvəzinə qoyulan SVG) HƏM DESKTOP, HƏM MOBIL header-dən SİL** — loqo YALNIZ mətn ("WEARTRY") olaraq qalsın, heç bir ikon/emoji olmadan.

## 15. Mobil menyuda dil seçicisini aşağıya köçür

- Mobil hamburger menyusu açılanda, onun İÇİNDƏ, ƏN AŞAĞI hissəyə dil seçici (dünya ikonu + dil siyahısı, əvvəlki tapşırıqdan) əlavə et.
- Desktop-da dil seçici Footer-də olduğu yerdə qalsın (dəyişmə) — bu, YALNIZ mobil menyu daxilinə əlavə bir giriş nöqtəsi əlavə etməkdir, desktop davranışını dəyişmir.

## 16. Returns Policy — CJ Dropshipping əsaslı, öz brendimizə uyğun qısa versiya; Cookie Policy-ni Legal-dan sil; axtarış hər şeyi əhatə etsin; qalan bölmələr üçün səhifələr

- **`components/legal/LegalPage.tsx`-in `returns` namespace-i üçün mətni yenilə** (`messages/en.json` və `messages/az.json`-da `Legal.returns.sections`): CJ Dropshipping-in ümumi dispute/return təcrübəsinə əsaslanan, AMMA bizim öz brendimizə uyğunlaşdırılmış QISA versiya yaz. Əsas vurğu: **çatdırılma 3-10 gün arası** (bunu ayrıca, aydın bir bənd kimi qeyd et), sifariş qəbulundan sonra məhsul qüsurlu/səhv gəldikdə neçə gün ərzində (məs. çatdırılmadan sonra 14 gün) dispute açıla biləcəyi, geri qaytarma prosesinin əsas addımları (əlaqə, foto sübut, təsdiq, geri ödəniş/dəyişdirmə). Uzun hüquqi mətn yox, sadə, aydın, 5-6 bənddən ibarət qısa siyasət.
- **Cookie Policy-ni "Legal" siyahısından (Footer-də göstərilən linklər) SİL** — `Footer.tsx`-dəki Legal sütunundan `legalCookies` linkini çıxar. (`app/[locale]/cookie-policy/page.tsx` faylının özünü silmə, sadəcə Footer-dəki görünən linki sil — səhifə hələ mövcud olsun, birbaşa keçid linki olmasın kifayətdir; əgər tam silinməsini istəyirsənsə ayrıca deyəcəm.)
- **Axtarışın hər şeyi əhatə etməsi**: əvvəlki tapşırıqda qurulan axtarış funksionallığını (`lib/data.ts` üzərində) YOXLA və genişlət ki, YALNIZ məhsul adı yox, HƏM DƏ kateqoriya adı (Men/Women/Kids) və mövcuddursa təsvir mətni üzrə də axtarış etsin (case-insensitive, `includes()` matching).
- **Footer-də Legal/Help sütunlarında qalan, hələ öz səhifəsi olmayan HƏR BİR linkin (məs. "Shipping Info", "FAQ" əgər ayrıca səhifə kimi nəzərdə tutulubsa, "Returns & Refunds" fərqli adla) öz minimal route/page.tsx-i yaradılsın** — sadə, `LegalPage.tsx`-ə bənzər struktur (başlıq + qısa mətn bəndləri) istifadə edərək, tərcümə açarları ilə (ən azı `en`/`az`-da real mətn, digərlərində ingiliscə fallback + "bu səhifə hazırda İngilis dilindədir" qeydi, əvvəlki tapşırıqdakı qaydaya uyğun). Məzmun hələ minimal/placeholder ola bilər — sonradan mən konkret mətn göndərəcəm, indi struktur və route-un mövcud olması kifayətdir.

## 17. FAQ bölməsi (Footer-dəki qara "Join Our Newsletter" yerinə, homepage-də)

Yeni komponent yarat: `components/home/FAQSection.tsx`:
- Qara/tünd fon (əvvəlki Newsletter bölməsinin vizual üslubuna bənzər ola bilər, `bg-neutral-900 text-white` kimi), başlıq "Tez-tez Verilən Suallar" (tərcümə açarı ilə).
- **10 ədəd sual-cavab**, akkordeon (accordion) formatında, KİÇİK/YIĞCAM görünüşdə (hər sual bir sətir, klikləndikdə cavab açılır) — `framer-motion` `AnimatePresence` ilə animasiyalı açılış-bağlanış (height/opacity keçidi).
- Sual mövzuları (sən konkret mətn göndərməyibsən, buna görə e-ticarət saytı üçün TİPİK suallar yaz — sifariş izləmə, çatdırılma müddəti [3-10 gün, maddə 16 ilə uyğun], qaytarma şərtləri, ödəniş üsulları, ölçü bələdçisi, beynəlxalq çatdırılma, sifarişi ləğv etmə, endirim kodları, məhsul keyfiyyəti/material, əlaqə üsulu) — hər sualın həm sualı, həm qısa cavabı `en` və `az` mesaj fayllarında tam yazılsın, digər 23 dildə fallback qaydasına uyğun (əvvəlki tapşırıqdakı Legal fallback məntiqi kimi, və ya sadə UI tərcüməsi mümkündürsə et).
- Bu komponenti `app/[locale]/page.tsx`-də, əvvəlki "Join Our Newsletter" bölməsinin dəqiq yerində render et.

---

## Ümumi tələblər

- Bütün yeni mətnləri `useTranslations`/`getTranslations` ilə et.
- `useReducedMotion()`-u bütün yeni animasiyalarda (Cart blur overlay, FAQ accordion, mobil menyu) tətbiq et.
- `npm run lint` və `npm run build` xətasız keçməlidir, bütün 25 locale route-u compile olmalıdır.
- Mobil (390px) və desktop (1440px) enlərində vizual sınaqdan keçir.

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Header/footer restructure, category pages, FAQ section, testimonials revamp, mobile grid fixes, returns policy update"
git push origin main
```

Vercel GitHub inteqrasiyası ilə `main`-ə push avtomatik production deploy tetikləyir — ayrıca `vercel` əmri lazım deyil.
