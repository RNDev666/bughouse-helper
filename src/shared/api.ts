/** Firefox exposes `browser`, Chrome exposes `chrome`; both are promise-based under MV3. */
export const api: typeof chrome =
  (globalThis as { browser?: typeof chrome }).browser ?? globalThis.chrome;
