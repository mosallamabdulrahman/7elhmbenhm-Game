"use client";

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Check,
  AlertTriangle,
  Play,
  Crown,
  Zap,
  Copy,
  ArrowDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { groupCategories } from "@/lib/game-data";
import CategoryGroupSection from "@/components/home-page/CategoryGroupSection";
import { useGameSetupStore } from "@/stores/useGameSetupStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { QuestionCategory } from "@/types/game";

export default function GameSetupSection() {
  const {
    user,
    setUser,
    toast,
    isSubmitting,
    createdRoom,
    setCreatedRoom,
    categoriesList,
    groupsList,
    questionSourceReady,
    selectedCategories,
    gameName,
    setGameName,
    team1Name,
    setTeam1Name,
    team2Name,
    setTeam2Name,
    team1Color,
    setTeam1Color,
    team2Color,
    setTeam2Color,
    teamTokens,
    setTeamTokens,
    toggleCategory,
    triggerToast,
    loadSetup,
    handleStartGame,
    handleExitCreatedRoom,
  } = useGameSetupStore();

  const { groups: renderedGroups, ungrouped: ungroupedCategories } = useMemo(
    () => groupCategories(categoriesList, groupsList),
    [categoriesList, groupsList],
  );

  const authUser = useAuthStore((s) => s.user);
  const initAuth = useAuthStore((s) => s.initAuth);

  // Sync auth from centralized auth store
  useEffect(() => {
    const cleanupAuth = initAuth();
    return () => cleanupAuth();
  }, [initAuth]);

  useEffect(() => {
    setUser(authUser);
  }, [authUser, setUser]);

  // Realtime updates for created room
  useEffect(() => {
    if (!createdRoom?.id) return;

    const channel = supabase
      .channel(`setup-room-${createdRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${createdRoom.id}`,
        },
        (payload) => {
          setCreatedRoom(payload.new);
          if (payload.new.status === "abandoned") {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("sovereignty_active_room");
            }
            triggerToast(
              "الحكم أو الخصم طلع من اللعبة، وتسكرت الغرفة.",
              "error",
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [createdRoom?.id, setCreatedRoom, triggerToast]);

  // Load question & category bank
  useEffect(() => {
    loadSetup();
  }, [loadSetup]);

  const getTeamUrl = (room_id: string, teamIndex: number) => {
    const token =
      teamIndex === 1 ? teamTokens?.team_1_token : teamTokens?.team_2_token;
    if (typeof window !== "undefined") {
      const url = new URL("/battle", window.location.origin);
      url.searchParams.set("room_id", room_id);
      url.searchParams.set("team", String(teamIndex));
      if (token) url.searchParams.set("token", token);
      return url.toString();
    }
    return `/battle?room_id=${room_id}&team=${teamIndex}&token=${token || ""}`;
  };

  const masterJudgeUrl = createdRoom
    ? `/battle?room_id=${createdRoom.id}&role=judge`
    : "#";

  const copyLinkToClip = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    triggerToast(`نسخنا الرابط حق ${label} لجهازك!`, "success");
  };

  const scrollToNamingTeams = () => {
    const el = document.getElementById("step-2-naming");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderCategoryCard = (cat: QuestionCategory) => {
    const isSelected = selectedCategories.includes(cat.id);
    return (
      <motion.button
        key={cat.id}
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => toggleCategory(cat.id)}
        className={`rounded-2xl text-right flex flex-col relative overflow-hidden cursor-pointer transition-all ${
          isSelected
            ? "border-4 border-[#44C530] scale-[1.03]"
            : "border-4 border-transparent hover:border-slate-200"
        }`}
      >
        {/* Selected Checkmark Badge */}
        {isSelected && (
          <span className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-[#44C530] text-white font-bold flex items-center justify-center shadow-md text-xs">
            ✓
          </span>
        )}
        <span className="w-full h-36 sm:h-40 md:h-44 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
          <img
            src={cat.image_url || "/images/logo.png"}
            alt={cat.name}
            className={`h-full w-full ${
              cat.image_url ? "object-cover" : "object-contain p-3 bg-slate-100"
            }`}
            onError={(e) => {
              const target = e.currentTarget;
              target.src = "/images/logo.png";
              target.className =
                "h-full w-full object-contain p-3 bg-slate-100";
            }}
          />
        </span>
        <span
          className={`py-2.5 sm:py-3 px-2 text-center w-full block transition-colors ${
            isSelected
              ? "bg-[#44C530] text-white"
              : "bg-[#0B2D4D] text-white"
          }`}
        >
          <span className="font-bold text-base sm:text-lg leading-tight block truncate">
            {cat.name}
          </span>
        </span>
      </motion.button>
    );
  };

  return (
    <section
      id="game-setup"
      className="py-8 sm:py-12 bg-transparent relative overflow-hidden dir-rtl"
    >
      {/* Decorative background glows */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300/60 text-emerald-900 px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-xs">
            <Crown className="w-4 h-4 text-emerald-700 animate-pulse" />
            إدارة وتجهيز اللعب والتحدي
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#20414B] tracking-tight leading-tight">
            تجهيز وضبط اللعبة
          </h2>
          <p className="text-sm md:text-md text-slate-600 mt-2.5 max-w-xl mx-auto leading-relaxed font-semibold">
            بصفتك الحكم، اختار فئات الأسئلة وأسماء الفرق، وعقبها طلع الروابط
            والـ QR كود عشان يدشون معاك باللعبة.
          </p>
        </div>

        {/* Global Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl shadow-2xl border max-w-sm w-full flex items-start gap-3.5 ${
                toast.type === "success"
                  ? "bg-emerald-900 border-emerald-800 text-white"
                  : toast.type === "auth-error"
                    ? "bg-orange-900 border-orange-850 text-white"
                    : "bg-slate-900 border-slate-800 text-white"
              }`}
            >
              <div className="p-1.5 rounded-xl bg-white/10 shrink-0 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 text-right text-xs leading-relaxed font-bold">
                <p className="text-sm text-slate-200">{toast.message}</p>
                {toast.type === "auth-error" && (
                  <div className="mt-3">
                    <a
                      href="/login"
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 font-bold text-slate-950 text-[11px] rounded transition-colors"
                    >
                      ⚡ الدخول السريع
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Setup Stage Modules */}
        {!createdRoom || createdRoom.status === "abandoned" ? (
          <div className="space-y-16">
            {createdRoom?.status === "abandoned" && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center text-sm font-bold text-rose-800">
                واحد من اللاعبين طلع وتسكرت الغرفة. تقدر تسوي غرفة جديدة.
              </div>
            )}

            {/* STEP 1: Categories Selection */}
            <div id="categories" className="scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#0B2D4D] text-white font-bold text-sm flex items-center justify-center">
                    ١
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      الخطوة الأولى: اختار فئات الأسئلة
                    </h3>
                    <p className="text-xs text-slate-500">
                      لازم تختار 6 فئات بالضبط حق التحدي
                    </p>
                  </div>
                </div>
                <div className="bg-slate-200/80 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                  اخترت {selectedCategories.length} من 6
                </div>
              </div>

              {questionSourceReady && categoriesList.length === 0 && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-sm font-bold text-amber-900">
                  ماكو فئات محملة من Supabase. تأكد إن في فئات مفعّلة من لوحة
                  التحكم تالي حدث الصفحة.
                </div>
              )}

              <div className="space-y-12">
                {renderedGroups.map((group) => (
                  <CategoryGroupSection key={group.id} title={group.title}>
                    {group.items.map(renderCategoryCard)}
                  </CategoryGroupSection>
                ))}

                {ungroupedCategories.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-2">
                    {ungroupedCategories.map(renderCategoryCard)}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Naming Team inputs */}
            <div
              id="step-2-naming"
              className={
                selectedCategories.length === 6 ? "opacity-100" : "opacity-40"
              }
            >
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-8">
                <span className="w-8 h-8 rounded-full bg-[#0B2D4D] text-white font-bold text-sm flex items-center justify-center">
                  ٢
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    الخطوة الثانية: سمي الفرق اللي بتلعب
                  </h3>
                  <p className="text-xs text-slate-500">
                    اكتب أسامي الفرق (الفريق الأول والثاني)
                  </p>
                </div>
              </div>

              <div className="mb-8 text-center">
                <label
                  htmlFor="gameName"
                  className="block text-sm font-bold text-slate-800 mb-2"
                >
                  اسم اللعبة
                </label>
                <input
                  id="gameName"
                  type="text"
                  disabled={selectedCategories.length !== 6}
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="مثال: تحدي رمضان ٢٠٢٦"
                  className="block w-full max-w-md mx-auto px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm font-bold text-slate-800 focus:outline-none transition-all text-center"
                />
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                onClick={() => {
                  if (selectedCategories.length !== 6) {
                    triggerToast(
                      "لازم تختار فئات الأسئلة أول شي قبل لا تكمل الباقي.",
                      "error",
                    );
                  }
                }}
              >
                {/* Team A */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative">
                  <div
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: team1Color }}
                  >
                    الفريق الأول
                  </div>
                  <label
                    htmlFor="team1"
                    className="block text-sm font-bold text-slate-800 mb-2"
                  >
                    اسم الفريق الأول
                  </label>
                  <input
                    id="team1"
                    type="text"
                    disabled={selectedCategories.length !== 6}
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    placeholder="مثال: كتيبة الفرسان"
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm font-bold text-slate-800 focus:outline-none transition-all"
                  />
                  {/* Team 1 Color Picker */}
                  <div className="mt-3">
                    <span className="block text-xs font-semibold text-slate-500 mb-1.5">
                      اختر لون الفريق:
                    </span>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "#2563EB", name: "أزرق ملكي", bg: "bg-blue-600" },
                        { id: "#EF4444", name: "أحمر قرمزي", bg: "bg-rose-500" },
                        { id: "#10B981", name: "أخضر زمردي", bg: "bg-emerald-500" },
                        { id: "#F59E0B", name: "ذهبي كهرماني", bg: "bg-amber-500" },
                        { id: "#8B5CF6", name: "بنفسجي", bg: "bg-purple-600" },
                        { id: "#06B6D4", name: "سماوي بحري", bg: "bg-cyan-500" },
                      ].map((col) => {
                        const isSelected = team1Color === col.id;
                        const isTakenByOther = team2Color === col.id;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            disabled={isTakenByOther}
                            onClick={() => setTeam1Color(col.id)}
                            title={
                              isTakenByOther
                                ? `${col.name} (مختار من الفريق الثاني)`
                                : col.name
                            }
                            className={`w-7 h-7 rounded-full ${col.bg} transition-all duration-150 flex items-center justify-center ${
                              isTakenByOther
                                ? "opacity-25 cursor-not-allowed scale-90 ring-1 ring-slate-300"
                                : isSelected
                                  ? "ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-md cursor-pointer"
                                  : "opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Team B */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative">
                  <div
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: team2Color }}
                  >
                    الفريق الثاني
                  </div>
                  <label
                    htmlFor="team2"
                    className="block text-sm font-bold text-slate-800 mb-2"
                  >
                    اسم الفريق الثاني
                  </label>
                  <input
                    id="team2"
                    type="text"
                    disabled={selectedCategories.length !== 6}
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    placeholder="مثال: صقور النخبة"
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm font-bold text-slate-800 focus:outline-none transition-all"
                  />
                  {/* Team 2 Color Picker */}
                  <div className="mt-3">
                    <span className="block text-xs font-semibold text-slate-500 mb-1.5">
                      اختر لون الفريق:
                    </span>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "#2563EB", name: "أزرق ملكي", bg: "bg-blue-600" },
                        { id: "#EF4444", name: "أحمر قرمزي", bg: "bg-rose-500" },
                        { id: "#10B981", name: "أخضر زمردي", bg: "bg-emerald-500" },
                        { id: "#F59E0B", name: "ذهبي كهرماني", bg: "bg-amber-500" },
                        { id: "#8B5CF6", name: "بنفسجي", bg: "bg-purple-600" },
                        { id: "#06B6D4", name: "سماوي بحري", bg: "bg-cyan-500" },
                      ].map((col) => {
                        const isSelected = team2Color === col.id;
                        const isTakenByOther = team1Color === col.id;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            disabled={isTakenByOther}
                            onClick={() => setTeam2Color(col.id)}
                            title={
                              isTakenByOther
                                ? `${col.name} (مختار من الفريق الأول)`
                                : col.name
                            }
                            className={`w-7 h-7 rounded-full ${col.bg} transition-all duration-150 flex items-center justify-center ${
                              isTakenByOther
                                ? "opacity-25 cursor-not-allowed scale-90 ring-1 ring-slate-300"
                                : isSelected
                                  ? "ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-md cursor-pointer"
                                  : "opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="text-center pt-8 border-t border-slate-200">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartGame}
                disabled={isSubmitting}
                className="inline-flex items-center gap-3 bg-[#44C530] hover:bg-[#3bb328] text-white font-sans font-bold text-lg px-12 py-4 rounded-2xl shadow-xl shadow-[#44C530]/25 hover:shadow-[#44C530]/40 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-5 h-5 fill-white" />
                {isSubmitting ? "جارٍ بدء الغرفة..." : "بدء الغرفة"}
              </motion.button>
              <p className="text-xs text-slate-400 mt-3 font-semibold">
                سيتم توجيهك مباشرة لشاشة الحكم واختيار الأسئلة بالتسلسل
              </p>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#44C530] border-t-transparent animate-spin mb-4" />
            <h3 className="font-sans font-bold text-lg text-[#0B2D4D]">
              تم تجهيز الغرفة بنجاح! جارٍ تحويلك لميدان اللعب...
            </h3>
          </div>
        )}
      </div>

      {/* Floating Selected Categories Dock (Desktop & Mobile) */}
      <AnimatePresence>
        {!createdRoom && selectedCategories.length > 0 && (
          <>
            {/* Desktop Dock: Vertical floating capsule on the right side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.25 }}
              className="fixed right-3 lg:right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 select-none"
            >
              <div className="bg-[#f8fafc]/95 backdrop-blur-md border border-slate-300/80 shadow-2xl rounded-[28px] p-2 flex flex-col items-center gap-2">
                {/* 6 category slots */}
                {Array.from({ length: 6 }).map((_, idx) => {
                  const catId = selectedCategories[idx];
                  const cat = catId
                    ? categoriesList.find((c) => c.id === catId)
                    : null;
                  if (cat) {
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className="relative w-13 h-16 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col items-center justify-between text-center group cursor-pointer transition-all hover:scale-105 active:scale-95"
                        title="انقر لإزالة التصنيف"
                      >
                        <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                          <img
                            src={cat.image_url || "/images/logo.png"}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-full bg-[#f97316] py-0.5 px-0.5 text-center shrink-0">
                          <span className="text-[9px] font-bold text-white truncate block leading-tight">
                            {cat.name}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`empty-d-${idx}`}
                      className="w-13 h-16 rounded-xl border-2 border-dashed border-slate-300/80 bg-slate-100/50 flex flex-col items-center justify-center text-slate-300 text-[11px] font-bold"
                    >
                      <span>{idx + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Down Arrow Button: Outside the white container */}
              <button
                type="button"
                onClick={scrollToNamingTeams}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-[#f97316] to-[#ea580c] hover:from-[#fb923c] hover:to-[#ea580c] text-white shadow-lg shadow-orange-500/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 border-2 border-white"
                title="الانتقال لملء بيانات الغرفة"
              >
                <ArrowDown className="w-5 h-5 stroke-[2.5]" />
              </button>
            </motion.div>

            {/* Mobile Dock: Horizontal floating dock at bottom screen (< md) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 md:hidden flex flex-col items-center gap-1.5 max-w-[96vw] select-none"
            >
              {/* Down Arrow Button right above dock */}
              <button
                type="button"
                onClick={scrollToNamingTeams}
                className="w-9 h-9 rounded-full bg-gradient-to-b from-[#f97316] to-[#ea580c] hover:from-[#fb923c] hover:to-[#ea580c] text-white shadow-lg shadow-orange-500/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 border-2 border-white"
                title="الانتقال لملء بيانات الغرفة"
              >
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Horizontal 6-slot dock */}
              <div className="bg-[#f8fafc]/95 backdrop-blur-md border border-slate-300/80 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1.5 max-w-[95vw] overflow-x-auto">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const catId = selectedCategories[idx];
                  const cat = catId
                    ? categoriesList.find((c) => c.id === catId)
                    : null;
                  if (cat) {
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className="relative w-11 h-14 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col items-center justify-between text-center shrink-0 cursor-pointer active:scale-95"
                        title="انقر لإزالة التصنيف"
                      >
                        <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                          <img
                            src={cat.image_url || "/images/logo.png"}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-full bg-[#f97316] py-0.5 px-0.5 text-center shrink-0">
                          <span className="text-[8px] font-bold text-white truncate block leading-tight">
                            {cat.name}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`empty-m-${idx}`}
                      className="w-11 h-14 rounded-lg border-2 border-dashed border-slate-300/80 bg-slate-100/50 flex items-center justify-center text-slate-300 text-[10px] font-bold shrink-0"
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
