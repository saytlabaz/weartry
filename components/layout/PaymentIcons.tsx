import type { ReactNode } from "react";

function CardBadge({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg className="h-full w-auto" viewBox="0 0 32 20" aria-label={label} role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      {children}
    </svg>
  );
}

export function GooglePayIcon() {
  return (
    <CardBadge label="Google Pay">
      <text x="9" y="14" fontSize="9" fontWeight="700" fill="#5F6368">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
      <text x="27" y="14" textAnchor="end" fontSize="9" fontWeight="500" fill="#5F6368">
        Pay
      </text>
    </CardBadge>
  );
}

export function CardIcon() {
  return (
    <svg className="h-full w-auto" viewBox="0 0 32 20" aria-label="Card" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="0.5" y="5" width="31" height="3" fill="currentColor" fillOpacity="0.7" />
      <rect x="4" y="13" width="8" height="2" rx="1" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

export function VisaIcon() {
  return (
    <CardBadge label="Visa">
      <text x="16" y="14" textAnchor="middle" fontSize="9" fontStyle="italic" fontWeight="800" fill="#1A1F71">
        VISA
      </text>
    </CardBadge>
  );
}

export function MastercardIcon() {
  return (
    <CardBadge label="Mastercard">
      <circle cx="13.5" cy="10" r="5.5" fill="#EB001B" />
      <circle cx="18.5" cy="10" r="5.5" fill="#F79E1B" fillOpacity="0.85" />
    </CardBadge>
  );
}

export function AmexIcon() {
  return (
    <svg className="h-full w-auto" viewBox="0 0 32 20" aria-label="American Express" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="#2E77BC" />
      <text x="16" y="13.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" letterSpacing="0.5">
        AMEX
      </text>
    </svg>
  );
}

export function PayPalIcon() {
  return (
    <CardBadge label="PayPal">
      <path
        d="M12.7 14h-1.9l1.4-8h3.1c1.7 0 2.7.9 2.4 2.4-.3 1.7-1.6 2.6-3.3 2.6h-1.1l-.6 3Zm1-4.5h.8c.8 0 1.4-.3 1.5-1 .1-.6-.3-1-1.1-1h-.7l-.5 2Z"
        fill="#003087"
      />
      <path
        d="M18.9 14H17l1.4-8h3.1c1.7 0 2.7.9 2.4 2.4-.3 1.7-1.6 2.6-3.3 2.6h-1.1l-.6 3Zm1-4.5h.8c.8 0 1.4-.3 1.5-1 .1-.6-.3-1-1.1-1h-.7l-.5 2Z"
        fill="#009cde"
      />
    </CardBadge>
  );
}

export function ApplePayIcon() {
  return (
    <svg className="h-full w-auto" viewBox="0 0 32 20" aria-label="Apple Pay" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="#000" />
      <path
        d="M11.1 8.3c.3-.4.5-1 .5-1.5-.5 0-1 .3-1.4.7-.3.3-.6.9-.5 1.4.5 0 1-.3 1.4-.6Zm.5.8c-.7 0-1.4.4-1.7.4-.4 0-.9-.4-1.5-.4-.8 0-1.5.5-1.9 1.2-.8 1.4-.2 3.5.6 4.6.4.6.8 1.2 1.4 1.2.6 0 .8-.4 1.5-.4s.9.4 1.5.4c.6 0 1-.6 1.4-1.1.4-.6.6-1.2.6-1.2s-1.2-.5-1.2-1.8c0-1.1.9-1.7 1-1.7-.5-.8-1.3-.9-1.6-.9-.7-.1-1.1-.3-1.1-.3Z"
        fill="white"
      />
      <path
        d="M17.5 6.8v7.1h1.1v-2.4h1.5c1.4 0 2.4-1 2.4-2.4 0-1.4-1-2.3-2.3-2.3h-2.7Zm1.1.9h1.3c1 0 1.5.5 1.5 1.4 0 .9-.6 1.4-1.5 1.4h-1.3V7.7Z"
        fill="white"
      />
      <path
        d="M24.9 14c.7 0 1.3-.3 1.6-.9h0v.8h1v-3.4c0-1-.8-1.6-2-1.6-1.1 0-2 .6-2 1.5h1c.1-.4.4-.6 1-.6.6 0 1 .3 1 .8v.4l-1.3.1c-1.2.1-1.9.6-1.9 1.5 0 .9.7 1.4 1.6 1.4Zm.3-.8c-.5 0-.8-.2-.8-.6 0-.4.3-.6.9-.7l1.1-.1v.4c0 .6-.5 1-1.2 1Z"
        fill="white"
      />
    </svg>
  );
}

export function DiscoverIcon() {
  return (
    <svg className="h-full w-auto" viewBox="0 0 32 20" aria-label="Discover" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      <clipPath id="discover-clip">
        <rect x="1" y="1" width="30" height="18" rx="2" />
      </clipPath>
      <circle cx="30" cy="16" r="7" fill="#FF6000" clipPath="url(#discover-clip)" />
      <text x="14" y="13" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#1a1a1a">
        DISCOVER
      </text>
    </svg>
  );
}

export function JCBIcon() {
  return (
    <svg className="h-full w-auto" viewBox="0 0 32 20" aria-label="JCB" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      <rect x="4" y="4" width="7" height="12" rx="1.5" fill="#0E4C96" />
      <rect x="12.5" y="4" width="7" height="12" rx="1.5" fill="#B01F2C" />
      <rect x="21" y="4" width="7" height="12" rx="1.5" fill="#00944E" />
      <text x="7.5" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">
        J
      </text>
      <text x="16" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">
        C
      </text>
      <text x="24.5" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">
        B
      </text>
    </svg>
  );
}

export function DinersClubIcon() {
  return (
    <svg className="h-full w-auto" viewBox="0 0 32 20" aria-label="Diners Club" role="img">
      <rect x="0.5" y="0.5" width="31" height="19" rx="2.5" fill="white" stroke="currentColor" strokeOpacity="0.15" />
      <circle cx="16" cy="10" r="6.5" fill="#0079BE" />
      <path d="M16 4.5a5.5 5.5 0 0 0 0 11" fill="none" stroke="white" strokeWidth="1.2" />
      <path d="M13 10h6" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

// 8 icons — UnionPay dropped (least relevant to this store's markets, and it
// was the one left orphaned alone on a third row in the mobile grid).
export const PAYMENT_ICONS = [
  VisaIcon,
  MastercardIcon,
  AmexIcon,
  PayPalIcon,
  ApplePayIcon,
  DiscoverIcon,
  JCBIcon,
  DinersClubIcon,
];
