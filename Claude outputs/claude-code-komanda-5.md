# Claude Code Komandası — Header balansı, mobil footer, tərcümə düzəlişi, PDP yenidən qurulması

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsi (`weartry`). Bu, əvvəlki tapşırıqlardan HƏLƏ TAM İCRA OLUNMAMIŞ maddələrin təkrar, daha dəqiq göstərişlə verilməsidir — hər maddəni diqqətlə, TAM şəkildə et (əvvəlki cəhdlər natamam qalıb). Sonda `npm run lint` və `npm run build` xətasız keçməlidir, sonra ÖZÜN (soruşmadan) commit + push et.

---

## MOBİL düzəlişlər

### 1. Mobil footer — ödəniş loqoları: 4 üst + 4 alt, 9-cunu sil

Hazırda mobil footer-də 9 ödəniş loqosu (Visa, Mastercard, Amex, PayPal, Apple Pay, Discover, JCB, Diners/UnionPay-ə bənzər dairəvi loqo, üçüncü sıra tək qalan loqo) səliqəsiz, qeyri-bərabər sətirlərdə görünür. Bunu dəqiq belə düzəlt:
- Loqo sayını **8-ə endir** (hazırkı 9-dan birini sil — ən az tanınan/az önəmli olanı, məs. ikinci sırada tək qalan üçüncü loqonu, seç və sil).
- Qalan 8 loqonu **2 bərabər sıraya böl: 4 loqo yuxarı sırada, 4 loqo aşağı sırada**, hər sırada bərabər genişlik və boşluqla (`grid grid-cols-4 gap-2` istifadə et, `flex-wrap` yox — grid daha proqnozlaşdırıla bilən bərabər bölgü verir).
- Hər loqo eyni hündürlükdə (`h-6` və ya uyğun) və konteynerinə mütənasib enlə (`w-full` grid xanası daxilində, öz nisbətini pozmadan `object-contain`) göstərilsin.
- Bunu `components/layout/Footer.tsx`-də YALNIZ mobil breakpoint-də (`grid-cols-4` mobil, desktop-da isə hazırkı `flex-wrap` sıra formatını SAXLA — desktopda 8/9 loqo bir sırada problemsiz sığır, dəyişmə).

### 2. Mobil footer — sütun başlıqları və loqo tarazlığı

2-ci şəkildə göstərilən "WEARTRY" başlığı + "Modern everyday fashion..." mətni ilə "Help"/"Company" sütunlarının horizontal düzülüşü bərabərsizdir (WEARTRY bloku bir qədər yuxarıda, sütunlar bir qədər aşağıda başlayır kimi görünür). Bunu düzəlt:
- Footer-in yuxarı hissəsindəki bütün sütunları (loqo+təsvir bloku, Help, Company) **eyni üfüqi başlanğıc xəttinə (`items-start`)** düz, hər birinin başlıq/məzmun blokları eyni `margin-top`/`padding-top` ilə başlasın.
- Loqonu (WEARTRY mətni/şəkli) sütun başlığı ilə eyni üfüqi xəttə salmaq üçün lazım gələrsə loqo bloku üçün kiçik bir aşağı offset (`mt-1` və ya `mt-2` kimi) əlavə et — istifadəçinin təklifinə uyğun olaraq "logonu bir az aşağı çəkmək" düzgün yanaşmadır, bunu tətbiq et.

### 3. Mobil footer-də loqo — WEARTRY mətnini sil, şəkli əlavə et, böyüt

Mobil footer-in yuxarı sol küncündə HƏLƏ DƏ "WEARTRY" mətni və onun altında "Modern everyday fashion, designed to move with you." təsviri görünür. Bunu düzəlt:
- **"WEARTRY" mətnini TAM SİL**, yerinə `public/` qovluğundakı loqo şəklini (`next/image` ilə, əvvəlki tapşırıqda header üçün istifadə edilən eyni fayl) əlavə et.
- **Altındakı təsvir mətnini ("Modern everyday fashion, designed to move with you.") DƏ SİL** — istifadəçi açıq şəkildə bunun silinməsini istəyib.
- Bu footer-dəki loqo şəklinin ölçüsünü header-dəki loqodan **nisbətən BÖYÜK** et (məs. header-də `h-8` isə, footer-də `h-10`/`h-12`) — footer-də loqo brend imzası kimi daha çox diqqət çəkməlidir.

---

## BRAUZER (Desktop) düzəlişləri

### 4. Header-də loqo — ƏN SOLA (bu, TƏKRAR dəfələrlə tələb olunub, İNDİ TAM İCRA ET)

