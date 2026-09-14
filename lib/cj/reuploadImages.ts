import { put } from "@vercel/blob";

/**
 * Re-hosts CJ's own CDN image URLs on Vercel Blob during import, so the
 * storefront never fetches product images from CJ's domain directly —
 * that would both reveal the supplier to a technically curious customer
 * (visible in the browser's Network tab) and simply fail outright, since
 * next.config.ts's image remotePatterns only allowlists Blob's own
 * domain. Best-effort per image: a single failed fetch/upload is dropped
 * rather than failing the whole import.
 */
export async function reuploadCjImages(urls: string[]): Promise<string[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;

        const contentType = res.headers.get("content-type") ?? "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const buffer = Buffer.from(await res.arrayBuffer());

        const blob = await put(`cj-import/${crypto.randomUUID()}.${ext}`, buffer, {
          access: "public",
          contentType,
        });
        return blob.url;
      } catch (err) {
        console.error("CJ image re-upload failed:", url, err);
        return null;
      }
    })
  );

  return results.filter((u): u is string => u !== null);
}
