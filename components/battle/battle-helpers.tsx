"use client";

import React from "react";
import Image from "next/image";
import { X, Shield } from "lucide-react";
import { UNIT_IMAGES, UNIT_NAMES } from "@/lib/game-data";

export interface CombatCellVisualArgs {
  result?: string | null;
  unit?: string | null;
  revealed?: boolean;
  canClick?: boolean;
}

export interface CombatCellVisualResult {
  className: string;
  content: React.ReactNode;
}

/**
 * Shared cell look for both the strike board and the radar board, so a
 * board reads exactly the same whichever modal shows it. `result` (from an
 * actual strike) always wins over a radar `reveal` — radar only fills in
 * cells that haven't actually been struck yet, and never gets the ✕ mark.
 */
export function getCombatCellVisual({
  result,
  unit,
  revealed,
  canClick,
}: CombatCellVisualArgs): CombatCellVisualResult {
  if (result === "pending") {
    return {
      className:
        "border-2 border-amber-400 bg-amber-500/30 text-amber-300 animate-pulse pointer-events-none backdrop-blur-xs",
      content: (
        <span className="leading-none flex items-center justify-center font-bold text-sm text-amber-300 drop-shadow">
          ⏳
        </span>
      ),
    };
  }
  if (result === "hit") {
    return {
      className:
        "border-2 border-rose-500 bg-rose-950/60 text-white shadow-md backdrop-blur-xs",
      content: (
        <>
          <span className="leading-none flex items-center justify-center p-0.5">
            {unit && UNIT_IMAGES[unit] ? (
              <Image
                width={36}
                height={36}
                src={UNIT_IMAGES[unit]}
                alt={UNIT_NAMES[unit] || unit}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
            ) : (
              "❓"
            )}
          </span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[4] text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
          </span>
        </>
      ),
    };
  }
  if (result === "miss") {
    return {
      className:
        "border-slate-400/80 bg-slate-950/60 text-white font-bold backdrop-blur-xs",
      content: (
        <span className="text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          ○
        </span>
      ),
    };
  }
  if (result === "mine") {
    return {
      className:
        "border-2 border-amber-500 bg-amber-950/70 text-white shadow-md backdrop-blur-xs",
      content: (
        <>
          <span className="leading-none flex items-center justify-center p-0.5">
            <Image
              width={36}
              height={36}
              src={UNIT_IMAGES.mine}
              alt={UNIT_NAMES.mine || "لغم"}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            />
          </span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5] text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
          </span>
        </>
      ),
    };
  }
  if (result === "blocked") {
    return {
      className:
        "border-2 border-cyan-500 bg-cyan-950/70 text-cyan-200 backdrop-blur-xs",
      content: (
        <span className="leading-none flex items-center justify-center">
          <Shield className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-cyan-400 drop-shadow" />
        </span>
      ),
    };
  }
  if (revealed) {
    return unit
      ? {
          className:
            "border-2 border-amber-400 bg-amber-950/65 text-amber-300 shadow-md backdrop-blur-xs",
          content: (
            <span className="leading-none flex items-center justify-center p-0.5">
              {UNIT_IMAGES[unit] ? (
                <Image
                  width={36}
                  height={36}
                  src={UNIT_IMAGES[unit]}
                  alt={UNIT_NAMES[unit] || unit}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                />
              ) : (
                "●"
              )}
            </span>
          ),
        }
      : {
          className:
            "border-emerald-400/80 bg-emerald-950/60 text-emerald-300 font-bold backdrop-blur-xs",
          content: (
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">○</span>
          ),
        };
  }
  return canClick
    ? {
        className:
          "border-white/30 bg-black/25 hover:bg-rose-600/40 hover:border-rose-400 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] cursor-pointer backdrop-blur-[0.5px]",
        content: null,
      }
    : {
        className:
          "border-white/10 bg-black/40 text-white/40 cursor-not-allowed",
        content: null,
      };
}
