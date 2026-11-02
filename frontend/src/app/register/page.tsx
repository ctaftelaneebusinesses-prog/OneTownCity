"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole, VerticalType } from "@/context/AuthContext";
import { GraduationCap, Building2, Newspaper, ArrowRight, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("Nellore");

  // Tenant specific fields
  const [organizationName, setOrganizationName] = useState("");
  const [vertical, setVertical] = useState<VerticalType>("education");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Password must satisfy all security requirements below.");
      return;
    }

    if (selectedRole === "tenant_owner" && !organizationName.trim()) {
      setErrorMessage("Organization name is required for institution and business owners.");
      return;
    }

    setIsSubmitting(true);
    const success = await register({
      email: email.trim(),
      password,
      name: name.trim(),
      role: selectedRole,
      organization_name: selectedRole === "tenant_owner" ? organizationName.trim() : undefined,
      vertical: selectedRole === "tenant_owner" ? vertical : undefined,
      city,
    });
    setIsSubmitting(false);

    if (success) {
      if (selectedRole === "tenant_owner") {
        router.push("/dashboard");
      } else if (selectedRole === "content_provider") {
        router.push("/account");
      } else {
        router.push("/");
      }
    } else {
      setErrorMessage("Could not complete registration. The email may already be in use.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border font-mono text-[10px] font-semibold uppercase tracking-wider mb-4"
            style={{
              borderColor: "var(--border-grid)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--accent-signal)",
            }}
          >
            <ShieldCheck className="w-3 h-3" />
            Civic Onboarding Ledger
          </div>

          <h1
            className="text-3xl sm:text-4xl tracking-tight mb-3"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink-primary)" }}
          >
            Create Your Verified Account
          </h1>
          <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
            Select your persona to establish access boundaries and manage verified hyperlocal resources.
          </p>
        </div>

        {user && (
          <div className="mb-8 p-4 rounded border bg-amber-50 border-amber-200 text-amber-800 text-xs font-mono text-center">
            You are currently signed in as <strong>{user.name}</strong> ({user.role}). Registering will create a new session.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Persona Architecture Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                Step 1: Select Account Persona
              </span>
              <span className="font-mono text-[10px] text-neutral-400">Strict Scope Boundaries Enforced</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Student / Resident */}
              <div
                onClick={() => setSelectedRole("student")}
                className={`p-5 rounded border cursor-pointer transition-all pressable flex flex-col justify-between ${
                  selectedRole === "student"
                    ? "border-orange-600 bg-white ring-2 ring-orange-600/20 shadow-md"
                    : "border-neutral-300 bg-white hover:border-neutral-400 opacity-90"
                }`}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: selectedRole === "student" ? "var(--accent-signal)" : "var(--border-grid)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded border flex items-center justify-center"
                      style={{
                        borderColor: selectedRole === "student" ? "var(--accent-signal)" : "var(--border-grid)",
                        backgroundColor: selectedRole === "student" ? "var(--bg-muted)" : "transparent",
                      }}
                    >
                      <GraduationCap className="w-4 h-4" style={{ color: selectedRole === "student" ? "var(--accent-signal)" : "var(--ink-primary)" }} />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-neutral-400">01</span>
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-tight mb-1" style={{ color: "var(--ink-primary)" }}>
                    Student &amp; Resident
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                    Apply for verified internships, browse admissions, and redeem student discount passes.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t font-mono text-[9px] uppercase tracking-wider text-neutral-500" style={{ borderColor: "var(--border-grid)" }}>
                  Zero Application Fees
                </div>
              </div>

              {/* Option 2: Tenant Owner */}
              <div
                onClick={() => setSelectedRole("tenant_owner")}
                className={`p-5 rounded border cursor-pointer transition-all pressable flex flex-col justify-between ${
                  selectedRole === "tenant_owner"
                    ? "border-orange-600 bg-white ring-2 ring-orange-600/20 shadow-md"
                    : "border-neutral-300 bg-white hover:border-neutral-400 opacity-90"
                }`}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: selectedRole === "tenant_owner" ? "var(--accent-signal)" : "var(--border-grid)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded border flex items-center justify-center"
                      style={{
                        borderColor: selectedRole === "tenant_owner" ? "var(--accent-signal)" : "var(--border-grid)",
                        backgroundColor: selectedRole === "tenant_owner" ? "var(--bg-muted)" : "transparent",
                      }}
                    >
                      <Building2 className="w-4 h-4" style={{ color: selectedRole === "tenant_owner" ? "var(--accent-signal)" : "var(--ink-primary)" }} />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-neutral-400">02</span>
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-tight mb-1" style={{ color: "var(--ink-primary)" }}>
                    Institution &amp; Business Owner
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                    Claim storefront or campus profile, respond to admission enquiries, and post student offers.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t font-mono text-[9px] uppercase tracking-wider text-neutral-500" style={{ borderColor: "var(--border-grid)" }}>
                  SaaS Studio Portal
                </div>
              </div>

              {/* Option 3: Content Provider */}
              <div
                onClick={() => setSelectedRole("content_provider")}
                className={`p-5 rounded border cursor-pointer transition-all pressable flex flex-col justify-between ${
                  selectedRole === "content_provider"
                    ? "border-orange-600 bg-white ring-2 ring-orange-600/20 shadow-md"
                    : "border-neutral-300 bg-white hover:border-neutral-400 opacity-90"
                }`}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: selectedRole === "content_provider" ? "var(--accent-signal)" : "var(--border-grid)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded border flex items-center justify-center"
                      style={{
                        borderColor: selectedRole === "content_provider" ? "var(--accent-signal)" : "var(--border-grid)",
                        backgroundColor: selectedRole === "content_provider" ? "var(--bg-muted)" : "transparent",
                      }}
                    >
                      <Newspaper className="w-4 h-4" style={{ color: selectedRole === "content_provider" ? "var(--accent-signal)" : "var(--ink-primary)" }} />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-neutral-400">03</span>
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase tracking-tight mb-1" style={{ color: "var(--ink-primary)" }}>
                    Community Contributor
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                    Submit verified town news, campus updates, and propose directory taxonomy extensions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t font-mono text-[9px] uppercase tracking-wider text-neutral-500" style={{ borderColor: "var(--border-grid)" }}>
                  Moderation Required
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Tenant Organization Info (Only for tenant_owner) */}
          {selectedRole === "tenant_owner" && (
            <div className="p-6 rounded border bg-white space-y-4 animate-in fade-in duration-200"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-grid)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border-grid)" }}>
                <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                  Step 2: Tenant Entity Specification
                </span>
                <span className="font-mono text-[10px] text-neutral-400">Server-Scoped Workspace</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-primary)" }}>
                    Organization / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Sree Vidyanikethan College or Kaveri Bookstore"
                    className="w-full px-3 py-2 rounded border font-mono text-xs outline-none"
                    style={{
                      borderColor: "var(--border-grid)",
                      backgroundColor: "var(--bg-canvas)",
                      color: "var(--ink-primary)",
                    }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-primary)" }}>
                    Directory Vertical *
                  </label>
                  <select
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value as VerticalType)}
                    className="w-full px-3 py-2 rounded border font-mono text-xs outline-none cursor-pointer"
                    style={{
                      borderColor: "var(--border-grid)",
                      backgroundColor: "var(--bg-canvas)",
                      color: "var(--ink-primary)",
                    }}
                  >
                    <option value="education">Education (College, School, Coaching)</option>
                    <option value="business">Business (Storefront, Cafe, Bookshop)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Account Credentials */}
          <div className="p-6 rounded border bg-white space-y-4"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-grid)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border-grid)" }}>
              <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                Step {selectedRole === "tenant_owner" ? "3" : "2"}: Account Identity &amp; Security
              </span>
              <span className="font-mono text-[10px] text-neutral-400">Argon2id Salted Hash</span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 font-mono text-xs flex items-start gap-2">
                <span className="font-bold">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-primary)" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. K. Radhakrishnan or M. Suresh"
                  className="w-full px-3 py-2 rounded border font-mono text-xs outline-none"
                  style={{
                    borderColor: "var(--border-grid)",
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--ink-primary)",
                  }}
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-primary)" }}>
                  Primary Town *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded border font-mono text-xs outline-none cursor-pointer"
                  style={{
                    borderColor: "var(--border-grid)",
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--ink-primary)",
                  }}
                >
                  <option value="Nellore">Nellore (SPSR Nellore District)</option>
                  <option value="Kuppam">Kuppam (Chittoor District)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-primary)" }}>
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.in"
                  className="w-full px-3 py-2 rounded border font-mono text-xs outline-none"
                  style={{
                    borderColor: "var(--border-grid)",
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--ink-primary)",
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-primary)" }}>
                  Secure Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong passphrase"
                    className="w-full px-3 pr-10 py-2 rounded border font-mono text-xs outline-none"
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

                {/* Password Criteria Checklist */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700" : "text-neutral-400"}`}>
                    <Check className={`w-3 h-3 ${hasMinLength ? "text-emerald-600 font-bold" : "text-neutral-300"}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700" : "text-neutral-400"}`}>
                    <Check className={`w-3 h-3 ${hasUppercase ? "text-emerald-600 font-bold" : "text-neutral-300"}`} />
                    <span>1 uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700" : "text-neutral-400"}`}>
                    <Check className={`w-3 h-3 ${hasLowercase ? "text-emerald-600 font-bold" : "text-neutral-300"}`} />
                    <span>1 lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700" : "text-neutral-400"}`}>
                    <Check className={`w-3 h-3 ${hasNumber ? "text-emerald-600 font-bold" : "text-neutral-300"}`} />
                    <span>1 digit</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid}
              className="w-full mt-4 py-3 rounded font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 pressable disabled:opacity-50"
              style={{ backgroundColor: "var(--accent-signal)" }}
            >
              {isSubmitting ? (
                <span>Registering Salted Security Credentials...</span>
              ) : (
                <>
                  <span>Complete Onboarding &amp; Enter OneTownCity</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>
            Already hold an established account?{" "}
            <Link
              href="/login"
              className="font-mono font-bold hover:underline"
              style={{ color: "var(--accent-signal)" }}
            >
              Sign In to Your Workspace &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
