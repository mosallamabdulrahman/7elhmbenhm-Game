"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw,
  LockKeyhole,
  AlertTriangle,
  Lock,
  Shield,
  Crown,
  Gamepad2,
  CheckCircle,
} from "lucide-react";
import type { GameRoom } from "@/types/game";

// Floating alert message toast
export function BattleAlert({ alert }: { alert: { message?: string; text?: string; type?: string } | null }) {
  const displayMsg = alert?.message || alert?.text;
  return (
    <AnimatePresence>
      {alert && displayMsg && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
            alert.type === "success"
              ? "bg-emerald-900 border-emerald-800"
              : alert.type === "error"
                ? "bg-rose-900 border-rose-800"
                : "bg-slate-900 border-slate-800"
          } text-white text-xs font-bold`}
        >
          {alert.type === "error" ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          )}
          {displayMsg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Initial authorization check loading screen
export function BattleAuthCheckingView() {
  return (
    <div className="min-h-screen flex items-center justify-center dir-rtl" suppressHydrationWarning>
      <div className="text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-cyan-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800 mt-4">
          قاعدين نشيك على حسابك وتصاريح الدخول...
        </h3>
      </div>
    </div>
  );
}

// Mandatory login requirement card
export function BattleLoginRequiredView({ returnPath }: { returnPath: string }) {
  return (
    <div className="min-h-screen py-16 px-4 flex flex-col justify-center items-center dir-rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center"
      >
        <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl inline-block mb-6 shadow-inner">
          <LockKeyhole className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          لازم تسجل دخولك أول
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
          عفواً، لازم تسجل دخولك أول شي عشان تقدر توزع فريقك أو تدير الغرفة. الدخول وايد سريع بدون باسورد!
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={`/login?redirect=${encodeURIComponent(returnPath)}`}
            className="w-full bg-gradient-to-r from-cyan-600 to-sky-500 hover:shadow-md py-3 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2"
          >
            ⚡ دخول سريع
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-cyan-600 transition-colors mt-2 block"
          >
            ← ارجع للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Database sync loading screen
export function BattleDbLoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center dir-rtl">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
        <p className="text-xs font-bold text-slate-700 mt-4">
          قاعدين نربط الجبهات وننطر باجي ربعنا يدشون...
        </p>
      </div>
    </div>
  );
}

// Connection error card with retry button
export function BattleDbErrorView({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 dir-rtl">
      <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-lg text-center max-w-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-900 mt-4">صار خلل بالاتصال بالنت</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 font-bold bg-cyan-600 text-white px-5 py-2 rounded-xl text-xs cursor-pointer hover:bg-cyan-700 transition-colors"
        >
          جرب مرة ثانية
        </button>
      </div>
    </div>
  );
}

// Room data preparation spinner
export function BattleRoomSetupView() {
  return (
    <div className="min-h-screen flex items-center justify-center dir-rtl">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mx-auto" />
        <p className="text-xs font-bold text-slate-700 mt-4">
          قاعدين نجهز بيانات الغرفة...
        </p>
      </div>
    </div>
  );
}

// Unauthorized referee notice
export function BattleUnauthorizedJudgeView() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 dir-rtl">
      <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-lg">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="mt-4 text-xl font-bold text-slate-950">هالشاشة بس حق حكم الغرفة</h2>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          الحساب المسجّل حالياً لا يتطابق مع معرف الحكم الذي أنشأ هذه الغرفة.
        </p>
        <Link
          href="/"
          className="mt-7 block w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 py-3 font-bold text-white text-xs"
        >
          ارجع للرئيسية
        </Link>
      </div>
    </div>
  );
}

// Role selection portal when entering room without query params
export function BattleGatewayRoleSelectView({
  room,
  isJudgeOwner,
  onExitGame,
}: {
  room: GameRoom;
  isJudgeOwner: boolean;
  onExitGame: () => void;
}) {
  return (
    <div className="min-h-screen py-16 px-4 flex flex-col justify-center items-center dir-rtl">
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center">
        <div className="bg-gradient-to-tr from-cyan-500 to-sky-400 text-white p-3.5 rounded-2xl inline-block mb-6 shadow-md">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-950 leading-tight">بوابة الدخول للتحدي</h2>
        <p className="text-xs text-slate-500 mt-1 pb-6 border-b border-slate-100 font-semibold">
          اختار منو أنت الحين وحدد مكانك عشان تبدأ اللعب سيدة
        </p>
        <div className="mt-8 space-y-4">
          {!isJudgeOwner && (
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              لازم تدش برابط فريقك الخاص (فيه رمز الدخول) اللي عطاك ياه الحكم.
            </p>
          )}
          {isJudgeOwner && (
            <>
              <Link
                href={`/battle?room_id=${room.id}&role=judge`}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-all text-right group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-sm text-slate-800 block">
                    دش كحكم حق المباراة (شاشة المتابعة)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    تتبع اللعب، شوف طقات الرادار وراقب المؤشرات
                  </span>
                </div>
                <Crown className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={onExitGame}
                className="w-full rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 p-3 text-sm font-bold text-rose-700 cursor-pointer transition-colors"
              >
                اطلع من اللعبة وسكر الغرفة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Fallback offline sandbox screen
export function BattleSandboxFallbackView() {
  return (
    <div className="min-h-screen py-20 px-4 flex flex-col justify-center items-center dir-rtl overflow-x-auto overflow-y-auto">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center">
        <div className="bg-gradient-to-tr from-cyan-600 to-sky-500 text-white p-4 rounded-2xl inline-block mb-6 shadow-md animate-bounce">
          <Gamepad2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-950">لعبة حيلهم بينهم</h2>
        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-semibold">
          يا هلا فيك! عشان تبدأ اللعب وتتحدى ربعك، لازم تسوي غرفة جديدة وتختار فئات الأسئلة من الصفحة الرئيسية أول شي.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/#game-setup"
            className="w-full bg-gradient-to-br from-cyan-500 to-sky-500 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all block text-center"
          >
            ← سوي غرفة جديدة وابدأ اللعب الحين
          </Link>
          <Link
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all block text-center border border-slate-200"
          >
            شلون تلعب وقواعد اللعبة
          </Link>
        </div>
      </div>
    </div>
  );
}
