"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { X, Shield, Radar, Target, Swords } from "lucide-react";
import { UNIT_IMAGES, UNIT_NAMES } from "@/lib/game-data";

export interface UnifiedBattleBoardProps {
  mode: "deploy" | "strike" | "radar" | "full_scan";
  title?: string;
  subtitle?: string | null;

  // Optional score badges (from Image 2)
  team1?: { name?: string; score?: number };
  team2?: { name?: string; score?: number };
  showScores?: boolean;

  // Deploy mode props
  board?: (string | null)[];
  unitSpecs?: Record<string, any>;
  lastPlacedCell?: number | null;
  isReady?: boolean;
  onDeployCellClick?: (cellIndex: number) => void;

  // Strike mode props
  strikeCellResults?: Map<number, string>;
  strikeCellUnits?: Map<number, string>;
  strikeRadarRevealMap?: Map<number, string | null>;
  locallyPendingStrikes?: Set<number>;
  isBusy?: boolean;
  canStrike?: boolean;
  onStrikeCellClick?: (cellIndex: number) => void;

  // Radar mode props
  radarRevealMap?: Map<number, string | null>;
  hoveredCell?: number | null;
  highlightedCells?: number[];
  isCurrentStepDone?: boolean;
  isScanning?: boolean;
  onRadarCellHover?: (cellIndex: number | null) => void;
  onRadarCellClick?: (cellIndex: number) => void;

  // Full scan mode props
  fullScanCellMap?: Map<number, string | null>;

  className?: string;
}

