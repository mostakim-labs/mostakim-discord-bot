interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  max = 5,
  windowMs = 15 * 60 * 1000
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const rec = store.get(key);

  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }
  if (rec.count >= max) return { ok: false, remaining: 0, resetAt: rec.resetAt };
  rec.count++;
  return { ok: true, remaining: max - rec.count, resetAt: rec.resetAt };
}

export const resetLimit = (key: string) => store.delete(key);
