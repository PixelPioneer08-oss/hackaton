type Entry<T> = { value: T; expires: number };

const g = globalThis as unknown as { __dealCache?: Map<string, Entry<unknown>> };
const store: Map<string, Entry<unknown>> = (g.__dealCache ??= new Map());

export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await fn();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export function invalidateDeal(dealId: string) {
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(`${dealId}:`)) store.delete(key);
  }
}
