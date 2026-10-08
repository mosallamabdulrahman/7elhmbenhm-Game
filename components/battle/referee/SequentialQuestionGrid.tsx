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

      <div className="absolute left-[-2.2%] bottom-[-4%] h-[74%] w-[15%] [clip-path:polygon(0_0,28%_0,91%_58%,54%_100%,0_100%)] bg-gradient-to-r from-white via-[#dcebf1] to-[#748b9f] shadow-[12px_0_22px_rgba(0,0,0,0.48)]" />
      <div className="absolute left-[0.1%] bottom-[-4%] h-[72%] w-[10.7%] [clip-path:polygon(0_0,18%_0,88%_60%,45%_100%,0_100%)] bg-[#082b4b]" />
      <div className="absolute right-[-2.2%] bottom-[-4%] h-[74%] w-[15%] [clip-path:polygon(72%_0,100%_0,100%_100%,46%_100%,9%_58%)] bg-gradient-to-l from-white via-[#dcebf1] to-[#748b9f] shadow-[-12px_0_22px_rgba(0,0,0,0.48)]" />
      <div className="absolute right-[0.1%] bottom-[-4%] h-[72%] w-[10.7%] [clip-path:polygon(82%_0,100%_0,100%_100%,55%_100%,12%_60%)] bg-[#082b4b]" />

      <div className="absolute left-[11%] top-[-4%] h-[14%] w-[10%] rotate-[38deg] rounded-[1.2rem] bg-[#00172f]/70 shadow-[inset_0_2px_4px_rgba(28,102,159,0.25)]" />
      <div className="absolute left-[22%] top-[9%] h-[6%] w-[6%] rotate-[33deg] rounded-[0.8rem] bg-[#063767]/75" />
      <div className="absolute right-[18%] top-[2%] h-[9%] w-[14%] rotate-[-32deg] rounded-[1.2rem] border border-[#0e548f]/70 bg-[#052c58]/75" />
      <div className="absolute right-[12%] bottom-[-2%] h-[8%] w-[9%] rotate-[30deg] rounded-[1rem] bg-[#052851]/80" />
    </div>
  );
}

function TeamPanel({ teamIndex, score }: { teamIndex: 1 | 2; score: number }) {
  const isBlue = teamIndex === 1;
  const label = isBlue ? "الفريق الأول" : "الفريق الثاني";
  return (
    <section
      aria-label={label}
      className={`absolute top-[17.4%] z-20 h-[31.4%] w-[28.2%] ${
        isBlue ? "left-[2.4%]" : "right-[2.4%]"
      }`}
    >
      <div
        className={`relative h-full w-full rounded-[11%] border-[clamp(3px,0.45vw,8px)] p-[8.2%] shadow-[0_20px_28px_rgba(0,0,0,0.55),inset_0_7px_10px_rgba(255,255,255,0.48),inset_0_-10px_15px_rgba(0,0,0,0.34)] ${
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
          <span className="whitespace-nowrap text-[clamp(20px,2.6vw,46px)] font-black leading-none text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.55)]">
            {label}
          </span>
        </div>

        <div
          dir="ltr"
          className={`mt-[5%] flex h-[39%] items-center justify-between overflow-hidden rounded-[999px] border-[clamp(1px,0.14vw,3px)] bg-[#00182f]/90 px-[15%] shadow-[inset_0_7px_16px_rgba(0,0,0,0.78)] ${
            isBlue ? "border-[#147fc7]" : "border-[#14923b]"
          }`}
        >
          <span className="text-[clamp(28px,3.8vw,64px)] font-black leading-none text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.5)]">
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
      className="relative flex h-full min-h-0 w-full items-center justify-center overflow-auto bg-[#01162f] font-[family-name:var(--font-game-display)] overscroll-contain"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            role="status"
            aria-live="polite"
            className="fixed left-1/2 top-3 z-50 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-2 rounded-full border border-amber-200 bg-amber-400 px-4 py-2 text-sm font-black text-[#0b2d4d] shadow-xl"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-[1672/941] h-auto max-h-full w-full min-w-[920px] shrink-0 overflow-hidden bg-[#01162f]">
        <RoomBackdrop />

        <GlossyTriangle
          id="tri-logo-start"
          color="green"
          className="left-[31.7%] top-[8.4%] z-10 w-[6.2%] -rotate-[8deg]"
        />
        <GlossyTriangle
          id="tri-logo-small"
          color="green"
          className="left-[36.3%] top-[6.1%] z-20 w-[3.3%] rotate-[16deg]"
        />
        <GlossyBolt
          id="bolt-logo"
          color="green"
          className="right-[34.1%] top-[5.9%] z-20 w-[3.5%] rotate-[8deg]"
        />
        <GlossyTriangle
          id="tri-logo-end"
          color="blue"
          className="right-[31.8%] top-[12%] z-20 w-[5%] rotate-[19deg]"
        />

        <GlossyTriangle
          id="tri-left-big"
          color="blue"
          className="left-[1%] top-[49%] z-10 w-[13.5%] -rotate-[9deg]"
        />
        <GlossyTriangle
          id="tri-left-small"
          color="green"
          className="left-[17.6%] top-[52.4%] z-20 w-[6.6%] rotate-[10deg]"
        />
        <GlossyBolt
          id="bolt-left"
          color="blue"
          className="left-[11.8%] top-[69.5%] z-20 w-[8%] -rotate-[7deg]"
        />
        <GlossyTriangle
          id="tri-left-white"
          color="white"
          className="left-[19.1%] top-[81.1%] z-20 w-[4.5%] rotate-[13deg]"
        />

        <GlossyBolt
          id="bolt-right"
          color="green"
          className="right-[13%] top-[51.5%] z-20 w-[10.5%] rotate-[8deg]"
        />
        <GlossyTriangle
          id="tri-right-blue"
          color="blue"
          className="right-[3.2%] top-[51.7%] z-20 w-[9.6%] -rotate-[10deg]"
        />
        <GlossyTriangle
          id="tri-right-white"
          color="white"
          className="right-[12.5%] top-[74%] z-20 w-[7%] -rotate-[11deg]"
        />

        <div className="absolute left-1/2 top-[-2.5%] z-30 h-[29%] w-[30%] -translate-x-1/2">
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

        <TeamPanel teamIndex={1} score={team1Score} />
        <TeamPanel teamIndex={2} score={team2Score} />

        <section
          aria-label="لوحة الأسئلة"
          className="absolute left-1/2 top-[25.8%] z-30 h-[70.6%] w-[49.8%] -translate-x-1/2"
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

          <div className="absolute inset-x-[11.4%] top-[7.2%] bottom-[9.2%] z-10 grid grid-cols-5 grid-rows-6 gap-x-[2.7%] gap-y-[2.2%]">
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
                  className={`relative flex min-h-0 min-w-0 items-center justify-center rounded-[13%] border-[clamp(1px,0.12vw,2px)] font-black leading-none transition-[filter,box-shadow] duration-150 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-[clamp(2px,0.25vw,4px)] focus-visible:ring-amber-300 ${
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
                  <span className="text-[clamp(17px,2.35vw,40px)] font-black tabular-nums drop-shadow-[0_2px_0_rgba(255,255,255,0.85)]">
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
