type CacheEntry<T> = { value: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

// Cap the number of entries so user-supplied query strings (e.g. course list
// filters) can never grow this Map without bound.
const MAX_CACHE_ENTRIES = 5000;

const sweepExpired = (): void => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) {
      store.delete(key);
    }
  }
};

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }

  return entry.value;
}

export function setCached<T>(key: string, value: T, ttlInSeconds: number): void {
  if (!store.has(key)) {
    sweepExpired();

    if (store.size >= MAX_CACHE_ENTRIES) {
      // Evict the entry closest to expiry to make room for the new one.
      let oldestKey: string | undefined;
      let oldestExpiry = Infinity;
      for (const [candidateKey, entry] of store) {
        if (entry.expiresAt < oldestExpiry) {
          oldestExpiry = entry.expiresAt;
          oldestKey = candidateKey;
        }
      }
      if (oldestKey) {
        store.delete(oldestKey);
      }
    }
  }

  store.set(key, {
    value,
    expiresAt: Date.now() + ttlInSeconds * 1000,
  });
}

export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
