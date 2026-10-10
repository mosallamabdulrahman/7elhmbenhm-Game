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
    light: "#70e5ff",
    face: "#20a9f4",
    deep: "#0873cf",
    edge: "#04569d",
  },
  green: {
    light: "#94ff6e",
    face: "#35eb35",
    deep: "#13a72d",
    edge: "#087c26",
  },
  white: {
    light: "#ffffff",
    face: "#f8fbff",
    deep: "#cbd8e4",
    edge: "#91a7ba",
  },
};

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
        <linearGradient id={`${id}-face`} x1="18" y1="12" x2="83" y2="92">
          <stop offset="0" stopColor={palette.light} />
          <stop offset="0.5" stopColor={palette.face} />
          <stop offset="1" stopColor={palette.deep} />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="50" y1="66" x2="50" y2="94">
          <stop stopColor={palette.deep} />
          <stop offset="1" stopColor={palette.edge} />
        </linearGradient>
      </defs>
      <path
        d="M50 8C54 8 57 11 60 15L93 70C97 77 93 87 84 89L21 96C11 97 5 88 10 79L43 16C45 11 47 8 50 8Z"
        fill={`url(#${id}-edge)`}
      />
      <path
        d="M50 5C54 5 57 8 60 12L91 67C95 74 91 82 83 83L21 90C12 91 7 82 11 74L43 13C45 8 47 5 50 5Z"
        fill={`url(#${id}-face)`}
        stroke={palette.light}
        strokeOpacity="0.7"
        strokeWidth="2"
      />
      <path
        d="M49 12L82 68C83 70 82 72 80 72L25 78L49 12Z"
        fill="#ffffff"
        fillOpacity="0.18"
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
      <defs>
        <linearGradient id={`${id}-bolt`} x1="22" y1="8" x2="78" y2="111">
          <stop stopColor={palette.light} />
          <stop offset="0.44" stopColor={palette.face} />
          <stop offset="1" stopColor={palette.deep} />
        </linearGradient>
      </defs>
      <path
        d="M56 5L20 61C17 66 20 72 26 72H45L34 108C31 118 42 122 48 114L84 62C88 57 84 51 78 51H59L69 13C72 3 61-3 56 5Z"
        fill={palette.edge}
        transform="translate(0 7)"
      />
      <path
        d="M56 5L20 61C17 66 20 72 26 72H45L34 108C31 118 42 122 48 114L84 62C88 57 84 51 78 51H59L69 13C72 3 61-3 56 5Z"
        fill={`url(#${id}-bolt)`}
        stroke={palette.light}
        strokeOpacity="0.65"
        strokeWidth="2"
      />
      <path
        d="M58 12L27 61H48L40 99L76 59H54L64 15Z"
        fill="#ffffff"
        fillOpacity="0.2"
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
  return (
    <section
      aria-label={label}
      className={`absolute top-[16.8%] z-20 hidden h-[30.5%] md:block ${
        side === "left"
          ? "left-[1.4%] w-[min(27.8%,60dvh)]"
          : "right-[1.7%] w-[min(27.3%,59dvh)]"
      }`}
    >
      <div
        className={`relative h-full w-full rounded-[11%] border-[clamp(3px,0.45vw,8px)] p-[7.7%] shadow-[0_20px_28px_rgba(0,0,0,0.55),inset_0_7px_10px_rgba(255,255,255,0.48),inset_0_-10px_15px_rgba(0,0,0,0.34)] ${
          isBlue
            ? "border-[#55dfff] bg-gradient-to-br from-[#42d9ff] via-[#1aa8ed] to-[#0870cf]"
            : "border-[#7aff66] bg-gradient-to-br from-[#6dff5b] via-[#2ce33b] to-[#0ba52b]"
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
          className={`mt-[5%] flex h-[39%] items-center justify-between overflow-hidden rounded-[999px] border-[clamp(1px,0.14vw,3px)] bg-[#00182f]/90 px-[15%] shadow-[inset_0_7px_16px_rgba(0,0,0,0.78)] ${
            isBlue ? "border-[#147fc7]" : "border-[#14923b]"
          }`}
        >
          <span className="text-[clamp(28px,3.8vw,64px)]  leading-none text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.5)]">
            {score}
          </span>
          <div className="flex items-center gap-[clamp(3px,0.55vw,10px)]">
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
          ? "border-[#55dfff] bg-gradient-to-br from-[#42d9ff] via-[#1aa8ed] to-[#0870cf]"
          : "border-[#7aff66] bg-gradient-to-br from-[#6dff5b] via-[#2ce33b] to-[#0ba52b]"
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
        className={`mt-1 flex h-7 items-center justify-between rounded-full border bg-[#00182f]/90 px-3 shadow-[inset_0_4px_8px_rgba(0,0,0,0.72)] ${
          isBlue ? "border-[#147fc7]" : "border-[#14923b]"
        }`}
      >
        <span className="text-lg  leading-none text-white">{score}</span>
        <div className="flex items-center gap-1">
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
      dir="rtl"
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
          className="absolute left-1/2 top-[13.5%] z-30 h-[65.5%] w-[96%] -translate-x-1/2 md:top-[25.8%] md:h-[70.6%] md:w-[min(49%,88dvh)]"
        >
          <div className="absolute inset-0 rounded-[8%/10%] bg-gradient-to-r from-[#27bfff] via-[#f5ffff] to-[#55ef45] shadow-[0_24px_30px_rgba(0,0,0,0.62),inset_0_5px_8px_rgba(255,255,255,0.95),inset_0_-7px_10px_rgba(0,0,0,0.28)]" />
          <div className="absolute inset-[2.2%] rounded-[7%/9%] bg-gradient-to-b from-[#f8ffff] via-[#c9eced] to-[#f5ffff] shadow-[inset_0_4px_6px_rgba(255,255,255,0.95),inset_0_-5px_8px_rgba(30,69,90,0.34)]" />
          <div className="absolute inset-[4.6%] overflow-hidden rounded-[5.8%/7.6%] border-[clamp(2px,0.24vw,4px)] border-[#082c4e] bg-[linear-gradient(90deg,#08395f_0%,#07345a_49.8%,#064224_50.2%,#07542d_100%)] shadow-[inset_0_11px_20px_rgba(0,0,0,0.62)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,155,238,0.13)_0%,transparent_48%,transparent_52%,rgba(45,239,65,0.12)_100%)]" />
            <div className="absolute inset-x-0 top-[10.5%] h-[1.7%] bg-gradient-to-r from-[#177ec3] via-[#1f82bd] to-[#258d4a] shadow-[0_2px_4px_rgba(0,0,0,0.42)]" />
            <div className="absolute inset-x-0 top-[27.2%] h-[1.7%] bg-gradient-to-r from-[#177ec3] via-[#1f82bd] to-[#258d4a] shadow-[0_2px_4px_rgba(0,0,0,0.42)]" />
            <div className="absolute inset-x-0 top-[44%] h-[1.7%] bg-gradient-to-r from-[#177ec3] via-[#1f82bd] to-[#258d4a] shadow-[0_2px_4px_rgba(0,0,0,0.42)]" />
            <div className="absolute inset-x-0 top-[60.8%] h-[1.7%] bg-gradient-to-r from-[#177ec3] via-[#1f82bd] to-[#258d4a] shadow-[0_2px_4px_rgba(0,0,0,0.42)]" />
            <div className="absolute inset-x-0 top-[77.5%] h-[1.7%] bg-gradient-to-r from-[#177ec3] via-[#1f82bd] to-[#258d4a] shadow-[0_2px_4px_rgba(0,0,0,0.42)]" />
            <div className="absolute inset-x-0 top-[94%] h-[1.7%] bg-gradient-to-r from-[#177ec3] via-[#1f82bd] to-[#258d4a] shadow-[0_2px_4px_rgba(0,0,0,0.42)]" />
          </div>

          <div
            dir="ltr"
            className="absolute left-1/2 top-[-1.5%] z-20 flex h-[7.2%] w-[42%] -translate-x-1/2 overflow-hidden rounded-b-[24%] shadow-[0_5px_8px_rgba(0,0,0,0.34)]"
          >
            <span className="h-full flex-1 bg-gradient-to-b from-[#50dcff] to-[#0b93df]" />
            <span className="h-full w-[2.7%] bg-[#073755]" />
            <span className="h-full flex-1 bg-gradient-to-b from-[#7aff61] to-[#1fd337]" />
          </div>
          <div
            dir="ltr"
            className="absolute bottom-[-1.5%] left-1/2 z-20 flex h-[7.2%] w-[42%] -translate-x-1/2 overflow-hidden rounded-t-[24%] shadow-[0_-4px_8px_rgba(0,0,0,0.28)]"
          >
            <span className="h-full flex-1 bg-gradient-to-t from-[#0b93df] to-[#50dcff]" />
            <span className="h-full w-[2.7%] bg-[#073755]" />
            <span className="h-full flex-1 bg-gradient-to-t from-[#1fd337] to-[#7aff61]" />
          </div>

          <div className="absolute inset-x-[7.5%] top-[7.5%] bottom-[8.8%] z-10 grid grid-cols-5 grid-rows-6 gap-x-[1%] gap-y-[3.6%]">
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
                  className={`relative flex h-full w-[96%] min-h-0 min-w-0 items-center justify-center justify-self-center rounded-[13%] border-[clamp(1px,0.12vw,2px)]  leading-none transition-[filter,box-shadow] duration-150 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-[clamp(2px,0.25vw,4px)] focus-visible:ring-amber-300 ${
                    isAnswered
                      ? winnerColor
                        ? "border-white/35 text-white shadow-[0_6px_0_rgba(0,0,0,0.35),inset_0_3px_4px_rgba(255,255,255,0.3)]"
                        : "border-slate-400 bg-slate-500 text-white shadow-[0_6px_0_#334155]"
                      : isCurrentlyActive
                        ? "border-amber-100 bg-gradient-to-b from-white via-[#fff9d8] to-[#f7db82] text-[#07264a] shadow-[0_7px_0_#cf8f23,0_10px_12px_rgba(0,0,0,0.42),inset_0_4px_5px_rgba(255,255,255,0.94)] ring-[clamp(2px,0.22vw,4px)] ring-amber-300"
                        : isActiveNext
                          ? "border-[#dff7fa] bg-gradient-to-b from-white via-[#f8ffff] to-[#d8e8e9] text-[#07264a] shadow-[0_7px_0_#91a8b4,0_10px_12px_rgba(0,0,0,0.42),inset_0_4px_5px_rgba(255,255,255,0.96)]"
                          : isLocked
                            ? "cursor-not-allowed border-[#d9edf0] bg-gradient-to-b from-white via-[#f7fdfd] to-[#d6e5e6] text-[#08284a] shadow-[0_7px_0_#91a8b4,0_10px_12px_rgba(0,0,0,0.4),inset_0_4px_5px_rgba(255,255,255,0.95)]"
                            : "border-[#dff7fa] bg-gradient-to-b from-white via-[#f8ffff] to-[#d8e8e9] text-[#07264a] shadow-[0_7px_0_#91a8b4,0_10px_12px_rgba(0,0,0,0.42),inset_0_4px_5px_rgba(255,255,255,0.96)]"
                  }`}
                >
                  <span className="text-[clamp(14px,2.35vw,40px)]  tabular-nums drop-shadow-[0_2px_0_rgba(255,255,255,0.85)]">
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
