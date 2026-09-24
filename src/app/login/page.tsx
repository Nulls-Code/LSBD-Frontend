"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // Timer for lockout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutMinutes !== null && lockoutMinutes > 0) {
      interval = setInterval(() => {
        setLockoutMinutes((prev) => (prev && prev > 1 ? prev - 1 : null));
      }, 60000); // decrement every minute
    }
    return () => clearInterval(interval);
  }, [lockoutMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutMinutes) return;

    setLoading(true);
    setGlobalError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 400 Validation Error
        if (response.status === 400 && data.error?.errors) {
          setFieldErrors(data.error.errors);
        }
        // Handle 429 Too Many Requests (Lockout)
        else if (response.status === 429) {
          const match = data.error?.message?.match(/(\d+)\s+minute/i);
          if (match && match[1]) {
            setLockoutMinutes(parseInt(match[1], 10));
          } else {
            setLockoutMinutes(15); // Fallback to 15 mins if parsing fails
          }
        }
        // General Errors (401, 403, 500)
        else {
          setGlobalError(data.error?.message || "An unexpected error occurred. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Success (200 OK)
      setSuccessToast(true);

      // Delay redirect to allow the user to see the success toast
      setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh(); // Refresh to ensure middleware re-evaluates the new cookie
      }, 1500);

    } catch (err) {
      console.error("Login request failed:", err);
      setGlobalError("Could not connect to the server. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-110 p-8 md:p-10">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#08254a] mb-2">Welcome Back!</h1>
            <p className="text-[#64748b] text-sm">Sign in to continue your courier journey</p>
          </div>

          {globalError && (
            <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {globalError}
            </div>
          )}

          {lockoutMinutes !== null && (
            <div className="mb-6 p-3 rounded bg-amber-50 border border-amber-200 text-amber-700 text-sm flex flex-col items-center justify-center">
              <span className="font-semibold">Account locked due to too many failed attempts.</span>
              <span>Try again in {lockoutMinutes} minute(s).</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  disabled={loading || lockoutMinutes !== null}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={clsx(
                    "block w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm transition-colors outline-none",
                    fieldErrors.email
                      ? "border-red-500 bg-red-50 focus:ring-1 focus:ring-red-500"
                      : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500",
                    (loading || lockoutMinutes !== null) && "opacity-60 cursor-not-allowed"
                  )}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={loading || lockoutMinutes !== null}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={clsx(
                    "block w-full pl-11 pr-12 py-3.5 border rounded-xl text-sm transition-colors outline-none",
                    fieldErrors.password
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                    (loading || lockoutMinutes !== null) && "opacity-60 cursor-not-allowed"
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a href="#" className="text-[#f43f5e] hover:text-[#e11d48] text-sm font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutMinutes !== null || !email || !password}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium transition-all shadow-md",
                (loading || lockoutMinutes !== null || !email || !password)
                  ? "bg-[#1E293B]/70 cursor-not-allowed shadow-none"
                  : "bg-[#1E293B] hover:bg-[#0F172A] hover:shadow-lg active:scale-[0.98]"
              )}
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Login Successful</h4>
            <p className="text-xs opacity-90">Taking you to your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
