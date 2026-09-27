"use client";

import React from "react";
import { motion } from "motion/react";
import { Shield, X } from "lucide-react";
import { UnifiedBattleBoard } from "../UnifiedBattleBoard";

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

  const handleClose = () => {
    setLocallyPendingStrikes(new Set());
    onClose();
  };

  const handleCancel = async () => {
    const teamIdx = strikeModalTeam;
    setLocallyPendingStrikes(new Set());
    onClose();
    if (onCancelStrike) {
      await onCancelStrike(teamIdx);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 dir-rtl overflow-y-auto"
      onClick={strikeAttacker.available_strikes <= 0 ? handleClose : undefined}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[min(94vw,calc(88dvh-80px),680px)] flex flex-col items-center gap-1.5 my-auto shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar above map */}
        <div className="w-full flex items-center justify-between gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-white shadow-lg">
          <div>
            <h2 className="text-xs sm:text-base font-bold">
              ساحة الضرب — خريطة {strikeTarget.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-sky-200 font-semibold mt-0.5">
              عند {strikeAttacker.name} {strikeAttacker.available_strikes}{" "}
              {strikeAttacker.available_strikes === 1 ? "طقة" : "طقات"} متاحة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/60 text-xs font-bold transition shadow-sm cursor-pointer"
              title="إلغاء الضربة وإرجاع اللعبة"
            >
              <X className="w-3.5 h-3.5 text-slate-300" />
              <span>إلغاء الضربة</span>
            </button>

            {strikeAttacker.available_strikes <= 0 && (
              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Large Map Board */}
        <UnifiedBattleBoard
          mode="strike"
          title={`ضرب خريطة ${strikeTarget.name}`}
          subtitle={`اختر المربع المطلوب ضربه`}
          team1={{ name: strikeAttacker.name, score: strikeAttacker.points ?? strikeAttacker.score ?? 0 }}
          team2={{ name: strikeTarget.name, score: strikeTarget.points ?? strikeTarget.score ?? 0 }}
          showScores={true}
          strikeCellResults={strikeCellResults}
          strikeCellUnits={strikeCellUnits}
          strikeRadarRevealMap={strikeRadarRevealMap}
          locallyPendingStrikes={locallyPendingStrikes}
          isBusy={isBusy}
          canStrike={strikeAttacker.available_strikes > 0}
          onStrikeCellClick={(cellIndex) => {
            setLocallyPendingStrikes((prev) => new Set(prev).add(cellIndex));
            onStrike(strikeModalTeam, cellIndex);
          }}
          className="w-full"
        />

        {/* Status / Footer messages */}
        {strikeTarget.shield_active && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-700/60 px-4 py-1 rounded-full shadow-sm">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>{strikeTarget.name} مشغل الدرع الدفاعي</span>
          </p>
        )}

        {strikeAttacker.available_strikes <= 0 && (
          <div className="flex flex-col items-center gap-2 mt-1">
            <p className="text-center text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-700/60 px-4 py-1.5 rounded-full shadow-sm">
              خلصت الطقات المتاحة! اضغط بالخارج أو على زر الإغلاق للمتابعة
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold rounded-full shadow-lg transition cursor-pointer"
            >
              متابعة اللعبة
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
