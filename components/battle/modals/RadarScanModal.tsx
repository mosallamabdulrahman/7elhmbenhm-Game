"use client";

import React from "react";
import { BoardModal } from "./BoardModal";
import { UnifiedBattleBoard } from "../UnifiedBattleBoard";

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
      <UnifiedBattleBoard
        mode="radar"
        title={`رادار ${radarAttacker?.name || ""}`}
        subtitle={radarHasResult ? "المربعات المكشوفة" : "اختر مربعاً للمسح"}
        radarRevealMap={radarRevealMap}
        isCurrentStepDone={radarHasResult}
        isScanning={isBusy}
        onRadarCellClick={(cellIndex) =>
          !radarHasResult && !isBusy && onUseTool(radarModalTeam, "radar_scan", cellIndex)
        }
        className="w-full"
      />

      {radarHasResult && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 text-sm font-bold text-white hover:from-emerald-700 hover:to-green-700 transition cursor-pointer shadow-lg"
        >
          إغلاق
        </button>
      )}
    </BoardModal>
  );
}
