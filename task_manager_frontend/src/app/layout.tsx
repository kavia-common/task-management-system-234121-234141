import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Retro Tasks",
  description: "Retro-themed task manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen retro-grid">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
