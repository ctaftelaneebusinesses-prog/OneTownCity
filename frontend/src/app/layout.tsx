import type { Metadata } from "next";
import "./globals.css";
import { TownProvider } from "@/components/TownContext";
import { Navigation } from "@/components/Navigation";
import { TelemetryRibbon } from "@/components/TelemetryRibbon";
import { SpotlightProvider } from "@/components/SpotlightProvider";

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
          <SpotlightProvider>
            {/* 36px Telemetry Ribbon */}
            <TelemetryRibbon />

            {/* Sticky Masthead */}
            <Navigation />

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer
              className="border-t font-mono text-xs py-6 px-6"
              style={{
                borderColor: "var(--border-grid)",
                color: "var(--ink-tertiary)",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold tracking-tight" style={{ color: "var(--ink-primary)" }}>
                    ONETOWNCITY
                  </span>
                  <span style={{ color: "var(--border-grid)" }}>|</span>
                  <span>Nellore &amp; Kuppam Hyperlocal Index</span>
                </div>
                <div className="flex items-center gap-4 uppercase tracking-wide" style={{ fontSize: "9px" }}>
                  <span>Verified Content Only</span>
                  <span style={{ color: "var(--border-grid)" }}>|</span>
                  <span>Zero Application Fees</span>
                  <span style={{ color: "var(--border-grid)" }}>|</span>
                  <span>Andhra Pradesh, India</span>
                </div>
              </div>
            </footer>
          </SpotlightProvider>
        </TownProvider>
      </body>
    </html>
  );
}
