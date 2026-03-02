"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/components/AppProviders";
import { apiSignIn } from "@/lib/backend";
import { ApiError } from "@/lib/apiClient";

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="max-w-xl mx-auto">
      <div className="retro-card p-5 bg-white">
        <div className="retro-scanlines rounded-[var(--radius)]">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-gray-600 mt-1">
            Authenticate to sync tasks to the backend API.
          </p>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            try {
              const session = await apiSignIn(email.trim(), password);
              signIn(session);
              router.push("/tasks");
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : "Failed to sign in.";
              setError(msg);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="retro-input w-full mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="retro-input w-full mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div className="retro-card-soft p-3 border-red-600">
              <div className="text-sm text-red-700">{error}</div>
              <div className="text-xs text-gray-600 mt-1">
                If backend auth routes are not implemented yet, you will see errors.
              </div>
            </div>
          ) : null}

          <button className="retro-btn retro-btn-primary w-full text-sm" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="text-sm text-gray-600 mt-4">
          No account?{" "}
          <Link className="underline" href="/auth/sign-up">
            Create one
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
