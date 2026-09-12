# Claude Code Komandası — Header, endirim barı, mobil sabitlik, UI düzəlişləri

Aşağıdakı mətni olduğu kimi Claude Code-a ver. Bu, Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsidir (`weartry`). 16 maddəlik dəyişiklik siyahısıdır — hər maddəni ardıcıl, diqqətlə et, sonda `npm run lint` və `npm run build` xətasız keçməlidir, sonra ÖZÜN (soruşmadan) commit + push et.

---

## 1. Dil/Region seçici — bayraqları sil, dünya ikonu, avtomatik region

Hazırkı `components/layout/LanguageMarketSwitcher.tsx` dil VƏ bazar/region seçimini eyni dropdown-da, bayraqlarla göstərir. Bunu tam yenidən qur:

- Bayraq emoji-lərini (`localeFlags`, `markets[].flag`) HEÇ YERDƏ göstərmə (header düyməsində, dropdown siyahısında).
- Header-dəki düymə artıq bayraq göstərməsin — sadəcə bir **dünya (globe) ikonu** (inline SVG, `lucide`-vari sadə dairə + meridian xətləri) göstərsin, üzərinə klikləyəndə YALNIZ DİL seçimi açılsın (region/ölkə seçimi YOX).
- Dropdown açılanda animasiyalı olsun (framer-motion: `AnimatePresence` + `scale`/`opacity` + yüngül `y` offset ilə açılıb-bağlansın, sadə `display: none` keçidi olmasın).
- Dropdown daxilində YALNIZ dillərin siyahısı olsun (`locales` + `localeNames`), bayraqsız — sadəcə dil adı (məs. "Azərbaycanca", "English", "Français").
- **Region/bazar seçimini istifadəçi bir daha əl ilə seçməsin.** `markets`/`getMarket` məntiqini "checkout" axınına köçür: ödəniş (checkout) səhifəsi/komponenti hazırda yoxdursa, bunun üçün minimal bir `lib/market-context` və ya sadə bir "OrderSummary"/"CheckoutSummary" nümunə komponenti yarat ki, gələcək checkout axışında istifadəçi ölkəsini/valyutasını orada seçsin (bu, gələcək inkişaf üçün struktur — hazırda əsas odur ki, HEADER-də ayrıca ölkə seçimi DÜYMƏSİ qalmasın).
- **Avtomatik geolokasiyaya görə qiymət/valyuta göstər:** istifadəçi sayta ilk dəfə daxil olanda brauzerin/serverin aşkarladığı ölkəyə görə uyğun bazarı (`markets` massivindən) avtomatik seç və `weartry_market` cookie-sinə yaz — istifadəçi manual seçim etməyibsə. Bunun üçün:
  - Ən sadə yol: Vercel-in `x-vercel-ip-country` request header-indən (middleware daxilində əlçatandır) ölkə kodunu oxu, `middleware.ts`-də (next-intl middleware-dən ƏVVƏL və ya sonra, chain şəklində) bu header əsasında `weartry_market` cookie-sini set et (əgər cookie hələ yoxdursa).
  - Bu header production-da (Vercel-də) mövcuddur; lokal dev-də olmaya bilər — belə halda mövcud `defaultMarket` (US) fallback kimi qalsın, xəta verməsin.
  - Qiymətlərin özü hələ statik placeholder ola bilər (`lib/data.ts`-dəki `Product` massivləri) — bu addımın məqsədi YALNIZ düzgün valyuta simvolunun/region məlumatının avtomatik seçilməsidir, tam çoxvalyutalı qiymət konvertasiyası ayrı bir iş kimi qeyd edilsin (kod daxilində `// TODO: real currency conversion` şərhi ilə).

## 2. Header promo/endirim barı — sonsuz marquee, cüzi sürət artımı

Hazırkı `components/layout/PromoBar.tsx` CSS marquee istifadə edir (`.animate-marquee`, sabit sürət, `globals.css`-dəki `@keyframes marquee`).

