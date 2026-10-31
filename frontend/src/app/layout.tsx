import type { Metadata } from "next";
import "./globals.css";
import { TownProvider } from "@/components/TownContext";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "OneTownCity — Performance-First Hyperlocal Discovery & Multi-Tenant SaaS",
  description: "Verified town updates, education hub, student opportunities, and local businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased bg-neutral-950 text-neutral-100">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <TownProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
        </TownProvider>
      </body>
    </html>
  );
}
