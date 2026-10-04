"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { RefreshCw, Crown, Lock } from "lucide-react";
import GameLogo from "@/components/common/GameLogo";
import { UnifiedBattleBoard } from "@/components/battle/UnifiedBattleBoard";
import {
  STARTING_POINTS,
  UNIT_LIMITS,
  UNIT_SPECS,
} from "@/components/battle/battle-constants";
import { UNIT_IMAGES } from "@/lib/game-data";
import type { GameRoom, Team } from "@/types/game";

interface TeamDeploymentScreenProps {
  room: GameRoom;
  activeTeam: Team;
  isJudgeDevice: boolean;
  isAutoFilling: boolean;
  selectedUnit: string;
  lastPlacedCell: number | null;
  onSelectUnit: (unit: string) => void;
  onCellClick: (cellIndex: number) => void;
  onAutoFill: () => void;
  onSetTeamReady: () => void;
}

// Team participant board deployment screen
export function TeamDeploymentScreen({
  room,
  activeTeam,
  isJudgeDevice,
  isAutoFilling,
  selectedUnit,
  lastPlacedCell,
  onSelectUnit,
  onCellClick,
  onAutoFill,
  onSetTeamReady,
}: TeamDeploymentScreenProps) {
  // Prevent judge from deploying for teams on the judge's own browser
  if (isJudgeDevice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dir-rtl">
        <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-lg">
          <Lock className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">
            افتح رابط الفريق من جهاز أو متصفح ثاني
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            إنت مسجل دخولك كحكم هذي الغرفة على هذا المتصفح — رابط توزيع الفريق لازم يتفتح من جهاز الفريق نفسه، مو من نفس حسابك.
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

  const currentBoardState: (string | null)[] = Array.isArray(activeTeam?.board)
    ? activeTeam.board
    : [];

  const totalSpentCost = currentBoardState.reduce(
    (sum: number, unit: string | null) => sum + (unit ? UNIT_SPECS[unit]?.cost || 0 : 0),
    0,
  );
  const remainingPoints = Math.max(0, STARTING_POINTS - totalSpentCost);

  const unitCounts: Record<string, number> = Object.keys(UNIT_SPECS).reduce(
    (acc: Record<string, number>, key: string) => {
      acc[key] = currentBoardState.filter((cell) => cell === key).length;
      return acc;
    },
    {},
  );

  // Post-readiness spectator view
  if (activeTeam.is_ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dir-rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center"
        >
          <div className="bg-gradient-to-tr from-cyan-500 to-sky-400 text-white p-4 rounded-2xl inline-block mb-6 shadow-md">
            <Crown className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-950 leading-tight">
            وزعت جنودك بنجاح، والحين الحكم هو اللي متحكم بكل حاجة
          </h2>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed font-semibold">
            تابع اللعب من شاشة الحكم، وقول له شفهيًا أي مربع تبي تضرب أو أي فزعة تبي تستخدم — ما فيه أي تفاعل تاني مطلوب منك بهالجهاز.
          </p>
          <Link
            href="/"
            className="mt-7 block w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 py-3 font-bold text-white text-sm"
          >
            رجوع للصفحة الرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dir-rtl pb-16 overflow-x-auto overflow-y-auto">
      {/* Player Header */}
      <header className="bg-white border-b border-slate-200 py-4 shadow-sm relative z-20">
        <div className="max-w-[85rem] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GameLogo className="w-14 h-14 sm:w-18 sm:h-18 shrink-0" />
            <div className="text-right">
              <h1 className="font-sans font-bold text-base text-slate-950">
                لوحة توزيع فريق: {activeTeam.name}
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                كود الغرفة: {room.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-bold">
                النقاط الباقية لتسليح جنودك
              </span>
              <span className="text-base font-bold text-cyan-600">
                {remainingPoints}ن
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                activeTeam.is_ready ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"
              }`}
            >
              {activeTeam.is_ready ? "✓ جاهز" : "● قاعد يوزع الجنود"}
            </span>
          </div>
        </div>
      </header>

      {/* Main board deploy area */}
      <main className="max-w-[85rem] mx-auto px-4 mt-8 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* 6x6 Army Board Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md relative overflow-visible">
            <div className="flex p-6 md:p-8 items-center justify-between border-b border-slate-100 pb-3 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  خريطتك وتوزيعك (6×6 مربعات)
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  طق على المربع عشان تحط جندي أو تشيله
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg">
                  {(activeTeam.board || []).filter(Boolean).length} / 33
                </div>
                {!activeTeam.is_ready && (
                  <motion.button
                    type="button"
                    whileTap={!isAutoFilling ? { scale: 0.93 } : {}}
                    onClick={onAutoFill}
                    disabled={isAutoFilling}
                    className={`text-xs text-white font-bold px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAutoFilling
                        ? "bg-slate-400 cursor-not-allowed opacity-70"
                        : "bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600"
                    }`}
                  >
                    <RefreshCw className={`h-3 w-3 ${isAutoFilling ? "animate-spin" : ""}`} />
                    {isAutoFilling ? "قاعدين نحفظ..." : "توزيع عشوائي"}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Interactive Grid */}
            <div className="relative w-full">
              <UnifiedBattleBoard
                mode="deploy"
                title={`خريطة ${activeTeam.name}`}
                subtitle="طق على المربع عشان تحط جندي أو تشيله"
                board={
                  Array.isArray(activeTeam.board)
                    ? activeTeam.board
                    : Array(36).fill(null)
                }
                unitSpecs={UNIT_SPECS}
                lastPlacedCell={lastPlacedCell}
                isReady={activeTeam.is_ready}
                onDeployCellClick={onCellClick}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Unit selections and ready button */}
        <div className="space-y-6">
          <div
            className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-md ${
              activeTeam.is_ready ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <h3 className="font-sans font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">
              الجنود المتاحين للتوزيع
            </h3>

            <div className="grid grid-cols-1 gap-3.5">
              {Object.keys(UNIT_SPECS).map((key) => {
                const unit = UNIT_SPECS[key];
                const isSelected = selectedUnit === key;
                const count = unitCounts[key] || 0;
                const limit = UNIT_LIMITS[key] || 0;
                const isFull = count >= limit;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectUnit(key)}
                    disabled={activeTeam.is_ready}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-50/70 shadow-sm shadow-cyan-100 ring-2 ring-cyan-500/10"
                        : isFull
                          ? "border-rose-200 bg-rose-50/40 opacity-70"
                          : "border-slate-150 hover:bg-slate-50 hover:border-slate-250"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center shrink-0">
                        <Image
                          src={UNIT_IMAGES[key] || unit.image}
                          alt={unit.name}
                          width={32}
                          height={32}
                          className="w-7 h-7 sm:w-11 sm:h-11 object-contain"
                        />
                      </span>
                      <span className="block text-right">
                        <span className="font-bold text-xs text-slate-900 block group-hover:text-cyan-600">
                          {unit.name}
                        </span>
                        {unit.description && (
                          <span className="text-[10px] text-slate-500 block leading-tight">
                            {unit.description}
                          </span>
                        )}
                        <span
                          className={`text-[10px] leading-tight block font-bold mt-0.5 ${
                            isFull ? "text-rose-500" : "text-slate-400"
                          }`}
                        >
                          {count} / {limit} {isFull ? "· خلصت أعدادهم" : ""}
                        </span>
                      </span>
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {unit.cost}ن
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Readiness Action button */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-center">
            <div className="space-y-4">
              <div className="text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold leading-relaxed text-slate-500">
                تبدأ بـ <strong className="text-slate-800">4000 نقطة</strong> · الحدود: جندي (15) · مدرعة (7) · دبابة (4) · طائرة (3) · غواصة (2) · لغم (2). إذا شلت جندي ترجع لك نقاطه.
              </div>
              <motion.button
                whileHover={!isAutoFilling ? { scale: 1.02 } : {}}
                whileTap={!isAutoFilling ? { scale: 0.98 } : {}}
                onClick={isAutoFilling ? undefined : onSetTeamReady}
                disabled={isAutoFilling}
                className={`w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-sans font-bold text-sm py-4 rounded-2xl shadow-lg transition-opacity ${
                  isAutoFilling
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-emerald-500/25 cursor-pointer"
                }`}
              >
                {isAutoFilling ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    قاعدين نحفظ التوزيع...
                  </span>
                ) : (
                  "خلصت توزيع جنودي 🛡️"
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