- Marquee ARTIQ SONSUZ olmalıdır — bu artıq `animation: marquee ... infinite` ilə təmin olunur, YOXLA ki, həqiqətən kəsilmədən davam edir (əgər hazırda mətn qısadırsa və boşluq görünürsə, mətni kifayət qədər təkrarla ki, ekran genişliyindən asılı olmayaraq boşluq görünməsin — `Marquee.tsx` komponentinin uşaqları iki dəfə deyil, DÖRD dəfə təkrarla, geniş ekranlarda boşluq qalmasın).
- **Sürəti tədricən, çox cüzi şəkildə artır**: hər tam dövrədən sonra animasiyanın müddətini (`--marquee-duration`) çox az (məs. 0.5–1%) qısalt, beləliklə sürət zamanla nəzərəçarpmaz şəkildə artsın. Bunun üçün `PromoBar.tsx`-i client component edib, `setInterval`/`requestAnimationFrame` ilə CSS custom property-ni (`--marquee-duration`) tədricən azalt (məs. başlanğıc 28s-dən minimum 10s-ə qədər, sonra sabit qal — sonsuza qədər azalmasın, məntiqli bir alt həddə çatanda dayansın).
- **"Bitdikdən sonra çıxır, digər tərəfdən sayı artırır" problemi**: bu, marquee-nin loop nöqtəsində "sıçrayış" effektidir. Səbəb çox güman ki, endirim faizi kimi bir ədəd (`30%`) mətn daxilində sabit yazılıb, amma sən "sayın artması" demisən — YƏNİ: mətndəki faiz ədədi (`30%`) sabit yox, DİNAMİK olaraq addım-addım artan bir sayğac olmalıdır (məs. 10%-dən başlayıb tədricən 30%-ə, sonra plato). Bunu `PromoBar.tsx`-də ayrı bir state ilə et: `useState` + `useEffect` + `setInterval` ilə faiz ədədini yavaş-yavaş artır (məs. hər 150ms-də 1% addımla 10%-dən 30%-ə), maksimuma çatanda dayansın (sıfırlanmasın, "sonsuz sayda" olması marquee-nin təkrarlanması ilə təmin olunur, ədədin özü hər dövrədə sıfırdan başlamasın — bir dəfə 30%-ə çatdıqdan sonra sabit 30% qalıb marquee sonsuz axmağa davam etsin).
- Mətn nümunəsi: `Endirimlər {percent}%-ə qədər` (tərcümə açarı `PromoBar.message1`/`message2`-yə `{percent}` interpolasiyası əlavə et, `next-intl`-in `t("message1", { percent })` formatı ilə, bütün 25 dil faylında).

## 3. Alt menu (Footer) — sıxlaşdır, ödəniş loqoları, təmizlə

`components/layout/Footer.tsx`-i tam sadələşdir:

- Hazırkı 4 sütunlu (Shop/Help/Company/Legal) geniş yayılmış strukturu SIX bir yerə yığ — sütunlar arası boşluğu azalt, konteyneri mərkəzləşdirmə yerinə kənarlara (sola/sağa) doğru sıxlaşdır (`justify-between` saxla, amma `gap`-i azalt, `max-width`-i məzmuna görə optimallaşdır, hər sütunun enini `w-auto`/`shrink` et ki, "boş, yayılmış" görünüş getsin).
- **Newsletter/"Xəbərdar olun" bölümünü tamamilə sil**: `components/home/NewsletterForm.tsx`-in Footer-də istifadəsini (`<NewsletterForm compact />`) Footer-dən çıxar, Footer-dəki `newsletterHeading` sətrini də render etmə. (`NewsletterForm.tsx` faylının özünü silmə — `NewsletterSection.tsx` homepage-də hələ istifadə oluna bilər, YALNIZ Footer-dəki referansı sil, əgər `NewsletterSection` da silinməlidirsə ayrıca deyəcəm, hələlik YALNIZ Footer-dəkini sil.)
- Footer-in aşağı hissəsinə (copyright sətrinin yanında və ya üstündə) **ödəniş metodları loqoları** əlavə et: Visa, Mastercard, Amex, PayPal, Apple Pay kimi inline SVG ikonlar (sadə, monoxrom/outline tərz SVG-lər, brend adları ilə `aria-label`, xarici şəkil/link yükləmə — hamısı kodda inline SVG kimi yaz, xarici URL-dən yükləmə).
- Footer-i "səliqəli" et: hər sütun başlığının altındakı boşluğu, sətirlər arası interval-ı Tailwind-in kiçik utility-ləri ilə tənzimlə (`space-y-2` və s.), mobil görünüşdə sütunlar 2 sütuna yığılsın (`grid-cols-2 sm:grid-cols-4` kimi), lazımsız geniş boşluqlar qalmasın.

