import { createPersistedJSONStore } from "@/lib/persisted-store";

export interface MockUser {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
}

/**
 * Frontend-only "logged in" simulation — no real backend/session yet.
 * AuthView writes here on login/register submit so Checkout can prefill
 * the shipping form as if the shopper were signed in.
 */
export const mockAuthStore = createPersistedJSONStore<MockUser | null>("weartry_mock_user", null);

export function createMockUser(overrides: Partial<MockUser>): MockUser {
  return {
    fullName: "Jordan Blake",
    email: "jordan.blake@example.com",
    phone: "+1 555-0100",
    country: "US",
    city: "New York",
    addressLine1: "123 Market Street",
    addressLine2: "",
    postalCode: "10001",
    ...overrides,
  };
}
