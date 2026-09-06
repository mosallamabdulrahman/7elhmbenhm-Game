"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Loader2, Save, X } from "lucide-react";
import { CategoryImageUpload } from "./MediaUploaders";

export default function CategoryModal({
  category,
  categories,
  groups = [],
  onSave,
  onClose,
  busy,
}) {
  const [form, setForm] = useState(() => {
    if (category) {
      return {
        ...category,
        group_id: category.group_id ? String(category.group_id) : "",
      };
    }
    const usedOrders = new Set((categories || []).map((c) => c.sort_order));
    let nextOrder = 1;
    while (usedOrders.has(nextOrder)) nextOrder += 1;
    return {
      name: "",
      group_id: groups[0]?.id ? String(groups[0].id) : "",
      description: "",
      image_url: "",
      sort_order: nextOrder,
      is_active: true,
    };
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const usedOrders = new Set(
    (categories || []).filter((c) => c.id !== form.id).map((c) => c.sort_order),
  );
  const orderTaken = usedOrders.has(form.sort_order);
  const orderTooLow = form.sort_order < 1;
  const isMissingGroup = !form.group_id || !form.group_id.trim();

  const getNextFreeOrder = (current) => {
    let next = Math.max(1, (Number(current) || 0) + 1);
    while (usedOrders.has(next)) next += 1;
    return next;
  };

  const getPrevFreeOrder = (current) => {
    let prev = (Number(current) || 1) - 1;
    while (prev >= 1 && usedOrders.has(prev)) prev -= 1;
    return prev >= 1 ? prev : current;
  };

  const handleStepUp = () => set("sort_order", getNextFreeOrder(form.sort_order));
  const handleStepDown = () => set("sort_order", getPrevFreeOrder(form.sort_order));

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
        className="w-full max-w-md max-h-[85vh] rounded-3xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">
            {category ? "تعديل فئة الأسئلة" : "فئة أسئلة جديدة"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
          <div>
            <label className="text-[11px] font-bold text-slate-500">
              اسم فئة الأسئلة *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 outline-none transition-colors"
              placeholder="مثال: أعلام الدول، معرفة عامة، كلمات كويتية..."
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500">
              التصنيف (المجموعة الرئيسية) *
            </label>
            <select
              value={form.group_id}
              onChange={(e) => set("group_id", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-cyan-500 outline-none transition-colors"
            >
              <option value="">-- اختر التصنيف الرئيسي --</option>
              {(groups || []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {isMissingGroup && (
              <p className="mt-1 text-[10px] font-bold text-amber-600">
                يجب اختيار تصنيف رئيسي تتبع له فئة الأسئلة.
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500">
              الوصف
            </label>
            <input
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-cyan-500 outline-none transition-colors"
              placeholder="وصف مختصر"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500">
              صورة الغلاف
            </label>
            <div className="mt-1">
              <CategoryImageUpload
                value={form.image_url || ""}
                onChange={(url) => set("image_url", url)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-start">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500">
                  الترتيب
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  (الأسهم تتنقل بين الأرقام المتاحة)
                </span>
              </div>
              <div className="relative mt-1 flex items-center">
                <input
                  type="number"
                  value={form.sort_order}
                  min={1}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleStepUp();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleStepDown();
                    }
                  }}
                  onChange={(e) => set("sort_order", Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 pl-16 text-sm font-bold transition-colors outline-none ${
                    orderTaken || orderTooLow
                      ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500"
                      : "border-slate-200 focus:border-cyan-500 text-slate-800"
                  }`}
                />
                <div className="absolute left-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    title="الترتيب المتاح التالي"
                    onClick={handleStepUp}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="الترتيب المتاح السابق"
                    onClick={handleStepDown}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                ترتيب الظهور (الأصغر أولاً).
              </p>
              {orderTooLow && (
                <p className="mt-1 text-[10px] font-bold text-rose-600">
                  الترتيب لازم يكون 1 أو أكبر.
                </p>
              )}
              {!orderTooLow && orderTaken && (
                <div className="mt-1 flex flex-col gap-1 text-[10px] font-bold text-rose-600">
                  <span>هذا الترتيب مستخدم بالفعل في فئة أخرى.</span>
                  <button
                    type="button"
                    onClick={handleStepUp}
                    className="text-cyan-700 hover:underline cursor-pointer text-right inline-flex items-center gap-1 font-black"
                  >
                    ⚡ اضغط هنا للانتقال لأقرب ترتيب متاح (#{getNextFreeOrder(form.sort_order)})
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">
                الحالة
              </label>
              <div className="mt-1 flex items-center h-[38px]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => set("is_active", e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4 border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    مفعّل (يظهر في الإعداد)
                  </span>
                </label>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                إظهار أو إخفاء في الإعداد.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={
              busy ||
              !form.name.trim() ||
              isMissingGroup ||
              orderTaken ||
              orderTooLow
            }
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-bold text-white disabled:opacity-60 hover:bg-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
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
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