## 4. Sayt xətaları + mobil sabitlik (horizontal scroll / ağ boşluq)

- `npm run build` və `npm run lint` işlədib bütün xətaları/warning-ləri düzəlt (əgər yeni xəta yoxdursa, bu addım "clean" təsdiqi kimi keçsin).
- **Mobildə "sağa-sola tərpənmə, ağ arxa plan görünməsi" problemi** — bu, adətən bir elementin `width`-inin viewport-dan böyük olub üfüqi scroll yaratmasından qaynaqlanır. Bunu həll et:
  - `app/globals.css`-də `body`/`html`-ə `overflow-x: hidden` əlavə et (təhlükəsizlik toru kimi), AMMA əsas səbəbi tap və düzəlt: bütün genişlik alan section-larda (`Hero`, `MarqueeTextSection`, `Categories`, marquee-lər) `w-screen` və ya sabit `px` genişlik istifadə edilibsə, bunları `w-full`/`max-w-full`-a çevir.
  - `Marquee.tsx` komponentinin konteynerinə `overflow-hidden` təsdiqlə (yoxla ki, artıq var).
  - Mobil header-in `position: sticky/fixed` davranışı zamanı arxa fonun (`bg-background`) HƏMİŞƏ tam örtülü olduğunu təsdiqlə (şəffaf/keçid zamanı ağ boşluq görünməsin) — `Header.tsx`-də arxa plan rənginin transition zamanı da tətbiq olunduğunu yoxla.
  - Bütün `motion.div`/`BlurFadeUp` animasiyalarında `x`/`translateX` istifadə olunan yerlərdə (əgər varsa) bunların mobil enini aşmadığını yoxla (`overflow-hidden` wrapper ilə).

## 5. Dil dəyişimi — tam tərcümə, qarışıq dil olmasın

- `messages/{locale}.json` fayllarını (25 dil) yoxla: hazırda 2-də (`en`, `az`) tam tərcümə var, digər 23-də UI tərcümə olunub AMMA `Legal` (hüquqi mətnlər) ingiliscə qalıb (bu, əvvəlki mərhələdə şüurlu qərar idi). İstifadəçi indi "yarı ingiliscə yarı azərbaycanca olmasın" deyir — bunun mənası: HƏR bir seçilmiş dildə görünən BÜTÜN mətn HƏMİN DİLDƏ olmalıdır, başqa dilin qırıntısı qalmamalıdır.
  - Prioritet: azaldılmış scope ilə düzəlt — Legal (Privacy/Terms/Returns/Cookies) mətnlərini hələlik YALNIZ iki dildə (`en`, `az`) saxlamaq əvəzinə, DİGƏR 23 dildə də Legal mətnlərini İNGİLİSCƏ göstərmək yerinə, həmin dilin öz adı ilə YOX, universal fallback olaraq **İNGİLİSCƏ göstərildiyini istifadəçiyə aydın et** (kiçik bir qeyd: "This policy is currently available in English" mətni əlavə et Legal səhifələrinin başına, əgər cari dil `en`/`az` deyilsə) — bu, "yarı-yarı" hissini aradan qaldırır, çünki İSTİFADƏÇİ NİYƏ ingiliscə gördüyünü anlayır, qarışıq deyil, aydın fallback olur.
  - Bundan başqa, KOD daxilində hardcode edilmiş (tərcümə açarı istifadə etməyən) HƏR HANSI mətn qalıbsa (məs. `components/motion/CustomCursor.tsx`, `ContactForm.tsx`, `Footer.tsx` daxilində "aria-label" kimi yerlərdə) — hamısını tap (`grep -rn` ilə JSX daxilində düz-mətn axtar) və `useTranslations`-a köçür, hər 25 mesaj faylına uyğun açar əlavə et.
  - `next-intl`-in `NextIntlClientProvider`-ə ötürdüyü mesajların düzgün namespace ilə tam ötürüldüyünü təsdiqlə (`app/[locale]/layout.tsx`-də mesajları filterləyən bir kod yoxdursa, problem yoxdur — tam mesaj obyekti ötürülməlidir).

