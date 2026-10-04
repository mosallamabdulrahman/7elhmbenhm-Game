"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { LogOut, Share2, Radar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import GameLogo from "@/components/common/GameLogo";
import type { GameRoom, Team } from "@/types/game";

interface JudgeLobbyScreenProps {
  room: GameRoom;
  teams: Team[];
  categoryInfoMap: Map<string, { name: string; image_url: string }>;
  getTeamUrl: (roomId: string, teamIndex: number) => string;
  onExitGame: () => void;
  onStartPreGameRadar: () => void;
  onShowAlert: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

// Referee lobby waiting screen while teams deploy armies
export function JudgeLobbyScreen({
  room,
  teams,
  categoryInfoMap,
  getTeamUrl,
  onExitGame,
  onStartPreGameRadar,
  onShowAlert,
}: JudgeLobbyScreenProps) {
  const team1Obj = teams.find((t) => t.team_index === 1);
  const team2Obj = teams.find((t) => t.team_index === 2);

  const copyTeamLink = (teamIdx: number, teamName: string) => {
    navigator.clipboard.writeText(getTeamUrl(room.id, teamIdx));
    onShowAlert(`نسخنا رابط ${teamName} بنجاح!`, "success");
  };

  return (
    <div className="min-h-screen flex flex-col dir-rtl pb-16">
      {/* Judge Header */}
      <header className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="max-w-[85rem] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GameLogo className="w-14 h-14 sm:w-18 sm:h-18 shrink-0" />
            <div className="text-right">
              <h1 className="font-sans font-bold text-lg text-slate-950">
                شاشة الحكم الحية لمتابعة اللعب
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExitGame}
              className="px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 font-bold rounded-xl text-xs transition-colors text-rose-700 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              اطلع من اللعبة
            </button>
            <Link
              href="/"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors text-slate-600"
            >
              ارجع للرئيسية
            </Link>
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
              ● ناطرين تجهيز الجيوش
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[85rem] mx-auto px-4 mt-8 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team 1 Status panel */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
              <div className="flex items-center justify-between gap-3 mt-1 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-xs" />
                  <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900">
                    {room.team_1_name}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-bold text-xs shadow-xs ${
                    team1Obj?.is_ready
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {team1Obj?.is_ready ? "✓ جاهز للمعركة" : "○ قاعد يوزع جنوده"}
                </span>
              </div>

              <div className="mt-4 space-y-3 flex-1">
                <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-semibold">الجنود على الخريطة:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {(team1Obj?.board || []).filter(Boolean).length} من ٣٦
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-3.5">
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs shrink-0">
                    <QRCodeSVG value={getTeamUrl(room.id, 1)} size={78} />
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <span className="text-xs text-slate-500 font-bold truncate">
                      رابط دخول {room.team_1_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyTeamLink(1, room.team_1_name || "الفريق الأول")}
                        className="text-[11px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        نسخ الرابط
                      </button>
                      <a
                        href={getTeamUrl(room.id, 1)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
                      >
                        فتح
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team 2 Status panel */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />
              <div className="flex items-center justify-between gap-3 mt-1 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 shadow-xs" />
                  <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900">
                    {room.team_2_name}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-bold text-xs shadow-xs ${
                    team2Obj?.is_ready
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {team2Obj?.is_ready ? "✓ جاهز للمعركة" : "○ قاعد يوزع جنوده"}
                </span>
              </div>

              <div className="mt-4 space-y-3 flex-1">
                <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-semibold">الجنود على الخريطة:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {(team2Obj?.board || []).filter(Boolean).length} من ٣٦
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-3.5">
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs shrink-0">
                    <QRCodeSVG value={getTeamUrl(room.id, 2)} size={78} />
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <span className="text-xs text-slate-500 font-bold truncate">
                      رابط دخول {room.team_2_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyTeamLink(2, room.team_2_name || "الفريق الثاني")}
                        className="text-[11px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        نسخ الرابط
                      </button>
                      <a
                        href={getTeamUrl(room.id, 2)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
                      >
                        فتح
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start pre-game radar phase banner */}
          {team1Obj?.is_ready && team2Obj?.is_ready && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-cyan-400/30"
            >
              <div className="flex items-center gap-3.5 text-right">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Radar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-lg">
                    الفريقان جاهزان لبدء المعركة! ⚔️
                  </h3>
                  <p className="text-xs text-cyan-100">
                    اضغط للبدء بمرحلة استطلاع الرادار لكل فريق قبل دخول غرفة الأسئلة.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onStartPreGameRadar}
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-cyan-800 hover:bg-cyan-50 font-bold text-sm rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Radar className="w-5 h-5 text-cyan-700" />
                بدء مرحلة استطلاع الرادار 🎯
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Panel: Selected room parameters */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
            <h4 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              كشف إعدادات الغرفة واللعب
            </h4>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-3">
                  فئات الأسئلة المختارة (6 فئات):
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {(room.selected_categories || []).map((catId: string, idx: number) => {
                    const info = categoryInfoMap.get(catId);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-bold text-xs p-2 rounded-2xl border border-slate-200/80 flex items-center gap-2.5 transition-all shadow-xs"
                      >
                        <img
                          src={info?.image_url || "/images/logo.png"}
                          alt=""
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover shrink-0 border border-white shadow-xs"
                          loading="lazy"
                        />
                        <span className="truncate text-xs sm:text-sm font-bold text-slate-800">
                          {info?.name || catId}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400">
                الفزعات مخشوشة للحين لين يبدأ اللعب والطق.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
