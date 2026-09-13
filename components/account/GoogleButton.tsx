"use client";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.66Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3a7.4 7.4 0 0 1-11-3.9H1.08v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.07 14.2a7.2 7.2 0 0 1 0-4.4V6.71H1.08a12 12 0 0 0 0 10.58l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.08 6.71l3.99 3.09A7.16 7.16 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

export default function GoogleButton({ label }: { label: string }) {
  function handleClick() {
    // TODO: Google OAuth — API key veriləndə tamamlanacaq
    console.log("Google auth clicked — not yet connected");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-muted"
    >
      <GoogleLogo />
      {label}
    </button>
  );
}
