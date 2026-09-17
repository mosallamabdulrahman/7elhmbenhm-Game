"use client";

import React from "react";
import { motion } from "motion/react";
import { Headphones } from "lucide-react";
import GameLogo from "@/components/common/GameLogo";
import {
  TeamPillBar,
  TeamStrikeStepper,
  HelperToolsSection,
} from "./TeamControls";

export interface GameBottomFooterProps {
  team1: any;
  team2: any;
  isBusy: boolean;
  onOpenRadar: (teamIndex: number) => void;
  onOpenStrike: (teamIndex: number) => void;
  onUseTool: (teamIndex: number, toolId: string, payload: any) => void;
  onGrantPoints: (teamIndex: number, delta: number) => void;
  onGrantExtraStrike: (teamIndex: number, count: number) => void;
  onOpenSupport: () => void;
}

export function GameBottomFooter({
  team1,
  team2,
  isBusy,
  onOpenRadar,
  onOpenStrike,
  onUseTool,
  onGrantPoints,
  onGrantExtraStrike,
  onOpenSupport,
}: GameBottomFooterProps) {
  return (
    <div className="w-full bg-[#e2e8f0] p-1.5 xs:p-2 sm:p-4 shrink-0">
      {/* Mobile Layout (< md) */}
      <div className="grid grid-cols-2 gap-2 xs:gap-3 md:hidden">
        {/* Right Section in RTL: Team 1 */}
        <div className="flex flex-col items-center gap-1">
          <TeamPillBar
            team={team1}
            isBusy={isBusy}
            onGrantPoints={onGrantPoints}
            onOpenStrike={onOpenStrike}
          />
          <TeamStrikeStepper
            team={team1}
            isBusy={isBusy}
            onGrantExtraStrike={onGrantExtraStrike}
          />
          <HelperToolsSection
            team={team1}
            isBusy={isBusy}
            onOpenRadar={onOpenRadar}
            onUseTool={onUseTool}
          />
        </div>

        {/* Left Section in RTL: Team 2 */}
        <div className="flex flex-col items-center gap-1">
          <TeamPillBar
            team={team2}
            isBusy={isBusy}
            onGrantPoints={onGrantPoints}
            onOpenStrike={onOpenStrike}
          />
          <TeamStrikeStepper
            team={team2}
            isBusy={isBusy}
            onGrantExtraStrike={onGrantExtraStrike}
          />
          <HelperToolsSection
            team={team2}
            isBusy={isBusy}
            onOpenRadar={onOpenRadar}
            onUseTool={onUseTool}
          />
        </div>
      </div>

      {/* Desktop Layout (>= md) */}
      <div className="hidden md:flex items-center justify-between gap-4 w-full">
        {/* Team 1 Section (Right side in RTL) */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2 w-[150px]">
            <TeamPillBar
              team={team1}
              isBusy={isBusy}
              onGrantPoints={onGrantPoints}
              onOpenStrike={onOpenStrike}
            />
          </div>
          <div className="flex flex-col gap-2">
            <HelperToolsSection
              team={team1}
              isBusy={isBusy}
              onOpenRadar={onOpenRadar}
              onUseTool={onUseTool}
            />
            <TeamStrikeStepper
              team={team1}
              isBusy={isBusy}
              onGrantExtraStrike={onGrantExtraStrike}
            />
          </div>
        </div>

        {/* Center Logo Section */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2 -mt-[37px] gap-2">
          <GameLogo className="w-22 h-22" />
          {/* Floating Support Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSupport}
            className="z-[250] flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white shadow-2xl border border-white/25 backdrop-blur-md cursor-pointer transition-all duration-200 group select-none"
            title="إرسال رسالة للدعم الفني"
          >
            <div className="relative flex items-center justify-center">
              <Headphones className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-bold text-slate-100 hidden sm:inline">
              الدعم الفني
            </span>
          </motion.button>
        </div>

        {/* Team 2 Section (Left side in RTL) */}
        <div className="flex items-center gap-4 justify-end">
          <div className="flex flex-col gap-2">
            <HelperToolsSection
              team={team2}
              isBusy={isBusy}
              onOpenRadar={onOpenRadar}
              onUseTool={onUseTool}
            />
            <TeamStrikeStepper
              team={team2}
              isBusy={isBusy}
              onGrantExtraStrike={onGrantExtraStrike}
            />
          </div>
          <div className="flex flex-col items-center gap-2 w-[150px]">
            <TeamPillBar
              team={team2}
              isBusy={isBusy}
              onGrantPoints={onGrantPoints}
              onOpenStrike={onOpenStrike}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