`components/layout/Header.tsx`-də loqo (şəkil) elementinin CSS/flex mövqeyini yoxla və təsdiqlə ki, header-in flex konteynerində **`justify-start`/ilk uşaq element** olaraq, HEÇ BİR margin-auto və ya mərkəzləşdirici sinif olmadan, konteynerin ən sol kənarına ilişik dursun. Əgər header 3 hissəli grid (`grid-cols-3`) strukturundadırsa, loqo birinci sütunda, sütun daxilində `justify-self-start` ilə tam sola sıxılsın — heç bir sol padding artıqlığı, heç bir mərkəzləşdirmə qalmasın.

### 5. Header-in bütün elementləri — üfüqi olaraq TAM tarazlaşdırılmış, yuxarı çəkilmiş

4-cü şəkildə header-in loqo/naviqasiya/ikonlar sırası bir-birinə görə şaquli olaraq (vertically) tam düz deyil (bəziləri bir qədər aşağıda, bəziləri yuxarıda kimi görünür). Bunu düzəlt:
- Header-in əsas konteynerinə (loqo + naviqasiya + ikonlar sırasını əhatə edən element) `items-center` tətbiq et ki, HAMISI (loqo, Men/Women/Kids linkləri, account/wishlist/cart/search ikonları) eyni üfüqi mərkəz xəttində, bir-birinə tam paralel dursun.
- Əgər loqo şəkli (`<Image>`) öz içində əlavə boşluq buraxırsa (PNG-nin özündə şəffaf sahə çoxdursa), bunu `Image`-ə `className="block"` (inline boşluğu aradan qaldırmaq üçün) əlavə edərək düzəlt.
- **Sağ tərəfdəki ikon qrupunu (account/wishlist/cart/search) ən sağ kənara, dibinə qədər** çək — konteynerin sağında artıq padding/margin qalmasın, `justify-end` və ya grid-in son sütununda `justify-self-end` istifadə et.
- Naviqasiya (Men/Women/Kids) əvvəlki tapşırıqda tələb olunduğu kimi header-in ORTASINDA (mərkəzində) qalsın — bu maddə YALNIZ vertical alignment və sağ/sol kənar sıxlığını düzəldir, horizontal mövqeləri (sol/orta/sağ) dəyişmir.

### 6. FAQ bölməsi — dil dəyişəndə suallar tərcümə OLUNMALIDIR (kritik bug)

5-ci şəkildə göstərilən problem: dil `da` (Danimarka) seçiləndə səhifə başlığı "Frequently Asked Questions" İNGİLİSCƏ qalır VƏ altında "Dette indhold er i øjeblikket kun tilgængeligt på engelsk" (bu məzmun hazırda yalnız ingilis dilində əlçatandır) mesajı görünür, output isə TAM İNGİLİSCƏDİR — YƏNİ FAQ TƏRCÜMƏ OLUNMAYIB, bu fallback mətn hər dil üçün görünür. Kök səbəb: `components/home/FAQSection.tsx` yalnız `en`/`az` mesaj fayllarında FAQ məzmununu tapır, digər 23 dildə tapmayıb fallback mesajı göstərir.

Bunu TAM həll et:
- **FAQ-ın 10 sual-cavabını BÜTÜN 25 dil faylına (`messages/{locale}.json`) tam tərcümə et** — bu, "Legal" siyasət mətnləri kimi uzun hüquqi mətn deyil, cəmi 10 qısa sual + 10 qısa cavabdır, BÜTÜN dillərdə tam yerli tərcümə YAZILMALIDIR (fallback DEYİL). Hər dil üçün native/düzgün tərcümə et (məsələn Danimarka dilində "Hvordan kan jeg spore min ordre?" və s.).
- `FAQSection.tsx`-dəki fallback ("bu məzmun yalnız ingilis dilində əlçatandır") məntiqini FAQ üçün TAM ÇIXAR — FAQ artıq bütün dillərdə mövcud olduğundan bu xəbərdarlığa ehtiyac qalmır.
- Bu fallback məntiqini YALNIZ Legal (Privacy/Terms/Returns/Cookies) səhifələrində saxla (onlar hələ də yalnız `en`/`az`-da tam ola bilər, bu qaydaya toxunma) — YALNIZ FAQ-a aid HƏLLİ tam tərcüməyə çevir.
- Yoxla: `scripts/build-messages.mjs` (əgər mövcud merge skripti istifadə olunursa) FAQ namespace-ni "UI tərcüməsi" hissəsinə daxil etsin (Legal kimi ayrıca saxlanılan bir hissə olmasın) — FAQ mesaj strukturunu elə qur ki, `deepMerge` funksiyası onu digər UI mətnləri kimi hər dilin öz JSON faylına düzgün yazsın.

### 7. FAQ sualları — scroll zamanı animasyalı giriş

