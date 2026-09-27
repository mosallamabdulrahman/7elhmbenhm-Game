"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  X,
  RotateCcw,
  Tv,
} from "lucide-react";
import { ActiveQuestionView } from "@/components/battle/referee/ActiveQuestionView";

export interface QuestionPreviewModalProps {
  question: any;
  category?: any;
  onClose: () => void;
}

export function QuestionPreviewModal({
  question,
  category,
  onClose,
}: QuestionPreviewModalProps) {
  const [step, setStep] = useState<"question" | "answer" | "select-winner">(
    "question"
  );
  const [mediaRevealed, setMediaRevealed] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Timer simulation
  const initialSeconds = Number(question?.timer_seconds) || 60;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);

  // Reset timer on question change
  useEffect(() => {
    setSeconds(Number(question?.timer_seconds) || 60);
    setIsPaused(false);
    setStep("question");
    setMediaRevealed(false);
  }, [question]);

  // Real-time countdown
  useEffect(() => {
    if (isPaused || seconds <= 0 || step !== "question") return;
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, seconds, step]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (expandedImage) {
          setExpandedImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedImage, onClose]);

  // Format question object as expected by ActiveQuestionView
  const formattedQuestion = useMemo(() => {
    if (!question) return null;
    return {
      ...question,
      category_name:
        category?.name || question.category_name || "فئة عامة",
      category_id: question.category_id || category?.id,
      group_name:
        category?.group_name || question.group_name || "",
      points:
        question.points ||
        (question.difficulty === "easy"
          ? 200
          : question.difficulty === "medium"
          ? 400
          : 600),
    };
  }, [question, category]);

  const mockTeams = useMemo(
    () => [
      { id: "mock-team-1", name: "الفريق الأول", team_index: 1 },
      { id: "mock-team-2", name: "الفريق الثاني", team_index: 2 },
    ],
    []
  );

  const handleResetPreview = useCallback(() => {
    setStep("question");
    setSeconds(initialSeconds);
    setIsPaused(false);
    setMediaRevealed(false);
  }, [initialSeconds]);

  if (!formattedQuestion) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto dir-rtl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-3.5 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Tv className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="preview-modal-title"
                  className="font-bold text-sm sm:text-base text-white tracking-wide"
                >
                  معاينة السؤال داخل الغرفة
                </h3>
                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  تصميم الغرفة الحي
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تصفح خطوات السؤال والإجابة تماماً كما يشاهدها الحكم والفرق في اللعبة
              </p>
            </div>
          </div>


          {/* Top Actions: Restart & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetPreview}
              title="إعادة المؤقت والبدء من جديد"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="إغلاق المعاينة (Esc)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Active Question View Container */}
        <div className="p-4 sm:p-8 md:p-10 bg-slate-100/95 overflow-y-auto max-h-[75vh]">
          <div className="w-full max-w-3xl mx-auto">
            <ActiveQuestionView
              step={step}
              activeQuestion={formattedQuestion}
              teams={mockTeams}
              answerText={formattedQuestion.answer_text}
              answerImageUrl={formattedQuestion.answer_image_url}
              isBusy={false}
              questionSeconds={seconds}
              timerPaused={isPaused}
              mediaRevealed={mediaRevealed}
              onPauseTimer={() => setIsPaused(true)}
              onResumeTimer={() => setIsPaused(false)}
              onResetTimer={() => setSeconds(initialSeconds)}
              onMediaReveal={() => setMediaRevealed(true)}
              onShowAnswer={() => setStep("answer")}
              onBackToQuestion={() => setStep("question")}
              onOpenTeamSelect={() => setStep("select-winner")}
              onBackToAnswer={() => setStep("answer")}
              onPickWinner={() => {
                setStep("question");
                setSeconds(initialSeconds);
              }}
              onExpandImage={(url: string) => setExpandedImage(url)}
            />
          </div>
        </div>

        {/* Modal Bottom Bar: Stepper Pills */}
        <div className="flex items-center justify-center p-3 sm:py-3.5 bg-slate-950/80 border-t border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setStep("question")}
              className={`px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                step === "question"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1. السؤال
            </button>
            <button
              type="button"
              onClick={() => setStep("answer")}
              className={`px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                step === "answer"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              2. الإجابة
            </button>
            <button
              type="button"
              onClick={() => setStep("select-winner")}
              className={`px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                step === "select-winner"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              3. تحديد الفائز
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lightbox Modal for Media Images */}
      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={expandedImage}
              alt="صورة مكبرة"
              className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold shadow-lg hover:bg-slate-100 cursor-pointer"
              title="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
