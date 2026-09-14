# Claude Code Komandası — Layout düzəlişləri, loqo, mobil qruplaşdırma

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsi (`weartry`). Canlı deploy-un (`weartry.vercel.app`) hazırkı görünüşünə əsaslanan düzəlişlərdir. Hər maddəni ardıcıl et, sonda `npm run lint` və `npm run build` xətasız keçməlidir, sonra ÖZÜN (soruşmadan) commit + push et.

---

## LOQO — `public/WearTRY Black Logo.png` istifadəsi (bütün digər maddələrdən ƏVVƏL bunu et)

Layihənin `public/` qovluğunda artıq `WearTRY Black Logo.png` faylı var. Header-də mətn loqosu ("WEARTRY") yerinə bu şəkli istifadə et:

- `components/layout/Header.tsx`-də Next.js `Image` komponenti ilə (`next/image`) loqo şəklini əlavə et: `<Image src="/WearTRY Black Logo.png" alt="WearTry" width={...} height={...} priority />`.
- **Ölçü**: orta ölçüdə olsun — nə çox kiçik, nə çox iri (header hündürlüyünə mütənasib, təxminən hündürlük 28-36px aralığında, en avtomatik nisbətlə saxlanılsın, `h-8 w-auto` kimi Tailwind sinifləri ilə).
- **Desktop-da**: loqo ƏN SOLDA yerləşsin (əvvəlki tapşırıqlardan miras qalan "ən sol" tələbi davam edir).
- **Mobil-də**: loqo, HAZIRKI "WEARTRY" mətninin yerində, EYNİ mövqedə (mobil header-in ortasında/sol-orta, hazırkı struktura uyğun) görünsün.
- Loqoya klik (`Link href="/"`) → səhifəni yuxarı qaytarsın (əvvəlki tapşırıqdan davam edən `window.scrollTo({ top: 0, behavior: "smooth" })` məntiqi buraya da tətbiq olunsun).
- Mətn "WEARTRY" yazısını header-dən TAM ÇIXAR (həm desktop, həm mobil) — YALNIZ şəkil qalsın.
- `next.config.ts`-də şəkil faylının adı boşluq ehtiva etdiyi üçün (`WearTRY Black Logo.png`), `src` atributunda boşluğu URL-encode et və ya faylı boşluqsuz ada köçür (`public/weartry-logo-black.png`) — İKİNCİ YOL DAHA TƏHLÜKƏSİZDİR: faylı yenidən adlandır (`mv "public/WearTRY Black Logo.png" "public/weartry-logo-black.png"`) və kodda `/weartry-logo-black.png` istifadə et.

---

## BRAUZER (Desktop) düzəlişləri

### 1. "New Arrival is Here" — 1 məhsul əlavə et

`lib/data.ts`-dəki `newArrivals` massivinə 1 YENİ placeholder məhsul əlavə et (mövcud 3-ün formatına uyğun: ad, qiymət, endirim faizi, rəng paletləri, gradient placeholder). Nəticədə bu bölmə 4 məhsul göstərəcək.

### 2. "Seasonal Drop" bölməsi — sağdakı 3-cü kartı aşağı köçür (desktop)

Canlı saytda bu bölmə: sol tərəfdə böyük "Seasonal Drop" bənneri, sağ tərəfdə 3 kart yan-yana, altında 4-cü kart tək qalır (səliqəsiz görünür). `components/home/SeasonalDrop.tsx`-in grid strukturunu düzəlt:
- Desktop-da sağ tərəfdəki kart qrupunu **2x2 grid**-ə çevir (sol bənner öz sütununda qalsın, sağda 4 kart 2 sütun × 2 sıra şəklində düzülsün) — bu, indiki "3 yan-yana + 1 tək aşağıda" səliqəsiz görünüşünü aradan qaldırır.
- Mobildə HAZIRKI görünüş (istifadəçinin təsdiqinə görə) artıq düzgündür — mobil breakpoint-i DƏYİŞMƏ, YALNIZ desktop (`sm:`/`md:` breakpoint-lərindən yuxarı) grid-i düzəlt.

### 3. "Best Sellers" altındakı "View More" — ayrı səhifəyə aparsın

Hazırda `View More` linki `#best-sellers` anchor-a gedir (eyni səhifədə scroll). Bunu dəyiş:
- `app/[locale]/products/page.tsx` (və ya `app/[locale]/best-sellers/page.tsx`) adlı yeni bir "Bütün Məhsullar"/"Best Sellers" səhifəsi yarat — `lib/data.ts`-dəki `bestSellers` massivini (və istəsən digər massivləri də) grid şəklində göstərsin (StaggerGroup/StaggerItem ilə, `ProductCard`-ları təkrar istifadə et, filtr tablarını `BestSellers.tsx`-dən miras al).
- `components/home/BestSellers.tsx`-dəki "View More" linkini bu yeni route-a yönləndir (`Link href="/products"` kimi, anchor `#`-siz).

### 4. "Shop With Confidence" başlığını sil, alt hissəni saxla

