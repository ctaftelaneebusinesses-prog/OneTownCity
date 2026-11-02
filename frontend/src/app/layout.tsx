import type { Metadata } from "next";
import "./globals.css";
import { TownProvider } from "@/components/TownContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { TelemetryRibbon } from "@/components/TelemetryRibbon";
import { SpotlightProvider } from "@/components/SpotlightProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "OneTownCity — Verified Academic, Civic & Commercial Index",
  description:
    "The verified hyperlocal directory for Nellore and Kuppam. Education hub, student opportunities, civic tracker, and authenticated local businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" style={{ backgroundColor: "var(--bg-canvas)" }}>
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: "var(--bg-canvas)",
          color: "var(--ink-primary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <TownProvider>
          <AuthProvider>
            <SpotlightProvider>
              {/* 36px Telemetry Ribbon */}
              <TelemetryRibbon />

              {/* Sticky Masthead */}
              <Navigation />

              {/* Page Content */}
              <main className="flex-1">{children}</main>

              {/* Toast Notifications */}
              <Toaster position="top-right" richColors theme="light" />

              {/* Footer */}
              <footer
                className="border-t font-mono text-xs py-8 px-6 mt-12"
                style={{
                  borderColor: "var(--border-grid)",
                  color: "var(--ink-secondary)",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold tracking-tight text-sm" style={{ color: "var(--ink-primary)" }}>
                        ONETOWNCITY
                      </span>
                      <span style={{ color: "var(--border-grid)" }}>|</span>
                      <span className="text-[11px]">Nellore &amp; Kuppam Hyperlocal Index</span>
                    </div>
                    <p className="text-[10px] text-[var(--ink-secondary)] max-w-md">
                      Verified local discovery for Education, Student Opportunities, Town News, and Local Businesses. Zero emojis, zero scam fees.
                    </p>
                  </div>

                  {/* Navigation Directory Links */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 uppercase tracking-wider text-[10px] font-semibold">
                    <a href="/submit" className="text-[var(--accent-signal)] hover:underline">
                      + Submit / Claim
                    </a>
                    <a href="/pricing" className="hover:text-[var(--ink-primary)] transition-colors">
                      SaaS Pricing
                    </a>
                    <a href="/trust" className="hover:text-[var(--ink-primary)] transition-colors">
                      Trust Handbook
                    </a>
                    <a href="/dashboard" className="hover:text-[var(--ink-primary)] transition-colors">
                      SaaS Studio
                    </a>
                    <a href="/admin" className="hover:text-[var(--ink-primary)] transition-colors">
                      Governance
                    </a>
                    <a href="/architecture" className="hover:text-[var(--ink-primary)] transition-colors">
                      System Map
                    </a>
                    <a href="/login" className="hover:text-[var(--ink-primary)] transition-colors">
                      Sign In
                    </a>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[var(--border-grid)]/60 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[var(--ink-secondary)]">
                  <div>
                    &copy; {new Date().getFullYear()} OneTownCity Civic Monorepo. Strict 4-Vertical Architecture.
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span>Verified Content Only</span>
                    <span>•</span>
                    <span>Zero Application Fees</span>
                    <span>•</span>
                    <span>Andhra Pradesh, India</span>
                  </div>
                </div>
              </footer>
            </SpotlightProvider>
          </AuthProvider>
        </TownProvider>
      </body>
    </html>
  );
}
