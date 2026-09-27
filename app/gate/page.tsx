"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Mail,
  Loader2,
  KeyRound,
} from "lucide-react";
import GameLogo from "@/components/common/GameLogo";
import { getSafeRedirect } from "@/lib/auth";

export default function SiteGatePage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/site-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "بيانات الدخول غير صحيحة.");
        setIsLoading(false);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectTarget = searchParams.get("redirect") || "/";
      window.location.replace(getSafeRedirect(redirectTarget));
    } catch {
      setError("صار خلل بالاتصال. جرب مرة ثانية.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a192f] via-[#0f2744] to-[#081325] flex items-center justify-center p-4 dir-rtl relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/40 shadow-2xl text-center relative z-10"
      >
        <div className="flex justify-center mb-4">
          <div className="relative">
            <GameLogo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          تسجيل الدخول للموقع
        </h1>
        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed font-semibold">
          الموقع محمي ومخصص للمصرح لهم فقط. يرجى إدخال البريد الإلكتروني وكلمة
          المرور للمتابعة.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@7elhmbenhm.com"
                autoComplete="email"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 pr-10 text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:border-sky-500 focus:bg-white focus:ring-3 focus:ring-sky-500/15 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 pr-10 pl-10 text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:border-sky-500 focus:bg-white focus:ring-3 focus:ring-sky-500/15 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition p-0.5"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2.5"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full mt-2 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-sky-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>دخول إلى الموقع</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-400 font-semibold mt-5">
          بعد الدخول، يمكنك تسجيل حسابك أو بدء اللعب بشكل طبيعي.
        </p>
      </motion.div>
    </div>
  );
}
