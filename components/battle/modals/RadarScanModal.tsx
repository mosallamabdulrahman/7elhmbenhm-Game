"use client";

import React from "react";
import { BoardModal } from "./BoardModal";
import { getCombatCellVisual } from "../battle-helpers";
import { UNIT_NAMES } from "@/lib/game-data";

interface RadarScanModalProps {
  radarModalTeam: any;
  radarAttacker?: { name?: string };
  radarRevealMap: Map<number, string | null>;
  radarHasResult: boolean;
  isBusy: boolean;
  onClose: () => void;
  onUseTool: (team: any, tool: string, cellIndex: number) => void;
}

export function RadarScanModal({
  radarModalTeam,
  radarAttacker,
  radarRevealMap,
  radarHasResult,
  isBusy,
  onClose,
  onUseTool,
}: RadarScanModalProps) {
  if (!radarModalTeam) return null;

  return (
    <BoardModal
      title={`رادار ${radarAttacker?.name || ""}`}
      subtitle={
        radarHasResult
          ? "المربعات اللي اتكشفت"
          : "دوس المربع اللي تبي تمسحه — نفس خريطة الضرب بالظبط"
      }
      onClose={onClose}
    >
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 36 }, (_, cellIndex) => {
          const revealed = !radarHasResult
            ? false
            : radarRevealMap.has(cellIndex);
          const unit = radarRevealMap.get(cellIndex) ?? undefined;
          const canClick = !isBusy && !radarHasResult;
          const visual = getCombatCellVisual({
            result: undefined,
            unit,
            revealed,
            canClick,
          });
          return (
            <button
              key={cellIndex}
              type="button"
              disabled={!canClick}
              onClick={() => onUseTool(radarModalTeam, "radar_scan", cellIndex)}
              title={
                revealed
                  ? unit
                    ? UNIT_NAMES[unit] || unit
                    : "فاضي"
                  : undefined
              }
              className={`relative aspect-square rounded-lg border text-[10px] font-bold transition-all ${visual.className}`}
            >
              {visual.content ?? cellIndex + 1}
            </button>
          );
        })}
      </div>
      {radarHasResult && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-slate-800 transition cursor-pointer"
        >
          إغلاق
        </button>
      )}
    </BoardModal>
  );
}
