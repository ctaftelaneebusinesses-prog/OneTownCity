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
    <html lang="en" className="h-full antialiased bg-[#DDE3E8] text-[#1E081B]">
      <body className="min-h-full flex flex-col bg-[#DDE3E8] text-[#1E081B]">
        <TownProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
        </TownProvider>
      </body>
    </html>
  );
}
