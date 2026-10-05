"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import Image from "next/image";
import type { Question, Team, CombatEvent } from "@/types/game";

// ==========================================
// 3D FLOATING GEOMETRIC DECORATIVE SVG ICONS
// Multi-facet 3D SVGs with lighting & shadows
// ==========================================

function Floating3DTriangle({
  color = "blue",
  size = 72,
  className = "",
}: {
  color?: "blue" | "green" | "white";
  size?: number;
  className?: string;
}) {
  const gradId = `tri-g-${color}-${Math.random().toString(36).substring(2, 6)}`;
  const bevelId = `tri-b-${color}-${Math.random().toString(36).substring(2, 6)}`;

  const fillColors =
    color === "green"
      ? { top: "#86efac", mid: "#22c55e", bot: "#15803d", bevel: "#14532d" }
      : color === "white"
        ? { top: "#ffffff", mid: "#f8fafc", bot: "#cbd5e1", bevel: "#94a3b8" }
        : { top: "#67e8f9", mid: "#0284c7", bot: "#0369a1", bevel: "#075985" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`select-none pointer-events-none filter drop-shadow-[0_14px_22px_rgba(0,0,0,0.75)] ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={fillColors.top} />
          <stop offset="60%" stopColor={fillColors.mid} />
          <stop offset="100%" stopColor={fillColors.bot} />
        </linearGradient>
        <linearGradient id={bevelId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={fillColors.bevel} />
          <stop offset="100%" stopColor={fillColors.bot} />
        </linearGradient>
      </defs>
      {/* 3D Bottom shadow edge */}
      <path
        d="M50 14 L88 78 C89 80 87 84 84 84 L16 84 C13 84 11 80 12 78 Z"
        fill={`url(#${bevelId})`}
        transform="translate(0, 6)"
      />
      {/* Main Face */}
      <path
        d="M50 12 C52 12 53 14 54 16 L88 74 C89 76 88 79 85 80 L15 80 C12 79 11 76 12 74 L46 16 C47 14 48 12 50 12 Z"
        fill={`url(#${gradId})`}
      />
      {/* Top Gloss Highlight */}
      <path d="M50 16 L76 68 L24 68 Z" fill="white" fillOpacity="0.32" />
    </svg>
  );
}

function Floating3DLightning({
  color = "green",
  size = 88,
  className = "",
}: {
  color?: "green" | "blue";
  size?: number;
  className?: string;
}) {
  const gradId = `bolt-g-${color}-${Math.random().toString(36).substring(2, 6)}`;
  const bevelId = `bolt-b-${color}-${Math.random().toString(36).substring(2, 6)}`;

  const fillColors =
    color === "green"
      ? { top: "#a3e635", mid: "#22c55e", bot: "#15803d", bevel: "#14532d" }
      : { top: "#38bdf8", mid: "#0284c7", bot: "#075985", bevel: "#082f49" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`select-none pointer-events-none filter drop-shadow-[0_16px_26px_rgba(0,0,0,0.8)] ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={fillColors.top} />
          <stop offset="60%" stopColor={fillColors.mid} />
          <stop offset="100%" stopColor={fillColors.bot} />
        </linearGradient>
        <linearGradient id={bevelId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={fillColors.bevel} />
          <stop offset="100%" stopColor={fillColors.bot} />
        </linearGradient>
      </defs>
      {/* 3D bottom bevel */}
      <path
        d="M58 8 L32 46 L52 46 L40 88 L72 46 L52 46 Z"
        fill={`url(#${bevelId})`}
        transform="translate(-2, 6)"
      />
      {/* Main Lightning Bolt */}
      <path
        d="M58 8 L32 46 L52 46 L40 88 L72 46 L52 46 Z"
        fill={`url(#${gradId})`}
      />
      {/* Inner highlight ridge */}
      <path d="M56 12 L36 46 L50 46 L43 78 Z" fill="white" fillOpacity="0.35" />
    </svg>
  );
}

// Side Sculpted Metallic Rail Frames
function SideSculptedBorder({ side = "left" }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`absolute bottom-0 ${
        isLeft ? "left-0" : "right-0"
      } w-32 sm:w-44 md:w-60 h-72 sm:h-88 md:h-[420px] pointer-events-none select-none z-0`}
    >
      <svg
        viewBox="0 0 100 200"
        fill="none"
        preserveAspectRatio="none"
        className={`w-full h-full ${
          isLeft ? "" : "scale-x-[-1]"
        } filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)]`}
      >
        <path
          d="M0 200 L40 200 L85 100 L45 0 L25 0 L65 100 L20 200 Z"
          fill="url(#railGrad3D)"
        />
        <path
          d="M0 200 L20 200 L65 100 L25 0 L20 0 L60 100 L0 200 Z"
          fill="#ffffff"
          fillOpacity="0.65"
        />
        <defs>
          <linearGradient id="railGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ==========================================
// MAIN GAME BOARD PROPS & COMPONENT
// ==========================================

export interface SequentialQuestionGridProps {
  questions?: Question[];
  activeQuestionId?: string | null;
  events?: CombatEvent[];
  teams?: Team[];
  teamColors?: { [teamIndex: number]: string };
  disabled?: boolean;
  selectedCategories?: string[];
  onSelect?: (question: Question) => void;
  onShowAlert?: (msg: string, type?: "warning" | "error" | "info") => void;
}

export function SequentialQuestionGrid({
  questions = [],
  activeQuestionId = null,
  events = [],
  teams = [],
  teamColors = {},
  disabled = false,
  selectedCategories = [],
  onSelect = () => {},
  onShowAlert,
}: SequentialQuestionGridProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss warning toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Fallback placeholder teams if empty
  const team1 = teams.find((t) => t.team_index === 1) || {
    id: "team-1",
    name: "الفريق الأول",
    team_index: 1,
    score: 0,
  };
  const team2 = teams.find((t) => t.team_index === 2) || {
    id: "team-2",
    name: "الفريق الثاني",
    team_index: 2,
    score: 0,
  };

  // Build category order lookup map
  const categoryOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    if (selectedCategories && selectedCategories.length > 0) {
      selectedCategories.forEach((catId, idx) => map.set(catId, idx));
    } else {
      let idx = 0;
      questions.forEach((q) => {
        if (!map.has(q.category_id)) {
          map.set(q.category_id, idx++);
        }
      });
    }
    return map;
  }, [selectedCategories, questions]);

  // Generate 30 sorted questions or 30 placeholder items
  const sortedQuestions = useMemo(() => {
    if (questions.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({
        id: `mock-q-${i + 1}`,
        category_id: `cat-${Math.floor(i / 5) + 1}`,
        question_text: `سؤال ${i + 1}`,
        answer_text: `إجابة ${i + 1}`,
        position: (i % 5) + 1,
        is_used: false,
        difficulty_level: i % 5 < 2 ? "easy" : i % 5 < 4 ? "medium" : "hard",
      })) as unknown as Question[];
    }

    return [...questions].sort((a, b) => {
      const catOrderA = categoryOrderMap.has(a.category_id)
        ? categoryOrderMap.get(a.category_id)!
        : 999;
      const catOrderB = categoryOrderMap.has(b.category_id)
        ? categoryOrderMap.get(b.category_id)!
        : 999;

      if (catOrderA !== catOrderB) {
        return catOrderA - catOrderB;
      }
      return (a.position || 0) - (b.position || 0);
    });
  }, [questions, categoryOrderMap]);

  // Next sequential box number (1 to 30)
  const nextPendingBoxNumber = useMemo(() => {
    const idx = sortedQuestions.findIndex((q) => !q.is_used);
    return idx === -1 ? sortedQuestions.length + 1 : idx + 1;
  }, [sortedQuestions]);

  // Question resolution map
  const questionWinnerMap = useMemo(() => {
    const map = new Map<string, number | null>();
    events.forEach((ev) => {
      if (ev.event_type === "question_resolved") {
        const qId = (ev.metadata as { question_id?: string })?.question_id;
        if (qId && ev.actor_team_index !== undefined) {
          map.set(qId, ev.actor_team_index);
        }
      }
    });
    return map;
  }, [events]);

  const handleCellClick = (q: Question, boxNumber: number) => {
    if (disabled) return;
    if (q.is_used) return;

    if (boxNumber > nextPendingBoxNumber) {
      const msg = `يرجى الاختيار بالتسلسل — الدور الآن على السؤال رقم (${nextPendingBoxNumber})`;
      setToastMessage(msg);
      if (onShowAlert) {
        onShowAlert(msg, "warning");
      }
      return;
    }

    onSelect(q);
  };

  // Group 30 questions into 6 rows of 5 questions each
  const rows = useMemo(() => {
    const result: Question[][] = [];
    for (let r = 0; r < 6; r++) {
      result.push(sortedQuestions.slice(r * 5, r * 5 + 5));
    }
    return result;
  }, [sortedQuestions]);

  // Mobile-only zoom controls
  const handleZoomIn = () =>
    setZoomScale((prev) => Math.min(2.2, +(prev + 0.2).toFixed(2)));
  const handleZoomOut = () =>
    setZoomScale((prev) => Math.max(1.0, +(prev - 0.2).toFixed(2)));
  const handleResetZoom = () => {
    setZoomScale(1.0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-0 m-0 relative overflow-hidden select-none bg-[#021024] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#07264a] via-[#021024] to-[#010812]">
      {/* Background Decorative Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[460px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-8 left-8 w-[380px] h-[380px] bg-blue-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-8 right-8 w-[380px] h-[380px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Side Sculpted Metallic Rails */}
      <SideSculptedBorder side="left" />
      <SideSculptedBorder side="right" />

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 z-50 px-4 py-2 rounded-full bg-amber-500/95 border border-amber-300 text-slate-950 text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-Only Floating Zoom Helper Widget */}
      <div className="md:hidden absolute bottom-2 left-2 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-2 py-1 flex items-center gap-1.5 shadow-xl shadow-black/50">
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoomScale >= 2.2}
          className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 active:scale-95 disabled:opacity-40 transition"
          title="تكبير"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-bold text-white px-1 tabular-nums min-w-[34px] text-center">
          {Math.round(zoomScale * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoomScale <= 1.0}
          className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 active:scale-95 disabled:opacity-40 transition"
          title="تصغير"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {zoomScale > 1.0 && (
          <button
            type="button"
            onClick={handleResetZoom}
            className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center hover:bg-amber-500/30 active:scale-95 transition"
            title="إعادة ضبط الحجم"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main Viewport Container */}
      <div
        ref={scrollContainerRef}
        className={`w-full h-full flex items-center justify-center p-1 sm:p-2 md:p-3 pt-6 sm:pt-8 ${
          zoomScale > 1.0
            ? "overflow-auto touch-pan-x touch-pan-y"
            : "overflow-hidden"
        }`}
      >
        <div
          style={{
            transform: zoomScale > 1.0 ? `scale(${zoomScale})` : undefined,
            transformOrigin: "center center",
            transition: "transform 0.18s cubic-bezier(0.2, 0, 0, 1)",
          }}
          className="relative w-full max-w-[1400px] aspect-video flex items-center justify-center shrink-0"
        >
          {/* ======================================================== */}
          {/* FLOATING 3D GEOMETRIC ICONS - EXACT POSITIONING MATCH    */}
          {/* ======================================================== */}

          {/* --- TOP ROW AROUND LOGO --- */}
          {/* 1. Green Triangle to the Left of Logo */}
          <div className="absolute left-[36%] top-[6%] -rotate-25 pointer-events-none z-20">
            <Floating3DTriangle color="green" size={48} />
          </div>

          {/* 2. Green Lightning to the Right of Logo */}
          <div className="absolute right-[37%] top-[7%] rotate-20 pointer-events-none z-20">
            <Floating3DLightning color="green" size={44} />
          </div>

          {/* 3. Blue Triangle to the Right of Logo */}
          <div className="absolute right-[33%] top-[9%] rotate-45 pointer-events-none z-20">
            <Floating3DTriangle color="blue" size={46} />
          </div>

          {/* --- ABOVE THE TEAM PODS --- */}
          {/* 4. Blue Triangle above Left Pod */}
          <div className="absolute left-[8%] top-[10%] -rotate-15 pointer-events-none z-10">
            <Floating3DTriangle color="blue" size={56} />
          </div>

          {/* 5. Green Triangle above Right Pod */}
          <div className="absolute right-[8%] top-[10%] rotate-25 pointer-events-none z-10">
            <Floating3DTriangle color="green" size={60} />
          </div>

          {/* --- LEFT WING AREA (UNDER BLUE POD) --- */}
          {/* 6. Big Chunky Blue 3D Triangle under Left Pod */}
          <div className="absolute left-[4%] top-[50%] -rotate-15 pointer-events-none z-10">
            <Floating3DTriangle color="blue" size={96} />
          </div>

          {/* 7. Small Green Triangle next to it */}
          <div className="absolute left-[18%] top-[52%] rotate-20 pointer-events-none z-10">
            <Floating3DTriangle color="green" size={48} />
          </div>

          {/* 8. Blue 3D Lightning Bolt under Left Pod */}
          <div className="absolute left-[13%] top-[66%] -rotate-10 pointer-events-none z-10">
            <Floating3DLightning color="blue" size={72} />
          </div>

          {/* 9. Small White 3D Pebble */}
          <div className="absolute left-[19%] top-[80%] rotate-35 pointer-events-none z-10">
            <Floating3DTriangle color="white" size={32} />
          </div>

          {/* 10. Large Green Triangle at Bottom-Left Corner */}
          <div className="absolute left-[1%] bottom-[2%] -rotate-10 pointer-events-none z-10">
            <Floating3DTriangle color="green" size={80} />
          </div>

          {/* --- RIGHT WING AREA (UNDER GREEN POD) --- */}
          {/* 11. Large Green 3D Lightning Bolt under Right Pod */}
          <div className="absolute right-[18%] top-[50%] rotate-15 pointer-events-none z-10">
            <Floating3DLightning color="green" size={98} />
          </div>

          {/* 12. Blue 3D Triangle next to it */}
          <div className="absolute right-[7%] top-[52%] -rotate-20 pointer-events-none z-10">
            <Floating3DTriangle color="blue" size={62} />
          </div>

          {/* 13. Small White 3D Pebble */}
          <div className="absolute right-[20%] top-[72%] -rotate-15 pointer-events-none z-10">
            <Floating3DTriangle color="white" size={34} />
          </div>

          {/* 14. Large Green Triangle at Bottom-Right Corner */}
          <div className="absolute right-[2%] bottom-[3%] rotate-10 pointer-events-none z-10">
            <Floating3DTriangle color="green" size={82} />
          </div>

          {/* ======================================================== */}
          {/* TOP CENTER: 3D LOGO WITH COMFORTABLE GAP BELOW HEADER    */}
          {/* ======================================================== */}
          <div className="absolute top-[5%] sm:top-[6%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            {/* Ambient logo glow */}
            <div className="absolute inset-0 bg-[#44C530]/40 blur-2xl rounded-full scale-125 pointer-events-none -z-10" />
            <div className="relative w-36 sm:w-48 md:w-56 lg:w-64 h-18 sm:h-24 md:h-28 lg:h-32">
              <Image
                src="/images/logo.png"
                alt="حيلهم بينهم"
                fill
                priority
                className="object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)]"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* 1. VISUAL LEFT: TEAM 1 POD (CYAN/BLUE 3D THEME)           */}
          {/* ======================================================== */}
          <div className="absolute left-[3%] sm:left-[4%] md:left-[5%] top-[21%] sm:top-[22%] w-[28%] sm:w-[27%] max-w-[350px] z-10 select-none">
            {/* Thick 3D Cyan/Blue Housing */}
            <div className="w-full bg-gradient-to-b from-[#14b8a6] via-[#0284c7] to-[#0369a1] p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.4rem] border-4 sm:border-[5px] border-cyan-300 drop-shadow-2xl shadow-[0_16px_36px_rgba(2,132,199,0.45),inset_0_3px_5px_rgba(255,255,255,0.7),inset_0_-5px_8px_rgba(0,0,0,0.5)] flex flex-col gap-2.5 sm:gap-3.5">
              {/* Team 1 Name Banner */}
              <div
                className="w-full bg-[#042548]/95 border-2 border-[#38bdf8]/60 rounded-xl sm:rounded-2xl py-2 sm:py-3 px-3 text-center shadow-inner flex items-center justify-center"
                title={team1.name}
              >
                <span className="text-white font-bold text-sm sm:text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate max-w-full">
                  {team1.name}
                </span>
              </div>

              {/* Team 1 Score Pill Track (Deep Inset Pill with Inner Shadow) */}
              <div className="w-full bg-black/55 border border-[#38bdf8]/40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] p-2.5 sm:p-3.5 rounded-full flex items-center justify-between">
                {/* 4 Helper Circular Slots on Right */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#031d36] border-2 border-[#0284c7]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#031d36] border-2 border-[#0284c7]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#031d36] border-2 border-[#0284c7]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#031d36] border-2 border-[#0284c7]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                </div>
                {/* Score Number: Large, Bold, White on Left */}
                <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl tabular-nums drop-shadow-md">
                  {team1.score ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. VISUAL RIGHT: TEAM 2 POD (LIME/GREEN 3D THEME)        */}
          {/* ======================================================== */}
          <div className="absolute right-[3%] sm:right-[4%] md:right-[5%] top-[21%] sm:top-[22%] w-[28%] sm:w-[27%] max-w-[350px] z-10 select-none">
            {/* Thick 3D Lime/Green Housing */}
            <div className="w-full bg-gradient-to-b from-[#22c55e] via-[#16a34a] to-[#15803d] p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.4rem] border-4 sm:border-[5px] border-green-300 drop-shadow-2xl shadow-[0_16px_36px_rgba(34,197,94,0.45),inset_0_3px_5px_rgba(255,255,255,0.7),inset_0_-5px_8px_rgba(0,0,0,0.5)] flex flex-col gap-2.5 sm:gap-3.5">
              {/* Team 2 Name Banner */}
              <div
                className="w-full bg-[#032a10]/95 border-2 border-[#4ade80]/60 rounded-xl sm:rounded-2xl py-2 sm:py-3 px-3 text-center shadow-inner flex items-center justify-center"
                title={team2.name}
              >
                <span className="text-white font-bold text-sm sm:text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate max-w-full">
                  {team2.name}
                </span>
              </div>

              {/* Team 2 Score Pill Track (Deep Inset Pill with Inner Shadow) */}
              <div className="w-full bg-black/55 border border-[#4ade80]/40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] p-2.5 sm:p-3.5 rounded-full flex items-center justify-between">
                {/* 4 Helper Circular Slots on Right */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#02240b] border-2 border-[#22c55e]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#02240b] border-2 border-[#22c55e]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#02240b] border-2 border-[#22c55e]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#02240b] border-2 border-[#22c55e]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                </div>
                {/* Score Number: Large, Bold, White on Left */}
                <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl tabular-nums drop-shadow-md">
                  {team2.score ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. VISUAL CENTER: MASSIVE 3D BEZEL BOARD (30 TILES)      */}
          {/* Visual Left: Blue, Visual Right: Green (strictly matched) */}
          {/* ======================================================== */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[23%] sm:top-[22%] w-[48%] sm:w-[46%] max-w-[580px] aspect-[4/3] z-20">
            {/* Massive 3D Outer Plastic Bezel Container */}
            <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3rem] border-[10px] sm:border-[14px] border-slate-100 bg-[#021830] shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_4px_6px_rgba(255,255,255,0.9),inset_0_-8px_12px_rgba(0,0,0,0.65)] p-2 sm:p-3 flex flex-col justify-between overflow-hidden">
              {/* Top Center Split Cap Notch (Visual Left: Blue, Visual Right: Green) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-3.5 sm:h-4.5 flex flex-row-reverse rounded-b-lg overflow-hidden z-20 shadow-md">
                <div className="w-1/2 h-full bg-[#0284c7] border-b border-l border-[#38bdf8]" />
                <div className="w-[3px] h-full bg-[#021024]" />
                <div className="w-1/2 h-full bg-[#22c55e] border-b border-r border-[#4ade80]" />
              </div>

              {/* Bottom Center Split Cap Notch (Visual Left: Blue, Visual Right: Green) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-3.5 sm:h-4.5 flex flex-row-reverse rounded-t-lg overflow-hidden z-20 shadow-md">
                <div className="w-1/2 h-full bg-[#0284c7] border-t border-l border-[#38bdf8]" />
                <div className="w-[3px] h-full bg-[#021024]" />
                <div className="w-1/2 h-full bg-[#22c55e] border-t border-r border-[#4ade80]" />
              </div>

              {/* Strictly Split Vertical Background (Visual Left: Blue 50%, Visual Right: Green 50%) */}
              <div className="absolute inset-0 flex flex-row-reverse pointer-events-none -z-0">
                {/* Visual Left 50% (First child in flex-row-reverse): Deep Blue Grid Surface */}
                <div className="w-1/2 h-full bg-gradient-to-r from-[#032345] via-[#042d57] to-[#05376b] border-r border-[#021428] relative">
                  <div className="absolute inset-0 flex flex-col justify-between py-4 sm:py-6 opacity-30">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`shelf-b-${i}`}
                        className="w-full h-1 bg-[#38bdf8]/40 shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                {/* Visual Right 50% (Second child in flex-row-reverse): Deep Green Grid Surface */}
                <div className="w-1/2 h-full bg-gradient-to-l from-[#02311c] via-[#034025] to-[#044f2e] border-l border-[#021428] relative">
                  <div className="absolute inset-0 flex flex-col justify-between py-4 sm:py-6 opacity-30">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`shelf-g-${i}`}
                        className="w-full h-1 bg-[#4ade80]/40 shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* The 30 Buttons Grid (6 Rows x 5 Columns) */}
              {/* In dir="rtl", each row uses flex-row-reverse so button 1 is on VISUAL LEFT (Blue side)! */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between py-2 sm:py-3 px-1 sm:px-2 gap-1.5 sm:gap-2.5">
                {rows.map((rowQuestions, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    className="w-full flex-1 flex justify-between items-center gap-1.5 sm:gap-3"
                  >
                    {rowQuestions.map((q, colIndex) => {
                      const boxNumber = rowIndex * 5 + colIndex + 1;
                      const isAnswered = Boolean(q.is_used);
                      const isCurrentlyActive = activeQuestionId === q.id;
                      const isActiveNext =
                        boxNumber === nextPendingBoxNumber && !isAnswered;
                      const isLocked = boxNumber > nextPendingBoxNumber;
                      const winnerTeamIndex =
                        q.awarded_team_index ?? questionWinnerMap.get(q.id);
                      const winnerColor = winnerTeamIndex
                        ? teamColors[winnerTeamIndex]
                        : undefined;

                      return (
                        <div
                          key={q.id || `box-${boxNumber}`}
                          className="flex-1 h-full flex items-center justify-center min-w-0"
                        >
                          <motion.button
                            type="button"
                            disabled={disabled || isAnswered}
                            whileHover={
                              isActiveNext && !disabled ? { scale: 1.05 } : {}
                            }
                            whileTap={
                              isActiveNext && !disabled ? { scale: 0.94 } : {}
                            }
                            onClick={() => handleCellClick(q, boxNumber)}
                            style={
                              isAnswered && winnerColor
                                ? { backgroundColor: winnerColor }
                                : undefined
                            }
                            className={`relative w-full h-full rounded-xl sm:rounded-2xl font-bold flex items-center justify-center select-none transition-all ${
                              isAnswered
                                ? winnerColor
                                  ? "text-white shadow-[0_4px_0_0_rgba(0,0,0,0.4)] border-b-2 border-black/30 cursor-default"
                                  : "bg-slate-600 text-white opacity-90 cursor-default shadow-[0_4px_0_0_#334155]"
                                : isCurrentlyActive
                                  ? "bg-gradient-to-b from-amber-50 to-amber-100 text-[#021024] shadow-[0_6px_0_0_#d97706] ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 cursor-pointer animate-pulse active:translate-y-[4px] active:shadow-[0_2px_0_0_#d97706]"
                                  : isActiveNext
                                    ? "bg-gradient-to-b from-white to-slate-100 text-[#021024] shadow-[0_6px_0_0_#94a3b8] ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 cursor-pointer animate-pulse active:translate-y-[4px] active:shadow-[0_2px_0_0_#94a3b8]"
                                    : isLocked
                                      ? "bg-gradient-to-b from-white/95 to-slate-100/95 text-[#021024]/75 shadow-[0_5px_0_0_#cbd5e1] cursor-not-allowed active:translate-y-[2px] active:shadow-[0_3px_0_0_#cbd5e1]"
                                      : "bg-gradient-to-b from-white to-slate-100 text-[#021024] shadow-[0_6px_0_0_#94a3b8] cursor-pointer hover:-translate-y-0.5 active:translate-y-[4px] active:shadow-[0_2px_0_0_#94a3b8]"
                            }`}
                          >
                            <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl tabular-nums font-bold text-[#021024]">
                              {boxNumber}
                            </span>
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
