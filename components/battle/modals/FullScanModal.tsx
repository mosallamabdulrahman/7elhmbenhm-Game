"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Scan, Timer, X } from "lucide-react";
import { UNIT_IMAGES, UNIT_NAMES } from "@/lib/game-data";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md dir-rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[2.5rem] border-2 border-cyan-400 shadow-2xl p-5 sm:p-7 overflow-hidden"
        >
          {/* High-tech tactical top bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shadow-inner">
                <Scan className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  كشف السكان الكامل: خريطة {enemyTeamName}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400">
                  خريطة الخصم مكشوفة بالكامل لمدة 10 ثوانٍ فقط!
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-2xl shadow-sm">
                <Timer className="w-4 h-4 animate-spin" />
                <span className="text-sm font-bold tabular-nums">
                  {secondsLeft} ث
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-3">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-500"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>

          {/* 6x6 Full Board Grid */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 max-w-md mx-auto aspect-square p-2 bg-slate-50/70 border border-slate-200/80 rounded-2xl shadow-inner relative">
            {Array.from({ length: 36 }).map((_, idx) => {
              const unit = cellMap.get(idx);
              const hasUnit = unit && unit !== "null";
              const unitName = hasUnit ? UNIT_NAMES[unit] || unit : null;
              const unitImg = hasUnit ? UNIT_IMAGES[unit] : null;

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative p-1 transition-all ${
                    hasUnit
                      ? unit === "mine"
                        ? "bg-rose-50 border-2 border-rose-400 text-rose-800 shadow-xs"
                        : "bg-cyan-50/90 border-2 border-cyan-400 text-cyan-900 shadow-xs"
                      : "bg-white/80 border border-slate-200 text-slate-300"
                  }`}
                >
                  {hasUnit && unitImg ? (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (idx % 6) * 0.02 }}
                      className="flex flex-col items-center justify-center w-full h-full"
                    >
                      <Image
                        src={unitImg}
                        alt={unitName || ""}
                        width={28}
                        height={28}
                        className="w-5 h-5 sm:w-8 sm:h-8 object-contain drop-shadow-xs"
                      />
                      <span className="text-[8px] sm:text-[9px] font-bold mt-0.5 truncate leading-none">
                        {unitName}
                      </span>
                    </motion.div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300">
                      {idx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3.5 text-center">
            <p className="text-[11px] font-semibold text-slate-500">
              💡 احفظ أماكن أهم جنود الخصم والألغام قبل أن ينتهي الوقت!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
