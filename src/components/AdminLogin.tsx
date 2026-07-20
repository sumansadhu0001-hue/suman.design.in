import { useState, FormEvent } from "react";
import { Lock, Mail, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase/client";

interface AdminLoginProps {
  setActivePage: (page: any) => void;
}

export default function AdminLogin({ setActivePage }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setIsSuccess(false);

    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    // Rate-limiting check: Max 5 attempts
    const now = Date.now();
    let attempts = [];
    try {
      attempts = JSON.parse(localStorage.getItem("login_attempts") || "[]");
    } catch (err) {
      attempts = [];
    }
    attempts = attempts.filter((t: number) => now - t < 300000); // last 5 minutes
    if (attempts.length >= 5) {
      setErrorMsg("Too many login attempts. Please wait 5 minutes before trying again.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Supabase Login Error:", error);
        attempts.push(now);
        try {
          localStorage.setItem("login_attempts", JSON.stringify(attempts));
        } catch (e) {}

        const errorMessage = error.message;
        if (errorMessage.toLowerCase().includes("invalid login credentials")) {
          setErrorMsg("Invalid login credentials. Please verify your email and password.");
        } else if (errorMessage.toLowerCase().includes("email not confirmed")) {
          setErrorMsg("Email not confirmed. Please verify your email address before logging in.");
        } else if (errorMessage.toLowerCase().includes("user not found")) {
          setErrorMsg("User not found. No account exists for this email.");
        } else if (errorMessage.toLowerCase().includes("invalid api key") || errorMessage.toLowerCase().includes("api key")) {
          setErrorMsg("Invalid API key configured. Please check your Supabase credentials.");
        } else if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch")) {
          setErrorMsg("Network error. Unable to connect to Supabase authentication server.");
        } else {
          setErrorMsg(errorMessage);
        }
        setIsLoading(false);
        return;
      }

      if (!data.session || !data.user) {
        setErrorMsg("Authentication succeeded, but no session could be established. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Check if user actually has the requested admin email or check existence of administrator email
      const authenticatedEmail = data.user.email;
      if (!authenticatedEmail) {
        setErrorMsg("Authenticated user has no email address. Access denied.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
      try {
        localStorage.removeItem("login_attempts");
      } catch (e) {}

      // Set cookie for Express middleware
      document.cookie = `admin_token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Strict; path=/`;

      setTimeout(() => {
        // Redirect to /admin/dashboard
        const searchParams = new URLSearchParams(window.location.search);
        const redirectParam = searchParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("/admin")) {
          window.history.replaceState(null, "", redirectParam);
          setActivePage(redirectParam.substring(1));
        } else {
          window.history.replaceState(null, "", "/admin/dashboard");
          setActivePage("admin/dashboard");
        }
      }, 1000);

    } catch (err: any) {
      console.error("Unexpected login exception:", err);
      setErrorMsg(err.message || "An unexpected error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-[#030303] text-white">
      {/* Background glowing spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-violet-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-950/40 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase text-violet-400 bg-violet-500/10 border border-violet-500/20 mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Area Access</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">Admin Login</h1>
          <p className="text-sm text-zinc-400/80 mt-2">Access the Suman.design Operations Console</p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 mb-6 text-sm rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium animate-shake">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="flex items-start gap-2.5 p-3.5 mb-6 text-sm rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-450" />
            <span>{infoMsg}</span>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-start gap-2.5 p-3.5 mb-6 text-sm rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Authenticated! Redirecting to Workspace...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sumandesign.in"
                className="w-full pl-10 pr-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                disabled={isLoading || isSuccess}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                disabled={isLoading || isSuccess}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-violet-600 rounded bg-zinc-900 border-zinc-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                disabled={isLoading || isSuccess}
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => setInfoMsg("Please use your registered Supabase administrator credentials. Passwords can be reset via the Supabase auth panel.")}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
              disabled={isLoading || isSuccess}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.862 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In →</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setActivePage("home")}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to Public Website
          </button>
        </div>
      </motion.div>
    </div>
  );
}
