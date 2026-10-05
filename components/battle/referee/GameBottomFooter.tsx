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
  onGrantPoints: (teamIndex: number, delta: number) => void;
  onOpenSupport: () => void;
  onOpenRadar?: (teamIndex: number) => void;
  onOpenStrike?: (teamIndex: number) => void;
  onUseTool?: (teamIndex: number, toolId: string, payload: any) => void;
  onGrantExtraStrike?: (teamIndex: number, count: number) => void;
}

export function GameBottomFooter({
  team1,
  team2,
  isBusy,
  onGrantPoints,
  onOpenSupport,
}: GameBottomFooterProps) {
  return (
    <div className="w-full bg-slate-200/80 backdrop-blur-md border-t border-slate-300 p-2 sm:p-3 shrink-0">
      {/* Mobile Layout (< md) */}
      <div className="grid grid-cols-2 gap-2 xs:gap-3 md:hidden">
        {/* Right Section in RTL: Team 1 */}
        <div className="flex flex-col items-center gap-1.5">
          <TeamPillBar
            team={team1}
            isBusy={isBusy}
            onGrantPoints={onGrantPoints}
          />
          <HelperToolsSection
            team={team1}
            isBusy={isBusy}
          />
        </div>

        {/* Left Section in RTL: Team 2 */}
        <div className="flex flex-col items-center gap-1.5">
          <TeamPillBar
            team={team2}
            isBusy={isBusy}
            onGrantPoints={onGrantPoints}
          />
          <HelperToolsSection
            team={team2}
            isBusy={isBusy}
          />
        </div>
      </div>

      {/* Desktop Layout (>= md) */}
      <div className="hidden md:flex items-center justify-between gap-6 w-full max-w-7xl mx-auto">
        {/* Team 1 Section (Right side in RTL) */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 w-[160px]">
            <TeamPillBar
              team={team1}
              isBusy={isBusy}
              onGrantPoints={onGrantPoints}
            />
          </div>
          <div className="flex flex-col">
            <HelperToolsSection
              team={team1}
              isBusy={isBusy}
            />
          </div>
        </div>

        {/* Center Logo Section */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2 -mt-7 gap-1.5">
          <GameLogo className="w-16 h-16 sm:w-20 sm:h-20" />
          {/* Floating Support Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSupport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B2D4D] hover:bg-[#071c30] text-white shadow-lg border border-white/20 backdrop-blur-md cursor-pointer transition-all duration-200 group select-none"
            title="إرسال رسالة للدعم الفني"
          >
            <div className="relative flex items-center justify-center">
              <Headphones className="w-3.5 h-3.5 text-[#67C3FF] group-hover:rotate-12 transition-transform shrink-0" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#44C530] animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#44C530]" />
            </div>
            <span className="text-[11px] font-bold text-slate-100 hidden sm:inline">
              الدعم الفني
            </span>
          </motion.button>
        </div>

        {/* Team 2 Section (Left side in RTL) */}
        <div className="flex items-center gap-4 justify-end">
          <div className="flex flex-col">
            <HelperToolsSection
              team={team2}
              isBusy={isBusy}
            />
          </div>
          <div className="flex flex-col items-center gap-1 w-[160px]">
            <TeamPillBar
              team={team2}
              isBusy={isBusy}
              onGrantPoints={onGrantPoints}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