FAQ akkordeon sualları hazırda statik görünür (heç bir giriş animasiyası yoxdur). Bunu düzəlt:
- Hər sual sətrini (`StaggerItem` və ya ayrıca `BlurFadeUp`) ilə bölmə görünəndə ardıcıl (staggered) şəkildə aşağıdan-yuxarı+blur ilə görünsün — `StaggerGroup`/`StaggerItem` komponentlərini (əvvəlki tapşırıqlarda qurulmuş) FAQ sual siyahısına tətbiq et (10 sualın hər biri bir `StaggerItem`).
- Akkordeon aç/bağla keçidi (mövcud `AnimatePresence` istifadəsi, əgər varsa) TOXUNULMAZ qalsın, YALNIZ İLK GİRİŞ (scroll-a-view) animasiyası əlavə olunur.

---

## LOGİN SƏHİFƏSİ

### 8. Login/Qeydiyyat səhifəsi yarat, header-dəki account ikonu ora aparsın

`app/[locale]/account/login/page.tsx` (və istəsən `app/[locale]/account/register/page.tsx`, ya da bir səhifədə tab keçidi ilə hər ikisi) yarat:
- Sadə, öz brendimizin dizayn dilinə uyğun (neytral, minimal, `border-border`, `rounded-xl`, `bg-background`) login formu: email + şifrə sahələri, "Login" düyməsi, altında "Hesabın yoxdur? Qeydiyyatdan keç" linki (tab/route keçidi ilə register formuna).
- Register formu: ad, email, şifrə, şifrə təkrarı sahələri, "Qeydiyyatdan keç" düyməsi.
- Bu, hələlik FRONTEND-ONLY struktur ola bilər (real autentifikasiya backend-i YOXDUR bu mərhələdə) — forma submit-i sadə bir `useState`/placeholder mesajla idarə olunsun (`// TODO: connect to auth backend` şərhi ilə), heç bir real sessiya/JWT yaradılmasın.
- `Header.tsx`-dəki account ikonuna klik → bu login səhifəsinə (`/account/login`) yönləndirsin (hazırda funksionalsızdırsa, indi bağla).
- `BlurFadeUp`/`StaggerGroup` ilə səhifə girişi animasiyalı olsun (digər səhifələrlə tutarlı).

---

## MƏHSUL DETAL SƏHİFƏSİ (PDP) — TAM YENİDƏN QURULMASI

### 9. PDP-ni referans dizayna uyğun, çox-bölməli, detallı struktur halına gətir

İstifadəçinin göndərdiyi referans şəkillər (GemPages Shopify şablonu) bir PDP-nin necə OLMALI olduğunu göstərir — RƏNGLƏR/BRENDLƏŞDİRMƏ YOX, YALNIZ STRUKTUR/FORMA eyni olsun, bizim saytın öz vizual stilində (neytral rənglər, mövcud tipoqrafiya, mövcud `border`/`rounded` dəyərləri) tətbiq et. Mövcud `app/[locale]/products/[slug]/page.tsx` (əvvəlki tapşırıqda yaradılmışdısa) bu strukturu əhatə etməlidir:

**a) Yuxarı bölmə (şəkil + əsas info):**
- Sol tərəfdə: böyük əsas şəkil (placeholder gradient) + altında kiçik thumbnail-lər sırası (4 ədəd, kliklənəndə əsas şəkli dəyişdirən — client-side state ilə, real şəkil yoxdursa fərqli gradient rənglərlə simulyasiya et).
- Sağ tərəfdə yuxarıdan aşağı: məhsul adı, qiymət (endirimli + üstü xətli köhnə qiymət), ulduz reytinqi + rəy sayı (məs. "★★★★☆ (128 rəy)"), stok xəbərdarlığı ("Yalnız 5 ədəd qaldı" kimi, aşağı stok üçün qırmızı/narıncı vurğu), qısa etibarlılıq nişanı ("Məhsulun nümunə şəkillə eyni olduğuna zəmanət veririk" kimi), qısa təsvir paraqrafı, bir müştəri rəyi sitatı (placeholder ad + placeholder rəy mətni ilə, kart daxilində), rəng seçici (dairələr, mövcud sxem), ölçü seçici (dropdown, mövcud sxem), miqdar seçici (+/- düymələri ilə), "Add to Cart" və "Buy Now" iki ayrı düymə (Add to Cart = mövcud cart sisteminə bağlı, Buy Now = hələlik placeholder), ödəniş metodu ikonları sırası (əvvəlki tapşırıqlarda hazırlanan rəngli SVG-lər).

**b) "Details / Free Shipping / Returns" akkordeon bölməsi:**
- 3 qatlanan bölmə (Details, Free Shipping, Return Policy) — klikləndikdə açılan (`AnimatePresence` ilə animasiyalı), qısa məzmun mətni ilə.

