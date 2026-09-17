"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { MediaPlayer } from "../CombatShared";
import { TimerPill } from "./TimerPill";

export interface ActiveQuestionViewProps {
  step: "question" | "answer" | "select-winner";
  activeQuestion: any;
  teams: any[];
  answerText?: string | null;
  answerImageUrl?: string | null;
  isBusy: boolean;
  questionSeconds: number;
  timerPaused: boolean;
  mediaRevealed: boolean;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onMediaReveal: () => void;
  onShowAnswer: () => void;
  onBackToQuestion: () => void;
  onOpenTeamSelect: () => void;
  onBackToAnswer: () => void;
  onPickWinner: (teamIndexOrNone: number | "none") => void;
  onExpandImage: (url: string) => void;
}

export function ActiveQuestionView({
  step,
  activeQuestion,
  teams,
  answerText,
  answerImageUrl,
  isBusy,
  questionSeconds,
  timerPaused,
  mediaRevealed,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onMediaReveal,
  onShowAnswer,
  onBackToQuestion,
  onOpenTeamSelect,
  onBackToAnswer,
  onPickWinner,
  onExpandImage,
}: ActiveQuestionViewProps) {
  if (!activeQuestion) return null;

  return (
    <AnimatePresence mode="wait">
      {step === "question" && (
        <motion.div
          key="question"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="relative mx-auto rounded-[2rem] sm:rounded-[2.5rem] border-4 border-cyan-500 bg-white p-8 sm:p-10 md:px-12 text-center shadow-2xl"
        >
          {/* Top Center: TimerPill on top border */}
          <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 z-20 shrink-0">
            <TimerPill
              seconds={questionSeconds}
              isPaused={timerPaused}
              onPause={onPauseTimer}
              onResume={onResumeTimer}
              onReset={onResetTimer}
            />
          </div>

          {/* Top Right: Points badge */}
          <span className="absolute -top-4 sm:-top-5 right-3 sm:right-6 md:right-8 z-20 rounded-xl bg-slate-950 px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm md:text-base font-bold text-white shadow-lg">
            {activeQuestion.points ||
              (activeQuestion.difficulty === "easy"
                ? 200
                : activeQuestion.difficulty === "medium"
                ? 400
                : 600)}{" "}
            نقطة
          </span>

          {activeQuestion.category_name === "ولا كلمة" ||
          activeQuestion.category_name?.includes("ولا كلمة") ||
          activeQuestion.group_name === "ولا كلمة" ||
          activeQuestion.category_id === "wla_kelma" ? (
            <div className="flex flex-col items-center justify-center w-full py-1 sm:py-3">
              <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pb-4">
                {/* Rules Pills Stack */}
                <div className="flex-1 w-full flex flex-col gap-3.5 max-w-md">
                  <div className="w-full rounded-full bg-white border-2 border-slate-200/90 py-2.5 sm:py-3 pr-11 sm:pr-14 pl-3 sm:pl-5 text-slate-800 font-bold text-xs sm:text-sm md:text-base shadow-sm relative flex items-center justify-center text-center">
                    <span className="leading-snug">
                      اختر شخص غير مكرر لتمثيل فريقك
                    </span>
                    <div className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#f25c05] text-white text-sm sm:text-base md:text-lg flex items-center justify-center shadow-sm shrink-0 font-bold">
                      1
                    </div>
                  </div>
                  <div className="w-full rounded-full bg-white border-2 border-slate-200/90 py-2.5 sm:py-3 pr-11 sm:pr-14 pl-3 sm:pl-5 text-slate-800 font-bold text-xs sm:text-sm md:text-base shadow-sm relative flex items-center justify-center text-center">
                    <span className="leading-snug">
                      هذا الشخص الوحيد المسموح له تصوير الباركود
                    </span>
                    <div className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#f25c05] text-white text-sm sm:text-base md:text-lg flex items-center justify-center shadow-sm shrink-0 font-bold">
                      2
                    </div>
                  </div>
                  <div className="w-full rounded-full bg-white border-2 border-slate-200/90 py-2.5 sm:py-3 pr-11 sm:pr-14 pl-3 sm:pl-5 text-slate-800 font-bold text-xs sm:text-sm md:text-base shadow-sm relative flex items-center justify-center text-center">
                    <span className="leading-snug">
                      بعد تصوير الباركود ورؤية السؤال اضغط جاهز
                    </span>
                    <div className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#f25c05] text-white text-sm sm:text-base md:text-lg flex items-center justify-center shadow-sm shrink-0 font-bold">
                      3
                    </div>
                  </div>
                </div>

                {/* QR Code Card */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-lg bg-white border-4 border-slate-200 shadow-2xl flex items-center justify-center p-4 mb-2">
                    <QRCodeSVG
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/wlakelma/${activeQuestion.id}`
                          : `/wlakelma/${activeQuestion.id}`
                      }
                      size={145}
                      level="M"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="absolute -bottom-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs sm:text-sm px-8 py-1.5 rounded-full shadow-lg tracking-wide font-bold">
                    السؤال
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-950 leading-relaxed px-2">
                {activeQuestion.question_text}
              </h2>
              {activeQuestion.media_url &&
                (activeQuestion.show_question_first && !mediaRevealed ? (
                  <div className="mt-6 flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={onMediaReveal}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 active:scale-95 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-cyan-600/25 transition-all duration-200 cursor-pointer"
                    >
                      <Play className="h-5 w-5 fill-white" />
                      <span>عرض الوسائط</span>
                    </button>
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      (نص السؤال يظهر أولاً — اضغط لعرض الوسائط)
                    </p>
                  </div>
                ) : (
                  <MediaPlayer
                    key={activeQuestion.id}
                    mediaUrl={activeQuestion.media_url}
                    mediaType={activeQuestion.media_type}
                    imageDuration={activeQuestion.image_duration}
                    mediaPlayCount={activeQuestion.media_play_count}
                    onImageClick={onExpandImage}
                  />
                ))}
            </>
          )}

          {/* Bottom Right: Category badge */}
          <span className="absolute -bottom-4 sm:-bottom-5 right-3 sm:right-6 md:right-8 z-20 rounded-xl bg-rose-500 px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg">
            {activeQuestion.category_name}
          </span>

          {/* Bottom Left: Show Answer button */}
          <button
            type="button"
            onClick={onShowAnswer}
            className="absolute -bottom-4 sm:-bottom-5 left-3 sm:left-6 md:left-8 z-20 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 px-4 py-2 sm:px-7 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition cursor-pointer"
          >
            إظهار الإجابة
          </button>
        </motion.div>
      )}

      {step === "answer" && (
        <motion.div
          key="answer"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="relative mx-auto rounded-[2rem] sm:rounded-[2.5rem] border-4 border-emerald-500 bg-white p-4 sm:p-10 md:px-12 text-center shadow-2xl"
        >
          <div className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
            {answerText || "قاعدين نحمل الإجابة..."}
            {answerImageUrl && (
              <img
                src={answerImageUrl}
                alt="صورة الإجابة"
                className="mt-4 max-h-64 object-contain rounded-xl mx-auto cursor-pointer hover:opacity-90 active:scale-[0.99] transition shadow-sm"
                onClick={() => onExpandImage(answerImageUrl)}
                title="اضغط لتكبير الصورة"
              />
            )}
          </div>

          {/* Bottom Right: Return to Question */}
          <button
            type="button"
            onClick={onBackToQuestion}
            className="absolute -bottom-4 sm:-bottom-5 right-3 sm:right-6 md:right-8 z-20 rounded-xl px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg hover:shadow-xl transition active:scale-95 disabled:opacity-60 bg-red-800 hover:bg-red-900 cursor-pointer"
          >
            ارجع للسؤال
          </button>

          {/* Bottom Left: Which team? */}
          <button
            type="button"
            onClick={onOpenTeamSelect}
            className="absolute -bottom-4 sm:-bottom-5 left-3 sm:left-6 md:left-8 z-20 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-3.5 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95 cursor-pointer"
          >
            أي فريق؟
          </button>
        </motion.div>
      )}

      {step === "select-winner" && (
        <motion.div
          key="select-winner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="relative mx-auto rounded-[2rem] sm:rounded-[2.5rem] border-4 border-rose-500 bg-white pt-10 sm:pt-14 pb-14 sm:pb-16 px-6 sm:px-12 text-center shadow-2xl"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-950 mb-8 sm:mb-10">
            أي فريق جاوب صح ؟
          </h2>

          <div className="max-w-xl mx-auto flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onPickWinner(team.team_index)}
                  className="rounded-full py-4 sm:py-5 px-4 text-sm sm:text-lg font-bold text-white shadow-lg hover:shadow-xl transition active:scale-95 disabled:opacity-60 bg-red-800 hover:bg-red-900 cursor-pointer"
                >
                  {team.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => onPickWinner("none")}
              className="w-full rounded-full bg-slate-500 hover:bg-slate-600 py-4 sm:py-5 text-sm sm:text-lg font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              ولا أحد
            </button>
          </div>

          {/* Bottom Left: Back to answer */}
          <button
            type="button"
            onClick={onBackToAnswer}
            className="absolute -bottom-4 sm:-bottom-5 left-4 sm:left-8 z-20 rounded-full bg-emerald-900 hover:bg-emerald-950 px-5 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95 cursor-pointer"
          >
            العودة للإجابة
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
