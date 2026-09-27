"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radar,
  AlertCircle,
  ArrowLeft,
  Swords,
  CheckCircle2,
} from "lucide-react";
import GameLogo from "@/components/common/GameLogo";
import { UnifiedBattleBoard } from "../UnifiedBattleBoard";

import { useBattleStore } from "@/stores/useBattleStore";

interface PreGameRadarScreenProps {
  room?: any;
  teams?: any[];
  onExecuteRadar: (
    scannerTeamIndex: number,
    cellIndex: number,
  ) => Promise<{ cells: Array<{ cell_index: number; unit_type: string | null }> }>;
  onComplete: () => Promise<void> | void;
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
  // Step 1: team 1 scans team 2's board
  // Step 2: team 2 scans team 1's board
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);

  // Hover state for 3x3 highlighting
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Local storage of revealed cells per target team
  // team_index -> array of { cell_index, unit_type }
  const [revealedByTarget, setRevealedByTarget] = useState<
    Record<number, Array<{ cell_index: number; unit_type: string | null }>>
  >({});

  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const team1 = teams.find((t) => t.team_index === 1);
  const team2 = teams.find((t) => t.team_index === 2);

  const currentScannerIndex = activeStep;
  const currentTargetIndex = activeStep === 1 ? 2 : 1;

  const currentScannerTeam = activeStep === 1 ? team1 : team2;
  const currentTargetTeam = activeStep === 1 ? team2 : team1;

  const isCurrentStepDone = activeStep === 1 ? step1Done : step2Done;

  // Compute 3x3 surrounding cells on a 6x6 board
  const highlightedCells = useMemo(() => {
    if (hoveredCell === null || isCurrentStepDone) return [];
    const r = Math.floor(hoveredCell / 6);
    const c = hoveredCell % 6;
    const cells: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) {
          cells.push(nr * 6 + nc);
        }
      }
    }
    return cells;
  }, [hoveredCell, isCurrentStepDone]);

  // Reveal map for current target team
  const targetReveals = revealedByTarget[currentTargetIndex] || [];
  const revealMap = useMemo(() => {
    const map = new Map<number, string | null>();
    targetReveals.forEach((item) => map.set(item.cell_index, item.unit_type));
    return map;
  }, [targetReveals]);

  const handleCellClick = async (cellIndex: number) => {
    if (isCurrentStepDone || isScanning) return;
    setErrorMsg(null);
    setIsScanning(true);

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
    <div className="min-h-screen bg-gradient-to-b from-[#081528] via-[#0b203c] to-[#06101e] text-white flex flex-col dir-rtl overflow-x-hidden">
      {/* Top Header */}
      <header className="bg-slate-950/80 border-b border-white/10 py-2.5 px-4 shadow-lg backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <GameLogo className="w-10 h-10 shrink-0" />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Radar className="w-4 h-4 text-cyan-400 animate-spin" />
                استطلاع الرادار التمهيدي
              </h1>
              <p className="text-[10px] sm:text-xs text-sky-200/80 font-semibold">
                شاشة كشف استطلاع الفريقين قبل صافرة البداية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="text-xs font-bold text-slate-300 hover:text-rose-300 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/15 transition cursor-pointer"
          >
            الخروج
          </button>
        </div>
      </header>

      {/* Main Container — side-by-side: info panel LEFT, map RIGHT */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-5 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6">

        {/* ── Left Info Panel ── */}
        <aside className="w-full lg:w-64 xl:w-72 flex flex-col gap-3 shrink-0 lg:sticky lg:top-20">

          {/* Active Turn Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white">
                الدور الحالي
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-cyan-300 leading-tight">
              {currentScannerTeam?.name}
            </div>
            <p className="text-[10px] sm:text-xs text-sky-200/90 font-semibold mt-1">
              يستطلع خريطة {currentTargetTeam?.name}
            </p>
          </div>

          {/* Step Tracker */}
          <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 shadow-md flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-sky-200/80 uppercase tracking-wider mb-1">
              خطوات الاستطلاع
            </span>

            {/* Step 1 */}
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeStep === 1
                  ? "bg-[#0F74C5]/30 border-[#1F9FF6] text-sky-200 shadow-sm"
                  : step1Done
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                    : "bg-white/5 border-white/10 text-slate-400"
              }`}
            >
              {step1Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#1F9FF6] text-slate-950 flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
              )}
              <div className="flex flex-col leading-tight">
                <span>{team1?.name}</span>
                <span className="text-[10px] font-semibold opacity-70">يستطلع {team2?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3">
              <div className="flex-grow h-px bg-white/20" />
              <span className="text-white/40 text-xs">↓</span>
              <div className="flex-grow h-px bg-white/20" />
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeStep === 2
                  ? "bg-[#20414B]/50 border-[#6F9050] text-[#C2E581] shadow-sm"
                  : step2Done
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                    : "bg-white/5 border-white/10 text-slate-400"
              }`}
            >
              {step2Done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#6F9050] text-white flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
              )}
              <div className="flex flex-col leading-tight">
                <span>{team2?.name}</span>
                <span className="text-[10px] font-semibold opacity-70">يستطلع {team1?.name}</span>
              </div>
            </div>
          </div>

          {/* Instruction hint */}
          {!isCurrentStepDone && (
            <div className="bg-sky-900/40 border border-sky-700/50 rounded-xl px-3 py-2.5 text-[11px] text-sky-200 font-semibold leading-relaxed">
              👆 انقر على أي مربع في الخريطة لكشف منطقة 3×3 من خريطة الخصم
            </div>
          )}
          {isCurrentStepDone && (
            <div className="bg-emerald-900/40 border border-emerald-600/50 rounded-xl px-3 py-2.5 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>تم الاستطلاع بنجاح لصالح {currentScannerTeam?.name}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
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
                className="w-full bg-gradient-to-r from-[#20414B] to-[#6F9050] hover:from-[#1a3540] hover:to-[#5a7840] text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-xl border border-[#C2E581]/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>رادار {team2?.name}</span>
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
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Swords className="w-5 h-5" />
                <span>بدء اللعبة ⚔️</span>
              </motion.button>
            )}
          </AnimatePresence>
        </aside>

        {/* ── Radar Map (Right) ── */}
        <div className="relative w-full max-w-[min(92vw,92vh-100px)] lg:max-w-[min(65vw,82dvh-80px)] xl:max-w-[min(60vw,78dvh-80px)] mx-auto lg:mx-0 shrink-0">
          <UnifiedBattleBoard
            mode="radar"
            title="استطلاع الرادار"
            subtitle={
              !isCurrentStepDone
                ? `اختر مربعاً لكشف محيطه (3×3) في خريطة ${currentTargetTeam?.name || ""}`
                : `✓ تم الاستطلاع لصالح ${currentScannerTeam?.name}`
            }
            team1={{ name: team1?.name, score: team1?.score || 0 }}
            team2={{ name: team2?.name, score: team2?.score || 0 }}
            showScores={true}
            radarRevealMap={revealMap}
            hoveredCell={hoveredCell}
            highlightedCells={highlightedCells}
            isCurrentStepDone={isCurrentStepDone}
            isScanning={isScanning}
            onRadarCellHover={setHoveredCell}
            onRadarCellClick={handleCellClick}
            className="w-full"
          />

          {/* Loading Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center gap-2 z-30">
              <Radar className="w-10 h-10 text-cyan-400 animate-spin" />
              <span className="text-xs font-bold text-cyan-300">
                قاعدين نمسح المربعات بالرادار...
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