## 6. Header layout — WEARTRY sola, menu sağa, dil alt-menuya, axtarış sağa

`components/layout/Header.tsx`-i yenidən düzeniyi et:

- **Desktop-da**: `WEARTRY` loqosu ən SOLDA, naviqasiya menyusu (Kişi/Qadın/Uşaq — bax maddə 8) ən SAĞDA, aralarında bir boşluq (flex `justify-between` strukturu artıq buna bənzəyirsə tənzimlə).
- **Dil seçici düyməsini (indi dünya ikonu, maddə 1) header-dən çıxar, ALT MENUYA (Footer) köçür** — Footer-in münasib bir yerində (məs. copyright sətrinin yanında) kiçik bir dil dəyişdirici düymə kimi yerləşdir.
- **Axtarış (search) düyməsini SAĞ KƏNARA çək** — hazırda icon-lar sırasında ortada/başqa yerdə ola bilər, onu ən sağ tərəfə (Cart/Wishlist-dən sonra və ya öncə, sənin təsdiqinlə ən sağ) yerləşdir.

## 7. "Populyar" məhsul detalına keçid — animasyalı, keçidsiz olmasın

- Hazırda ayrıca məhsul detalı səhifəsi yoxdursa, BUNU YARAT: `app/[locale]/products/[slug]/page.tsx` — minimal bir Product Detail Page (PDP): böyük şəkil (placeholder gradient), ad, qiymət, "Add to Cart" düyməsi, ölçü seçici (placeholder).
- `ProductCard.tsx`-dəki klik/keçid, Next.js-in `<Link>` (next-intl-in öz `Link`-i, `i18n/navigation.ts`-dən) ilə bu səhifəyə aparsın.
- **Keçid animasiyalı olsun**: səhifə keçidində framer-motion `AnimatePresence` istifadə et — `app/[locale]/layout.tsx`-də `<main>` daxilini `AnimatePresence mode="wait"` ilə örtüb, hər route dəyişəndə fade+scale keçid animasiyası ver (`key={pathname}` ilə). Bu, Next.js App Router-də layout-level page transition kimi işləməlidir (`usePathname`-dan key alaraq).
- PDP-nin özündə giriş zamanı `BlurFadeUp`/`StaggerGroup` istifadə et ki, şəkil/başlıq/qiymət/düymə ardıcıl animasiya ilə açılsın.

## 8. Üst menu — "Mağaza" sözünü sil, Kişi/Qadın/Uşaq qalsın, WEARTRY klikləyəndə başa qaytarsın

- `Header.tsx`-dəki naviqasiya siyahısından "Mağaza"/"Shop" linkini SİL — yalnız **Kişi, Qadın, Uşaq** (mövcud `Nav.shopMen`/`shopWomen`/`shopKids` açarları) qalsın.
- `WEARTRY` loqosunun üzərinə klikləndikdə səhifənin ƏN BAŞINA (yəni `/` route-una, homepage-in hero bölməsinə) aparsın — `Link href="/"` ilə təsdiqlə (artıq belədirsə, yoxla və saxla).

## 9. WEARTRY yanındakı emojini sil, ikon qoy

