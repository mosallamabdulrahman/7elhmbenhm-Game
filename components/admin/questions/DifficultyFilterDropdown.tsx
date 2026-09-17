"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

interface DifficultyFilterDropdownProps {
  filterDifficulty: string;
  setFilterDifficulty: (diff: string) => void;
  questions?: any[];
}

export function DifficultyFilterDropdown({
  filterDifficulty,
  setFilterDifficulty,
  questions = [],
}: DifficultyFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    for (const q of questions) {
      if (q.difficulty && c[q.difficulty] !== undefined) {
        c[q.difficulty]++;
      }
    }
    return c;
  }, [questions]);

  const difficultyOptions = [
    {
      id: "easy",
      label: "سهل",
      badge: "1 طقة",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "🟢",
    },
    {
      id: "medium",
      label: "متوسط",
      badge: "طقتين",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "🟡",
    },
    {
      id: "hard",
      label: "صعب",
      badge: "3 طقات",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "🔴",
    },
  ];

  const selectedOption = difficultyOptions.find(
    (d) => d.id === filterDifficulty,
  );

  return (
    <div className="relative w-full sm:w-56">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 border border-[#ccd0d4] bg-white rounded-lg px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] transition cursor-pointer hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 truncate font-semibold text-[13px]">
          {selectedOption ? (
            <>
              <span className="text-xs">{selectedOption.dot}</span>
              <span className="truncate text-slate-800">
                {selectedOption.label}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${selectedOption.badgeClass}`}
              >
                {selectedOption.badge}
              </span>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold shrink-0">
                ⚡
              </span>
              <span className="text-slate-700 font-medium">
                كل درجات الصعوبة
              </span>
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
                setFilterDifficulty("");
                setOpen(false);
              }}
              className={`w-full text-right px-3 py-2 text-sm rounded-lg transition cursor-pointer flex items-center justify-between ${
                !filterDifficulty
                  ? "bg-cyan-50 text-[#2271b1] font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                  ⚡
                </span>
                <span>كل درجات الصعوبة</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {questions.length} سؤال
              </span>
            </button>

            {difficultyOptions.map((d) => {
              const isSelected = filterDifficulty === d.id;
              const count = counts[d.id] || 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setFilterDifficulty(d.id);
                    setOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2 text-sm rounded-lg transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-cyan-50 text-[#2271b1] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-xs shrink-0">{d.dot}</span>
                    <span className="font-semibold">{d.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${d.badgeClass}`}
                    >
                      {d.badge}
                    </span>
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
