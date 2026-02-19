"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS } from "@/lib/demo-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check demo accounts
    const allAccounts = [...DEMO_ACCOUNTS.clinicians, ...DEMO_ACCOUNTS.patients];
    const account = allAccounts.find(a => a.email === email && a.password === password);
    
    if (account) {
      if (account.role === 'patient') {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    // Fallback: try NextAuth
    try {
      const { signIn } = await import("next-auth/react");
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      // If NextAuth not configured, just go to dashboard for demo
      router.push("/dashboard");
    }
  }

  const handleQuickLogin = (account: { email: string; password: string; name: string }) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-blue-100 rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-900">MindCare AI</h1>
            <p className="text-blue-800/70 mt-1">Mental Health Clinical Platform</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                placeholder="doctor@mindcare.ai" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Demo Accounts — Quick Login</p>
            
            <p className="text-xs text-gray-400 mb-2">👨‍⚕️ Clinicians</p>
            <div className="space-y-2 mb-4">
              {DEMO_ACCOUNTS.clinicians.map(acc => (
                <button key={acc.email} onClick={() => handleQuickLogin(acc)}
                  className="w-full flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left hover:bg-blue-50 hover:border-blue-200 transition">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {acc.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                    <p className="text-xs text-gray-500">{acc.specialty}</p>
                  </div>
                  <span className="text-xs text-blue-600">→</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mb-2">🧑 Patients</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.patients.map(acc => (
                <button key={acc.email} onClick={() => handleQuickLogin(acc)}
                  className="w-full flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left hover:bg-purple-50 hover:border-purple-200 transition">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    {acc.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                    <p className="text-xs text-gray-500">Patient Portal</p>
                  </div>
                  <span className="text-xs text-purple-600">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
