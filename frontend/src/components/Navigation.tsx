"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTown } from "./TownContext";
import { MapPin, ShieldCheck, LayoutDashboard, Compass } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { town, setTown } = useTown();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-6 w-2 bg-neutral-100 group-hover:bg-white transition-colors" />
            <span className="font-mono text-base font-bold tracking-wider text-neutral-100 uppercase">
              OneTownCity
            </span>
            <span className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 uppercase">
              Local SaaS
            </span>
          </Link>

          {/* Persistent Town Selector */}
          <div className="flex items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900/60 px-2 py-1">
            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-mono text-xs text-neutral-400 uppercase">Town:</span>
            <select
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="bg-transparent font-mono text-xs font-semibold text-neutral-100 outline-none cursor-pointer"
            >
              <option value="Nellore" className="bg-neutral-900 text-neutral-100">
                Nellore (AP)
              </option>
              <option value="Kuppam" className="bg-neutral-900 text-neutral-100">
                Kuppam (AP)
              </option>
            </select>
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              pathname === "/"
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Discovery</span>
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              pathname.startsWith("/dashboard")
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>SaaS Portal</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Governance</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
