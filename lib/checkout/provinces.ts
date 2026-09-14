/**
 * CJ Dropshipping's v2.0 API has no province/state list endpoint — checked
 * directly against their docs (Authentication, Logistics, Settings, and
 * the Standard/Appendices sections; the only geography reference published
 * there is a static country-code table, no subdivisions). CJ's createOrder
 * call takes `shippingProvince` as free text, validated only reactively —
 * a failed freight-calculation call returns `ruleTips` describing what was
 * wrong, there's no "valid values" list to query up front.
 *
 * So instead of proxying a CJ endpoint that doesn't exist, this is a
 * curated static list, scoped to where it actually matters: the storefront
 * only ships to the US, UK, and EU (see Shipping Information). The US
 * genuinely needs a state for address/tax purposes; most EU countries
 * don't use a province in ordinary postal addressing, so for those,
 * `getProvinces` returns an empty list and the checkout form falls back to
 * an optional free-text field rather than fabricating administrative
 * divisions the request never asked for.
 */

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const GB_REGIONS = [
  "England", "Scotland", "Wales", "Northern Ireland",
];

/** ISO 3166-1 alpha-2 country code -> province/state list. Empty = not required for that country. */
const PROVINCES_BY_COUNTRY: Record<string, string[]> = {
  US: US_STATES,
  GB: GB_REGIONS,
};

export function getProvinces(countryCode: string): string[] {
  return PROVINCES_BY_COUNTRY[countryCode.toUpperCase()] ?? [];
}
