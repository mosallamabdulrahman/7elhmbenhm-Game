"use client";

import React from "react";
import { ChevronDown, Video, Music, Timer } from "lucide-react";
import { DIFFICULTY_AR } from "@/lib/admin-constants";

interface QuestionTableRowProps {
  q: any;
  cat?: any;
  stat?: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  setQModal: (q: any) => void;
  deleteQuestion: (id: string) => void;
  busy: boolean;
  difficultyEditFor: string | null;
  setDifficultyEditFor: (val: React.SetStateAction<string | null>) => void;
  onInlineDifficultyChange: (q: any, level: string) => void;
  statusEditFor: string | null;
  setStatusEditFor: (val: React.SetStateAction<string | null>) => void;
  onInlineStatusChange: (q: any, isActive: boolean) => void;
}

export function QuestionTableRow({
  q,
  cat,
  stat,
  isSelected,
  onToggleSelect,
  setQModal,
  deleteQuestion,
  busy,
  difficultyEditFor,
  setDifficultyEditFor,
  onInlineDifficultyChange,
  statusEditFor,
  setStatusEditFor,
  onInlineStatusChange,
}: QuestionTableRowProps) {
  const suggestedDifficulty: "easy" | "medium" | "hard" | null =
    stat && stat.used > 0
      ? stat.correct / stat.used >= 0.66
        ? "easy"
        : stat.correct / stat.used >= 0.33
          ? "medium"
          : "hard"
      : null;

  return (
    <tr
      className={`group hover:bg-[#f6f7f7] transition-colors ${
        isSelected ? "bg-[#f0f6fc]" : ""
      }`}
    >
      <td className="p-3 w-10 text-center">
        <input
          type="checkbox"
          aria-label="تحديد هذا السؤال"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-[#ccd0d4] text-[#2271b1] focus:ring-[#2271b1] cursor-pointer align-middle"
        />
      </td>
      <td className="p-3 max-w-sm">
        {cat?.name === "ولا كلمة" ||
        cat?.name?.includes("ولا كلمة") ||
        cat?.group_id === "d6a55dbb-85dd-4245-985e-e3d7e5d1e000" ? (
          <div className="font-bold text-[#1d2327] mb-1 flex items-center gap-1.5">
            <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full">
              ولا كلمة
            </span>
            <span className="line-clamp-1">
              {q.answer_text || q.question_text || "ولا كلمة"}
            </span>
          </div>
        ) : (
          <div className="font-semibold text-[#1d2327] mb-1 line-clamp-2">
            {q.question_text}
          </div>
        )}
        {q.answer_text && (
          <div className="text-[11px] text-emerald-700 font-bold mb-1">
            الإجابة: {q.answer_text}
          </div>
        )}
        {/* Inline Hover Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-semibold mt-1">
          <button
            type="button"
            onClick={() => setQModal(q)}
            className="text-[#2271b1] hover:text-[#135e96] cursor-pointer"
          >
            تحرير
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => deleteQuestion(q.id)}
            disabled={busy}
            className="text-rose-600 hover:text-rose-800 disabled:opacity-50 cursor-pointer"
          >
            حذف
          </button>
        </div>
      </td>
      <td className="p-3 text-slate-600">
        {cat ? (
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
        ) : (
          <span className="text-slate-400">غير معروف</span>
        )}
      </td>
      <td className="p-3">
        <div className="relative inline-block">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setDifficultyEditFor((cur) => (cur === q.id ? null : q.id))
            }
            className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded text-[11px] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
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
              <div className="absolute right-0 top-full mt-1 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
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
      </td>
      <td className="p-3 text-slate-500">#{q.position}</td>
      <td className="p-3">
        {q.media_url ? (
          <>
            <a
              href={q.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#2271b1] hover:underline"
            >
              {q.media_type === "image" ? (
                <>
                  <img
                    src={q.media_url}
                    alt={q.media_type}
                    className="w-14 h-14"
                  />
                  {q.image_duration ? (
                    <span className="text-[11px] font-bold text-slate-500">
                      {q.image_duration} ث
                    </span>
                  ) : null}
                </>
              ) : q.media_type === "video" ? (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>
                    فيديو
                    {q.media_play_count ? ` × ${q.media_play_count}` : ""}
                  </span>
                </>
              ) : (
                <>
                  <Music className="w-3.5 h-3.5" />
                  <span>
                    صوت
                    {q.media_play_count ? ` × ${q.media_play_count}` : ""}
                  </span>
                </>
              )}
            </a>
            {q.show_question_first && (
              <span className="block mt-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-1.5 py-0.5 rounded w-fit">
                الميديا أولاً
              </span>
            )}
          </>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="p-3">
        {stat && stat.used > 0 ? (
          <div className="space-y-1 min-w-[150px]">
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-600">
              <span>عدد مرات الاختيار</span>
              <span className="font-bold text-slate-900">{stat.used}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-emerald-700">
              <span>تمت الإجابة صح</span>
              <span className="font-bold">{stat.correct}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-rose-600">
              <span>لم تتم الإجابة صح</span>
              <span className="font-bold">{stat.incorrect}</span>
            </div>
            <span
              className={`inline-block w-full text-center font-semibold px-2 py-0.5 rounded text-[10px] mt-1.5 ${
                suggestedDifficulty === "easy"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : suggestedDifficulty === "medium"
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-rose-50 text-rose-600 border border-rose-200"
              }`}
            >
              مستوى مقترح: {suggestedDifficulty ? DIFFICULTY_AR[suggestedDifficulty] : ""}
            </span>
          </div>
        ) : (
          <span className="text-slate-300 text-[11px]">لا بيانات بعد</span>
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative inline-block">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                setStatusEditFor((cur) => (cur === q.id ? null : q.id))
              }
              className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded text-[11px] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
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

            {statusEditFor === q.id && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setStatusEditFor(null)}
                />
                <div className="absolute right-0 top-full mt-1 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
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

          <span
            className="inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 shrink-0"
            title="مدة مؤقت السؤال بالثواني"
          >
            <Timer className="w-3 h-3 text-cyan-600" />
            {q.timer_seconds || 60}ث
          </span>
        </div>
      </td>
    </tr>
  );
}
