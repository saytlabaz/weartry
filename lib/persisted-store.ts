/**
 * Minimal external-store factory for values persisted in localStorage.
 * Built on useSyncExternalStore's contract (getServerSnapshot vs. getSnapshot)
 * so reading the persisted value never causes a hydration mismatch — the
 * server and the first client render both see the same default, and the
 * real, possibly-different persisted value is applied in a follow-up paint
 * scheduled by React itself, not a manual setState-in-effect.
 */
export function createPersistedListStore(key: string) {
  const EMPTY: string[] = [];
  let ids: string[] = EMPTY;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function ensureHydrated() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(key);
      ids = raw ? (JSON.parse(raw) as string[]) : EMPTY;
    } catch {
      ids = EMPTY;
    }
  }

  function persist(next: string[]) {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.) — state stays in-memory only.
    }
  }

  return {
    getSnapshot(): string[] {
      ensureHydrated();
      return ids;
    },
    getServerSnapshot(): string[] {
      return EMPTY;
    },
    subscribe(callback: () => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    set(next: string[]) {
      ids = next;
      persist(next);
      listeners.forEach((listener) => listener());
    },
    get current() {
      return ids;
    },
  };
}

/** Same external-store contract as createPersistedListStore, generalized to any JSON-serializable value. */
export function createPersistedJSONStore<T>(key: string, defaultValue: T) {
  let value: T = defaultValue;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function ensureHydrated() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(key);
      value = raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      value = defaultValue;
    }
  }

  function persist(next: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.) — state stays in-memory only.
    }
  }

  return {
    getSnapshot(): T {
      ensureHydrated();
      return value;
    },
    getServerSnapshot(): T {
      return defaultValue;
    },
    subscribe(callback: () => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    set(next: T) {
      value = next;
      persist(next);
      listeners.forEach((listener) => listener());
    },
    get current() {
      return value;
    },
  };
}

export function createPersistedCookieValue<T extends string>(cookieName: string, defaultValue: T) {
  function read(): T {
    if (typeof document === "undefined") return defaultValue;
    const stored = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`))
      ?.split("=")[1];
    return (stored as T) ?? defaultValue;
  }

  let value = defaultValue;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function ensureHydrated() {
    if (hydrated || typeof document === "undefined") return;
    hydrated = true;
    value = read();
  }

  return {
    getSnapshot(): T {
      ensureHydrated();
      return value;
    },
    getServerSnapshot(): T {
      return defaultValue;
    },
    subscribe(callback: () => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    set(next: T) {
      value = next;
      document.cookie = `${cookieName}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
      listeners.forEach((listener) => listener());
    },
  };
}
