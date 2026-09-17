"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  PhoneCall,
  Users,
  RotateCcw,
  Shield,
  Radar,
  Star,
} from "lucide-react";
import { TACTICAL_TOOL_DETAILS } from "@/lib/game-data";

export interface TeamPillBarProps {
  team: any;
  isBusy: boolean;
  onGrantPoints: (teamIndex: number, delta: number) => void;
  onOpenStrike: (teamIndex: number) => void;
}

export function TeamPillBar({
  team,
  isBusy,
  onGrantPoints,
  onOpenStrike,
}: TeamPillBarProps) {
  const hasStrikes = team.available_strikes > 0;

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {/* Top Red Team Pill Badge */}
      <div className="w-full bg-[#a30000] text-white font-bold text-xs sm:text-base text-center py-1 sm:py-2.5 px-2.5 sm:px-8 rounded-full shadow-sm flex items-center justify-center gap-1.5">
        <span className="truncate max-w-[100px] sm:max-w-[120px]">
          {team.name ||
            (team.team_index === 1 ? "الفريق الأول" : "الفريق الثاني")}
        </span>
        {hasStrikes && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onOpenStrike(team.team_index)}
            className="bg-amber-400 text-slate-950 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold animate-pulse hover:bg-amber-300 cursor-pointer"
          >
            🎯 ({team.available_strikes})
          </button>
        )}
      </div>

      {/* Bottom Score Stepper Container */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 bg-white border-2 border-[#a30000] rounded-full p-0.5 sm:p-1 shadow-sm w-full">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onGrantPoints(team.team_index, -50)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#a30000] hover:bg-[#800000] text-white font-bold text-xs sm:text-sm flex items-center justify-center transition disabled:opacity-40 shrink-0 cursor-pointer"
        >
          −
        </button>
        <span className="font-bold text-sm sm:text-lg text-[#a30000] tabular-nums px-1 sm:px-2">
          {team.score}
        </span>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onGrantPoints(team.team_index, 50)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#a30000] hover:bg-[#800000] text-white font-bold text-xs sm:text-sm flex items-center justify-center transition disabled:opacity-40 shrink-0 cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}

export interface TeamStrikeStepperProps {
  team: any;
  isBusy: boolean;
  onGrantExtraStrike: (teamIndex: number, count: number) => void;
}

export function TeamStrikeStepper({
  team,
  isBusy,
  onGrantExtraStrike,
}: TeamStrikeStepperProps) {
  const [pending, setPending] = useState<number>(0);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const commit = () => {
    if (pending === 0) return;
    onGrantExtraStrike(team.team_index, pending);
    setPending(0);
    setPopoverOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setPopoverOpen((open) => !open)}
        className="w-full rounded-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] xs:text-xs sm:text-sm py-1 sm:py-1.5 px-2.5 sm:px-4 shadow-sm transition cursor-pointer"
      >
        اضف طاقات زياده{pending > 0 ? ` (${pending})` : ""}
      </button>

      {popoverOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setPopoverOpen(false)}
          />
          <div className="absolute bottom-full left-1/2 z-40 mb-2 w-[170px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl flex flex-col items-center gap-2">
            <div className="flex items-center justify-between gap-2 bg-white border-2 border-cyan-700 rounded-full px-1.5 py-0.5 shadow-sm w-full">
              <button
                type="button"
                disabled={isBusy || pending <= 0}
                onClick={() => setPending((p) => Math.max(0, p - 1))}
                className="w-6 h-6 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm flex items-center justify-center transition disabled:opacity-40 shrink-0 cursor-pointer"
              >
                −
              </button>
              <span className="font-bold text-base text-cyan-700 tabular-nums px-2">
                {pending}
              </span>
              <button
                type="button"
                disabled={isBusy || pending >= 10}
                onClick={() => setPending((p) => Math.min(10, p + 1))}
                className="w-6 h-6 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm flex items-center justify-center transition disabled:opacity-40 shrink-0 cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={isBusy || pending === 0}
              onClick={commit}
              className="w-full rounded-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-1.5 shadow-sm transition disabled:opacity-40 cursor-pointer"
            >
              إضافة
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export interface HelperToolsSectionProps {
  team: any;
  isBusy: boolean;
  onOpenRadar: (teamIndex: number) => void;
  onUseTool: (teamIndex: number, toolId: string, payload: any) => void;
}

export function HelperToolsSection({
  team,
  isBusy,
  onOpenRadar,
  onUseTool,
}: HelperToolsSectionProps) {
  const usedTools = team.used_tools || [];
  const tools =
    team.tools && team.tools.length > 0
      ? team.tools
      : ["phone_friend", "ask_audience", "swap_question"];

  return (
    <div className="flex flex-col items-center w-full">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">
        وسائل المساعدة
      </span>
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {tools.map((toolId: string) => {
          const tool = TACTICAL_TOOL_DETAILS[toolId];
          const isUsed = usedTools.includes(toolId);
          const isRadar = toolId === "radar_scan";
          return (
            <button
              key={toolId}
              type="button"
              disabled={isBusy || isUsed}
              title={tool?.name || toolId}
              onClick={() =>
                isRadar
                  ? onOpenRadar(team.team_index)
                  : onUseTool(team.team_index, toolId, null)
              }
              className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full border border-slate-300 flex items-center justify-center transition-all shadow-sm ${
                isUsed
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white text-slate-800 hover:border-cyan-500 hover:bg-cyan-50 hover:scale-105 cursor-pointer"
              }`}
            >
              {toolId === "phone_friend" || toolId === "phone" ? (
                <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              ) : toolId === "ask_audience" || toolId === "peace" ? (
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              ) : toolId === "swap_question" || toolId === "swap" ? (
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              ) : toolId === "shield" ? (
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              ) : isRadar ? (
                <Radar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              ) : (
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface TeamToolsCardProps {
  team: any;
  isBusy: boolean;
  onOpenRadar: (teamIndex: number) => void;
  onOpenStrike: (teamIndex: number) => void;
  onUseTool: (teamIndex: number, toolId: string, payload: any) => void;
}

export function TeamToolsCard({
  team,
  isBusy,
  onOpenRadar,
  onOpenStrike,
  onUseTool,
}: TeamToolsCardProps) {
  const usedTools = team.used_tools || [];
  const hasStrikes = team.available_strikes > 0;
  const tools =
    team.tools && team.tools.length > 0
      ? team.tools
      : ["phone_friend", "ask_audience", "swap_question"];

  return (
    <div className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-3xl border border-slate-200 shadow-sm w-full text h-fit-center">
      {/* Team Red Pill Badge */}
      <div className="w-full bg-[#a30000] text-white font-bold text-sm sm:text-base py-1.5 px-4 rounded-full shadow-sm text-center truncate">
        {team.name ||
          (team.team_index === 1 ? "الفريق الأول" : "الفريق الثاني")}
      </div>

      {/* Current Score */}
      <span className="font-bold text-2xl text-[#a30000] tabular-nums">
        {team.score}
      </span>

      {/* Helper Tools Title */}
      <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
        وسائل المساعدة
      </span>

      {/* Helper Tools Icons */}
      <div className="flex items-center gap-2">
        {tools.map((toolId: string) => {
          const tool = TACTICAL_TOOL_DETAILS[toolId];
          const isUsed = usedTools.includes(toolId);
          const isRadar = toolId === "radar_scan";
          return (
            <button
              key={toolId}
              type="button"
              disabled={isBusy || isUsed}
              title={tool?.name || toolId}
              onClick={() =>
                isRadar
                  ? onOpenRadar(team.team_index)
                  : onUseTool(team.team_index, toolId, null)
              }
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-400 flex items-center justify-center transition-all shadow-sm ${
                isUsed
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300"
                  : "bg-white text-slate-800 hover:border-cyan-500 hover:bg-cyan-50 hover:scale-105 cursor-pointer"
              }`}
            >
              {toolId === "phone_friend" || toolId === "phone" ? (
                <PhoneCall className="w-4 h-4 text-slate-700" />
              ) : toolId === "ask_audience" || toolId === "peace" ? (
                <Users className="w-4 h-4 text-slate-700" />
              ) : toolId === "swap_question" || toolId === "swap" ? (
                <RotateCcw className="w-4 h-4 text-slate-700" />
              ) : toolId === "shield" ? (
                <Shield className="w-4 h-4 text-slate-700" />
              ) : isRadar ? (
                <Radar className="w-4 h-4 text-slate-700" />
              ) : (
                <Star className="w-4 h-4 text-slate-700" />
              )}
            </button>
          );
        })}
      </div>

      {/* Strike Action Button */}
      {hasStrikes && (
        <motion.button
          type="button"
          disabled={isBusy}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          onClick={() => onOpenStrike(team.team_index)}
          className="mt-1 rounded-full bg-amber-400 text-slate-950 px-4 py-1 text-xs font-bold shadow hover:bg-amber-300 transition cursor-pointer"
        >
          🎯 اضرب الآن ({team.available_strikes})
        </motion.button>
      )}
    </div>
  );
}
