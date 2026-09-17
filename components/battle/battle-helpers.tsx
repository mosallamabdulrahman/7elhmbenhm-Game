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
        "border-2 border-amber-400 bg-amber-500/20 text-amber-300 animate-pulse pointer-events-none",
      content: (
        <span className="leading-none flex items-center justify-center font-bold text-sm text-amber-400">
          ⏳
        </span>
      ),
    };
  }
  if (result === "hit") {
    return {
      className: "border-2 border-rose-500 bg-rose-100 text-rose-950 shadow-sm",
      content: (
        <>
          <span className="leading-none flex items-center justify-center p-0.5">
            {unit && UNIT_IMAGES[unit] ? (
              <Image
                width={36}
                height={36}
                src={UNIT_IMAGES[unit]}
                alt={UNIT_NAMES[unit] || unit}
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm"
              />
            ) : (
              "❓"
            )}
          </span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5] text-rose-600 drop-shadow-sm" />
          </span>
        </>
      ),
    };
  }
  if (result === "miss") {
    return {
      className: "border-slate-400 bg-slate-300 text-slate-700",
      content: "○",
    };
  }
  if (result === "mine") {
    return {
      className:
        "border-2 border-amber-500 bg-amber-100 text-slate-950 shadow-sm",
      content: (
        <>
          <span className="leading-none flex items-center justify-center p-0.5">
            <Image
              width={36}
              height={36}
              src={UNIT_IMAGES.mine}
              alt={UNIT_NAMES.mine || "لغم"}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-sm"
            />
          </span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5] text-rose-600 drop-shadow-sm" />
          </span>
        </>
      ),
    };
  }
  if (result === "blocked") {
    return {
      className: "border-2 border-cyan-500 bg-cyan-100 text-cyan-900",
      content: (
        <span className="leading-none flex items-center justify-center">
          <Shield className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-cyan-600" />
        </span>
      ),
    };
  }
  if (revealed) {
    return unit
      ? {
          className:
            "border-2 border-amber-400 bg-amber-100 text-amber-900 shadow-sm",
          content: (
            <span className="leading-none flex items-center justify-center p-0.5">
              {UNIT_IMAGES[unit] ? (
                <Image
                  width={36}
                  height={36}
                  src={UNIT_IMAGES[unit]}
                  alt={UNIT_NAMES[unit] || unit}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-sm"
                />
              ) : (
                "●"
              )}
            </span>
          ),
        }
      : {
          className: "border-emerald-300 bg-emerald-50 text-emerald-700",
          content: "○",
        };
  }
  return canClick
    ? {
        className:
          "border-slate-600 bg-slate-800 text-slate-200 hover:bg-rose-800 hover:border-rose-500",
        content: null,
      }
    : {
        className: "border-slate-200 bg-slate-100 text-slate-400",
        content: null,
      };
}
