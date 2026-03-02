"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useAuth } from "@/components/AppProviders";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "block px-3 py-2 rounded-md border-2",
        active ? "bg-white" : "bg-gray-50 hover:bg-white",
        "border-black shadow-[2px_2px_0px_rgba(17,24,39,0.7)]",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrated, user, signOut } = useAuth();
  const router = useRouter();

  const primaryCta = useMemo(() => {
    if (!hydrated) return null;
    if (!user) return { href: "/auth/sign-in", label: "Sign in" };
    return { href: "/tasks", label: "Tasks" };
  }, [hydrated, user]);

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="retro-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[78vh]">
            {/* Sidebar */}
            <aside className="border-b-2 md:border-b-0 md:border-r-2 border-black bg-white p-4">
              <div className="retro-card-soft retro-scanlines p-3 mb-4">
                <div className="text-xs text-gray-600">RETRO TASKS</div>
                <div className="text-lg font-semibold tracking-tight">Task Manager</div>
                <div className="text-xs text-gray-600 mt-1">
                  Blue/Cyan accents · Monospace
                </div>
              </div>

              <nav className="space-y-2" aria-label="Primary navigation">
                <NavLink href="/" label="Home" />
                <NavLink href="/tasks" label="Tasks" />
                <NavLink href="/auth/sign-in" label="Sign in" />
                <NavLink href="/auth/sign-up" label="Sign up" />
              </nav>

              <div className="mt-6 text-xs text-gray-600">
                <div className="retro-badge inline-block">v0.1 UI</div>
              </div>
            </aside>

            {/* Main area */}
            <div className="flex flex-col">
              {/* Top nav */}
              <header className="border-b-2 border-black bg-gray-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {primaryCta ? (
                    <Link className="retro-btn retro-btn-primary text-sm" href={primaryCta.href}>
                      {primaryCta.label}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-600">Loading…</span>
                  )}
                  <span className="text-xs text-gray-600 hidden sm:inline">
                    Backend: configure <code>NEXT_PUBLIC_API_BASE_URL</code>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {hydrated && user ? (
                    <>
                      <div className="text-right">
                        <div className="text-sm font-semibold leading-4">{user.name ?? "User"}</div>
                        <div className="text-xs text-gray-600">{user.email}</div>
                      </div>
                      <button
                        className="retro-btn text-sm"
                        onClick={() => {
                          signOut();
                          router.push("/auth/sign-in");
                        }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-gray-600">Guest mode</div>
                  )}
                </div>
              </header>

              <main className="p-4 bg-[var(--bg)] flex-1">{children}</main>
            </div>
          </div>
        </div>

        <footer className="mt-4 text-xs text-gray-600">
          Tip: Start at <Link className="underline" href="/auth/sign-in">Sign in</Link> then go to{" "}
          <Link className="underline" href="/tasks">Tasks</Link>.
        </footer>
      </div>
    </div>
  );
}
