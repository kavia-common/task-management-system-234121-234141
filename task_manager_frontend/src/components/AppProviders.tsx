"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorage";
import type { AuthSession, User } from "@/lib/types";

type AuthState = {
  hydrated: boolean;
  token: string | null;
  user: User | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access current auth session (token/user) and auth actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AppProviders />");
  return ctx;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const { value, setValue, hydrated } = useLocalStorageState<AuthSession | null>(
    "retro_tasks_session_v1",
    null,
  );

  const signIn = useCallback(
    (session: AuthSession) => {
      setValue(session);
    },
    [setValue],
  );

  const signOut = useCallback(() => {
    setValue(null);
  }, [setValue]);

  const auth = useMemo<AuthState>(
    () => ({
      hydrated,
      token: value?.token ?? null,
      user: value?.user ?? null,
      signIn,
      signOut,
    }),
    [hydrated, value, signIn, signOut],
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
