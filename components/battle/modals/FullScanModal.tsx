"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scan, Timer, X } from "lucide-react";
import { UnifiedBattleBoard } from "../UnifiedBattleBoard";

export interface FullScanModalProps {
  isOpen: boolean;
  enemyTeamName: string;
  cells: Array<{ cell_index: number; unit_type: string | null }>;
  durationSeconds?: number;
  onClose: () => void;
}

export function FullScanModal({
  isOpen,
  enemyTeamName,
  cells,
  durationSeconds = 10,
  onClose,
}: FullScanModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    if (!isOpen) return;

    setSecondsLeft(durationSeconds);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, durationSeconds, onClose]);

  if (!isOpen) return null;

  // Build a lookup map of cell_index -> unit_type
  const cellMap = new Map<number, string | null>();
  (cells || []).forEach((c) => {
    cellMap.set(c.cell_index, c.unit_type);
  });

  const progressPercent = Math.max(0, (secondsLeft / durationSeconds) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md dir-rtl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-[min(94vw,calc(88dvh-80px),700px)] bg-white rounded-3xl sm:rounded-[2.5rem] border-2 border-cyan-400 shadow-2xl p-3 sm:p-4 overflow-hidden my-auto flex flex-col items-center gap-1.5 shrink-0"
        >
          {/* Tactical top bar */}
          <div className="w-full flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shadow-inner">
                <Scan className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-right">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  كشف السكان الكامل: خريطة {enemyTeamName}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                  خريطة الخصم مكشوفة بالكامل لمدة 10 ثوانٍ فقط!
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 sm:px-3 py-1 rounded-2xl shadow-sm">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs sm:text-sm font-bold tabular-nums">
                  {secondsLeft} ث
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                title="إغلاق"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-500"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>

          {/* 6x6 Full Board Grid with UnifiedBattleBoard */}
          <div className="w-full">
            <UnifiedBattleBoard
              mode="full_scan"
              title={`كشف خريطة ${enemyTeamName}`}
              subtitle="خريطة الخصم مكشوفة بالكامل"
              fullScanCellMap={cellMap}
              className="w-full"
            />
          </div>

          {/* Footer note */}
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 text-center">
            💡 احفظ أماكن أهم جنود الخصم والألغام قبل أن ينتهي الوقت!
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
