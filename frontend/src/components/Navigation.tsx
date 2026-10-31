"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTown } from "./TownContext";
import { MapPin, ShieldCheck, LayoutDashboard, Compass, PlusCircle } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { town, setTown } = useTown();

  return (
    <header className="sticky top-0 z-40 border-b border-[#EAAA00]/30 bg-[#3A0F34] text-[#F8FAFC] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-6 w-1.5 bg-[#EAAA00] group-hover:bg-white transition-colors rounded-xs" />
            <span className="font-mono text-base font-bold tracking-wider text-[#F8FAFC] uppercase">
              OneTownCity
            </span>
            <span className="rounded bg-[#240820] border border-[#EAAA00]/40 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#EAAA00] uppercase tracking-wider">
              Local SaaS
            </span>
          </Link>

          {/* Persistent Town Selector */}
          <div className="flex items-center gap-1.5 rounded border border-[#C3CDD6]/30 bg-[#240820] px-2.5 py-1 focus-within:ring-1 focus-within:ring-[#EAAA00] transition-shadow">
            <MapPin className="h-3.5 w-3.5 text-[#EAAA00]" strokeWidth={1.75} />
            <span className="font-mono text-xs text-[#DDE3E8]/70 uppercase">Town:</span>
            <select
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="bg-transparent font-mono text-xs font-semibold text-[#F8FAFC] outline-none cursor-pointer"
            >
              <option value="Nellore" className="bg-[#240820] text-[#F8FAFC]">
                Nellore (AP)
              </option>
              <option value="Kuppam" className="bg-[#240820] text-[#F8FAFC]">
                Kuppam (AP)
              </option>
            </select>
          </div>
        </div>

        {/* Global Navigation Links & Action */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-semibold uppercase transition-all ${
                pathname === "/"
                  ? "bg-[#EAAA00] text-[#240820] shadow-xs"
                  : "text-[#F8FAFC]/80 hover:bg-[#240820] hover:text-[#F8FAFC]"
              }`}
            >
              <Compass className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Discovery</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-semibold uppercase transition-all ${
                pathname.startsWith("/dashboard")
                  ? "bg-[#EAAA00] text-[#240820] shadow-xs"
                  : "text-[#F8FAFC]/80 hover:bg-[#240820] hover:text-[#F8FAFC]"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>SaaS Portal</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-semibold uppercase transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-[#EAAA00] text-[#240820] shadow-xs"
                  : "text-[#F8FAFC]/80 hover:bg-[#240820] hover:text-[#F8FAFC]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Governance</span>
            </Link>
          </nav>

          {/* Action pill button */}
          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#EAAA00] px-3.5 py-1.5 font-mono text-xs font-bold text-[#240820] shadow hover:bg-[#ffc02e] hover:shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Add Listing / Partner</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
