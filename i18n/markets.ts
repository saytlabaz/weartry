export type MarketCode =
  | "AT" | "BE" | "BG" | "HR" | "CY" | "CZ" | "DK" | "EE" | "FI" | "FR"
  | "DE" | "GR" | "HU" | "IE" | "IT" | "LV" | "LT" | "LU" | "MT" | "NL"
  | "PL" | "PT" | "RO" | "SK" | "SI" | "ES" | "SE" | "GB" | "US";

export interface Market {
  code: MarketCode;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  /** Suggested UI locale for this market */
  defaultLocale: string;
  euMember: boolean;
}

export const markets: Market[] = [
  { code: "AT", name: "Austria", flag: "🇦🇹", currency: "EUR", currencySymbol: "€", defaultLocale: "de", euMember: true },
  { code: "BE", name: "Belgium", flag: "🇧🇪", currency: "EUR", currencySymbol: "€", defaultLocale: "nl", euMember: true },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", currency: "BGN", currencySymbol: "лв", defaultLocale: "bg", euMember: true },
  { code: "HR", name: "Croatia", flag: "🇭🇷", currency: "EUR", currencySymbol: "€", defaultLocale: "hr", euMember: true },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", currency: "EUR", currencySymbol: "€", defaultLocale: "el", euMember: true },
  { code: "CZ", name: "Czechia", flag: "🇨🇿", currency: "CZK", currencySymbol: "Kč", defaultLocale: "cs", euMember: true },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currency: "DKK", currencySymbol: "kr", defaultLocale: "da", euMember: true },
  { code: "EE", name: "Estonia", flag: "🇪🇪", currency: "EUR", currencySymbol: "€", defaultLocale: "et", euMember: true },
  { code: "FI", name: "Finland", flag: "🇫🇮", currency: "EUR", currencySymbol: "€", defaultLocale: "fi", euMember: true },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", currencySymbol: "€", defaultLocale: "fr", euMember: true },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", currencySymbol: "€", defaultLocale: "de", euMember: true },
  { code: "GR", name: "Greece", flag: "🇬🇷", currency: "EUR", currencySymbol: "€", defaultLocale: "el", euMember: true },
  { code: "HU", name: "Hungary", flag: "🇭🇺", currency: "HUF", currencySymbol: "Ft", defaultLocale: "hu", euMember: true },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currency: "EUR", currencySymbol: "€", defaultLocale: "en", euMember: true },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR", currencySymbol: "€", defaultLocale: "it", euMember: true },
  { code: "LV", name: "Latvia", flag: "🇱🇻", currency: "EUR", currencySymbol: "€", defaultLocale: "lv", euMember: true },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", currency: "EUR", currencySymbol: "€", defaultLocale: "lt", euMember: true },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", currency: "EUR", currencySymbol: "€", defaultLocale: "fr", euMember: true },
  { code: "MT", name: "Malta", flag: "🇲🇹", currency: "EUR", currencySymbol: "€", defaultLocale: "mt", euMember: true },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR", currencySymbol: "€", defaultLocale: "nl", euMember: true },
  { code: "PL", name: "Poland", flag: "🇵🇱", currency: "PLN", currencySymbol: "zł", defaultLocale: "pl", euMember: true },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "EUR", currencySymbol: "€", defaultLocale: "pt", euMember: true },
  { code: "RO", name: "Romania", flag: "🇷🇴", currency: "RON", currencySymbol: "lei", defaultLocale: "ro", euMember: true },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", currency: "EUR", currencySymbol: "€", defaultLocale: "sk", euMember: true },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", currency: "EUR", currencySymbol: "€", defaultLocale: "sl", euMember: true },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", defaultLocale: "es", euMember: true },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK", currencySymbol: "kr", defaultLocale: "sv", euMember: true },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", defaultLocale: "en", euMember: false },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", currencySymbol: "$", defaultLocale: "en", euMember: false },
];

export const defaultMarket: MarketCode = "US";

export function getMarket(code: string): Market {
  return markets.find((m) => m.code === code) ?? markets.find((m) => m.code === defaultMarket)!;
}
