"use client";

import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useBattleStore } from "@/stores/useBattleStore";

export interface TimerPillProps {
  seconds?: number;
  isPaused?: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function TimerPill({
  seconds: propSeconds,
  isPaused: propPaused,
  onPause,
  onResume,
  onReset,
}: TimerPillProps) {
  const storeSeconds = useBattleStore((s) => s.questionSeconds);
  const storePaused = useBattleStore((s) => s.timerPaused);

  const seconds = propSeconds !== undefined ? propSeconds : storeSeconds;
  const isPaused = propPaused !== undefined ? propPaused : storePaused;

  const mm = String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, seconds) % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-slate-950 px-3.5 py-1.5 sm:px-6 sm:py-2.5 text-white shadow-2xl">
      <button
        type="button"
        onClick={onReset}
        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
        title="إعادة ضبط"
      >
        <RotateCcw className="w-5 h-5 sm:w-9 sm:h-9 text-slate-300" />
      </button>

      <span className="text-xl sm:text-2xl md:text-3xl tabular-nums drop-shadow-md min-w-[3.8rem] sm:min-w-[5rem] text-center tracking-wider font-bold">
        {mm}:{ss}
      </span>

      <button
        type="button"
        onClick={isPaused ? onResume : onPause}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
        title={isPaused ? "تشغيل" : "إيقاف مؤقت"}
      >
        {isPaused ? (
          <Play className="w-5 h-5 sm:w-9 sm:h-9 ml-0.5 fill-white" />
        ) : (
          <Pause className="w-5 h-5 sm:w-9 sm:h-9 fill-white" />
        )}
      </button>
    </div>
  );
}
