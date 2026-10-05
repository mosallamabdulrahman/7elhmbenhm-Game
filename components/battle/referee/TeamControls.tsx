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
  Scan,
  Flame,
} from "lucide-react";
import { TACTICAL_TOOL_DETAILS } from "@/lib/game-data";

export interface TeamPillBarProps {
  team: any;
  isBusy: boolean;
  onGrantPoints: (teamIndex: number, delta: number) => void;
  onOpenStrike?: (teamIndex: number) => void;
}

export function TeamPillBar({
  team,
  isBusy,
  onGrantPoints,
}: TeamPillBarProps) {
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {/* Top Team Pill Badge */}
      <div
        className="w-full bg-[#0B2D4D] text-white font-bold text-xs sm:text-base text-center py-1 sm:py-2 px-2 sm:px-6 rounded-full shadow-sm flex items-center justify-center gap-1.5"
      >
        <span className="truncate max-w-[120px] sm:max-w-[140px]">
          {team.name ||
            (team.team_index === 1 ? "الفريق الأول" : "الفريق الثاني")}
        </span>
      </div>

      {/* Bottom Score Stepper Container */}
      <div
        className="flex items-center justify-between gap-1 sm:gap-2 bg-white border-2 border-slate-200 rounded-full p-0.5 sm:p-1 shadow-sm w-full"
      >
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onGrantPoints(team.team_index, -50)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B2D4D] hover:bg-[#071c30] text-white font-bold text-xs sm:text-sm flex items-center justify-center transition disabled:opacity-40 shrink-0 cursor-pointer"
        >
          −
        </button>
        <span
          className="font-bold text-sm sm:text-lg text-slate-800 tabular-nums px-1 sm:px-2"
        >
          {team.score}
        </span>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onGrantPoints(team.team_index, 50)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B2D4D] hover:bg-[#071c30] text-white font-bold text-xs sm:text-sm flex items-center justify-center transition disabled:opacity-40 shrink-0 cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}

export interface TeamStrikeStepperProps {
  team?: any;
  isBusy?: boolean;
  onGrantExtraStrike?: (teamIndex: number, count: number) => void;
}

export function TeamStrikeStepper(_props: TeamStrikeStepperProps) {
  // Strikes completely disabled per new gameplay design
  return null;
}

export interface HelperToolsSectionProps {
  team: any;
  isBusy?: boolean;
  onOpenRadar?: (teamIndex: number) => void;
  onUseTool?: (teamIndex: number, toolId: string, payload: any) => void;
}

export function HelperToolsSection({
  team: _team,
}: HelperToolsSectionProps) {
  const tools = ["scan", "shield", "pit"];

  return (
    <div className="flex flex-col items-center w-full">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 mb-0.5 sm:mb-1">
        وسائل المساعدة
      </span>
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {tools.map((toolId: string) => {
          const tool = TACTICAL_TOOL_DETAILS[toolId];
          return (
            <div
              key={toolId}
              title={`${tool?.name || toolId} (مستخدمة / غير مفعّلة)`}
              className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full border border-slate-300 bg-slate-200/80 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-50 shadow-2xs select-none"
            >
              {toolId === "scan" ? (
                <Scan className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              ) : toolId === "pit" ? (
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              ) : (
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface TeamToolsCardProps {
  team: any;
  isBusy?: boolean;
  onOpenRadar?: (teamIndex: number) => void;
  onOpenStrike?: (teamIndex: number) => void;
  onUseTool?: (teamIndex: number, toolId: string, payload: any) => void;
  teamColor?: string;
  isCurrentTurn?: boolean;
}

export function TeamToolsCard({
  team,
  teamColor,
  isCurrentTurn = false,
}: TeamToolsCardProps) {
  const tools = ["scan", "shield", "pit"];

  return (
    <div
      className={`flex flex-col items-center gap-3 py-4 px-3.5 bg-white/95 backdrop-blur-sm rounded-3xl border transition-all shadow-sm w-full ${
        isCurrentTurn
          ? "border-amber-400 ring-2 ring-amber-400/20 shadow-md"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Team Color Pill Badge */}
      <div
        style={teamColor ? { backgroundColor: teamColor } : undefined}
        className={`w-full ${
          !teamColor ? "bg-gradient-to-r from-emerald-600 to-green-600" : ""
        } text-white font-bold text-sm sm:text-base py-2 px-4 rounded-2xl shadow-sm text-center truncate flex items-center justify-center gap-2`}
      >
        <span>{team.name || (team.team_index === 1 ? "الفريق الأول" : "الفريق الثاني")}</span>
        {isCurrentTurn && (
          <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">
            دوره الآن
          </span>
        )}
      </div>

      {/* Current Score */}
      <div className="flex flex-col items-center justify-center py-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          مجموع النقاط
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-bold text-3xl sm:text-4xl text-slate-900 tabular-nums">
            {team.score ?? 0}
          </span>
          <span className="text-xs font-bold text-slate-500">نقطة</span>
        </div>
      </div>

      {/* Helper Tools Container */}
      <div className="w-full pt-3 border-t border-slate-100 flex flex-col items-center">
        <span className="text-xs font-bold text-slate-500 mb-2.5">
          الأدوات المساعدة
        </span>
        <div className="flex items-center justify-center gap-2.5">
          {tools.map((toolId) => {
            const tool = TACTICAL_TOOL_DETAILS[toolId];
            return (
              <div
                key={toolId}
                title={`${tool?.name || toolId} (غير مفعّلة حالياً)`}
                className="w-10 h-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-50 shadow-2xs transition"
              >
                {toolId === "scan" ? (
                  <Scan className="w-4 h-4 text-slate-500" />
                ) : toolId === "pit" ? (
                  <Flame className="w-4 h-4 text-slate-500" />
                ) : (
                  <Shield className="w-4 h-4 text-slate-500" />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-[10px] text-slate-400 font-medium mt-1.5">
          (غير مفعّلة حالياً)
        </span>
      </div>
    </div>
  );
}

