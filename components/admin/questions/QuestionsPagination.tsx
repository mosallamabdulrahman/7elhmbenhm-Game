"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  pages.push(1);
  if (current > 3) {
    pages.push("...");
  }
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }
  if (current < total - 2) {
    pages.push("...");
  }
  pages.push(total);
  return pages;
}

interface QuestionsPaginationProps {
  filteredCount: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  setPageSize?: (size: number) => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function QuestionsPagination({
  filteredCount,
  startIndex,
  endIndex,
  pageSize,
  currentPage,
  totalPages,
  goToPage,
  onPageSizeChange,
}: QuestionsPaginationProps) {
  return (
    <div className="bg-[#f6f7f7] border-t border-[#ccd0d4] p-3 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[13px] text-slate-600 select-none">
      {/* Page size and range info */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full md:w-auto">
        <span>
          {filteredCount === 0 ? (
            "لا توجد نتائج"
          ) : (
            <>
              عرض{" "}
              <strong className="text-slate-800 font-bold">
                {startIndex + 1}
              </strong>{" "}
              إلى{" "}
              <strong className="text-slate-800 font-bold">{endIndex}</strong> من
              أصل{" "}
              <strong className="text-slate-800 font-bold">
                {filteredCount}
              </strong>{" "}
              سؤال
            </>
          )}
        </span>
        {filteredCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>| لكل صفحة:</span>
            {[25, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition ${
                  pageSize === size
                    ? "bg-[#2271b1] text-white shadow-xs"
                    : "bg-white border border-[#ccd0d4] text-slate-700 hover:bg-slate-50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation buttons: Previous, Page Numbers, Next */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 w-full md:w-auto">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            className="px-3 py-1.5 bg-white border border-[#ccd0d4] rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers(currentPage, totalPages).map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="px-1.5 text-slate-400 text-xs font-bold"
                  >
                    …
                  </span>
                );
              }
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => typeof p === "number" && goToPage(p)}
                  className={`min-w-[30px] h-[28px] px-2 rounded text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? "bg-[#2271b1] text-white shadow-xs"
                      : "bg-white border border-[#ccd0d4] text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="px-3 py-1.5 bg-white border border-[#ccd0d4] rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="الصفحة التالية"
          >
            <span>التالي</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
