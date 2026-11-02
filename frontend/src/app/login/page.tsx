"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, SEEDED_PERSONAS } from "@/context/AuthContext";
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please provide both email address and password.");
      return;
    }

    setIsSubmitting(true);
    const success = await login(email.trim(), password);
    setIsSubmitting(false);

    if (success) {
      router.push("/account");
    } else {
      setErrorMessage("Invalid email or password. Please verify your credentials.");
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-stretch">
      {/* 2-Column Split: Editorial Trust Ledger (Left) & Form (Right) */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 border-x" style={{ borderColor: "var(--border-grid)" }}>
        
        {/* Left Editorial Manifesto & Trust Ledger */}
        <div
          className="lg:col-span-5 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r flex flex-col justify-between"
          style={{
            borderColor: "var(--border-grid)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border font-mono text-[10px] font-semibold uppercase tracking-wider mb-6"
              style={{
                borderColor: "var(--border-grid)",
                backgroundColor: "var(--bg-muted)",
                color: "var(--accent-signal)",
              }}
            >
              <KeyRound className="w-3 h-3" />
              SaaS Identity &amp; RBAC Gateway
            </div>

            <h1
              className="text-3xl sm:text-4xl tracking-tight mb-4"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--ink-primary)",
                lineHeight: 1.15,
              }}
            >
              Authenticate with Civic Confidence.
            </h1>

            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--ink-secondary)" }}>
              OneTownCity operates on server-derived tenant scopes and cryptographically salted Argon2id credentials. No tracking beacons, no advertising pixels.
            </p>

            {/* Trust Ledger */}
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--border-grid)" }}>
              <div className="flex items-start gap-3">
                <div className="font-mono text-xs font-bold text-neutral-400 mt-0.5">01</div>
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide font-mono" style={{ color: "var(--ink-primary)" }}>
                    Zero Public Gatekeeping
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-secondary)" }}>
                    Residents do not require accounts to browse news, search colleges, or submit enquiries.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="font-mono text-xs font-bold text-neutral-400 mt-0.5">02</div>
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide font-mono" style={{ color: "var(--ink-primary)" }}>
                    Server-Derived Tenancy
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-secondary)" }}>
                    Directory owners access exclusively verified organization resources. Tenant IDs are never trusted from client payloads.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="font-mono text-xs font-bold text-neutral-400 mt-0.5">03</div>
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide font-mono" style={{ color: "var(--ink-primary)" }}>
                    Cryptographic Session Ledger
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-secondary)" }}>
                    High-entropy SHA-256 tokens stored with client fingerprinting. Revoke any active session in 1 click.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Accounts Pill Selector */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border-grid)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--ink-secondary)" }}>
                Quick Demo Accounts (Local Dev)
              </span>
              <span className="font-mono text-[9px] text-neutral-400">Password: Password123!</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SEEDED_PERSONAS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => fillDemoCredentials(p.email)}
                  className="p-1.5 rounded border text-left hover:border-neutral-400 transition-colors pressable"
                  style={{
                    borderColor: email === p.email ? "var(--accent-signal)" : "var(--border-grid)",
                    backgroundColor: email === p.email ? "var(--bg-muted)" : "transparent",
                  }}
                >
                  <div className="font-mono text-[10px] font-semibold truncate" style={{ color: "var(--ink-primary)" }}>
                    {p.title}
                  </div>
                  <div className="font-mono text-[9px] text-neutral-500 truncate">
                    {p.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-8 lg:p-16 flex flex-col justify-center" style={{ backgroundColor: "var(--bg-canvas)" }}>
          <div className="max-w-md w-full mx-auto">
            
            {user ? (
              <div
                className="p-6 rounded border bg-white space-y-4"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-grid)",
                }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-tight" style={{ color: "var(--ink-primary)" }}>
                      Already Authenticated
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Signed in as <strong>{user.name}</strong> ({user.role.replace("_", " ")})
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/account"
                    className="px-4 py-2 rounded font-mono text-xs font-semibold uppercase tracking-wider text-white inline-flex items-center gap-2 pressable"
                    style={{ backgroundColor: "var(--accent-signal)" }}
                  >
                    Open Security Console
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded font-mono text-xs font-semibold uppercase tracking-wider border hover:bg-neutral-50 inline-flex items-center gap-2 pressable"
                    style={{ borderColor: "var(--border-grid)", color: "var(--ink-primary)" }}
                  >
                    Go to SaaS Studio
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className="p-8 rounded border shadow-sm bg-white"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-grid)",
                }}
              >
                <div className="mb-6">
                  <h2
                    className="text-2xl font-bold tracking-tight mb-1"
                    style={{ color: "var(--ink-primary)" }}
                  >
                    Sign In
                  </h2>
                  <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>
                    Enter your email credentials to access your dashboard and manage directory records.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-5 p-3 rounded border border-red-200 bg-red-50 text-red-700 font-mono text-xs flex items-start gap-2">
                    <span className="font-bold">!</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-primary)" }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institution.edu.in"
                        className="w-full pl-9 pr-3 py-2 rounded border font-mono text-xs outline-none transition-colors"
                        style={{
                          borderColor: "var(--border-grid)",
                          backgroundColor: "var(--bg-canvas)",
                          color: "var(--ink-primary)",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                        Password
                      </label>
                      <span className="font-mono text-[10px] text-neutral-400">Argon2id Salted</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-10 py-2 rounded border font-mono text-xs outline-none transition-colors"
                        style={{
                          borderColor: "var(--border-grid)",
                          backgroundColor: "var(--bg-canvas)",
                          color: "var(--ink-primary)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 pressable disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent-signal)" }}
                  >
                    {isSubmitting ? (
                      <span>Verifying Cryptographic Credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to OneTownCity</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "var(--border-grid)" }}>
                  <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>
                    Don&apos;t have an account yet?{" "}
                    <Link
                      href="/register"
                      className="font-mono font-bold hover:underline"
                      style={{ color: "var(--accent-signal)" }}
                    >
                      Register New Persona &rarr;
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
