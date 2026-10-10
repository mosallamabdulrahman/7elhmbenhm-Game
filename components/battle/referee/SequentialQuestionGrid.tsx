"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import type { CombatEvent, Question, Team } from "@/types/game";

type AccentColor = "blue" | "green" | "white";

const ACCENTS: Record<
  AccentColor,
  { light: string; face: string; deep: string; edge: string }
> = {
  blue: {
    light: "#86d7ff",
    face: "#44adfe",
    deep: "#0873cf",
    edge: "#04569d",
  },
  green: {
    light: "#a5ff85",
    face: "#59f34d",
    deep: "#25d83a",
    edge: "#0b9b2b",
  },
  white: {
    light: "#ffffff",
    face: "#f4ffff",
    deep: "#d1dadf",
    edge: "#91a7ba",
  },
};

// Main room measurements. Change these values to tune the layout in one place.
const ROOM_LAYOUT = {
  desktopBoardWidth: "min(49%, 88dvh)",
  desktopTeamWidth: "min(25%, 54dvh)",
  teamBoardOverlap: "8px",
} as const;

const ROOM_LAYOUT_STYLE = {
  "--room-board-width": ROOM_LAYOUT.desktopBoardWidth,
  "--room-team-width": ROOM_LAYOUT.desktopTeamWidth,
  "--room-team-overlap": ROOM_LAYOUT.teamBoardOverlap,
} as React.CSSProperties;

function GlossyTriangle({
  id,
  color,
  className,
}: {
  id: string;
  color: AccentColor;
  className: string;
}) {
  const palette = ACCENTS[color];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={`pointer-events-none absolute overflow-visible drop-shadow-[0_12px_10px_rgba(0,0,0,0.5)] ${className}`}
    >
      <defs>
        <linearGradient id={`${id}-edge`} x1="50" y1="66" x2="50" y2="94">
          <stop stopColor={palette.deep} />
          <stop offset="1" stopColor={palette.edge} />
        </linearGradient>
      </defs>
      <path
        d="M50 11C55 11 59 14 62 19L93 70C98 79 93 90 83 92L23 98C12 99 5 89 10 79L42 19C44 14 47 11 50 11Z"
        fill={`url(#${id}-edge)`}
      />
      <path
        d="M50 4C55 4 59 8 62 13L91 65C96 74 91 83 82 84L23 90C13 91 7 82 12 73L42 13C44 8 47 4 50 4Z"
        fill={palette.face}
        stroke={palette.light}
        strokeOpacity="0.82"
        strokeWidth="2"
      />
    </svg>
  );
}

function GlossyBolt({
  id,
  color,
  className,
}: {
  id: string;
  color: "blue" | "green";
  className: string;
}) {
  const palette = ACCENTS[color];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 120"
      className={`pointer-events-none absolute overflow-visible drop-shadow-[0_14px_11px_rgba(0,0,0,0.55)] ${className}`}
    >
      <path
        d="M39 8C36 8 33 11 32 14L18 57C16 64 20 70 27 70H44L36 107C34 118 47 122 53 112L84 60C88 53 83 47 76 47H59L72 17C76 8 69 3 61 5L39 8Z"
        fill={palette.edge}
        transform="translate(0 7)"
      />
      <path
        d="M39 5C35 6 33 9 32 13L18 56C16 62 20 68 27 68H46L37 106C35 116 46 120 52 111L83 59C87 53 83 48 76 48H57L71 16C74 8 68 3 61 4L39 5Z"
        fill={palette.face}
        stroke={palette.light}
        strokeOpacity="0.78"
        strokeWidth="2"
      />
    </svg>
  );
}

function RoomBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,#07526f_0%,#06345a_31%,#032647_58%,#01162f_100%)]" />
      <div className="absolute inset-0 opacity-45 bg-[linear-gradient(120deg,transparent_0%,transparent_25%,rgba(22,119,185,0.18)_25.2%,transparent_36%,rgba(1,10,27,0.34)_36.2%,transparent_51%,rgba(11,76,125,0.2)_51.2%,transparent_66%)]" />

      <div className="absolute -left-[5%] -top-[9%] h-[19%] w-[12.5%] rotate-[-34deg] rounded-[2rem] border-[3px] border-[#63d7ff]/65 bg-gradient-to-b from-[#62ddff] via-[#1fa5ee] to-[#0872cf] shadow-[0_18px_25px_rgba(0,0,0,0.45),inset_0_5px_7px_rgba(255,255,255,0.55)]" />
      <div className="absolute -right-[5%] -top-[6%] h-[18%] w-[14%] rotate-[34deg] rounded-[2rem] border-[3px] border-[#7cff75]/65 bg-gradient-to-b from-[#72ff69] via-[#28e738] to-[#0ca428] shadow-[0_18px_25px_rgba(0,0,0,0.45),inset_0_5px_7px_rgba(255,255,255,0.55)]" />
      <div className="absolute -left-[5%] bottom-[-11%] h-[31%] w-[13%] rotate-[-35deg] rounded-[2rem] border-[3px] border-[#68ff6e]/60 bg-gradient-to-br from-[#59f25c] to-[#0ba62d] shadow-[0_18px_25px_rgba(0,0,0,0.55),inset_0_5px_7px_rgba(255,255,255,0.45)]" />
      <div className="absolute -right-[5%] bottom-[-12%] h-[32%] w-[13%] rotate-[35deg] rounded-[2rem] border-[3px] border-[#60f96b]/60 bg-gradient-to-br from-[#4bf354] to-[#079d29] shadow-[0_18px_25px_rgba(0,0,0,0.55),inset_0_5px_7px_rgba(255,255,255,0.45)]" />

      <div className="absolute left-0 top-[20%] h-[2.2%] w-[2.4%] bg-gradient-to-r from-white via-[#eef8fb] to-[#7890a5] shadow-[8px_4px_14px_rgba(0,0,0,0.42)]" />
      <div className="absolute left-[1%] top-[20%] h-[42%] w-[1.3%] bg-gradient-to-r from-white via-[#eef8fb] to-[#7890a5] shadow-[8px_5px_14px_rgba(0,0,0,0.45)]" />
      <div className="absolute left-[1.4%] top-[59.5%] h-[52%] w-[1.3%] origin-top -rotate-[26deg] bg-gradient-to-r from-white via-[#eef8fb] to-[#7890a5] shadow-[8px_5px_14px_rgba(0,0,0,0.48)]" />
      <div className="absolute right-0 top-[24.8%] h-[2.2%] w-[2.4%] bg-gradient-to-l from-white via-[#eef8fb] to-[#7890a5] shadow-[-8px_4px_14px_rgba(0,0,0,0.42)]" />
      <div className="absolute right-[1%] top-[24.8%] h-[37%] w-[1.3%] bg-gradient-to-l from-white via-[#eef8fb] to-[#7890a5] shadow-[-8px_5px_14px_rgba(0,0,0,0.45)]" />
      <div className="absolute right-[1.4%] top-[59.5%] h-[52%] w-[1.3%] origin-top rotate-[26deg] bg-gradient-to-l from-white via-[#eef8fb] to-[#7890a5] shadow-[-8px_5px_14px_rgba(0,0,0,0.48)]" />

      <div className="absolute left-[11%] top-[-4%] h-[14%] w-[10%] rotate-[38deg] rounded-[1.2rem] bg-[#00172f]/70 shadow-[inset_0_2px_4px_rgba(28,102,159,0.25)]" />
      <div className="absolute left-[22%] top-[9%] h-[6%] w-[6%] rotate-[33deg] rounded-[0.8rem] bg-[#063767]/75" />
      <div className="absolute right-[18%] top-[2%] h-[9%] w-[14%] rotate-[-32deg] rounded-[1.2rem] border border-[#0e548f]/70 bg-[#052c58]/75" />
      <div className="absolute right-[12%] bottom-[-2%] h-[8%] w-[9%] rotate-[30deg] rounded-[1rem] bg-[#052851]/80" />
    </div>
  );
}

