/** Mulberry32 — small, fast, deterministic seeded PRNG */
export function createRng(seed: number) {
  let s = seed >>> 0;
  if (s === 0) s = 1;

  const next = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int(min: number, max: number) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(next() * arr.length)]!;
    },
    bool(p = 0.5) {
      return next() < p;
    },
    chars(alphabet: string, length: number) {
      let out = "";
      for (let i = 0; i < length; i++) {
        out += alphabet[Math.floor(next() * alphabet.length)]!;
      }
      return out;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;