`components/home/Features.tsx`-də bölmənin başlığı olan "Shop With Confidence" mətnini (və uyğun tərcümə açarını render edən sətri) SİL — YALNIZ başlıq, aşağıdakı 4 xüsusiyyət kartı (Truck/Leaf/Return/Shield ikonları və mətnləri) OLDUĞU KİMİ qalsın.

### 5. Header-də böyük "WEARTRY" mətnini sil (loqo bölməsində artıq edilib) — burada YALNIZ desktop naviqasiyanı ORTALA

Yuxarıdakı "LOQO" bölməsində mətn artıq silinib və şəkillə əvəz olunub. Bu maddədə əlavə tələb: **desktop-da naviqasiya menyusunu (Men/Women/Kids) header-in ORTASINA (mərkəzinə) al** — əvvəlki tapşırıqda "loqonun yanına, sola" deyilmişdi, İNDİ İSTİFADƏÇİ TƏLƏBİ DƏYİŞİB: loqo solda tək qalsın, Men/Women/Kids isə header-in horizontal mərkəzində (`justify-center` və ya `absolute left-1/2 -translate-x-1/2` texnikası ilə) yerləşsin, sağda ikonlar (account/wishlist/cart/search) qalsın — üç bölgülü klassik header strukturu: SOL (loqo) — ORTA (naviqasiya) — SAĞ (ikonlar).

### 6. FAQ bölməsi — qara fon sil, başlıq soldan, suallar alt-alta

`components/home/FAQSection.tsx`:
- Tünd/qara arxa fonu (`bg-neutral-900 text-white`) SİL — normal açıq fon (`bg-background` və ya şəffaf, homepage-in ümumi fonuna uyğun) et, mətn rəngini uyğun tünd rəngə (`text-foreground`) çevir.
- "Frequently Asked Questions" başlığını, hazırkı ORTALANMIŞ mövqedən SOLA al (`text-left`).
- Sualları hazırkı kimi ALT-ALTA (accordion, dəyişməz) saxla — YALNIZ fon və başlıq düzülüşü dəyişir, akkordeon funksionallığı və animasiya olduğu kimi qalsın.

---

## MOBİL düzəlişlər

### 7. "New Arrival is Here" mobildə — kartları böyüt, 2x2 qruplaşdır

Canlı saytın mobil görünüşündə (4-cü şəkil) 3 (indi 4, maddə 1-dən sonra) kart bir sırada sıxılıb, kiçik və səliqəsiz görünür. `components/home/NewArrivals.tsx`-in mobil grid-ini düzəlt:
- Mobildə (`< 640px`) grid-i **2 sütunlu** et (`grid-cols-2`), kartları BÖYÜT (hazırkı həddindən artıq kiçik/sıx ölçüdən çıxar — kart eni, şəkil sahəsinin hündürlüyü, mətn ölçüsü mütənasib böyüsün).
- 4 kart 2×2 formatında (2 yuxarıda yan-yana, 2 aşağıda yan-yana) düzülsün.
- Rəng palet dairələrinin (swatch) mobil ölçüsünü də bu böyümüş kart ölçüsünə mütənasib tənzimlə (əvvəlki tapşırıqdakı "kobud olmasın" qaydası davam etsin — böyüsün, amma daşmasın).

### 8. Mobil footer-də ödəniş loqoları — səliqəli sırala

Canlı saytın mobil görünüşündə (son şəkil) ödəniş loqoları (Visa/Mastercard/Amex/PayPal/Apple Pay/Discover/JCB/Diners/UnionPay) 2 sətirdə, qeyri-mütənasib enlərlə səpələnib. `Footer.tsx`-dəki ödəniş loqoları konteynerini düzəlt:
- Mobildə `flex-wrap` + sabit/bərabər `gap` (məs. `gap-2`) istifadə et, hər loqonu EYNİ HÜNDÜRLÜKDƏ (məs. `h-6`) və mütənasib enlə göstər (SVG-lərin öz nisbətini pozmadan).
- Sətirlər arası boşluğu bərabərləşdir (`gap-y-2`), loqoların bir-birinə born-a-born yapışmaması üçün kiçik daxili padding (`p-1`) əlavə et hər loqo konteynerinə.
- Nəticədə mobil enində loqolar səliqəli, bərabər ölçülü, bərabər boşluqlu grid/flex sırasında görünsün (məs. 4 loqo bir sırada, növbəti 5 loqo başqa sırada, mütənasib).

---

## Ümumi tələblər

- Bütün yeni mətnləri `useTranslations`/`getTranslations` ilə et (yeni `newArrivals` elementi üçün 25 dil faylına uyğun açar əlavə et, ən azı `en`/`az`-da tam tərcümə).
- `npm run lint` və `npm run build` xətasız keçməlidir, bütün 25 locale route-u compile olmalıdır.
- `next/image` istifadə edərkən `next.config.ts`-də əlavə domain konfiqurasiyası TƏLƏB OLUNMUR (loqo lokal `public/`-dandır).
- Mobil (390px) və desktop (1440px) enlərində vizual olaraq yoxla.

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Add logo image, fix header layout, grid groupings, FAQ styling, and product listing page"
git push origin main
```

Vercel GitHub inteqrasiyası ilə `main`-ə push avtomatik production deploy tetikləyir — ayrıca `vercel` əmri lazım deyil.
