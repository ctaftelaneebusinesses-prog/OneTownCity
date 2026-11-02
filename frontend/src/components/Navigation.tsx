"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTown } from "./TownContext";
import { useSpotlight } from "./SpotlightProvider";
import { useAuth } from "@/context/AuthContext";
import { MapPin, ShieldCheck, LayoutDashboard, Compass, Search, Map, User, Plus, Tag, BookOpen, Lock } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { town, setTown } = useTown();
  const { toggle } = useSpotlight();
  const { user } = useAuth();

  const navLinks = [
    { href: "/",             label: "Index",          icon: Compass,         exact: true },
    { href: "/pricing",       label: "Pricing",        icon: Tag,             exact: false },
    { href: "/trust",         label: "Trust",          icon: BookOpen,        exact: false },
    { href: "/dashboard",    label: "SaaS Studio",    icon: LayoutDashboard, exact: false },
    { href: "/admin",        label: "Governance",     icon: Lock,            exact: false },
    { href: "/architecture", label: "System Map",     icon: Map,             exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-grid)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-[52px] gap-4">

        {/* Brand mark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 pressable"
          title="OneTownCity — Verified Hyperlocal Index"
        >
          {/* Geometric mark: two stacked bars */}
          <div className="flex flex-col gap-[3px] shrink-0">
            <div
              className="h-[3px] w-[18px] rounded-full"
              style={{ backgroundColor: "var(--accent-signal)" }}
            />
            <div
              className="h-[3px] w-[12px] rounded-full"
              style={{ backgroundColor: "var(--ink-primary)" }}
            />
            <div
              className="h-[3px] w-[16px] rounded-full"
              style={{ backgroundColor: "var(--border-grid)" }}
            />
          </div>
          <span
            className="font-mono font-bold tracking-tight uppercase hidden sm:inline"
            style={{ fontSize: "13px", color: "var(--ink-primary)", letterSpacing: "0.04em" }}
          >
            ONETOWNCITY
          </span>
        </Link>

        {/* Main nav links */}
        <nav className="flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded transition-colors pressable font-mono uppercase"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: active ? "var(--ink-primary)" : "var(--ink-secondary)",
                  backgroundColor: active ? "var(--bg-muted)" : "transparent",
                  textDecoration: "none",
                }}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Town switcher + Submit + Spotlight trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Submit / Contribute CTA */}
          <Link
            href="/submit"
            className="flex items-center gap-1.5 rounded px-2.5 py-1.5 border pressable font-mono text-[11px] font-semibold uppercase tracking-wider transition-all"
            style={{
              borderColor: "var(--accent-signal)",
              backgroundColor: "rgba(255, 79, 23, 0.08)",
              color: "var(--accent-signal)",
              textDecoration: "none",
            }}
            title="Suggest listing, submit event, or request category"
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} />
            <span className="hidden sm:inline">Submit</span>
          </Link>

          {/* Town selector */}
          <div
            className="flex items-center gap-1.5 rounded px-2.5 py-1.5 border pressable"
            style={{
              borderColor: "var(--border-grid)",
              backgroundColor: "var(--bg-muted)",
            }}
          >
            <MapPin
              className="h-3 w-3 shrink-0"
              strokeWidth={2}
              style={{ color: "var(--accent-signal)" }}
              aria-hidden
            />
            <select
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="bg-transparent font-mono font-semibold outline-none cursor-pointer"
              style={{ fontSize: "11px", color: "var(--ink-primary)", letterSpacing: "0.02em" }}
              aria-label="Select town"
            >
              <option value="Nellore">Nellore</option>
              <option value="Kuppam">Kuppam</option>
            </select>
          </div>

          {/* Spotlight search trigger */}
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded px-2.5 py-1.5 border pressable"
            style={{
              borderColor: "var(--border-grid)",
              backgroundColor: "var(--bg-muted)",
              color: "var(--ink-secondary)",
            }}
            aria-label="Open spotlight search (Ctrl+K)"
            title="Search (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="font-mono hidden sm:inline" style={{ fontSize: "10px", letterSpacing: "0.04em" }}>
              CTRL+K
            </span>
          </button>

          {/* User Account / Sign In Trigger */}
          {user ? (
            <Link
              href="/account"
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 border pressable font-mono"
              style={{
                borderColor: "var(--accent-signal)",
                backgroundColor: "var(--bg-muted)",
                color: "var(--ink-primary)",
                textDecoration: "none",
              }}
              title={`Signed in as ${user.name} (${user.role})`}
            >
              <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px] uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:inline text-[11px] font-semibold truncate max-w-[90px]">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 border pressable font-mono text-[11px] font-semibold uppercase tracking-wider"
              style={{
                borderColor: "var(--border-grid)",
                backgroundColor: "var(--bg-muted)",
                color: "var(--ink-primary)",
                textDecoration: "none",
              }}
            >
              <User className="h-3 w-3 shrink-0" strokeWidth={2} style={{ color: "var(--accent-signal)" }} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
