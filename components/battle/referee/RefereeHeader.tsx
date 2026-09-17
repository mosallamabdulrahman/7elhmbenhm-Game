"use client";

import React from "react";
import { Flag, Headphones, LayoutGrid, LogOut } from "lucide-react";
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
  return (
    <header className="bg-gradient-to-l from-cyan-800 via-cyan-700 to-cyan-600 shadow-lg shrink-0">
      {/* Mobile Header (< md) */}
      <div className="md:hidden px-3 py-2 flex flex-col items-center gap-1.5 w-full">
        {/* Top row: Logo on Right, Action buttons on Left */}
        <div className="flex items-center justify-between w-full">
          <GameLogo className="w-9 h-9 shrink-0" />

          <div className="flex items-center gap-2 text-white font-bold text-xs shrink-0">
            <button
              type="button"
              onClick={onOpenSupport}
              className="inline-flex items-center gap-1 hover:text-emerald-200 transition cursor-pointer"
              title="إرسال رسالة للدعم الفني"
            >
              <Headphones className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="whitespace-nowrap">الدعم</span>
            </button>

            <button
              type="button"
              onClick={onConfirmEnd}
              disabled={isBusy || room?.status !== "playing"}
              className="inline-flex items-center gap-1 hover:text-amber-200 transition disabled:opacity-50 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="whitespace-nowrap">انتهاء اللعبة</span>
            </button>

            {step !== "grid" && (
              <button
                type="button"
                onClick={onReturnToGrid}
                className="inline-flex items-center gap-1 hover:text-cyan-200 transition cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="whitespace-nowrap">الرجوع للوحة</span>
              </button>
            )}

            <button
              type="button"
              onClick={onConfirmExit}
              className="inline-flex items-center gap-1 hover:text-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="whitespace-nowrap">الخروج</span>
            </button>
          </div>
        </div>

        {/* Middle row: Turn indicator pill */}
        <button
          type="button"
          disabled={isBusy || room?.status !== "playing"}
          onClick={() =>
            onSetCurrentTurn(currentTeam?.team_index === 1 ? 2 : 1)
          }
          className="rounded-full bg-[#a30000] border border-white/20 px-4 py-1 text-xs font-bold text-white shadow-inner flex items-center gap-1.5 hover:bg-[#800000] transition disabled:opacity-60 cursor-pointer"
        >
          <span className="whitespace-nowrap">دور فريق :</span>
          <span className="text-white font-bold truncate max-w-[140px]">
            {currentTeam?.name ||
              (currentTeam?.team_index === 1
                ? "الفريق الأول"
                : "الفريق الثاني")}
          </span>
        </button>

        {/* Bottom row: Game Title */}
        <span className="text-sm font-bold text-white/95 tracking-wide drop-shadow-sm text-center truncate max-w-[280px]">
          {room?.game_name || "تجربة اللعبه"}
        </span>
      </div>

      {/* Desktop Header (>= md) */}
      <div className="hidden md:flex max-w-[98rem] mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex-nowrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <GameLogo className="w-14 h-14 sm:w-18 sm:h-18 shrink-0" />

          <button
            type="button"
            disabled={isBusy || room?.status !== "playing"}
            onClick={() =>
              onSetCurrentTurn(currentTeam?.team_index === 1 ? 2 : 1)
            }
            className="rounded-full bg-cyan-950/70 border border-white/20 px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-bold text-white shadow-inner flex items-center gap-1.5 hover:bg-cyan-950/90 transition disabled:opacity-60 cursor-pointer"
          >
            <span className="whitespace-nowrap">دور فريق :</span>
            <span className="text-amber-300 font-bold truncate max-w-[100px] sm:max-w-[160px]">
              {currentTeam?.name || "—"}
            </span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center min-w-[120px]">
          <span className="text-lg sm:text-xl font-bold text-white/95 tracking-wide drop-shadow-sm text-center truncate">
            {room?.game_name || "تجربة اللعبه"}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-white font-bold text-xs sm:text-sm shrink-0">
          <button
            type="button"
            onClick={onConfirmEnd}
            disabled={isBusy || room?.status !== "playing"}
            className="inline-flex items-center gap-1.5 hover:text-amber-200 transition disabled:opacity-50 cursor-pointer"
          >
            <Flag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white shrink-0" />
            <span className="whitespace-nowrap">انتهاء اللعبة</span>
          </button>

          {step !== "grid" && (
            <button
              type="button"
              onClick={onReturnToGrid}
              className="inline-flex items-center gap-1.5 hover:text-cyan-200 transition cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white shrink-0" />
              <span className="whitespace-nowrap">الرجوع للوحة</span>
            </button>
          )}

          <button
            type="button"
            onClick={onConfirmExit}
            className="inline-flex items-center gap-1.5 hover:text-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white shrink-0" />
            <span className="whitespace-nowrap">الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}