- `Header.tsx`-də loqo mətni `WEARTRY ✳` şəklindədirsə, `✳` emoji/simvolunu SİL, əvəzinə kiçik, sadə bir inline SVG ikon qoy (məs. bir "T-shirt" outline ikonu və ya sadə brend nöqtəsi/monogram — sadə, minimal, marka rənginə uyğun).

## 10. Mobildə header — yalnız yuxarı scroll edəndə görünsün

- `Header.tsx`-ə (client component olduğu üçün) scroll istiqamətini izləyən məntiq əlavə et: `useEffect` + `scroll` event listener (`passive: true`) ilə əvvəlki scroll mövqeyini saxla:
  - Aşağı scroll edəndə (yəni `currentScrollY > lastScrollY` VƏ `currentScrollY > threshold`, məs. 80px) header-i YUXARI GİZLƏT (`transform: translateY(-100%)`, `transition: transform 0.3s ease`).
  - Yuxarı scroll edəndə header-i GERİ GÖSTƏR.
  - Bu davranış YALNIZ mobil enində (`max-width: 768px` breakpoint-də) aktiv olsun, desktop-da header həmişə görünsün (sticky).
  - Səhifənin ən başında (`scrollY < threshold`) header həmişə görünsün.

## 11. Alt menudakı bayraqları sil

- `Footer.tsx`-də hər hansı bayraq emoji/işarəsi göstərilirsə (region seçimi ilə bağlı əvvəlki koddan qalıq ola bilər) SİL. Region/dil göstərimi yalnız mətn (dil adı) ilə olsun, bayraqsız.

## 12. Sayt strukturunu gücləndir + "Xəbərdar olun" bölümünü sil (təkrar təsdiq)

- Maddə 3-də Footer-dəki newsletter artıq silinib — bunu bir də təsdiqlə (Footer-də `Sections.newsletter` importu/istifadəsi qalmasın).
- "Sayt güc strukturun artır" — bunun konkret texniki qarşılığı: `app/[locale]/layout.tsx` və səhifələrdə SEO/metadata-nı gücləndir (`generateMetadata`-da `openGraph`, `twitter`, `alternates.languages` (hreflang, 25 dil üçün) əlavə et), `robots.txt`/`sitemap.xml` üçün Next.js-in `app/robots.ts` və `app/sitemap.ts` fayllarını yarat (bütün locale route-larını daxil edən), semantic HTML-i (`<nav>`, `<main>`, `<footer>`, `<article>` teqlərinin düzgün istifadəsini) təsdiqlə.

## 13. Səbət (cart) və istəklər (wishlist) ikonlarını modernləşdir + aktivləşdir

- `Header.tsx`-dəki cart/wishlist SVG ikonlarını daha müasir, incə xətli (stroke-based, `stroke-width: 1.5` kimi) versiyalarla əvəz et.
- **Hər ikisini FUNKSIONAL et**: sadə client-side state ilə (React `useState` + `localStorage` — YALNIZ per-viewer rahatlıq üçün, `try/catch` ilə qorunmuş) minimal bir Cart/Wishlist paneli yarat:
  - `components/layout/CartDrawer.tsx` və `components/layout/WishlistDrawer.tsx` (və ya bir `components/layout/SidePanel.tsx` paylaşılan struktur ilə hər ikisi üçün) — sağdan sürüşərək açılan panel (framer-motion `AnimatePresence` + `x` transform ilə animasiyalı).
  - Header-dəki cart/wishlist ikonlarına klik → müvafiq paneli aç/bağla (hazırda "üstünə vuranda açılmır" problemi buradan qaynaqlanır — click handler-lər əlavə edilməmiş, indi əlavə et).
  - Panel daxilində boş vəziyyət mesajı göstər (məs. "Səbətiniz boşdur"), məhsul əlavə etmə funksionallığı `ProductCard.tsx`-dəki bir "Add to Cart"/"Add to Wishlist" düyməsi ilə bağlana bilər (sadə local state context, `React Context` və ya `useState` + prop drilling əvəzinə minimal bir `CartContext`/`WishlistContext` yarat, `app/[locale]/layout.tsx`-də provider et).

