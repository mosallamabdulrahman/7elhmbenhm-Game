"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Radar, ArrowLeft, Swords, CheckCircle2, AlertCircle } from "lucide-react";
import GameLogo from "@/components/common/GameLogo";
import { UNIT_IMAGES, UNIT_NAMES } from "@/lib/game-data";
import { useBattleStore } from "@/stores/useBattleStore";

export interface PreGameRadarScreenProps {
  room?: any;
  teams?: any[];
  onExecuteRadar: (
    forTeamIndex: number,
    cellIndex: number,
  ) => Promise<{ cells: Array<{ cell_index: number; unit_type: string | null }> }>;
  onComplete: () => void;
  onExit: () => void;
}

export function PreGameRadarScreen({
  room: propRoom,
  teams: propTeams,
  onExecuteRadar,
  onComplete,
  onExit,
}: PreGameRadarScreenProps) {
  const storeRoom = useBattleStore((s) => s.room);
  const storeTeams = useBattleStore((s) => s.teams);
  const room = propRoom ?? storeRoom;
  const teams = propTeams ?? storeTeams;
  // Step 1: Team 1 scans Team 2 | Step 2: Team 2 scans Team 1
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Store revealed cells for each target team (targetTeamIndex -> cells map)
  const [revealedByTarget, setRevealedByTarget] = useState<
    Record<number, Array<{ cell_index: number; unit_type: string | null }>>
  >({
    1: [],
    2: [],
  });

  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);

  const team1 = teams.find((t) => t.team_index === 1);
  const team2 = teams.find((t) => t.team_index === 2);

  // In Step 1: Scanner is Team 1, Target is Team 2
  // In Step 2: Scanner is Team 2, Target is Team 1
  const currentScannerTeam = activeStep === 1 ? team1 : team2;
  const currentTargetTeam = activeStep === 1 ? team2 : team1;
  const currentScannerIndex = activeStep === 1 ? 1 : 2;
  const currentTargetIndex = activeStep === 1 ? 2 : 1;

  const currentReveals = revealedByTarget[currentTargetIndex] || [];
  const revealMap = new Map<number, string | null>();
  currentReveals.forEach((r) => revealMap.set(r.cell_index, r.unit_type));

  const isCurrentStepDone = activeStep === 1 ? step1Done : step2Done;

  // Compute 3x3 surrounding cells for a given center cell
  const getRadarRadiusCells = (centerIndex: number | null): number[] => {
    if (centerIndex === null || centerIndex < 0 || centerIndex > 35) return [];
    const row = Math.floor(centerIndex / 6);
    const col = centerIndex % 6;
    const indices: number[] = [];
    for (let r = Math.max(0, row - 1); r <= Math.min(5, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(5, col + 1); c++) {
        indices.push(r * 6 + c);
      }
    }
    return indices;
  };

  const highlightedCells = !isCurrentStepDone
    ? getRadarRadiusCells(hoveredCell)
    : [];

  const handleCellClick = async (cellIndex: number) => {
    if (isCurrentStepDone || isScanning) return;
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const res = await onExecuteRadar(currentScannerIndex, cellIndex);
      const newCells = res?.cells || [];

      setRevealedByTarget((prev) => ({
        ...prev,
        [currentTargetIndex]: [
          ...(prev[currentTargetIndex] || []),
          ...newCells,
        ],
      }));

      if (activeStep === 1) {
        setStep1Done(true);
      } else {
        setStep2Done(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "فشل تنفيذ الرادار، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col dir-rtl pb-16">
      {/* Top Header */}
      <header className="bg-slate-950/90 border-b border-slate-800 py-3.5 px-4 shadow-lg backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GameLogo className="w-12 h-12 shrink-0" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Radar className="w-5 h-5 text-cyan-400 animate-spin" />
                مرحلة استطلاع الرادار التمهيدي
              </h1>
              <p className="text-xs text-slate-400 font-semibold">
                شاشة الحكم الحصرية لكشف استطلاع الفريقين قبل صافرة البداية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 mt-6 flex-grow flex flex-col items-center">
        {/* Step Indicator Tracker */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl mb-6">
          <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
            {/* Step 1 Pill */}
            <div
              className={`flex-1 flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                activeStep === 1
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300"
                  : step1Done
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  step1Done
                    ? "bg-emerald-500 text-white"
                    : activeStep === 1
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {step1Done ? "✓" : "1"}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] block font-semibold text-slate-400">
                  المرحلة الأولى
                </span>
                <span className="text-xs sm:text-sm font-bold truncate block">
                  رادار {team1?.name || "الفريق الأول"}
                </span>
              </div>
            </div>

            <div className="text-slate-600 font-bold text-sm">←</div>

            {/* Step 2 Pill */}
            <div
              className={`flex-1 flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                activeStep === 2
                  ? "bg-orange-500/10 border-orange-500/50 text-orange-300"
                  : step2Done
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  step2Done
                    ? "bg-emerald-500 text-white"
                    : activeStep === 2
                      ? "bg-orange-500 text-white"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {step2Done ? "✓" : "2"}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] block font-semibold text-slate-400">
                  المرحلة الثانية
                </span>
                <span className="text-xs sm:text-sm font-bold truncate block">
                  رادار {team2?.name || "الفريق الثاني"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Instruction Banner */}
        <div className="w-full max-w-xl text-center mb-5">
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-4 py-1.5 rounded-full inline-block mb-2">
            الدور الآن: {currentScannerTeam?.name} يستطلع خريطة {currentTargetTeam?.name}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {!isCurrentStepDone
              ? `اختر المربع الذي طلبه ${currentScannerTeam?.name} لكشف محيطه (3×3)`
              : `✓ تم استطلاع الرادار بنجاح لصالح ${currentScannerTeam?.name}`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {!isCurrentStepDone
              ? "انقر على المربع المطلوب بالشبكة أدناه لتشغيل الرادار وكشف جنود الخصم."
              : "راجع المربعات المكشوفة مع الفريق، ثم اضغط على زر المتابعة."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="w-full max-w-md bg-rose-950/80 border border-rose-800 text-rose-200 px-4 py-2.5 rounded-2xl text-xs font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Radar Interactive Board (6x6) */}
        <div className="relative bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-md w-full aspect-square flex flex-col justify-center">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full h-full">
            {Array.from({ length: 36 }).map((_, idx) => {
              const isRevealed = revealMap.has(idx);
              const unit = isRevealed ? revealMap.get(idx) : null;
              const hasUnit = unit && unit !== "null";
              const isHighlighted = highlightedCells.includes(idx);
              const isCenter = hoveredCell === idx && !isCurrentStepDone;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isCurrentStepDone || isScanning}
                  onMouseEnter={() => setHoveredCell(idx)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => handleCellClick(idx)}
                  className={`aspect-square rounded-xl sm:rounded-2xl border transition-all flex flex-col items-center justify-center relative p-1 cursor-pointer select-none ${
                    isRevealed
                      ? hasUnit
                        ? unit === "mine"
                          ? "bg-rose-950/90 border-rose-500 text-rose-300 shadow-md shadow-rose-950/50"
                          : "bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50"
                        : "bg-slate-900/80 border-slate-700 text-slate-500"
                      : isHighlighted
                        ? isCenter
                          ? "bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50 scale-105"
                          : "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700"
                  }`}
                >
                  {isRevealed && hasUnit && UNIT_IMAGES[unit] ? (
                    <motion.div
                      initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      className="flex flex-col items-center justify-center w-full h-full"
                    >
                      <Image
                        src={UNIT_IMAGES[unit]}
                        alt={UNIT_NAMES[unit] || ""}
                        width={28}
                        height={28}
                        className="w-5 h-5 sm:w-8 sm:h-8 object-contain drop-shadow-md"
                      />
                      <span className="text-[7px] sm:text-[8px] font-bold mt-0.5 truncate leading-tight">
                        {UNIT_NAMES[unit]}
                      </span>
                    </motion.div>
                  ) : isRevealed ? (
                    <span className="text-[9px] font-bold text-slate-500">
                      فاضي
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center gap-2">
              <Radar className="w-10 h-10 text-cyan-400 animate-spin" />
              <span className="text-xs font-bold text-cyan-300">
                قاعدين نمسح المربعات بالرادار...
              </span>
            </div>
          )}
        </div>

        {/* Action Button Section */}
        <div className="w-full max-w-md mt-6 text-center">
          <AnimatePresence mode="wait">
            {activeStep === 1 && step1Done && (
              <motion.button
                key="btn-step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                type="button"
                onClick={() => {
                  setActiveStep(2);
                  setHoveredCell(null);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>الانتقال لرادار {team2?.name}</span>
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            )}

            {activeStep === 2 && step2Done && (
              <motion.button
                key="btn-complete"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                type="button"
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Swords className="w-5 h-5" />
                <span>دخول الغرفة وبدء اللعبة ⚔️</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
