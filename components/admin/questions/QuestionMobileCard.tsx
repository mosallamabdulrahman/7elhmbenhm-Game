"use client";

import React from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Video, Music, Timer } from "lucide-react";
import { DIFFICULTY_AR } from "@/lib/admin-constants";

interface QuestionMobileCardProps {
  q: any;
  cat?: any;
  stat?: any;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  setQModal: (q: any) => void;
  deleteQuestion: (id: string) => void;
  busy: boolean;
  difficultyEditFor: string | null;
  setDifficultyEditFor: React.Dispatch<React.SetStateAction<string | null>>;
  onInlineDifficultyChange: (q: any, level: string) => void;
  statusEditFor: string | null;
  setStatusEditFor: React.Dispatch<React.SetStateAction<string | null>>;
  onInlineStatusChange: (q: any, isActive: boolean) => void;
}

export function QuestionMobileCard({
  q,
  cat,
  stat,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  setQModal,
  deleteQuestion,
  busy,
  difficultyEditFor,
  setDifficultyEditFor,
  onInlineDifficultyChange,
  statusEditFor,
  setStatusEditFor,
  onInlineStatusChange,
}: QuestionMobileCardProps) {
  const suggestedDifficulty: "easy" | "medium" | "hard" | null =
    stat && stat.used > 0
      ? stat.correct / stat.used >= 0.66
        ? "easy"
        : stat.correct / stat.used >= 0.33
          ? "medium"
          : "hard"
      : null;

  return (
    <div
      className={`p-3.5 space-y-2 ${isSelected ? "bg-[#f0f6fc]" : ""}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <input
          type="checkbox"
          aria-label="تحديد هذا السؤال"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 mt-1 rounded border-[#ccd0d4] text-[#2271b1] focus:ring-[#2271b1] cursor-pointer shrink-0 align-middle"
        />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="font-bold text-[14px] text-[#1d2327] leading-snug">
            {q.question_text}
          </div>

          {cat && (
            <span className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-800 px-2 py-0.5 rounded-full font-medium text-[11px]">
              {cat.image_url && (
                <img
                  src={cat.image_url}
                  alt=""
                  className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                />
              )}
              {cat.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-0.5 relative">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setStatusEditFor((cur) =>
                cur === `m_${q.id}` ? null : `m_${q.id}`,
              )
            }
            className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full cursor-pointer transition ${
              q.is_active
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {q.is_active ? "مفعّل" : "معطّل"}
          </button>

          {statusEditFor === `m_${q.id}` && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setStatusEditFor(null)}
              />
              <div className="absolute left-0 top-full -mt-0.5 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
                <button
                  type="button"
                  onClick={() => {
                    onInlineStatusChange(q, true);
                    setStatusEditFor(null);
                  }}
                  className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                    q.is_active
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-700"
                  }`}
                >
                  مفعّل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onInlineStatusChange(q, false);
                    setStatusEditFor(null);
                  }}
                  className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                    !q.is_active
                      ? "text-rose-700 bg-rose-50"
                      : "text-slate-700"
                  }`}
                >
                  معطّل
                </button>
              </div>
            </>
          )}

          {/* Circular Collapse / Expand Button */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-7 h-7 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition shrink-0 cursor-pointer"
            aria-label={isExpanded ? "طي التفاصيل" : "عرض التفاصيل"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#2271b1]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Action Links */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-0.5">
        <button
          type="button"
          onClick={() => setQModal(q)}
          className="text-[#2271b1] hover:underline cursor-pointer"
        >
          تحرير
        </button>
        <span>|</span>
        <button
          type="button"
          onClick={() => deleteQuestion(q.id)}
          disabled={busy}
          className="text-rose-600 hover:underline disabled:opacity-50 cursor-pointer"
        >
          حذف
        </button>
      </div>

      {/* Collapsible Key-Value Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="pt-2 border-t border-slate-100 space-y-2 text-[12px]"
        >
          <div className="flex justify-between items-start py-1 border-b border-slate-50">
            <span className="font-bold text-slate-500">الإجابة:</span>
            <span className="font-bold text-emerald-700 text-left max-w-[65%]">
              {q.answer_text}
            </span>
          </div>

          {q.answer_image_url && (
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="font-bold text-slate-500">صورة الإجابة:</span>
              <a
                href={q.answer_image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2271b1] hover:underline flex items-center gap-1.5 font-semibold"
              >
                <img
                  src={q.answer_image_url}
                  alt="الإجابة"
                  className="w-9 h-9 object-cover rounded border border-slate-200"
                />
                <span>معاينة</span>
              </a>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-slate-50 relative">
            <span className="font-bold text-slate-500">الصعوبة:</span>
            <div className="relative inline-block">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setDifficultyEditFor((cur) =>
                    cur === q.id ? null : q.id,
                  )
                }
                className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded text-[11px] transition cursor-pointer disabled:opacity-50 ${
                  q.difficulty === "easy"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : q.difficulty === "medium"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                }`}
              >
                <span>
                  {DIFFICULTY_AR[q.difficulty]} ({q.strikes}⚡)
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {difficultyEditFor === q.id && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDifficultyEditFor(null)}
                  />
                  <div className="absolute left-0 top-full -mt-0.5 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
                    {(["easy", "medium", "hard"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onInlineDifficultyChange(q, level)}
                        className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                          q.difficulty === level
                            ? "text-cyan-700 bg-cyan-50"
                            : "text-slate-700"
                        }`}
                      >
                        {DIFFICULTY_AR[level]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="font-bold text-slate-500">الموضع:</span>
            <span className="text-slate-700 font-bold">#{q.position}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="font-bold text-slate-500">الوسائط:</span>
            <div>
              {q.media_url ? (
                <>
                  <a
                    href={q.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#2271b1] hover:underline font-semibold"
                  >
                    {q.media_type === "image" ? (
                      <>
                        <img
                          src={q.media_url}
                          alt={q.media_type}
                          className="w-8 h-8 rounded object-cover border border-slate-200"
                        />
                        {q.image_duration ? (
                          <span className="text-[11px] font-bold text-slate-500">
                            ({q.image_duration} ث)
                          </span>
                        ) : null}
                      </>
                    ) : q.media_type === "video" ? (
                      <>
                        <Video className="w-3.5 h-3.5" />
                        <span>
                          فيديو
                          {q.media_play_count
                            ? ` × ${q.media_play_count}`
                            : ""}
                        </span>
                      </>
                    ) : (
                      <>
                        <Music className="w-3.5 h-3.5" />
                        <span>
                          صوت
                          {q.media_play_count
                            ? ` × ${q.media_play_count}`
                            : ""}
                        </span>
                      </>
                    )}
                  </a>
                  {q.show_question_first && (
                    <span className="block mt-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-1.5 py-0.5 rounded w-fit">
                      السؤال أولاً
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>

          <div className="py-1 border-b border-slate-50 space-y-1">
            <span className="font-bold text-slate-500 block">
              إحصائيات الأداء:
            </span>
            {stat && stat.used > 0 ? (
              <div className="space-y-1 bg-slate-50 p-2 rounded-lg">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>عدد مرات الاختيار:</span>
                  <span className="font-bold text-slate-900">{stat.used}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                  <span>تمت الإجابة صح:</span>
                  <span className="font-bold">{stat.correct}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-rose-600">
                  <span>لم تتم الإجابة صح:</span>
                  <span className="font-bold">{stat.incorrect}</span>
                </div>
                {suggestedDifficulty && (
                  <span
                    className={`inline-block w-full text-center font-semibold px-2 py-0.5 rounded text-[10px] mt-1 ${
                      suggestedDifficulty === "easy"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : suggestedDifficulty === "medium"
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "bg-rose-50 text-rose-600 border border-rose-200"
                    }`}
                  >
                    مستوى مقترح: {DIFFICULTY_AR[suggestedDifficulty]}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400 text-[11px]">
                لا توجد بيانات بعد
              </span>
            )}
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-slate-500">الحالة والمؤقت:</span>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 shrink-0"
                title="مدة مؤقت السؤال بالثواني"
              >
                <Timer className="w-3 h-3 text-cyan-600" />
                {q.timer_seconds || 60}ث
              </span>
              <div className="relative inline-block">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setStatusEditFor((cur) =>
                    cur === `exp_${q.id}` ? null : `exp_${q.id}`,
                  )
                }
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  q.is_active
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    q.is_active ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                <span>{q.is_active ? "مفعّل" : "معطّل"}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {statusEditFor === `exp_${q.id}` && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setStatusEditFor(null)}
                  />
                  <div className="absolute left-0 top-full -mt-0.5 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onInlineStatusChange(q, true);
                        setStatusEditFor(null);
                      }}
                      className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                        q.is_active
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-slate-700"
                      }`}
                    >
                      مفعّل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onInlineStatusChange(q, false);
                        setStatusEditFor(null);
                      }}
                      className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                        !q.is_active
                          ? "text-rose-700 bg-rose-50"
                          : "text-slate-700"
                      }`}
                    >
                      معطّل
                    </button>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
