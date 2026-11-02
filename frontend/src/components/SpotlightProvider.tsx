"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { Search, ArrowRight, GraduationCap, Building2, BookOpen, MapPin, Newspaper } from "lucide-react";
import Link from "next/link";

type SpotlightContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const SpotlightContext = createContext<SpotlightContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function useSpotlight() {
  return useContext(SpotlightContext);
}

const QUICK_LINKS = [
  { label: "Discovery Hub", href: "/", icon: MapPin, category: "Navigate" },
  { label: "Education Hub", href: "/?tab=education", icon: GraduationCap, category: "Navigate" },
  { label: "Student Corner", href: "/?tab=students", icon: BookOpen, category: "Navigate" },
  { label: "Local Businesses", href: "/?tab=business", icon: Building2, category: "Navigate" },
  { label: "News & Town Pulse", href: "/?tab=news", icon: Newspaper, category: "Navigate" },
  { label: "SaaS Studio", href: "/dashboard", icon: Building2, category: "Navigate" },
  { label: "Governance", href: "/admin", icon: Building2, category: "Admin" },
  { label: "Architecture Map", href: "/architecture", icon: MapPin, category: "Admin" },
];

function SpotlightDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? QUICK_LINKS.filter((l) =>
        l.label.toLowerCase().includes(query.toLowerCase()) ||
        l.category.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_LINKS;

  return (
    <div className="spotlight-overlay" onClick={onClose} role="dialog" aria-modal aria-label="Spotlight search">
      <div
        className="spotlight-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600, width: "calc(100% - 2rem)" }}
      >
        <Command>
          {/* Search input */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 border-b"
            style={{ borderColor: "var(--border-grid)" }}
          >
            <Search
              className="h-4 w-4 shrink-0"
              strokeWidth={1.75}
              style={{ color: "var(--ink-tertiary)" }}
            />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search colleges, scholarships, cafes, civic news..."
              className="flex-1 bg-transparent font-sans text-sm outline-none"
              style={{ color: "var(--ink-primary)", fontSize: "14px" }}
              autoFocus
            />
            <kbd
              className="font-mono text-xs px-2 py-0.5 rounded border shrink-0"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--ink-tertiary)",
                borderColor: "var(--border-grid)",
                backgroundColor: "var(--bg-muted)",
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="py-2 max-h-80 overflow-y-auto">
            <Command.Empty>
              <div
                className="py-8 text-center font-mono text-xs uppercase"
                style={{ color: "var(--ink-tertiary)" }}
              >
                No results for &quot;{query}&quot;
              </div>
            </Command.Empty>

            {Object.entries(
              filtered.reduce<Record<string, typeof QUICK_LINKS>>((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <Command.Group key={category}>
                <div
                  className="px-4 py-1.5 font-mono uppercase"
                  style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-tertiary)" }}
                >
                  {category}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item key={item.href} value={item.label}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors group pressable"
                        style={{ color: "var(--ink-primary)", textDecoration: "none" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-muted)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "";
                        }}
                      >
                        <Icon
                          className="h-4 w-4 shrink-0"
                          strokeWidth={1.5}
                          style={{ color: "var(--ink-tertiary)" }}
                        />
                        <span className="font-sans text-sm flex-1" style={{ fontSize: "13px" }}>
                          {item.label}
                        </span>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          strokeWidth={1.75}
                          style={{ color: "var(--accent-signal)" }}
                        />
                      </Link>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div
            className="border-t px-4 py-2 flex items-center gap-4 font-mono"
            style={{
              borderColor: "var(--border-grid)",
              fontSize: "10px",
              color: "var(--ink-tertiary)",
              backgroundColor: "var(--bg-muted)",
            }}
          >
            <span>
              <kbd
                className="px-1.5 py-0.5 rounded border mr-1"
                style={{ borderColor: "var(--border-grid)", backgroundColor: "var(--bg-surface)" }}
              >
                Enter
              </kbd>
              select
            </span>
            <span>
              <kbd
                className="px-1.5 py-0.5 rounded border mr-1"
                style={{ borderColor: "var(--border-grid)", backgroundColor: "var(--bg-surface)" }}
              >
                ESC
              </kbd>
              close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  return (
    <SpotlightContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      {open && <SpotlightDialog onClose={() => setOpen(false)} />}
    </SpotlightContext.Provider>
  );
}
