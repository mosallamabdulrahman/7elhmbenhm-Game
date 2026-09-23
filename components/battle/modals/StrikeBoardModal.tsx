"use client";

import React from "react";
import { Shield, X } from "lucide-react";
import { BoardModal } from "./BoardModal";
import { getCombatCellVisual } from "../battle-helpers";
import { UNIT_NAMES } from "@/lib/game-data";

interface StrikeBoardModalProps {
  strikeModalTeam: any;
  strikeAttacker: any;
  strikeTarget: any;
  strikeCellResults: Map<number, string>;
  strikeCellUnits: Map<number, string>;
  strikeRadarRevealMap: Map<number, string | null>;
  locallyPendingStrikes: Set<number>;
  isBusy: boolean;
  onClose: () => void;
  onStrike: (team: any, cellIndex: number) => void;
  onCancelStrike?: (team: any) => Promise<void> | void;
  setLocallyPendingStrikes: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export function StrikeBoardModal({
  strikeModalTeam,
  strikeAttacker,
  strikeTarget,
  strikeCellResults,
  strikeCellUnits,
  strikeRadarRevealMap,
  locallyPendingStrikes,
  isBusy,
  onClose,
  onStrike,
  onCancelStrike,
  setLocallyPendingStrikes,
}: StrikeBoardModalProps) {
  if (!strikeModalTeam || !strikeAttacker || !strikeTarget) return null;

  return (
    <BoardModal
      title={`ضرب خريطة ${strikeTarget.name}`}
      subtitle={`عند ${strikeAttacker.name} ${strikeAttacker.available_strikes} ${
        strikeAttacker.available_strikes === 1 ? "طقة" : "طقات"
      } متاحة`}
      dismissible={strikeAttacker.available_strikes <= 0}
      onClose={() => {
        setLocallyPendingStrikes(new Set());
        onClose();
      }}
      actionButton={
        <button
          type="button"
          onClick={async () => {
            const teamIdx = strikeModalTeam;
            setLocallyPendingStrikes(new Set());
            onClose();
            if (onCancelStrike) {
              await onCancelStrike(teamIdx);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition shadow-sm cursor-pointer"
          title="إلغاء الضربة وإرجاع اللعبة"
        >
          <X className="w-3.5 h-3.5" />
          <span>إلغاء الضربة</span>
        </button>
      }
    >
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 36 }, (_, cellIndex) => {
          const serverResult = strikeCellResults.get(cellIndex);
          const isLocallyPending =
            !serverResult && locallyPendingStrikes.has(cellIndex);
          const result =
            serverResult || (isLocallyPending ? "pending" : undefined);
          const hitUnit = strikeCellUnits.get(cellIndex);
          const revealed = !result && strikeRadarRevealMap.has(cellIndex);
          const revealedUnit = strikeRadarRevealMap.get(cellIndex) ?? undefined;
          const canClick =
            !isBusy &&
            !result &&
            !isLocallyPending &&
            strikeAttacker.available_strikes > 0;
          const visual = getCombatCellVisual({
            result,
            unit: result ? hitUnit : revealedUnit,
            revealed,
            canClick,
          });
          return (
            <button
              key={cellIndex}
              type="button"
              disabled={!canClick}
              onClick={() => {
                if (!canClick) return;
                setLocallyPendingStrikes((prev) =>
                  new Set(prev).add(cellIndex),
                );
                onStrike(strikeModalTeam, cellIndex);
              }}
              title={
                result === "hit"
                  ? (hitUnit ? UNIT_NAMES[hitUnit] : undefined) || hitUnit || "أصبت"
                  : result === "pending"
                    ? "جاري إرسال الضربة..."
                    : revealed
                      ? "معروف بالرادار — لسا ما انضرب"
                      : undefined
              }
              className={`relative aspect-square rounded-lg border text-[10px] font-bold transition-all ${visual.className}`}
            >
              {visual.content ?? cellIndex + 1}
            </button>
          );
        })}
      </div>
      {strikeTarget.shield_active && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-cyan-700">
          <Shield className="h-3.5 w-3.5" />
          {strikeTarget.name} مشغل الدرع
        </p>
      )}
      {strikeAttacker.available_strikes <= 0 && (
        <p className="mt-3 text-center text-[11px] font-bold text-slate-400">
          خلصت الطقات المتاحة
        </p>
      )}
    </BoardModal>
  );
}