function TeamPanel({
  teamIndex,
  score,
  tone,
  side,
}: {
  teamIndex: 1 | 2;
  score: number;
  tone: "blue" | "green";
  side: "left" | "right";
}) {
  const isBlue = tone === "blue";
  const label = teamIndex === 1 ? "الفريق الأول" : "الفريق الثاني";
  const boardAttachedPosition: React.CSSProperties = {
    width: "var(--room-team-width)",
    [side]:
      "calc(50% - (var(--room-board-width) / 2) - var(--room-team-width) + var(--room-team-overlap))",
  };

  return (
    <section
      aria-label={label}
      style={boardAttachedPosition}
      className="absolute top-[17.8%] z-20 hidden h-[28.5%] md:block"
    >
      <div
        className={`relative h-full w-full rounded-[11%] border-[clamp(3px,0.34vw,6px)] p-[6.8%] shadow-[0_18px_25px_rgba(0,0,0,0.5),inset_0_6px_9px_rgba(255,255,255,0.5),inset_0_-9px_14px_rgba(0,0,0,0.3)] ${
          isBlue
            ? "border-[#86d7ff] bg-[#44adfe]"
            : "border-[#9aff82] bg-[#59f34d]"
        }`}
      >
        <div
          className={`flex h-[49%] items-center justify-center rounded-[15%/32%] border-[clamp(1px,0.16vw,3px)] px-[5%] shadow-[inset_0_7px_16px_rgba(0,0,0,0.5),0_3px_0_rgba(255,255,255,0.3)] ${
            isBlue
              ? "border-[#258ed2] bg-gradient-to-b from-[#0b4076] to-[#05284f]"
              : "border-[#159c36] bg-gradient-to-b from-[#075c28] to-[#033617]"
          }`}
        >
          <span className="whitespace-nowrap text-[clamp(20px,2.6vw,46px)]  leading-none text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.55)]">
            {label}
          </span>
        </div>

        <div
          dir="ltr"
          className={`mt-[5%] flex h-[39%] items-stretch overflow-hidden rounded-[999px] border-[clamp(1px,0.14vw,3px)] bg-[#00182f]/90 shadow-[inset_0_7px_16px_rgba(0,0,0,0.78)] ${
            isBlue ? "border-[#147fc7]" : "border-[#14923b]"
          }`}
        >
          <div
            className={`flex w-[35%] shrink-0 items-center justify-center border-r ${
              isBlue
                ? "border-[#1b5f92] bg-[#001a33]"
                : "border-[#176233] bg-[#001c24]"
            }`}
          >
            <span className="text-[clamp(28px,3.8vw,64px)] leading-none text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.5)]">
              {score}
            </span>
          </div>
          <div
            className={`flex flex-1 items-center justify-center gap-[clamp(3px,0.55vw,10px)] ${
              isBlue ? "bg-[#032845]" : "bg-[#04351d]"
            }`}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <span
                key={index}
                className={`block aspect-square w-[clamp(11px,2vw,36px)] rounded-full border-[clamp(1px,0.14vw,3px)] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.24)] ${
                  isBlue
                    ? "border-[#176caa] bg-[#063057]"
                    : "border-[#12803a] bg-[#073b1d]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompactTeamPanel({
  teamIndex,
  score,
  tone,
}: {
  teamIndex: 1 | 2;
  score: number;
  tone: "blue" | "green";
}) {
  const isBlue = tone === "blue";
  const label = teamIndex === 1 ? "الفريق الأول" : "الفريق الثاني";

  return (
    <section
      aria-label={label}
      className={`min-w-0 rounded-[12px] border-2 p-1 shadow-[0_8px_14px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.42)] ${
        isBlue
          ? "border-[#86d7ff] bg-[#44adfe]"
          : "border-[#9aff82] bg-[#59f34d]"
      }`}
    >
      <div
        className={`flex h-8 items-center justify-center rounded-[8px] border px-1 shadow-[inset_0_4px_8px_rgba(0,0,0,0.48)] ${
          isBlue
            ? "border-[#258ed2] bg-gradient-to-b from-[#0b4076] to-[#05284f]"
            : "border-[#159c36] bg-gradient-to-b from-[#075c28] to-[#033617]"
        }`}
      >
        <span className="truncate text-[clamp(12px,3.8vw,17px)]  leading-none text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.55)]">
          {label}
        </span>
      </div>

      <div
        dir="ltr"
        className={`mt-1 flex h-7 items-stretch overflow-hidden rounded-full border bg-[#00182f]/90 shadow-[inset_0_4px_8px_rgba(0,0,0,0.72)] ${
          isBlue ? "border-[#147fc7]" : "border-[#14923b]"
        }`}
      >
        <div
          className={`flex w-[35%] items-center justify-center border-r ${
            isBlue
              ? "border-[#1b5f92] bg-[#001a33]"
              : "border-[#176233] bg-[#001c24]"
          }`}
        >
          <span className="text-lg leading-none text-white">{score}</span>
        </div>
        <div
          className={`flex flex-1 items-center justify-center gap-1 ${
            isBlue ? "bg-[#032845]" : "bg-[#04351d]"
          }`}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className={`block size-3 rounded-full border shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)] ${
                isBlue
                  ? "border-[#176caa] bg-[#063057]"
                  : "border-[#12803a] bg-[#073b1d]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

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

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const team1Score = teams.find((team) => team.team_index === 1)?.score ?? 0;
  const team2Score = teams.find((team) => team.team_index === 2)?.score ?? 0;

  const categoryOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    if (selectedCategories.length > 0) {
      selectedCategories.forEach((categoryId, index) =>
        map.set(categoryId, index),
      );
    } else {
      questions.forEach((question) => {
        if (!map.has(question.category_id)) {
          map.set(question.category_id, map.size);
        }
      });
    }
    return map;
  }, [questions, selectedCategories]);

  const sortedQuestions = useMemo(() => {
    if (questions.length === 0) {
      return Array.from({ length: 30 }, (_, index) => ({
        id: `mock-q-${index + 1}`,
        category_id: `cat-${Math.floor(index / 5) + 1}`,
        difficulty: "easy",
        question_text: `سؤال ${index + 1}`,
        position: (index % 5) + 1,
        is_used: false,
      })) as Question[];
    }

    return [...questions].sort((first, second) => {
      const firstCategory = categoryOrderMap.get(first.category_id) ?? 999;
      const secondCategory = categoryOrderMap.get(second.category_id) ?? 999;
      return firstCategory === secondCategory
        ? (first.position ?? 0) - (second.position ?? 0)
        : firstCategory - secondCategory;
    });
  }, [categoryOrderMap, questions]);

  const boardQuestions = useMemo(
    () =>
      Array.from(
        { length: 30 },
        (_, index) =>
          sortedQuestions[index] ?? {
            id: `empty-q-${index + 1}`,
            category_id: "empty",
            difficulty: "easy",
            question_text: `سؤال ${index + 1}`,
            position: index + 1,
            is_used: false,
          },
      ) as Question[],
    [sortedQuestions],
  );

  const nextPendingBoxNumber = useMemo(() => {
    const index = boardQuestions.findIndex((question) => !question.is_used);
    return index === -1 ? boardQuestions.length + 1 : index + 1;
  }, [boardQuestions]);

  const questionWinnerMap = useMemo(() => {
    const map = new Map<string, number | null>();
    events.forEach((event) => {
      if (event.event_type !== "question_resolved") return;
      const questionId = (event.metadata as { question_id?: string })
        ?.question_id;
      if (questionId && event.actor_team_index !== undefined) {
        map.set(questionId, event.actor_team_index);
      }
    });
    return map;
  }, [events]);

  const handleCellClick = (question: Question, boxNumber: number) => {
    if (disabled || question.is_used) return;
    if (boxNumber > nextPendingBoxNumber) {
      const message = `يرجى الاختيار بالتسلسل - الدور الآن على السؤال رقم (${nextPendingBoxNumber})`;
      setToastMessage(message);
      onShowAlert?.(message, "warning");
      return;
    }
    onSelect(question);
  };

  return (
    <div
      style={ROOM_LAYOUT_STYLE}
      className="relative h-full min-h-0 w-full overflow-hidden bg-[#01162f] font-[family-name:var(--font-game-display)] overscroll-contain"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            role="status"
            aria-live="polite"
            className="fixed left-1/2 top-3 z-50 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-2 rounded-full border border-amber-200 bg-amber-400 px-4 py-2 text-sm  text-[#0b2d4d] shadow-xl"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-full w-full overflow-hidden bg-[#01162f]">
        <RoomBackdrop />

        <div className="hidden md:block">
          <GlossyTriangle
            id="tri-logo-start"
            color="green"
            className="left-[32.8%] top-[7.6%] z-10 w-[8%] -rotate-[8deg]"
          />
          <GlossyTriangle
            id="tri-logo-small"
            color="green"
            className="left-[38.1%] top-[5.5%] z-20 w-[4.1%] rotate-[16deg]"
          />
          <GlossyBolt
            id="bolt-logo"
            color="green"
            className="right-[36.7%] top-[5.2%] z-20 w-[4.3%] rotate-[8deg]"
          />
          <GlossyTriangle
            id="tri-logo-end"
            color="blue"
            className="right-[33%] top-[10.6%] z-20 w-[6.2%] rotate-[19deg]"
          />

          <GlossyTriangle
            id="tri-left-big"
            color="blue"
            className="left-[0.7%] top-[47.8%] z-10 w-[14.4%] -rotate-[9deg]"
          />
          <GlossyTriangle
            id="tri-left-small"
            color="green"
            className="left-[17.1%] top-[51.3%] z-20 w-[7.2%] rotate-[10deg]"
          />
          <GlossyBolt
            id="bolt-left"
            color="blue"
            className="left-[11.4%] top-[68.3%] z-20 w-[8.7%] -rotate-[7deg]"
          />
          <GlossyTriangle
            id="tri-left-white"
            color="white"
            className="left-[19.1%] top-[81.1%] z-20 w-[4.5%] rotate-[13deg]"
          />

          <GlossyBolt
            id="bolt-right"
            color="green"
            className="right-[12.6%] top-[50.2%] z-20 w-[11.2%] rotate-[8deg]"
          />
          <GlossyTriangle
            id="tri-right-blue"
            color="blue"
            className="right-[2.8%] top-[50.4%] z-20 w-[10.3%] -rotate-[10deg]"
          />
          <GlossyTriangle
            id="tri-right-white"
            color="white"
            className="right-[12.1%] top-[73%] z-20 w-[7.4%] -rotate-[11deg]"
          />
        </div>

        <div className="absolute left-1/2 top-[0.5%] z-30 h-[14%] w-[42%] -translate-x-1/2 md:top-[-2.5%] md:h-[29%] md:w-[30%]">
          <div className="absolute inset-[12%] rounded-full bg-[#31e73b]/35 blur-xl" />
          <Image
            src="/images/logo.png"
            alt="حلهم بينهم"
            fill
            priority
            sizes="(max-width: 768px) 170px, 340px"
            className="object-contain drop-shadow-[0_13px_8px_rgba(0,0,0,0.58)]"
          />
        </div>

        <TeamPanel teamIndex={2} score={team2Score} tone="blue" side="left" />
        <TeamPanel teamIndex={1} score={team1Score} tone="green" side="right" />

        <div className="absolute inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-2 gap-2 md:hidden">
          <CompactTeamPanel teamIndex={1} score={team1Score} tone="green" />
          <CompactTeamPanel teamIndex={2} score={team2Score} tone="blue" />
        </div>

        <section
          aria-label="لوحة الأسئلة"
          className="absolute left-1/2 top-[13.5%] z-30 h-[65.5%] w-[96%] -translate-x-1/2 md:top-[25.8%] md:h-[70.6%] md:w-[var(--room-board-width)] md:rotate-[-0.35deg]"
        >
          <div className="absolute inset-0 rounded-[8%/10%] border-[clamp(2px,0.18vw,3px)] border-white bg-[#f4ffff] shadow-[0_22px_28px_rgba(0,0,0,0.58),inset_0_4px_7px_rgba(255,255,255,1),inset_0_-4px_7px_rgba(98,118,127,0.22)]" />
          <div className="absolute inset-[1.25%] rounded-[7%/9%] bg-gradient-to-r from-[#bceeff] via-[#f4ffff] to-[#c9ffc5] shadow-[inset_0_3px_5px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(74,104,115,0.22)]" />
          <div className="absolute inset-[2.8%] overflow-hidden rounded-[5.8%/7.6%] border-[clamp(1px,0.14vw,2px)] border-white/90 bg-[linear-gradient(90deg,#0b4f7a_0%,#0b466f_49.8%,#0b6439_50.2%,#0b7440_100%)] shadow-[inset_0_8px_15px_rgba(0,0,0,0.42)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(45,178,255,0.16)_0%,rgba(45,178,255,0.05)_49.8%,rgba(89,243,77,0.05)_50.2%,rgba(89,243,77,0.16)_100%)]" />
            <div className="absolute inset-x-0 top-[10.5%] h-[1.2%] bg-gradient-to-r from-[#2a91cc]/70 to-[#59f34d]/45" />
            <div className="absolute inset-x-0 top-[27.2%] h-[1.2%] bg-gradient-to-r from-[#2a91cc]/70 to-[#59f34d]/45" />
            <div className="absolute inset-x-0 top-[44%] h-[1.2%] bg-gradient-to-r from-[#2a91cc]/70 to-[#59f34d]/45" />
            <div className="absolute inset-x-0 top-[60.8%] h-[1.2%] bg-gradient-to-r from-[#2a91cc]/70 to-[#59f34d]/45" />
            <div className="absolute inset-x-0 top-[77.5%] h-[1.2%] bg-gradient-to-r from-[#2a91cc]/70 to-[#59f34d]/45" />
            <div className="absolute inset-x-0 top-[94%] h-[1.2%] bg-gradient-to-r from-[#2a91cc]/70 to-[#59f34d]/45" />
          </div>

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[-4.5%] z-20 h-[8.2%] w-[43%] -translate-x-1/2 drop-shadow-[0_5px_5px_rgba(0,0,0,0.34)]"
          >
            <span className="absolute inset-y-0 left-0 w-[50.5%] rounded-bl-[22%] rounded-tl-[13%] bg-[#44adfe] shadow-[inset_0_3px_4px_rgba(255,255,255,0.32),inset_0_-4px_5px_rgba(3,74,139,0.28)] [clip-path:polygon(5%_0,100%_0,100%_100%,8%_100%,0_66%)]" />
            <span className="absolute inset-y-0 right-0 w-[50.5%] rounded-br-[22%] rounded-tr-[13%] bg-[#59f34d] shadow-[inset_0_3px_4px_rgba(255,255,255,0.3),inset_0_-4px_5px_rgba(5,126,38,0.28)] [clip-path:polygon(0_0,95%_0,100%_66%,92%_100%,0_100%)]" />
            <span className="absolute left-1/2 top-0 h-full w-[6.8%] -translate-x-1/2 bg-[#075a36] [clip-path:polygon(30%_0,70%_0,90%_50%,68%_100%,32%_100%,10%_50%)]" />
            <span className="absolute left-1/2 top-[5%] h-[90%] w-[3.8%] -translate-x-1/2 bg-[#59f34d] [clip-path:polygon(28%_0,72%_0,100%_50%,70%_100%,30%_100%,0_50%)]" />
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-[-6.5%] left-1/2 z-20 h-[9.2%] w-[43%] -translate-x-1/2 drop-shadow-[0_-3px_5px_rgba(0,0,0,0.25)]"
          >
            <span className="absolute left-0 top-0 h-[72%] w-[50.5%] rounded-tl-[22%] bg-[#44adfe] shadow-[inset_0_3px_4px_rgba(255,255,255,0.28),inset_0_-4px_5px_rgba(3,74,139,0.26)] [clip-path:polygon(8%_0,100%_0,100%_100%,5%_100%,0_36%)]" />
            <span className="absolute right-0 top-0 h-[72%] w-[50.5%] rounded-tr-[22%] bg-[#59f34d] shadow-[inset_0_3px_4px_rgba(255,255,255,0.28),inset_0_-4px_5px_rgba(5,126,38,0.26)] [clip-path:polygon(0_0,92%_0,100%_36%,95%_100%,0_100%)]" />
            <span className="absolute left-1/2 top-0 h-full w-[7.2%] -translate-x-1/2 bg-[#075a36] [clip-path:polygon(12%_0,88%_0,68%_72%,50%_100%,32%_72%)]" />
            <span className="absolute left-1/2 top-[4%] h-[90%] w-[4.2%] -translate-x-1/2 bg-[#59f34d] [clip-path:polygon(8%_0,92%_0,70%_70%,50%_100%,30%_70%)]" />
          </div>

          <div className="absolute inset-[calc(2.8%+5px)] z-10 grid grid-cols-5 grid-rows-6 gap-x-[2px] gap-y-px">
            {boardQuestions.map((question, index) => {
              const boxNumber = index + 1;
              const isAnswered = Boolean(question.is_used);
              const isCurrentlyActive = activeQuestionId === question.id;
              const isActiveNext =
                boxNumber === nextPendingBoxNumber && !isAnswered;
              const isLocked = boxNumber > nextPendingBoxNumber;
              const winnerTeamIndex =
                question.awarded_team_index ??
                questionWinnerMap.get(question.id);
              const winnerColor = winnerTeamIndex
                ? teamColors[winnerTeamIndex]
                : undefined;

              return (
                <motion.button
                  key={question.id}
                  type="button"
                  aria-label={`السؤال رقم ${boxNumber}`}
                  disabled={disabled || isAnswered}
                  onClick={() => handleCellClick(question, boxNumber)}
                  whileHover={
                    !disabled && !isAnswered
                      ? { y: -2, scale: 1.02 }
                      : undefined
                  }
                  whileTap={
                    !disabled && !isAnswered ? { y: 4, scale: 0.98 } : undefined
                  }
                  style={
                    isAnswered && winnerColor
                      ? { backgroundColor: winnerColor }
                      : undefined
                  }
                  className={`relative flex h-[78%] w-[92%] min-h-0 min-w-0 items-center justify-center self-center justify-self-center rounded-[13%] border-[clamp(1px,0.12vw,2px)] font-black leading-none transition-[filter,box-shadow] duration-150 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-[clamp(2px,0.25vw,4px)] focus-visible:ring-amber-300 md:h-[90%] ${
                    isAnswered
                      ? winnerColor
                        ? "border-white/35 text-white shadow-[0_6px_0_rgba(0,0,0,0.35),inset_0_3px_4px_rgba(255,255,255,0.3)]"
                        : "border-slate-400 bg-slate-500 text-white shadow-[0_6px_0_#334155]"
                      : isCurrentlyActive
                        ? "border-amber-100 bg-gradient-to-b from-white via-[#fff9d8] to-[#f7db82] text-[#07264a] shadow-[0_7px_0_#cf8f23,0_10px_12px_rgba(0,0,0,0.42),inset_0_4px_5px_rgba(255,255,255,0.94)] ring-[clamp(2px,0.22vw,4px)] ring-amber-300"
                        : isActiveNext
                          ? "border-white bg-gradient-to-b from-white via-[#f4ffff] to-[#e8f1f3] text-[#082555] shadow-[0_7px_0_#d1dadf,0_10px_12px_rgba(0,0,0,0.38),inset_0_4px_5px_rgba(255,255,255,0.98)]"
                          : isLocked
                            ? "cursor-not-allowed border-white bg-gradient-to-b from-white via-[#f4ffff] to-[#e8f1f3] text-[#082555] shadow-[0_7px_0_#d1dadf,0_10px_12px_rgba(0,0,0,0.36),inset_0_4px_5px_rgba(255,255,255,0.97)]"
                            : "border-white bg-gradient-to-b from-white via-[#f4ffff] to-[#e8f1f3] text-[#082555] shadow-[0_7px_0_#d1dadf,0_10px_12px_rgba(0,0,0,0.38),inset_0_4px_5px_rgba(255,255,255,0.98)]"
                  }`}
                >
                  <span className="text-[clamp(14px,2.35vw,40px)] font-black tabular-nums drop-shadow-[0_2px_0_rgba(255,255,255,0.9)]">
                    {boxNumber}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
