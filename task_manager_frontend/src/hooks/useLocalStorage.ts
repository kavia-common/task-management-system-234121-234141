"use client";

import { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export function useLocalStorageState<T>(key: string, initial: T) {
  /** React state synchronized to localStorage. */
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value, hydrated]);

  return { value, setValue, hydrated } as const;
}
