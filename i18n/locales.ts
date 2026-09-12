export type Locale = (typeof locales)[number];

export const locales = [
  "en", // English (International / UK / US)
  "az", // Azərbaycan dili
  "bg", // Български (Bulgaria)
  "hr", // Hrvatski (Croatia)
  "cs", // Čeština (Czechia)
  "da", // Dansk (Denmark)
  "nl", // Nederlands (Netherlands, Belgium)
  "et", // Eesti (Estonia)
  "fi", // Suomi (Finland)
  "fr", // Français (France, Belgium, Luxembourg)
  "de", // Deutsch (Germany, Austria, Belgium, Luxembourg)
  "el", // Ελληνικά (Greece, Cyprus)
  "hu", // Magyar (Hungary)
  "ga", // Gaeilge (Ireland)
  "it", // Italiano (Italy)
  "lv", // Latviešu (Latvia)
  "lt", // Lietuvių (Lithuania)
  "mt", // Malti (Malta)
  "pl", // Polski (Poland)
  "pt", // Português (Portugal)
  "ro", // Română (Romania)
  "sk", // Slovenčina (Slovakia)
  "sl", // Slovenščina (Slovenia)
  "es", // Español (Spain)
  "sv", // Svenska (Sweden)
] as const;

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  az: "Azərbaycanca",
  bg: "Български",
  hr: "Hrvatski",
  cs: "Čeština",
  da: "Dansk",
  nl: "Nederlands",
  et: "Eesti",
  fi: "Suomi",
  fr: "Français",
  de: "Deutsch",
  el: "Ελληνικά",
  hu: "Magyar",
  ga: "Gaeilge",
  it: "Italiano",
  lv: "Latviešu",
  lt: "Lietuvių",
  mt: "Malti",
  pl: "Polski",
  pt: "Português",
  ro: "Română",
  sk: "Slovenčina",
  sl: "Slovenščina",
  es: "Español",
  sv: "Svenska",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  az: "🇦🇿",
  bg: "🇧🇬",
  hr: "🇭🇷",
  cs: "🇨🇿",
  da: "🇩🇰",
  nl: "🇳🇱",
  et: "🇪🇪",
  fi: "🇫🇮",
  fr: "🇫🇷",
  de: "🇩🇪",
  el: "🇬🇷",
  hu: "🇭🇺",
  ga: "🇮🇪",
  it: "🇮🇹",
  lv: "🇱🇻",
  lt: "🇱🇹",
  mt: "🇲🇹",
  pl: "🇵🇱",
  pt: "🇵🇹",
  ro: "🇷🇴",
  sk: "🇸🇰",
  sl: "🇸🇮",
  es: "🇪🇸",
  sv: "🇸🇪",
};