export function UnifiedBattleBoard({
  mode,
  title = "جولة المعركة",
  subtitle,
  team1,
  team2,
  showScores = false,
  board = [],
  unitSpecs = {},
  lastPlacedCell = null,
  isReady = false,
  onDeployCellClick,
  strikeCellResults = new Map(),
  strikeCellUnits = new Map(),
  strikeRadarRevealMap = new Map(),
  locallyPendingStrikes = new Set(),
  isBusy = false,
  canStrike = true,
  onStrikeCellClick,
  radarRevealMap = new Map(),
  hoveredCell = null,
  highlightedCells = [],
  isCurrentStepDone = false,
  isScanning = false,
  onRadarCellHover,
  onRadarCellClick,
  fullScanCellMap = new Map(),
  className = "",
}: UnifiedBattleBoardProps) {
  return (
    <div
      className={`relative w-full rounded-3xl shadow-2xl border-4 border-sky-400/60 bg-[#0c3558] flex flex-col items-center select-none p-3 sm:p-5 pt-6 sm:pt-8 pb-4 sm:pb-6 ${className}`}
    >
      {/* Background illustration — clipped separately */}
      <div className="absolute inset-0 rounded-[calc(1.5rem-4px)] overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: "url('/images/map-team-cover.jpg')" }}
        />
        {/* Subtle Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-sky-950/30" />
      </div>

      {/* Top Banner & Team Score Badges — centered title overflows upward outside board */}
      <div className="relative z-20 w-full flex items-center justify-between px-2 sm:px-4 pointer-events-none">
        {/* Team 1 Blue Pill Badge (Left) */}
        {showScores && team1 ? (
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#0F74C5] via-[#1F9FF6] to-[#0F74C5] border-2 border-sky-200 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-xl shadow-sky-950/60 transition-transform hover:scale-105">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
            <div className="text-right leading-tight">
              <span className="block text-[9px] sm:text-[11px] font-bold text-sky-100 truncate max-w-[70px] sm:max-w-[110px]">
                {team1.name || "الفرسان"}
              </span>
              <span className="block text-[11px] sm:text-xs font-bold text-white tracking-wide">
                {(team1.score ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block w-4" />
        )}

        {/* Center Title Banner — absolutely centered on the banner row, overflowing upward */}
        <div className="pointer-events-auto flex flex-col items-center absolute left-1/2 -translate-x-1/2 -top-8  sm:-top-12 z-30">
          <div className="relative flex items-center justify-center">
            {/* Cloud flourishes */}
            <div className="hidden sm:block absolute -left-6 top-1/2 -translate-y-1/2 w-7 h-4 rounded-full bg-white/50 blur-[1px]" />
            <div className="hidden sm:block absolute -right-6 top-1/2 -translate-y-1/2 w-7 h-4 rounded-full bg-white/50 blur-[1px]" />
            <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-1 sm:py-1.5 rounded-full border-2 border-sky-300 shadow-xl shadow-sky-900/50 text-center tracking-wide whitespace-nowrap">
              {title}
            </div>
          </div>
        </div>

        {/* Team 2 Brand Logo Palette Pill Badge (Right) — Calm Dark Slate & Olive Green */}
        {showScores && team2 ? (
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#20414B] via-[#6F9050] to-[#20414B] border-2 border-[#C2E581] text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-xl shadow-slate-950/60 transition-transform hover:scale-105">
            <div className="text-left leading-tight">
              <span className="block text-[9px] sm:text-[11px] font-bold text-emerald-100 truncate max-w-[70px] sm:max-w-[110px]">
                {team2.name || "الصقور"}
              </span>
              <span className="block text-[11px] sm:text-xs font-bold text-white tracking-wide">
                {(team2.score ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C2E581]" />
            </div>
          </div>
        ) : (
          <div className="hidden sm:block w-4" />
        )}
      </div>

      {/* 6x6 Map Grid Container — Seamless puzzle & Tight border directly on the tiles */}
      <div className="relative z-10 w-full aspect-square mx-auto shadow-[0_12px_30px_rgba(0,0,0,0.6)] bg-[#09223a] mt-3 sm:mt-4">
        <div className="grid grid-cols-6 gap-[1.5px] bg-[#1a4269]/70 w-full h-full p-0">
          {Array.from({ length: 36 }).map((_, idx) => {
            // TILE BASE:
            // Sliced tiles have uniform white borders embedded directly in the PNG images,
            // and the terrain is balanced (zero water clumping on the left, central lake & top-right bay).
            const tileBg = `/images/map-tiles/tile_${idx}.png`;

            // 1. DEPLOY MODE
            if (mode === "deploy") {
              const cell = board[idx] || null;
              const cellUnit = cell ? unitSpecs[cell] : null;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isReady}
                  onClick={() => onDeployCellClick?.(idx)}
                  style={{ backgroundImage: `url('${tileBg}')` }}
                  className={`aspect-square relative overflow-hidden bg-cover bg-center flex items-center justify-center select-none ${
                    isReady ? "cursor-default" : "cursor-pointer"
                  } ${
                    cell
                      ? "ring-2 ring-cyan-400/80 ring-inset"
                      : "hover:brightness-110"
                  }`}
                >
                  {/* Subtle tint overlay — white highlight on hover without moving */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-colors duration-150 ${
                      cell ? "bg-sky-950/25" : "bg-black/10 hover:bg-white/25"
                    }`}
                  />

                  {/* Placed Figurines — Large 3D presence filling almost the entire tile */}
                  {cellUnit && (
                    <motion.div
                      key={`${idx}-${cell}`}
                      initial={
                        lastPlacedCell === idx
                          ? { scale: 0.3, rotate: -15, opacity: 0 }
                          : false
                      }
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="relative z-10 flex items-center justify-center w-full h-full p-0.5"
                    >
                      <Image
                        src={(cell && UNIT_IMAGES[cell]) || cellUnit.image}
                        alt={cellUnit.name || "جندي"}
                        width={64}
                        height={64}
                        className="w-[90%] h-[90%] max-w-[62px] max-h-[62px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] filter"
                      />
                    </motion.div>
                  )}
                </button>
              );
            }

            // 2. STRIKE MODE
            if (mode === "strike") {
              const serverResult = strikeCellResults.get(idx);
              const isLocallyPending =
                !serverResult && locallyPendingStrikes.has(idx);
              const result =
                serverResult || (isLocallyPending ? "pending" : undefined);
              const hitUnit = strikeCellUnits.get(idx);
              const revealed = !result && strikeRadarRevealMap.has(idx);
              const revealedUnit = strikeRadarRevealMap.get(idx) ?? undefined;
              const canClick =
                !isBusy && !result && !isLocallyPending && canStrike;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!canClick}
                  onClick={() => onStrikeCellClick?.(idx)}
                  style={{ backgroundImage: `url('${tileBg}')` }}
                  title={
                    result === "hit"
                      ? (hitUnit ? UNIT_NAMES[hitUnit] : undefined) ||
                        hitUnit ||
                        "أصبت"
                      : result === "pending"
                        ? "جاري إرسال الضربة..."
                        : revealed
                          ? "معروف بالرادار"
                          : undefined
                  }
                  className={`aspect-square relative overflow-hidden bg-cover bg-center flex items-center justify-center transition-all ${
                    result === "hit"
                      ? "ring-2 ring-rose-500 ring-inset"
                      : result === "pending"
                        ? "ring-2 ring-amber-400 ring-inset animate-pulse"
                        : revealed
                          ? "ring-2 ring-amber-400/80 ring-inset"
                          : canClick
                            ? "hover:brightness-110 cursor-pointer"
                            : "opacity-85 cursor-not-allowed"
                  }`}
                >
                  {/* Result Tint Overlay */}
                  <div
                    className={`absolute inset-0 transition-colors ${
                      result === "hit"
                        ? "bg-rose-950/60"
                        : result === "miss"
                          ? "bg-slate-950/60"
                          : result === "pending"
                            ? "bg-amber-950/50"
                            : result === "mine"
                              ? "bg-amber-950/70"
                              : result === "blocked"
                                ? "bg-cyan-950/60"
                                : revealed
                                  ? "bg-amber-950/50"
                                  : canClick
                                    ? "bg-black/10 hover:bg-rose-500/25"
                                    : "bg-black/30"
                    }`}
                  />

                  {/* Marker / Unit (No numbers rendered in UI) */}
                  <div className="relative z-10 flex items-center justify-center w-full h-full p-0.5">
                    {result === "hit" ? (
                      <div className="relative flex items-center justify-center w-full h-full">
                        {hitUnit && UNIT_IMAGES[hitUnit] ? (
                          <Image
                            src={UNIT_IMAGES[hitUnit]}
                            alt={UNIT_NAMES[hitUnit] || hitUnit}
                            width={64}
                            height={64}
                            className="w-[88%] h-[88%] max-w-[58px] max-h-[58px] object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.85)] filter grayscale contrast-125"
                          />
                        ) : null}
                        {/* 3D Red "X" Marker matching Image 2 */}
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <X className="w-8 h-8 sm:w-10 sm:h-10 stroke-[4] text-rose-500 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]" />
                        </span>
                      </div>
                    ) : result === "miss" ? (
                      <span className="text-base sm:text-xl font-bold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        ○
                      </span>
                    ) : result === "pending" ? (
                      <span className="text-base sm:text-lg animate-pulse">
                        ⏳
                      </span>
                    ) : result === "mine" ? (
                      <div className="relative flex items-center justify-center w-full h-full">
                        <Image
                          src={UNIT_IMAGES.mine}
                          alt="لغم"
                          width={56}
                          height={56}
                          className="w-[85%] h-[85%] max-w-[54px] max-h-[54px] object-contain drop-shadow-md"
                        />
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] text-rose-500 drop-shadow-md" />
                        </span>
                      </div>
                    ) : result === "blocked" ? (
                      <Shield className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5] text-cyan-400 drop-shadow-md" />
                    ) : revealed ? (
                      revealedUnit && UNIT_IMAGES[revealedUnit] ? (
                        <div className="relative flex items-center justify-center w-full h-full">
                          <Image
                            src={UNIT_IMAGES[revealedUnit]}
                            alt={UNIT_NAMES[revealedUnit] || ""}
                            width={64}
                            height={64}
                            className="w-[88%] h-[88%] max-w-[58px] max-h-[58px] object-contain drop-shadow-md"
                          />
                          {/* Yellow Crosshair marker matching Image 2 */}
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Target className="w-6 h-6 text-amber-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] animate-pulse" />
                          </span>
                        </div>
                      ) : (
                        <Target className="w-6 h-6 text-amber-300 drop-shadow animate-pulse" />
                      )
                    ) : null}
                  </div>
                </button>
              );
            }

            // 3. RADAR MODE
            if (mode === "radar") {
              const isRevealed = radarRevealMap.has(idx);
              const unit = isRevealed ? radarRevealMap.get(idx) : null;
              const hasUnit = unit && unit !== "null";
              const isHighlighted = highlightedCells.includes(idx);
              const isCenter = hoveredCell === idx && !isCurrentStepDone;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isCurrentStepDone || isScanning}
                  onMouseEnter={() => onRadarCellHover?.(idx)}
                  onMouseLeave={() => onRadarCellHover?.(null)}
                  onClick={() => onRadarCellClick?.(idx)}
                  style={{ backgroundImage: `url('${tileBg}')` }}
                  className={`aspect-square relative overflow-hidden bg-cover bg-center flex items-center justify-center transition-all cursor-pointer select-none ${
                    isRevealed
                      ? hasUnit
                        ? unit === "mine"
                          ? "ring-2 ring-rose-500 ring-inset"
                          : "ring-2 ring-cyan-400 ring-inset"
                        : "ring-1 ring-slate-600/70 ring-inset"
                      : isHighlighted
                        ? isCenter
                          ? "ring-4 ring-cyan-300 ring-inset z-20 brightness-110"
                          : "ring-2 ring-cyan-400/80 ring-inset"
                        : "hover:brightness-110"
                  }`}
                >
                  {/* Tint overlay */}
                  <div
                    className={`absolute inset-0 transition-colors ${
                      isRevealed
                        ? hasUnit
                          ? unit === "mine"
                            ? "bg-rose-950/75"
                            : "bg-cyan-950/75"
                          : "bg-slate-950/70"
                        : isHighlighted
                          ? isCenter
                            ? "bg-cyan-500/35"
                            : "bg-cyan-500/20"
                          : "bg-black/15"
                    }`}
                  />

                  {/* Revealed Unit or Crosshair (No numbers rendered in UI) */}
                  <div className="relative z-10 flex items-center justify-center w-full h-full p-0.5">
                    {isRevealed && hasUnit && UNIT_IMAGES[unit] ? (
                      <motion.div
                        initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <Image
                          src={UNIT_IMAGES[unit]}
                          alt={UNIT_NAMES[unit] || ""}
                          width={64}
                          height={64}
                          className="w-[90%] h-[90%] max-w-[62px] max-h-[62px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
                        />
                      </motion.div>
                    ) : isRevealed ? (
                      <span className="text-[10px] font-bold text-slate-300 drop-shadow">
                        فاضي
                      </span>
                    ) : isCenter ? (
                      <Target className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-pulse" />
                    ) : null}
                  </div>
                </button>
              );
            }

            // 4. FULL SCAN MODE
            if (mode === "full_scan") {
              const unit = fullScanCellMap.get(idx);
              const hasUnit = unit && unit !== "null";
              const unitImg = hasUnit ? UNIT_IMAGES[unit] : null;

              return (
                <div
                  key={idx}
                  style={{ backgroundImage: `url('${tileBg}')` }}
                  className={`aspect-square relative overflow-hidden bg-cover bg-center flex items-center justify-center p-0.5 ${
                    hasUnit
                      ? unit === "mine"
                        ? "ring-2 ring-rose-400 ring-inset"
                        : "ring-2 ring-cyan-400 ring-inset"
                      : ""
                  }`}
                >
                  <div
                    className={`absolute inset-0 ${
                      hasUnit
                        ? unit === "mine"
                          ? "bg-rose-950/75"
                          : "bg-sky-950/70"
                        : "bg-black/15"
                    }`}
                  />
                  <div className="relative z-10 flex items-center justify-center w-full h-full">
                    {hasUnit && unitImg ? (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: (idx % 6) * 0.02 }}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <Image
                          src={unitImg}
                          alt={UNIT_NAMES[unit] || ""}
                          width={64}
                          height={64}
                          className="w-[90%] h-[90%] max-w-[62px] max-h-[62px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
                        />
                      </motion.div>
                    ) : null}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}
