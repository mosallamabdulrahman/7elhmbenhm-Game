"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

interface CategoryFilterDropdownProps {
  categories: any[];
  filterCategory: string;
  setFilterCategory: (catId: string) => void;
  questions?: any[];
}

export function CategoryFilterDropdown({
  categories,
  filterCategory,
  setFilterCategory,
  questions = [],
}: CategoryFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedCat = categories.find(
    (c) => String(c.id) === String(filterCategory),
  );

  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of questions) {
      if (q.category_id) {
        counts[q.category_id] = (counts[q.category_id] || 0) + 1;
      }
    }
    return counts;
  }, [questions]);

  return (
    <div className="relative w-full sm:w-64">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 border border-[#ccd0d4] bg-white rounded-lg px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] transition cursor-pointer hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 truncate font-semibold text-[13px]">
          {selectedCat ? (
            <>
              {selectedCat.image_url ? (
                <img
                  src={selectedCat.image_url}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  📁
                </span>
              )}
              <span className="truncate text-slate-800">
                {selectedCat.name}
              </span>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold shrink-0">
                ☰
              </span>
              <span className="text-slate-700 font-medium">كل الفئات</span>
            </>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-[#2271b1]" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-full bg-white border border-[#ccd0d4] rounded-xl shadow-xl max-h-72 overflow-y-auto z-40 divide-y divide-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => {
                setFilterCategory("");
                setOpen(false);
              }}
              className={`w-full text-right px-3 py-2 text-sm rounded-lg transition cursor-pointer flex items-center justify-between ${
                !filterCategory
                  ? "bg-cyan-50 text-[#2271b1] font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                  ☰
                </span>
                <span>كل الفئات</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {questions.length} سؤال
              </span>
            </button>

            {categories.map((c) => {
              const isSelected = String(filterCategory) === String(c.id);
              const count = questionCounts[c.id] || 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFilterCategory(c.id);
                    setOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2 text-sm rounded-lg transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-cyan-50 text-[#2271b1] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt=""
                        className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs shrink-0">
                        📁
                      </span>
                    )}
                    <span className="truncate">{c.name}</span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-[#2271b1]">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}
