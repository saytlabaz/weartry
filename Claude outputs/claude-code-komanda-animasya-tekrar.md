# Claude Code Komandası — Scroll animasiyalarını "təkrarlanan" et + deploy

Aşağıdakı mətni olduğu kimi Claude Code-a ver.

---

Bu Next.js (App Router, TypeScript, Tailwind v4, framer-motion, next-intl) layihəsidir. Scroll-reveal animasiya sistemini düzəlt:

## Problem

Hazırda `components/motion/BlurFadeUp.tsx` və `components/motion/StaggerGroup.tsx`-də bütün `whileInView` animasiyaları `viewport={{ once: true, ... }}` ilə işləyir — yəni element yalnız BİR DƏFƏ animasiya edir, ekrandan çıxıb yenidən girəndə heç nə olmur.

İstənilən davranış bunun ƏKSİDİR: element viewport-a hər dəfə girəndə animasiya (blur açılması + yuxarı qalxış + scale settle) OYNAMALIDIR, viewport-dan çıxanda isə gizli başlanğıc vəziyyətinə (opacity 0, aşağı offset, blur, kiçik scale) QAYITMALIDIR — beləliklə istifadəçi səhifəni yuxarı scroll edib yenidən aşağı düşəndə həmin bölmə TƏZƏDƏN animasiya olunsun. Referans: Framer saytlarındakı təkrarlanan scroll-reveal davranışı (məs. `saytlab-proje`-dəki `script.js`-in "7. Scroll-reveal — TƏKRARLANAN" bölməsindəki IntersectionObserver məntiqi: `entry.isIntersecting` olanda `data-visible` qoyulur, olmayanda silinir, `unobserve` heç vaxt çağırılmır).

## Ediləcək dəyişikliklər

### 1. `components/motion/BlurFadeUp.tsx`

- `viewport={{ once, ... }}` sətirindəki `once` prop-unun defolt dəyərini `false`-a dəyiş (yəni `once = false` funksiya parametrlərində).
- `once` prop-unu component API-də saxla (kimsə hələ də bir dəfəlik istəsə, `once={true}` verə bilsin), amma defolt təkrarlanan olsun.
- `whileInView`-ın əksi kimi işləməsi üçün `animate` prop-u YOX, məhz `whileInView` + `initial="hidden"` strukturu davam etsin (bu artıq düzgün qurulub) — sadəcə `viewport.once` dəyərini dəyiş.

### 2. `components/motion/StaggerGroup.tsx`

- Hər iki eksport (`StaggerGroup`) daxilindəki `viewport={{ once: true, ... }}`-i `viewport={{ once: false, ... }}`-a dəyiş.
- `StaggerItem` özü `whileInView` istifadə etmir (valideynin `variants`-ından miras alır) — dəyişiklik lazım deyil, amma yoxla ki, valideyn `StaggerGroup`-un `once: false` olması kifayətdir ki, hər dəfə yenidən stagger-lə animasiya etsin.

### 3. Performans qeydi (vacib)

`once: false` olduqda hər scroll-da yenidən renderlər tetiklənir — bunun üçün:
- Hər iki fayldakı `viewport` obyektinə `amount: 0.2` (artıq var) saxla, lazımsız təkrar tetiklənmələrin qarşısını almaq üçün `margin` dəyərini olduğu kimi saxla.
- `useReducedMotion()` olan halda (artıq mövcuddur) sadə fade saxlanılsın, bu da `once: false` ilə problemsiz işləyəcək.

### 4. Yoxlama

- `npm run lint` və `npm run build` xətasız keçməlidir.
- Bütün 25 dil route-u (`app/[locale]/...`) uğurla compile olmalıdır.
- Brauzerdə: səhifəni aşağı scroll et, bir bölmə görünsün və animasiya etsin; sonra yuxarı scroll edib həmin bölmədən çıx (viewport-dan tam çıxana qədər) və yenidən aşağı en — bölmə YENİDƏN animasiya etməlidir (gizli vəziyyətə qayıdıb təzədən oynamalıdır).
- Dairəvi custom cursor (`components/motion/CustomCursor.tsx`) və hər bölmənin `BlurFadeUp`/`StaggerGroup` ilə örtülü olması dəyişməz qalır — yalnız `once` davranışı dəyişir.

## Commit + Push + Deploy (avtomatik, Claude Code özü etsin)

İş bitəndə, testlər keçəndən sonra, aşağıdakını ÖZÜN icra et (istifadəçidən ayrıca soruşma):

```bash
git add -A
git commit -m "Make scroll-reveal animations repeat on every viewport entry/exit"
git push origin main
```

Bu repo Vercel-ə GitHub inteqrasiyası ilə bağlıdır — `main` branch-inə push avtomatik production deploy tetikləyir, ayrıca `vercel deploy` əmri lazım deyil. Push uğurlu olduqdan sonra Vercel-in dashboard/deployment linkini yoxlamaq istəsən, `vercel ls` və ya layihənin Vercel panelini yoxla; CLI login tələb olunarsa, bunu mənə bildir, mən deploy-u ayrıca izləmərəm — push kifayətdir, avtomatik işə düşəcək.
