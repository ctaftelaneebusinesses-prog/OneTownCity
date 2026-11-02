"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { UserCheck, Shield, ChevronUp, ChevronDown, LogOut, CheckCircle2 } from "lucide-react";

export type UserRole =
  | "super_admin"
  | "city_admin"
  | "sub_admin"
  | "content_provider"
  | "tenant_owner"
  | "tenant_staff"
  | "student";

export type VerticalType = "news" | "education" | "students" | "business";

export type PlanTier = "free" | "growth_business" | "edu_pro" | "campus_enterprise";

export type OrgRole = "owner" | "admin" | "staff" | "viewer";

export interface UserTenantMembership {
  organization_id: string;
  organization_name: string;
  vertical: VerticalType;
  city: string;
  role: OrgRole;
  plan_tier: PlanTier;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  tenant: UserTenantMembership | null;
  allMemberships: UserTenantMembership[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    organization_name?: string;
    vertical?: VerticalType;
    city?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchPersona: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenant: null,
  allMemberships: [],
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
  switchPersona: async () => false,
});

export const SEEDED_PERSONAS = [
  {
    role: "super_admin" as UserRole,
    title: "Super Admin",
    name: "Nellore City Commissioner",
    email: "admin@onetowncity.in",
    badge: "GOVERNANCE ROOT",
    description: "Full moderation queue & category lifecycle authority",
  },
  {
    role: "tenant_owner" as UserRole,
    title: "Edu Tenant Owner",
    name: "Dr. P. Narayana",
    email: "dean@narayana.edu.in",
    badge: "CAMPUS ENTERPRISE",
    description: "Narayana Engineering College admissions & leads",
  },
  {
    role: "tenant_owner" as UserRole,
    title: "Biz Tenant Owner",
    name: "S. Venkatesh",
    email: "owner@minervabooks.in",
    badge: "GROWTH BIZ",
    description: "Minerva Book Depot storefront & student deals",
  },
  {
    role: "content_provider" as UserRole,
    title: "Content Provider",
    name: "P. Raghava",
    email: "editor@kuppampulse.in",
    badge: "CONTENT QUEUE",
    description: "Community updates & subcategory extension requests",
  },
  {
    role: "student" as UserRole,
    title: "Student / Resident",
    name: "K. Sai Praneeth",
    email: "student@gist.edu.in",
    badge: "RESIDENT",
    description: "Browses verified drives, internships & student perks",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<UserTenantMembership | null>(null);
  const [allMemberships, setAllMemberships] = useState<UserTenantMembership[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPersonaBarOpen, setIsPersonaBarOpen] = useState<boolean>(false);
  const [switchingPersona, setSwitchingPersona] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal,
      });

      if (signal?.aborted) return;
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTenant(data.active_tenant || (data.memberships && data.memberships[0]) || null);
        setAllMemberships(data.memberships || []);
      } else {
        setUser(null);
        setTenant(null);
        setAllMemberships([]);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setUser(null);
      setTenant(null);
      setAllMemberships([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCurrentUser(controller.signal);
    return () => controller.abort();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Authentication Failed", {
          description: err.error || "Invalid credentials provided.",
        });
        return false;
      }

      const data = await res.json();
      setUser(data.user);
      setTenant(data.active_tenant || (data.memberships && data.memberships[0]) || null);
      setAllMemberships(data.memberships || []);
      toast.success("Welcome back", {
        description: `Signed in as ${data.user.name} (${data.user.role.replace("_", " ")})`,
      });
      return true;
    } catch (err) {
      toast.error("Network Error", {
        description: err instanceof Error ? err.message : "Failed to connect to authentication service.",
      });
      return false;
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    organization_name?: string;
    vertical?: VerticalType;
    city?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error("Registration Failed", {
          description: err.error || "Could not complete account creation.",
        });
        return false;
      }

      const data = await res.json();
      setUser(data.user);
      setTenant(data.active_tenant || (data.memberships && data.memberships[0]) || null);
      setAllMemberships(data.memberships || []);
      toast.success("Account Created", {
        description: `Welcome to OneTownCity, ${data.user.name}.`,
      });
      return true;
    } catch (err) {
      toast.error("Network Error", {
        description: err instanceof Error ? err.message : "Failed to connect to authentication service.",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setTenant(null);
      setAllMemberships([]);
      toast.info("Signed Out", {
        description: "Your session has been securely invalidated.",
      });
    }
  };

  const switchPersona = async (email: string): Promise<boolean> => {
    setSwitchingPersona(email);
    const success = await login(email, "Password123!");
    setSwitchingPersona(null);
    return success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        allMemberships,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        switchPersona,
      }}
    >
      {children}

      {/* Local Dev Persona Bar (Collapsible floating dock) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end select-none">
        {isPersonaBarOpen && (
          <div
            className="mb-2 w-80 sm:w-96 rounded border bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-grid)",
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: "var(--border-grid)" }}>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                  Dev Persona Dock
                </span>
              </div>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                LOCAL RBAC TEST
              </span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {SEEDED_PERSONAS.map((p) => {
                const isCurrent = user?.email === p.email;
                const isPending = switchingPersona === p.email;

                return (
                  <button
                    key={p.email}
                    onClick={() => switchPersona(p.email)}
                    disabled={isCurrent || isPending}
                    className={`w-full text-left p-2 rounded border transition-all text-xs flex flex-col gap-0.5 ${
                      isCurrent
                        ? "border-emerald-600/40 bg-emerald-50/50"
                        : "border-transparent hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium font-mono text-[11px]" style={{ color: "var(--ink-primary)" }}>
                        {p.title}
                      </span>
                      <span
                        className={`font-mono text-[9px] uppercase px-1 py-0.2 rounded border ${
                          isCurrent
                            ? "border-emerald-600 text-emerald-800 bg-emerald-100/60 font-bold"
                            : "border-neutral-300 text-neutral-600 bg-neutral-100"
                        }`}
                      >
                        {isCurrent ? "Active" : p.badge}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                      <span>{p.name}</span>
                      <span className="font-mono text-[9px] truncate max-w-[150px]">{p.email}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {user && (
              <div className="mt-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: "var(--border-grid)" }}>
                <span className="text-[10px] font-mono text-neutral-500">
                  Signed in: <strong className="text-neutral-800">{user.role}</strong>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 font-mono text-[10px] text-red-600 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Trigger Pill */}
        <button
          onClick={() => setIsPersonaBarOpen(!isPersonaBarOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg transition-all pressable bg-white"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: user ? "var(--accent-signal)" : "var(--border-grid)",
            color: "var(--ink-primary)",
          }}
          title="Toggle Local Dev Persona Switcher"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              user ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
            }`}
          />
          <UserCheck className="w-3.5 h-3.5" style={{ color: "var(--accent-signal)" }} />
          <span className="font-mono text-[11px] font-semibold tracking-tight">
            {user ? `${user.name.split(" ")[0]} (${user.role.replace("_", " ")})` : "Switch Persona"}
          </span>
          {isPersonaBarOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
