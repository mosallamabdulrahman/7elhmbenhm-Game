"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export default function CategoriesTab({
  categories,
  filteredCategories,
  groups = [],
  questions,
  categoryUsage,
  busy,
  searchQuery,
  setSearchQuery,
  setCatModal,
  deleteCategory,
  statusEditFor,
  setStatusEditFor,
  onInlineStatusChange,
  onBulkAction,
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkTargetGroup, setBulkTargetGroup] = useState("");

  const groupsMap = useMemo(
    () => new Map((groups || []).map((g) => [String(g.id), g.name])),
    [groups],
  );

  const tableRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    if (e.target.closest("button, input, select, a")) return;
    isDragging.current = true;
    startX.current = e.pageX - (tableRef.current?.offsetLeft || 0);
    scrollLeft.current = tableRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !tableRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    tableRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const isAllSelected =
    filteredCategories.length > 0 &&
    filteredCategories.every((c) => selectedIds.has(c.id));
  const isSomeSelected =
    !isAllSelected && filteredCategories.some((c) => selectedIds.has(c.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredCategories.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredCategories.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const handleToggleSelect = (id) => {
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
      if (
        !window.confirm(
          `هل أنت متأكد من حذف ${ids.length} فئة أسئلة وكل الأسئلة التابعة لها؟`,
        )
      )
        return;
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
    } else if (bulkAction === "assign_group") {
      await onBulkAction?.({
        action: "assign_group",
        ids,
        group_id: bulkTargetGroup,
      });
      setSelectedIds(new Set());
      setBulkAction("");
      setBulkTargetGroup("");
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-start items-stretch sm:items-center gap-3">
        {/* Search Box */}
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن فئة أسئلة..."
            className="border border-[#ccd0d4] bg-white rounded px-3 py-1.5 pl-8 text-sm outline-none focus:border-[#2271b1] w-full sm:w-64 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* WordPress-style Bulk Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#f6f7f7] border border-[#ccd0d4] rounded p-2 text-[13px]">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="border border-[#ccd0d4] bg-white rounded px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#2271b1] shadow-xs cursor-pointer"
          >
            <option value="">إجراءات جماعية</option>
            <option value="activate">تفعيل</option>
            <option value="deactivate">تعطيل</option>
            <option value="assign_group">تعيين التصنيف الرئيسي...</option>
            <option value="delete">حذف</option>
          </select>

          {bulkAction === "assign_group" && (
            <select
              value={bulkTargetGroup}
              onChange={(e) => setBulkTargetGroup(e.target.value)}
              className="border border-[#ccd0d4] bg-white rounded px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#2271b1] shadow-xs cursor-pointer max-w-xs"
            >
              <option value="">اختر التصنيف الرئيسي...</option>
              <option value="none">بدون تصنيف رئيسي</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            disabled={busy || !bulkAction || selectedIds.size === 0}
            onClick={handleApplyBulkAction}
            className="bg-[#f6f7f7] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white text-[#2271b1] text-xs font-semibold px-3 py-1 rounded transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            تطبيق
          </button>

          {selectedIds.size > 0 && (
            <span className="text-xs font-bold text-slate-700 mr-2 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
              تم تحديد {selectedIds.size} من {filteredCategories.length}
            </span>
          )}
        </div>

        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline mr-auto"
          >
            إلغاء التحديد
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white border border-[#ccd0d4] shadow-sm overflow-hidden rounded-sm">
        {/* Desktop & Tablet Table (Horizontal scroll & drag enabled for tablets) */}
        <div
          ref={tableRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="hidden md:block overflow-x-auto cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-x pan-y" }}
        >
          <table className="min-w-[980px] w-full text-right border-collapse text-[13px]">
            <thead>
              <tr className="bg-white border-b border-[#ccd0d4] select-none text-[#2c3338] font-bold text-[14px]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="تحديد كل فئات الأسئلة"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[#ccd0d4] text-[#2271b1] focus:ring-[#2271b1] cursor-pointer align-middle"
                  />
                </th>
                <th className="p-3 text-right">اسم الفئة</th>
                <th className="p-3 text-right">التصنيف الرئيسي</th>
                <th className="p-3 text-right">الوصف</th>
                <th className="p-3 text-right">الترتيب</th>
                <th className="p-3 text-right">صورة الغلاف</th>
                <th className="p-3 text-right">عدد الأسئلة</th>
                <th className="p-3 text-right">مرات الاختيار باللعب</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    لا توجد فئات أسئلة تطابق البحث.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const catQuestionsCount = questions.filter(
                    (q) => q.category_id === cat.id,
                  ).length;
                  return (
                    <tr
                      key={cat.id}
                      className={`group hover:bg-[#f6f7f7] transition-colors ${
                        selectedIds.has(cat.id) ? "bg-[#f0f6fc]" : ""
                      }`}
                    >
                      <td className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          aria-label="تحديد هذه الفئة"
                          checked={selectedIds.has(cat.id)}
                          onChange={() => handleToggleSelect(cat.id)}
                          className="w-4 h-4 rounded border-[#ccd0d4] text-[#2271b1] focus:ring-[#2271b1] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-[#1d2327] mb-1 flex items-center gap-1.5">
                          <span>{cat.name}</span>
                        </div>
                        {/* Inline Hover Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-semibold mt-1">
                          <button
                            onClick={() => setCatModal(cat)}
                            className="text-[#2271b1] hover:text-[#135e96]"
                          >
                            تحرير
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            disabled={busy}
                            className="text-rose-600 hover:text-rose-800 disabled:opacity-50"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                          {groupsMap.get(String(cat.group_id)) || "—"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {cat.description ? (
                          <p className="line-clamp-2 text-slate-500">
                            {cat.description}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">
                            لا يوجد وصف
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 ">#{cat.sort_order}</td>
                      <td className="p-3">
                        {cat.image_url ? (
                          <a
                            href={cat.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-16 h-10 rounded border border-slate-200 overflow-hidden hover:opacity-85 transition-opacity"
                          >
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/images/logo.png";
                                e.currentTarget.className =
                                  "w-full h-full object-contain p-1 bg-slate-50";
                              }}
                            />
                          </a>
                        ) : (
                          <div className="w-16 h-10 rounded border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                            <img
                              src="/images/logo.png"
                              alt="شعار"
                              className="w-full h-full object-contain p-1 opacity-70"
                            />
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {catQuestionsCount} أسئلة
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          🎮{" "}
                          {categoryUsage[cat.id] ||
                            categoryUsage[cat.name] ||
                            0}{" "}
                          {(categoryUsage[cat.id] ||
                            categoryUsage[cat.name] ||
                            0) === 1
                            ? "مرة"
                            : "مرات"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setStatusEditFor((cur) =>
                                cur === cat.id ? null : cat.id,
                              )
                            }
                            className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded text-[11px] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              cat.is_active
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cat.is_active ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span>{cat.is_active ? "مفعّل" : "معطّل"}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {statusEditFor === cat.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setStatusEditFor(null)}
                              />
                              <div className="absolute left-0 top-full -mt-0.5 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onInlineStatusChange(cat, true);
                                    setStatusEditFor(null);
                                  }}
                                  className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                                    cat.is_active
                                      ? "text-emerald-700 bg-emerald-50"
                                      : "text-slate-700"
                                  }`}
                                >
                                  مفعّل
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onInlineStatusChange(cat, false);
                                    setStatusEditFor(null);
                                  }}
                                  className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                                    !cat.is_active
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards with Accordion / Collapse) */}
        <div className="block md:hidden divide-y divide-[#ccd0d4] bg-white">
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              لا توجد تصنيفات تطابق البحث.
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const catQuestionsCount = questions.filter(
                (q) => q.category_id === cat.id,
              ).length;
              const isExpanded = expandedIds.has(cat.id);
              const usageCount =
                categoryUsage[cat.id] || categoryUsage[cat.name] || 0;

              return (
                <div
                  key={cat.id}
                  className={`p-3.5 space-y-2 ${
                    selectedIds.has(cat.id) ? "bg-[#f0f6fc]" : ""
                  }`}
                >
                  {/* Header Row: Checkbox + Category Name + Image Thumbnail + Status Badge + Expand Button */}
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="checkbox"
                      aria-label="تحديد هذه الفئة"
                      checked={selectedIds.has(cat.id)}
                      onChange={() => handleToggleSelect(cat.id)}
                      className="w-4 h-4 rounded border-[#ccd0d4] text-[#2271b1] focus:ring-[#2271b1] cursor-pointer shrink-0 align-middle"
                    />
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/images/logo.png";
                            e.currentTarget.className =
                              "w-10 h-10 object-contain p-1 bg-slate-50 rounded-lg border border-slate-200 shrink-0";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 shrink-0">
                          <img
                            src="/images/logo.png"
                            alt="شعار"
                            className="w-6 h-6 object-contain opacity-70"
                          />
                        </div>
                      )}
                      <div className="font-bold text-[14px] text-[#1d2327] truncate">
                        {cat.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 relative">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          setStatusEditFor((cur) =>
                            cur === `m_${cat.id}` ? null : `m_${cat.id}`,
                          )
                        }
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full cursor-pointer transition ${
                          cat.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {cat.is_active ? "مفعّل" : "معطّل"}
                      </button>

                      {statusEditFor === `m_${cat.id}` && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setStatusEditFor(null)}
                          />
                          <div className="absolute left-0 top-full -mt-0.5 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
                            <button
                              type="button"
                              onClick={() => {
                                onInlineStatusChange(cat, true);
                                setStatusEditFor(null);
                              }}
                              className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                                cat.is_active
                                  ? "text-emerald-700 bg-emerald-50"
                                  : "text-slate-700"
                              }`}
                            >
                              مفعّل
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onInlineStatusChange(cat, false);
                                setStatusEditFor(null);
                              }}
                              className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                                !cat.is_active
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
                        onClick={() => toggleExpand(cat.id)}
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

                  {/* Action Links - Always visible on mobile! */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setCatModal(cat)}
                      className="text-[#2271b1] hover:underline"
                    >
                      تحرير
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      disabled={busy}
                      className="text-rose-600 hover:underline disabled:opacity-50"
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
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500">
                          التصنيف الرئيسي:
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                          {groupsMap.get(String(cat.group_id)) || "—"}
                        </span>
                      </div>

                      <div className="py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500 block mb-0.5">
                          الوصف:
                        </span>
                        <p className="text-slate-600">
                          {cat.description || (
                            <span className="text-slate-400 italic">
                              لا يوجد وصف
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500">
                          الترتيب:
                        </span>
                        <span className=" text-slate-700 font-bold">
                          #{cat.sort_order}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500">
                          عدد الأسئلة:
                        </span>
                        <span className="font-bold text-slate-800">
                          {catQuestionsCount} أسئلة
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500">
                          مرات الاختيار باللعب:
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          🎮 {usageCount} {usageCount === 1 ? "مرة" : "مرات"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="font-bold text-slate-500">
                          الحالة:
                        </span>
                        <div className="relative">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setStatusEditFor((cur) =>
                                cur === `exp_${cat.id}` ? null : `exp_${cat.id}`,
                              )
                            }
                            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              cat.is_active
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cat.is_active ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span>{cat.is_active ? "مفعّل" : "معطّل"}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>

                          {statusEditFor === `exp_${cat.id}` && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setStatusEditFor(null)}
                              />
                              <div className="absolute left-0 top-full -mt-0.5 z-40 w-28 rounded-lg border border-[#ccd0d4] bg-white shadow-lg overflow-hidden py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onInlineStatusChange(cat, true);
                                    setStatusEditFor(null);
                                  }}
                                  className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                                    cat.is_active
                                      ? "text-emerald-700 bg-emerald-50"
                                      : "text-slate-700"
                                  }`}
                                >
                                  مفعّل
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onInlineStatusChange(cat, false);
                                    setStatusEditFor(null);
                                  }}
                                  className={`block w-full text-right px-3 py-1.5 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer ${
                                    !cat.is_active
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
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#f6f7f7] border-t border-[#ccd0d4] p-3 text-[12px] text-slate-500 text-left">
          إجمالي فئات الأسئلة المفلترة: {filteredCategories.length} من أصل{" "}
          {categories.length}
        </div>
      </div>
    </motion.div>
  );
}
