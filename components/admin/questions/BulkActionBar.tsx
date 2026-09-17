"use client";

interface BulkActionBarProps {
  bulkAction: string;
  setBulkAction: (action: string) => void;
  bulkTargetCategory: string;
  setBulkTargetCategory: (catId: string) => void;
  categories?: any[];
  busy: boolean;
  selectedCount: number;
  totalPageCount: number;
  onApply: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  bulkAction,
  setBulkAction,
  bulkTargetCategory,
  setBulkTargetCategory,
  categories = [],
  busy,
  selectedCount,
  totalPageCount,
  onApply,
  onClearSelection,
}: BulkActionBarProps) {
  return (
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
          <option value="change_category">نقل إلى فئة...</option>
          <option value="delete">حذف</option>
        </select>

        {bulkAction === "change_category" && (
          <select
            value={bulkTargetCategory}
            onChange={(e) => setBulkTargetCategory(e.target.value)}
            className="border border-[#ccd0d4] bg-white rounded px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#2271b1] shadow-xs cursor-pointer max-w-xs"
          >
            <option value="">اختر الفئة المستهدفة...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          disabled={busy || !bulkAction || selectedCount === 0}
          onClick={onApply}
          className="bg-[#f6f7f7] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white text-[#2271b1] text-xs font-semibold px-3 py-1 rounded transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          تطبيق
        </button>

        {selectedCount > 0 && (
          <span className="text-xs font-bold text-slate-700 mr-2 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
            تم تحديد {selectedCount} من {totalPageCount}
          </span>
        )}
      </div>

      {selectedCount > 0 && (
        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline mr-auto"
        >
          إلغاء التحديد
        </button>
      )}
    </div>
  );
}