**c) "1000+ müştəri bu üslubu sevir" statistika + rəylər bölməsi:**
- Böyük başlıq statistikası (məs. "1000+ müştəri bu məhsulu 4 ulduz və yuxarı qiymətləndirib!").
- Sol tərəfdə: ümumi reytinq xülasəsi (böyük rəqəm, "X rəyə əsasən", 5-1 ulduz bar-qrafiki).
- Sağ tərəfdə: fərdi rəy kartları siyahısı (ad, tarix, rəy mətni, ulduz sayı) — placeholder məlumatlarla (real istifadəçi məlumatı yoxdur), "Load More" düyməsi ilə (frontend-only, əlavə placeholder rəylər göstərən).
- **"Write a Review" düyməsi** əlavə et (frontend-only, klikləndikdə sadə bir forma açan/placeholder).

**d) "Products related to this item" bölməsi:**
- Referans şəkildəki kimi, əlaqəli məhsulları (`lib/data.ts`-dəki eyni kateqoriyadan digər məhsullar) 4 kart halında, hər birində şəkil, ad, rəy sayı, qiymət (endirimli), "Add to Cart" düyməsi, "Sold: X" / "Available: X" statistikası (placeholder ədədlərlə) göstərsin.

**e) FAQ + Əlaqə bölməsi (PDP-yə xas, homepage FAQ-dan AYRI):**
- Referansdakı kimi sol tərəfdə məhsula xas 5 sual-cavab (akkordeon, animasyalı), sağ tərəfdə əlaqə telefonu/mesajı — AMMA İSTİFADƏÇİNİN AÇIQ TƏLƏBİNƏ GÖRƏ: **email göndərmə formu (referansdakı "Tell us your question" + email input + submit) BURAYA ƏLAVƏ ETMƏ** — yalnız sualları özü göstər, "Bizimlə əlaqə: [telefon/email mətni]" kimi statik bir sətir kifayətdir, interaktiv form YOX.
- Bu 5 sualın mətnini məhsula uyğun uydur (ölçü, material, qulluq təlimatları, stok, çatdırılma ilə bağlı).

**f) Alt bölmə — etibarlılıq nişanları:**
- Referansdakı "Free shipping / Secured payment / 30-day return / Product check" 4-ikonlu sırasını əlavə et (mövcud saytın inline SVG ikon üslubunda, `Features.tsx`-dəki mövcud ikonlara bənzər sadə xətli ikonlar).

### 10. Bütün bunlar HƏR MƏHSULDA eyni struktur + ANIMASİYALAR ƏKSİKSİZ olmalıdır

- Yuxarıdakı bütün struktur `app/[locale]/products/[slug]/page.tsx`-də TƏK DƏFƏ qurulur və `lib/data.ts`-dəki BÜTÜN məhsullar üçün eyni şablonla işləyir (dinamik route olduğu üçün bu artıq təbii təmin olunur — YALNIZ strukturun HƏR bölməsinin doldurulduğunu təsdiqlə, heç bir bölmə boş/yarımçıq qalmasın).
- **Bütün yeni bölmələr (a-f) `BlurFadeUp`/`StaggerGroup`/`StaggerItem` ilə scroll-a-view animasiyalı olsun** — istifadəçi "Animasyalar əksiksiz olsun" deyə xüsusi vurğulayıb, HEÇ BİR bölmə animasiyasız qalmamalıdır.
- Səhifə keçidi (`ProductCard`-dan bu səhifəyə keçid) əvvəlki tapşırıqda qurulan `AnimatePresence` page-transition sistemi ilə işləməlidir.

---

## Ümumi tələblər

- Bütün yeni mətnləri `useTranslations`/`getTranslations` ilə et, 25 dil faylına uyğun açar əlavə et (FAQ üçün maddə 6-da tələb olunduğu kimi TAM tərcümə, PDP-nin digər mətnləri üçün ən azı `en`/`az`-da tam, qalanlarında mövcud fallback qaydası).
- `useReducedMotion()` bütün yeni animasiyalarda tətbiq olunsun.
- `npm run lint` və `npm run build` xətasız keçməlidir, bütün 25 locale route-u compile olmalıdır.
- Mobil (390px) və desktop (1440px) enlərində vizual olaraq yoxla, xüsusilə header vertical alignment və footer ödəniş loqoları grid-i diqqətlə test et.

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Fix header/footer alignment, complete FAQ translations, add login page, rebuild PDP with full sections"
git push origin main
```

Vercel GitHub inteqrasiyası ilə `main`-ə push avtomatik production deploy tetikləyir — ayrıca `vercel` əmri lazım deyil.
