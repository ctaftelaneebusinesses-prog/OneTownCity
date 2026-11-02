"use client";

import React from "react";
import { useTown } from "./TownContext";

const COORDINATES: Record<string, string> = {
  Nellore: "14.4426° N  79.9865° E",
  Kuppam:  "12.7492° N  78.3422° E",
};

export function TelemetryRibbon() {
  const { town } = useTown();
  const coords = COORDINATES[town] || COORDINATES["Nellore"];

  return (
    <div
      className="telemetry-ribbon w-full shrink-0 overflow-hidden"
      role="status"
      aria-label="Live town telemetry and student protection notice"
    >
      <div className="flex items-center gap-6 min-w-0 flex-1">
        {/* Live dot */}
        <span className="live-dot-signal shrink-0" aria-hidden="true" />

        {/* Coordinates */}
        <span className="font-mono-numbers shrink-0 hidden sm:inline">
          {town.toUpperCase()}: {coords}
        </span>

        {/* API status */}
        <span className="shrink-0 hidden md:flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "var(--status-verified)" }}
            aria-hidden="true"
          />
          <span>API ONLINE</span>
        </span>

        {/* Divider */}
        <span className="hidden md:inline" style={{ color: "rgba(244,242,238,0.2)" }}>
          |
        </span>

        {/* Student protection */}
        <span
          className="font-mono flex items-center gap-1.5 min-w-0"
          style={{ color: "var(--accent-signal)" }}
        >
          <span className="shrink-0">!</span>
          <span className="truncate">STUDENT PROTECTION LEDGER: ZERO APPLICATION FEES PERMITTED — NEVER PAY TO APPLY</span>
        </span>
      </div>

      {/* Right: timestamp */}
      <span
        className="hidden lg:inline font-mono-numbers shrink-0 ml-auto"
        suppressHydrationWarning
        style={{ color: "rgba(244,242,238,0.4)" }}
      >
        {new Date().toISOString().slice(0, 10)}
      </span>
    </div>
  );
}
