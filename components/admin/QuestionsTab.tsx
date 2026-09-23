"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { CategoryFilterDropdown } from "./questions/CategoryFilterDropdown";
import { DifficultyFilterDropdown } from "./questions/DifficultyFilterDropdown";
import { BulkActionBar } from "./questions/BulkActionBar";
import { QuestionsPagination } from "./questions/QuestionsPagination";
import { QuestionTableRow } from "./questions/QuestionTableRow";
import { QuestionMobileCard } from "./questions/QuestionMobileCard";
import { useAdminStore } from "@/stores/useAdminStore";
import { useDragScroll } from "@/hooks/useDragScroll";

interface QuestionsTabProps {
  categories?: any[];
  categoryMap?: Record<string, any>;
  questions?: any[];
  filteredQuestions?: any[];
  questionStats?: Record<string, any>;
  filterCategory?: string;
  setFilterCategory?: (cat: string) => void;
  filterDifficulty?: string;
  setFilterDifficulty?: (diff: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  busy?: boolean;
  setQModal?: (q: any) => void;
  deleteQuestion?: (id: string) => void;
  difficultyEditFor?: string | null;
  setDifficultyEditFor?: (val: React.SetStateAction<string | null>) => void;
  onInlineDifficultyChange?: (q: any, level: string) => void;
  statusEditFor?: string | null;
  setStatusEditFor?: (val: React.SetStateAction<string | null>) => void;
  onInlineStatusChange?: (q: any, isActive: boolean) => void;
  onBulkAction?: (actionData: any) => Promise<void>;
}

export default function QuestionsTab(props: QuestionsTabProps) {
  const storeCategories = useAdminStore((s) => s.categories);
  const storeQuestions = useAdminStore((s) => s.questions);
  const storeQuestionStats = useAdminStore((s) => s.questionStats);
  const storeFilterCategory = useAdminStore((s) => s.filterCategory);
  const storeSetFilterCategory = useAdminStore((s) => s.setFilterCategory);
  const storeFilterDifficulty = useAdminStore((s) => s.filterDifficulty);
  const storeSetFilterDifficulty = useAdminStore((s) => s.setFilterDifficulty);
  const storeSearchQuery = useAdminStore((s) => s.searchQuery);
  const storeSetSearchQuery = useAdminStore((s) => s.setSearchQuery);
  const storeBusy = useAdminStore((s) => s.busy);
  const storeSetQModal = useAdminStore((s) => s.setQModal);
  const storeDeleteQuestion = useAdminStore((s) => s.deleteQuestion);
  const storeDifficultyEditFor = useAdminStore((s) => s.difficultyEditFor);
  const storeSetDifficultyEditFor = useAdminStore((s) => s.setDifficultyEditFor);
  const storeInlineDiffChange = useAdminStore((s) => s.handleInlineDifficultyChange);
  const storeStatusEditFor = useAdminStore((s) => s.statusEditFor);
  const storeSetStatusEditFor = useAdminStore((s) => s.setStatusEditFor);
  const storeInlineStatusChange = useAdminStore((s) => s.handleInlineStatusChange);
  const storeBulkAction = useAdminStore((s) => s.handleBulkQuestions);

  const categories = props.categories ?? storeCategories;
  const questions = props.questions ?? storeQuestions;
  const questionStats = props.questionStats ?? storeQuestionStats;
  const filterCategory = props.filterCategory ?? storeFilterCategory;
  const setFilterCategory = props.setFilterCategory ?? storeSetFilterCategory;
  const filterDifficulty = props.filterDifficulty ?? storeFilterDifficulty;
  const setFilterDifficulty = props.setFilterDifficulty ?? storeSetFilterDifficulty;
  const searchQuery = props.searchQuery ?? storeSearchQuery;
  const setSearchQuery = props.setSearchQuery ?? storeSetSearchQuery;
  const busy = props.busy ?? storeBusy;
  const setQModal = props.setQModal ?? storeSetQModal;
  const deleteQuestion = props.deleteQuestion ?? storeDeleteQuestion;
  const difficultyEditFor = props.difficultyEditFor ?? storeDifficultyEditFor;
  const setDifficultyEditFor = props.setDifficultyEditFor ?? storeSetDifficultyEditFor;
  const onInlineDifficultyChange = props.onInlineDifficultyChange ?? storeInlineDiffChange;
  const statusEditFor = props.statusEditFor ?? storeStatusEditFor;
  const setStatusEditFor = props.setStatusEditFor ?? storeSetStatusEditFor;
  const onInlineStatusChange = props.onInlineStatusChange ?? storeInlineStatusChange;
  const onBulkAction = props.onBulkAction ?? storeBulkAction;

  const categoryMap = useMemo(() => {
    if (props.categoryMap) return props.categoryMap;
    const map: Record<string, any> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat;
    });
    return map;
  }, [props.categoryMap, categories]);

  const filteredQuestions = useMemo(() => {
    if (props.filteredQuestions) return props.filteredQuestions;
    return questions.filter((q) => {
      if (filterCategory && q.category_id !== filterCategory) return false;
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = q.question_text?.toLowerCase().includes(query);
        const matchesAnswer = q.answer_text?.toLowerCase().includes(query);
        if (!matchesQuestion && !matchesAnswer) return false;
      }
      return true;
    });
  }, [props.filteredQuestions, questions, filterCategory, filterDifficulty, searchQuery]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkTargetCategory, setBulkTargetCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const filterKey = `${filterCategory || ""}_${filterDifficulty || ""}_${searchQuery || ""}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  const tableTopRef = useRef<HTMLDivElement | null>(null);

  // Tablet & Desktop drag-to-scroll support
  const {
    ref: tableRef,
    onMouseDown: handleMouseDown,
    onMouseLeave: handleMouseLeave,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
  } = useDragScroll();

  // Adjust page state during render when filter or search changes
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / pageSize),
  );
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredQuestions.length);

  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, startIndex, endIndex]);

  const isAllSelected =
    paginatedQuestions.length > 0 &&
    paginatedQuestions.every((q) => selectedIds.has(q.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedQuestions.forEach((q) => next.delete(q.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedQuestions.forEach((q) => next.add(q.id));
        return next;
      });
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (bulkAction === "delete") {
      if (!window.confirm(`هل أنت متأكد من حذف ${ids.length} سؤال؟`)) return;
      await onBulkAction?.({ action: "delete", ids });
      setSelectedIds(new Set());
      setBulkAction("");
    } else if (bulkAction === "activate") {
      await onBulkAction?.({ action: "activate", ids });
      setSelectedIds(new Set());
      setBulkAction("");
    } else if (bulkAction === "deactivate") {
      await onBulkAction?.({ action: "deactivate", ids });
      setSelectedIds(new Set());
      setBulkAction("");
    } else if (bulkAction === "change_category") {
      if (!bulkTargetCategory) {
        alert("يرجى اختيار الفئة المستهدفة لنقل الأسئلة إليها.");
        return;
      }
      await onBulkAction?.({
        action: "change_category",
        ids,
        category_id: bulkTargetCategory,
      });
      setSelectedIds(new Set());
      setBulkAction("");
      setBulkTargetCategory("");
    }
  };

  const goToPage = (nextPage: number) => {
    const target = Math.max(1, Math.min(nextPage, totalPages));
    setPage(target);
    requestAnimationFrame(() => {
      tableTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      ref={tableTopRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 scroll-mt-6"
    >
      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <CategoryFilterDropdown
            categories={categories}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            questions={questions}
          />

          <DifficultyFilterDropdown
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
            questions={questions}
          />

          {(filterCategory || filterDifficulty) && (
            <button
              type="button"
              onClick={() => {
                setFilterCategory("");
                setFilterDifficulty("");
              }}
              className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="إعادة ضبط الفلاتر"
            >
              <span>✕</span>
              <span>مسح الفلاتر</span>
            </button>
          )}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن سؤال أو إجابة..."
            className="border border-[#ccd0d4] bg-white rounded px-3 py-1.5 pl-8 text-sm outline-none focus:border-[#2271b1] w-full sm:w-64 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* WordPress-style Bulk Actions Bar */}
      <BulkActionBar
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        bulkTargetCategory={bulkTargetCategory}
        setBulkTargetCategory={setBulkTargetCategory}
        categories={categories}
        busy={busy}
        selectedCount={selectedIds.size}
        totalPageCount={paginatedQuestions.length}
        onApply={handleApplyBulkAction}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Main Container */}
      <div className="bg-white border border-[#ccd0d4] shadow-sm overflow-hidden rounded-sm">
        {/* Desktop & Tablet Table */}
        <div
          ref={tableRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="hidden md:block overflow-x-auto cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-x pan-y" }}
        >
          <table className="min-w-[1020px] w-full text-right border-collapse text-[13px]">
            <thead>
              <tr className="bg-white border-b border-[#ccd0d4] select-none text-[#2c3338] font-bold text-[14px]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="تحديد الكل في الصفحة"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[#ccd0d4] text-[#2271b1] focus:ring-[#2271b1] cursor-pointer align-middle"
                  />
                </th>
                <th className="p-3 text-right">السؤال</th>
                <th className="p-3 text-right">الفئة</th>
                <th className="p-3 text-right">الصعوبة</th>
                <th className="p-3 text-right">الموضع</th>
                <th className="p-3 text-right">الوسائط</th>
                <th className="p-3 text-right">الأداء</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد أسئلة تطابق البحث أو الفلاتر المختارة.
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((q) => {
                  const cat =
                    (q.category_id
                      ? categoryMap[String(q.category_id)]
                      : null) || categories[0];
                  const stat = questionStats[q.id];
                  return (
                    <QuestionTableRow
                      key={q.id}
                      q={q}
                      cat={cat}
                      stat={stat}
                      isSelected={selectedIds.has(q.id)}
                      onToggleSelect={() => handleToggleSelect(q.id)}
                      setQModal={setQModal}
                      deleteQuestion={deleteQuestion}
                      busy={busy}
                      difficultyEditFor={difficultyEditFor}
                      setDifficultyEditFor={setDifficultyEditFor}
                      onInlineDifficultyChange={onInlineDifficultyChange}
                      statusEditFor={statusEditFor}
                      setStatusEditFor={setStatusEditFor}
                      onInlineStatusChange={onInlineStatusChange}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards with Accordion / Collapse) */}
        <div className="block md:hidden divide-y divide-[#ccd0d4] bg-white">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              لا توجد أسئلة تطابق البحث أو الفلاتر المختارة.
            </div>
          ) : (
            paginatedQuestions.map((q) => {
              const cat =
                (q.category_id ? categoryMap[String(q.category_id)] : null) ||
                categories[0];
              const stat = questionStats[q.id];
              return (
                <QuestionMobileCard
                  key={q.id}
                  q={q}
                  cat={cat}
                  stat={stat}
                  isSelected={selectedIds.has(q.id)}
                  isExpanded={expandedIds.has(q.id)}
                  onToggleSelect={() => handleToggleSelect(q.id)}
                  onToggleExpand={() => toggleExpand(q.id)}
                  setQModal={setQModal}
                  deleteQuestion={deleteQuestion}
                  busy={busy}
                  difficultyEditFor={difficultyEditFor}
                  setDifficultyEditFor={setDifficultyEditFor}
                  onInlineDifficultyChange={onInlineDifficultyChange}
                  statusEditFor={statusEditFor}
                  setStatusEditFor={setStatusEditFor}
                  onInlineStatusChange={onInlineStatusChange}
                />
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        <QuestionsPagination
          filteredCount={filteredQuestions.length}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
            requestAnimationFrame(() => {
              tableTopRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            });
          }}
        />
      </div>
    </motion.div>
  );
}
