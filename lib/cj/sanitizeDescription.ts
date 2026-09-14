/**
 * Strips CJ Dropshipping's own branding out of a product description
 * before it's stored — WearTry is customer-facing as its own brand, and
 * CJ's catalog descriptions sometimes mention CJ by name or link back to
 * cjdropshipping.com. Best-effort: catches CJ URLs, the bare domain, the
 * "CJ Dropshipping" brand phrase, and standalone "CJ" mentions, then
 * collapses whatever whitespace the removals leave behind.
 */
const CJ_URL_PATTERN = /https?:\/\/[^\s"'<>]*cjdropshipping[^\s"'<>]*/gi;
const CJ_BARE_DOMAIN_PATTERN = /\b[\w-]+\.cjdropshipping\.com\b/gi;
const CJ_BRAND_PATTERN = /\bCJ[\s-]?Dropshipping\b/gi;
const CJ_BARE_PATTERN = /\bCJ\b/g;

export function sanitizeCjDescription(raw: string): string {
  if (!raw) return "";

  const stripped = raw
    .replace(CJ_URL_PATTERN, "")
    .replace(CJ_BARE_DOMAIN_PATTERN, "")
    .replace(CJ_BRAND_PATTERN, "")
    .replace(CJ_BARE_PATTERN, "");

  return stripped
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
