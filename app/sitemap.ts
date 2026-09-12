import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/locales";
import { allProducts } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://weartry.com";

const STATIC_PATHS = ["", "/contact", "/privacy-policy", "/terms-of-service", "/returns-policy", "/cookie-policy"];

function localePath(locale: string, path: string) {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${BASE_URL}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const productSlugs = Array.from(new Set(allProducts.map((p) => p.slug)));
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: localePath(locale, path), lastModified: new Date() });
    }
    for (const slug of productSlugs) {
      entries.push({ url: localePath(locale, `/products/${slug}`), lastModified: new Date() });
    }
  }

  return entries;
}
