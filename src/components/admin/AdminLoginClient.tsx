'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Lock, Mail, AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingExistingSession, setIsVerifyingExistingSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasCheckedRef = useRef(false);

  // 1. Prompt, bounded non-blocking session check on mount
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setIsVerifyingExistingSession(false);
    }, 2000); // 2-second strict upper bound

    async function checkSession() {
      try {
        setIsVerifyingExistingSession(true);
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.isAuthenticated && data?.user?.email) {
            clearTimeout(timeoutId);
            window.location.replace('/dashboard');
            return;
          }
        }
      } catch {
        // Aborted or unauthenticated -> stay on login form
      } finally {
        clearTimeout(timeoutId);
        setIsVerifyingExistingSession(false);
      }
    }

    checkSession();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your administrative email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed. Please check credentials.');
        setIsLoading(false);
        return;
      }

      // Success: single deterministic redirect to dashboard
      window.location.replace('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error during login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100/90 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Top Header Branding with Official Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Image
              src="/images/officebazzar-logo-transparent.png"
              alt="Office Bazzar"
              width={360}
              height={180}
              priority
              className="w-48 sm:w-56 h-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
            <span>Office Bazzar</span>
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c] border border-orange-200">
              Admin
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Authorized Corporate Operations & Catalogue Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
          {/* Top Brand Accent Line */}
          <div className="h-1.5 bg-gradient-to-r from-[#ea580c] via-amber-500 to-[#ea580c]" />

          <div className="p-6 sm:p-8">
            {/* Transient Non-Blocking Verification Indicator */}
            {isVerifyingExistingSession && (
              <div className="mb-4 p-2.5 rounded-lg bg-orange-50/80 border border-orange-100 flex items-center justify-center gap-2 text-xs text-[#ea580c] font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking active session...</span>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@officebazzar.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                Protected by HMAC Session Verification • Row-Level Security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}