"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  Repeat,
  Save,
  Timer,
  X,
} from "lucide-react";
import { DIFFICULTY_STRIKES } from "@/lib/admin-constants";
import { AnswerImageUpload, MediaUpload } from "./MediaUploaders";

// A category can hold any number of questions — the game randomly picks 6
// of them per room. "position" is just a display/ordering value, so a new
// question is appended after the current highest position in its category.
const nextPosition = (questions, categoryId, excludeId) => {
  const used = (questions || [])
    .filter((q) => q.category_id === categoryId && q.id !== excludeId)
    .map((q) => q.position);
  return used.length ? Math.max(...used) + 1 : 1;
};

function CategorySelectDropdown({ categories, selectedId, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCat =
    categories.find((c) => String(c.id) === String(selectedId)) ||
    categories[0];

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-1 w-full flex items-center justify-between gap-2 border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 shadow-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition cursor-pointer hover:bg-slate-50"
      >
        <span className="flex items-center gap-2.5 truncate font-bold text-xs sm:text-sm">
          {selectedCat?.image_url ? (
            <img
              src={selectedCat.image_url}
              alt=""
              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold shrink-0">
              📁
            </span>
          )}
          <span className="truncate text-slate-900">
            {selectedCat?.name || "اختر الفئة"}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-cyan-600" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 divide-y divide-slate-100 p-1.5">
          {categories.map((c) => {
            const isSelected = String(c.id) === String(selectedId);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className={`w-full text-right px-3 py-2.5 text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-cyan-50 text-cyan-900 font-black"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold shrink-0">
                      📁
                    </span>
                  )}
                  <span className="truncate">{c.name}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function QuestionModal({
  question,
  categories,
  questions,
  onSave,
  onClose,
  busy,
  defaultCategoryId,
}) {
  const [form, setForm] = useState(() => {
    if (question) {
      const hasValidCategory = categories.some(
        (c) => String(c.id) === String(question.category_id),
      );
      return {
        ...question,
        category_id: hasValidCategory
          ? question.category_id
          : categories[0]?.id || "",
        show_question_first: Boolean(question.show_question_first),
      };
    }
    const targetCategoryId =
      defaultCategoryId &&
      categories.some((c) => String(c.id) === String(defaultCategoryId))
        ? defaultCategoryId
        : categories[0]?.id || "";
    return {
      category_id: targetCategoryId,
      question_text: "",
      answer_text: "",
      difficulty: "easy",
      position: nextPosition(questions, targetCategoryId),
      is_active: true,
      media_url: "",
      media_type: null,
      image_duration: null,
      media_play_count: null,
      show_question_first: false,
      answer_image_url: "",
    };
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Which extra setting applies is driven purely by media_type, so switching
  // an image out for a video instantly swaps duration ⇄ playback count.
  const hasMedia = Boolean(form.media_url?.trim());
  const isImageMedia = hasMedia && form.media_type === "image";
  const isPlayableMedia =
    hasMedia && (form.media_type === "audio" || form.media_type === "video");

  const usedPositions = new Set(
    (questions || [])
      .filter((q) => q.category_id === form.category_id && q.id !== form.id)
      .map((q) => q.position),
  );
  const positionTaken = usedPositions.has(form.position);

  const getNextFreePosition = (current) => {
    let next = Math.max(1, (Number(current) || 0) + 1);
    while (usedPositions.has(next)) next += 1;
    return next;
  };

  const getPrevFreePosition = (current) => {
    let prev = (Number(current) || 1) - 1;
    while (prev >= 1 && usedPositions.has(prev)) prev -= 1;
    return prev >= 1 ? prev : current;
  };

  const handleStepUp = () => {
    set("position", getNextFreePosition(form.position));
  };

  const handleStepDown = () => {
    set("position", getPrevFreePosition(form.position));
  };

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(form.category_id),
  );
  const isWlaKelma =
    selectedCategory?.name === "ولا كلمة" ||
    String(form.category_id) === "wla_kelma";

  const isDuplicateQuestion = (questions || []).some((q) => {
    if (q.category_id !== form.category_id) return false;
    if (question && q.id === question.id) return false;
    if (form.id && q.id === form.id) return false;
    const sameAnswer =
      (q.answer_text?.trim().toLowerCase() || "") ===
      (form.answer_text?.trim().toLowerCase() || "");
    const sameAnswerImage =
      (q.answer_image_url?.trim() || "") ===
      (form.answer_image_url?.trim() || "");
    if (isWlaKelma) {
      return sameAnswer && sameAnswerImage;
    }
    const sameText =
      q.question_text?.trim().toLowerCase() ===
      form.question_text?.trim().toLowerCase();
    return sameText && sameAnswer && sameAnswerImage;
  });

  // New question, category changed: jump the position past that category's
  // current highest slot instead of leaving it on whatever the previous
  // category last had (avoids colliding with an already-used position).
  const handleCategoryChange = (categoryId) => {
    const targetCategoryId = categoryId || categories[0]?.id || "";
    if (question) {
      set("category_id", targetCategoryId);
      return;
    }
    setForm((f) => ({
      ...f,
      category_id: targetCategoryId,
      position: nextPosition(questions, targetCategoryId),
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">
            {question ? "تعديل سؤال" : "سؤال جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
          <div>
            <label className="text-[11px] font-bold text-slate-500">
              الفئة *
            </label>
            <CategorySelectDropdown
              categories={categories}
              selectedId={form.category_id}
              onChange={handleCategoryChange}
            />
          </div>

          {isWlaKelma ? (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-right">
              <p className="text-xs font-bold text-amber-900 leading-relaxed">
                🤫 فئة ولا كلمة: كل المطلوب هو اسم الشيء المطلوب تمثيله وصورته
                التوضيحية (مثل مهنة، رياضة، نشاط، أو مثل شعبي). اللاعب بيمسح
                الباركود ويشوف الصورة ويمثلها لربعه بدون أي كلام!
              </p>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-slate-500">
                نص السؤال *
              </label>
              <textarea
                value={form.question_text}
                onChange={(e) => set("question_text", e.target.value)}
                rows={3}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm resize-none outline-none transition-colors ${
                  isDuplicateQuestion
                    ? "border-rose-400 focus:border-rose-500 bg-rose-50/50 text-rose-900"
                    : "border-slate-200 focus:border-cyan-500"
                }`}
                placeholder="اكتب السؤال هنا..."
              />
              {isDuplicateQuestion && (
                <p className="mt-1.5 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 inline shrink-0" />
                  هالسؤال موجود من قبل بنفس التصنيف، ما تقدر تضيفه مرة ثانية!
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-500">
              {isWlaKelma
                ? "المطلوب تمثيله / الإجابة (مثل: مهنة: رائد فضاء، رياضة: ركوب الخيل، مثل شعبي) *"
                : "الإجابة الصحيحة *"}
            </label>
            <input
              value={form.answer_text}
              onChange={(e) => set("answer_text", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 outline-none transition-colors"
              placeholder={isWlaKelma ? "مهنة: رائد فضاء" : "الإجابة"}
            />
            {isWlaKelma && isDuplicateQuestion && (
              <p className="mt-1.5 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 inline shrink-0" />
                هذا العنصر موجود مسبقاً في هذه الفئة!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500">
                الصعوبة
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => {
                  const d = e.target.value;
                  setForm((f) => ({
                    ...f,
                    difficulty: d,
                    strikes: DIFFICULTY_STRIKES[d],
                  }));
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-cyan-500 outline-none transition-colors"
              >
                <option value="easy">سهل (1 ضربة)</option>
                <option value="medium">متوسط (2 ضربة)</option>
                <option value="hard">صعب (3 ضربات)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500">
                  ترتيب العرض
                </label>
              </div>
              <div className="relative mt-1 flex items-center">
                <input
                  type="number"
                  min={1}
                  value={form.position}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleStepUp();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleStepDown();
                    }
                  }}
                  onChange={(e) => set("position", Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 pl-16 text-sm font-bold transition-colors outline-none ${
                    positionTaken
                      ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500"
                      : "border-slate-200 focus:border-cyan-500 text-slate-800"
                  }`}
                />
                <div className="absolute left-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    title="الموضع المتاح التالي"
                    onClick={handleStepUp}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="الموضع المتاح السابق"
                    onClick={handleStepDown}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {positionTaken && (
                <div className="mt-1.5 flex flex-col gap-1 text-[10px] font-bold text-rose-600">
                  <span>الموضع ده متاخد بسؤال ثاني في نفس الفئة.</span>
                  <button
                    type="button"
                    onClick={handleStepUp}
                    className="text-cyan-700 hover:underline cursor-pointer text-right inline-flex items-center gap-1 font-black"
                  >
                    ⚡ اضغط هنا للانتقال لأقرب موضع متاح (#
                    {getNextFreePosition(form.position)})
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isWlaKelma && (
            <div>
              <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> وسائط (صورة أو صوت أو فيديو —
                اختياري)
              </label>
              <div className="mt-1">
                <MediaUpload
                  value={form.media_url || ""}
                  type={form.media_type}
                  onChange={(url, type) => {
                    setForm((f) => ({
                      ...f,
                      media_url: url,
                      media_type: type,
                      image_duration:
                        type === "image" ? f.image_duration : null,
                      media_play_count:
                        type === "audio" || type === "video"
                          ? f.media_play_count
                          : null,
                      show_question_first: url ? f.show_question_first : false,
                    }));
                  }}
                  extra={
                    hasMedia && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1 text-slate-700 hover:bg-slate-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={Boolean(form.show_question_first)}
                            onChange={(e) =>
                              set("show_question_first", e.target.checked)
                            }
                            className="rounded text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold whitespace-nowrap">
                            ظهور السؤال أولاً
                          </span>
                        </label>
                        {isImageMedia && (
                          <div className="flex items-center gap-1.5 bg-cyan-50/70 border border-cyan-100 rounded-xl px-2.5 py-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap">
                              <Timer className="h-3.5 w-3.5 text-cyan-600" />
                              مدة العرض:
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={600}
                              value={form.image_duration ?? ""}
                              onChange={(e) => {
                                const raw = e.target.value;
                                set(
                                  "image_duration",
                                  raw === "" ? null : Math.max(1, Number(raw)),
                                );
                              }}
                              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-center font-bold text-slate-700 focus:border-cyan-500 outline-none transition-colors"
                              placeholder="ثواني"
                              title="مدة عرض الصورة بالثواني (فاضية = بدون توقيت)"
                            />
                          </div>
                        )}
                        {isPlayableMedia && (
                          <div className="flex items-center gap-1.5 bg-cyan-50/70 border border-cyan-100 rounded-xl px-2.5 py-1">
                            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap">
                              <Repeat className="h-3.5 w-3.5 text-cyan-600" />
                              مرات التشغيل:
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={form.media_play_count ?? ""}
                              onChange={(e) => {
                                const raw = e.target.value;
                                set(
                                  "media_play_count",
                                  raw === "" ? null : Math.max(1, Number(raw)),
                                );
                              }}
                              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-center font-bold text-slate-700 focus:border-cyan-500 outline-none transition-colors"
                              placeholder="بدون حد"
                              title="عدد مرات التشغيل (فاضية = بدون حد)"
                            />
                          </div>
                        )}
                      </div>
                    )
                  }
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> صورة الإجابة (اختياري)
            </label>
            <div className="mt-1">
              <AnswerImageUpload
                value={form.answer_image_url || ""}
                onChange={(url) => set("answer_image_url", url)}
                extra={
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => set("is_active", e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4 border-slate-300 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-700">
                      مفعّل
                    </span>
                  </label>
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
          <button
            type="button"
            onClick={() => {
              const finalForm = {
                ...form,
                question_text: isWlaKelma
                  ? form.question_text?.trim() ||
                    form.answer_text?.trim() ||
                    "ولا كلمة"
                  : form.question_text.trim(),
              };
              onSave(finalForm);
            }}
            disabled={
              busy ||
              !form.category_id ||
              (!isWlaKelma && !form.question_text.trim()) ||
              !form.answer_text.trim() ||
              positionTaken ||
              isDuplicateQuestion
            }
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-bold text-white disabled:opacity-60 hover:bg-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
