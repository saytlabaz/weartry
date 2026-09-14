# Vercel-ə AUTH_URL Əlavə Et

## Səbəb

Google-un verdiyi "Hata 400: redirect_uri_mismatch" xətası, Auth.js-in production-da sənin əsl domeninin (`weartry.shop`) yerinə fərqli/yalnış bir host istifadə edərək Google-a callback URL göndərməsindən qaynaqlanır. Bunun həlli — Auth.js-ə domeni AÇIQ-AŞKAR bildirmək.

## Addım

1. Vercel Dashboard → `weartry` layihəsi → Settings → Environment Variables → **"Add Environment Variable"**
2. Bu dəyəri əlavə et:
   - **Key**: `AUTH_URL`
   - **Value**: `https://weartry.shop`
   - **Type**: Config (sirr deyil, sadə URL-dir)
   - **Environment**: Production, Preview, Development (hamısını işarələ)
3. **Save** bas.
4. Vercel Dashboard → Deployments → son deployment-in yanındakı "..." menyusundan **"Redeploy"** et (yeni env variable-ın aktivləşməsi üçün mütləq lazımdır).

Bunu etdikdən sonra mənə xəbər ver — login/register-dəki digər problemi (OTP-nin qeydiyyatsız istifadəçiyə göndərilməməsi, giriş sonrası panelin açılmaması) həll edən kod düzəliş komandasını ayrıca göndərəcəm.
