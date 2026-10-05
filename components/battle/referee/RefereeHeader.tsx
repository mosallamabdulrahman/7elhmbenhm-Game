"use client";

import React from "react";
import { Flag, Headphones, LayoutGrid, LogOut, ArrowRightLeft } from "lucide-react";
import GameLogo from "@/components/common/GameLogo";

export interface RefereeHeaderProps {
  room: any;
  currentTeam: any;
  step: string;
  isBusy: boolean;
  onOpenSupport: () => void;
  onConfirmEnd: () => void;
  onConfirmExit: () => void;
  onReturnToGrid: () => void;
  onSetCurrentTurn: (turn: number) => void;
}

export function RefereeHeader({
  room,
  currentTeam,
  step,
  isBusy,
  onOpenSupport,
  onConfirmEnd,
  onConfirmExit,
  onReturnToGrid,
  onSetCurrentTurn,
}: RefereeHeaderProps) {
  const isPlaying = room?.status === "playing";

  return (
    <header className="w-full bg-gradient-to-r from-[#021024] via-[#07264a] to-[#021024] border-b border-[#67C3FF]/25 shadow-lg shadow-black/50 shrink-0 select-none z-40 transition-all">
      {/* Container: Sleek, compact height and responsive spacing */}
      <div className="max-w-[98rem] mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        
        {/* Right Section: Logo & Current Turn Pill */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          <GameLogo className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md shrink-0 transition-transform hover:scale-105" />

          {/* Turn Toggle Pill with Brand Glow */}
          <button
            type="button"
            disabled={isBusy || !isPlaying}
            onClick={() => onSetCurrentTurn(currentTeam?.team_index === 1 ? 2 : 1)}
            className="rounded-full bg-[#041d38] hover:bg-[#072a4e] border border-[#67C3FF]/40 hover:border-[#44C530]/60 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-white shadow-inner flex items-center gap-1.5 sm:gap-2 transition disabled:opacity-50 cursor-pointer shrink-0"
            title="اضغط لتبديل الدور للفريق الآخر"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#67C3FF] shrink-0" />
            <span className="whitespace-nowrap text-slate-300 hidden md:inline">دور فريق:</span>
            <span className="text-[#44C530] font-bold truncate max-w-[90px] sm:max-w-[130px]">
              {currentTeam?.name || (currentTeam?.team_index === 1 ? "الفريق الأول" : "الفريق الثاني")}
            </span>
          </button>
        </div>

        {/* Center Section: Game Name */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          <span className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide drop-shadow-md text-center truncate max-w-[280px] sm:max-w-[420px]">
            {room?.game_name || "حيلهم بينهم"}
          </span>
        </div>

        {/* Left Section: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Back to Grid (only active if in question/answer view) */}
          {step !== "grid" && (
            <button
              type="button"
              onClick={onReturnToGrid}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-200 hover:text-[#67C3FF] hover:bg-white/5 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer"
              title="الرجوع للوحة الاختيار"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#67C3FF] shrink-0" />
              <span className="hidden sm:inline">اللوحة</span>
            </button>
          )}

          {/* Support Button */}
          <button
            type="button"
            onClick={onOpenSupport}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-200 hover:text-[#67C3FF] hover:bg-white/5 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer"
            title="إرسال رسالة للدعم الفني"
          >
            <Headphones className="w-3.5 h-3.5 text-[#67C3FF] shrink-0" />
            <span className="hidden lg:inline">الدعم</span>
          </button>

          {/* End Game Button */}
          <button
            type="button"
            onClick={onConfirmEnd}
            disabled={isBusy || !isPlaying}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-bold text-xs sm:text-sm shadow-xs transition disabled:opacity-40 cursor-pointer"
            title="إنهاء اللعبة الحالية"
          >
            <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">إنهاء اللعبة</span>
          </button>

          {/* Exit Room Button */}
          <button
            type="button"
            onClick={onConfirmExit}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            title="الخروج من الغرفة"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>

      </div>
    </header>
  );
}