## 14. Açılmayan/animasyasız bölmələr — hamısını animasyalı et

- Sayt daxilində HANSI element/bölmə click ilə açılırsa (mobil menyu, dropdown-lar, açılan panellər, FAQ tipli akkordeonlar əgər varsa), hamısının açılma/bağlanma keçidi framer-motion `AnimatePresence` ilə animasiyalı olmalıdır — sadə CSS `display: none`/`block` keçidi HEÇ YERDƏ qalmasın.
- Xüsusilə **mobil menyu** (hamburger menu açılışı) üçün: soldan/sağdan sürüşərək (`x` transform) və ya yuxarıdan aşağı (`clip-path` və ya `height`) animasiyalı açılış-bağlanış təmin et.

## 15. Axtarış funksionallığı — real-time nəticə

- Header-dəki axtarış düyməsinə klik → açılan bir axtarış paneli/modal (`AnimatePresence` ilə animasiyalı) göstər, daxilində bir input.
- İnput dəyişdikcə (`onChange`), `lib/data.ts`-dəki BÜTÜN məhsul massivlərini (`newArrivals`, `seasonalDrop`, `bestSellers`) birləşdirib ad üzrə filter et (`useMemo` ilə), nəticələri altında kiçik bir siyahı kimi göstər (şəkil-placeholder + ad + qiymət).
- Boş axtarışda heç nə göstərmə və ya "populyar axtarışlar" kimi bir default siyahı göstər.
- Bu, hələlik statik `lib/data.ts` üzərində işləsin (real backend/API axtarışı gələcək iş kimi qeyd et), AMMA indiki üçün YENİ məhsul əlavə edildikdə (yəni `lib/data.ts`-ə yeni element əlavə olunanda) avtomatik axtarışda görünməlidir — bu, artıq təbii şəkildə təmin olunur çünki axtarış birbaşa bu massivlər üzərində işləyəcək.

## 16. Mobildə WEARTRY yanında səbət və istəklər

- Mobil header-də (hamburger menu düyməsinin əks tərəfində, `WEARTRY` loqosunun yanında) Cart və Wishlist ikonlarını göstər (hazırda bunlar yalnız desktop-da görünürsə, mobil breakpoint-də də görünən et — `hidden md:flex` kimi bir sinif varsa, cart/wishlist üçün bunu çıxar, yalnız axtarış/digər az vacib ikonlar mobil menyunun içinə keçsin).

---

## Ümumi tələblər (bütün maddələr üçün)

- `useReducedMotion()` yoxlanışını YENİ əlavə olunan bütün animasiyalarda (page transition, drawer-lər, dropdown-lar) tətbiq et — `prefers-reduced-motion: reduce` olduqda sadə fade/heç bir hərəkət olmasın.
- Bütün yeni mətnləri `useTranslations`/`getTranslations` ilə et, 25 mesaj faylının hamısına uyğun açarları əlavə et (heç olmasa `en` və `az`-da tam mətn, digərlərində məntiqli fallback — maddə 5-dəki qaydaya uyğun).
- `npm run lint` və `npm run build` xətasız keçməlidir (bütün 25 locale route-u compile olmalıdır).
- Mobil (390px) və desktop (1440px) enlərində vizual olaraq sınaqdan keçir (mümkünsə screenshot al, ya da ən azı build/runtime xətası olmadığını təsdiqlə).

## Commit + Push (ÖZÜN et, soruşma)

```bash
git add -A
git commit -m "Header/footer redesign, geolocation market, infinite promo bar, cart/wishlist drawers, search, page transitions, mobile stability fixes"
git push origin main
```

Bu repo Vercel-ə GitHub inteqrasiyası ilə bağlıdır — `main`-ə push avtomatik production deploy tetikləyir, ayrıca `vercel` əmri lazım deyil.
