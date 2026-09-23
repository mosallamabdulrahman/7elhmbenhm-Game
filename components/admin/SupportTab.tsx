"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Headphones,
  Image as ImageIcon,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAdminStore } from "@/stores/useAdminStore";
import { useDragScroll } from "@/hooks/useDragScroll";

export interface SupportMessage {
  id: string;
  sender_name?: string;
  sender_email?: string;
  sender_role?: string;
  subject?: string;
  message?: string;
  image_url?: string;
  room_id?: string;
  status: "unread" | "read" | "resolved" | string;
  created_at: string;
}

interface SupportTabProps {
  notify?: (msg: string, type?: "success" | "error" | "info") => void;
  onRefreshUnread?: () => void;
}

export default function SupportTab(props: SupportTabProps) {
  const messages = useAdminStore((s) => s.supportMessages);
  const loading = useAdminStore((s) => s.supportLoading);
  const busy = useAdminStore((s) => s.supportBusy);
  const fetchMessages = useAdminStore((s) => s.loadSupportMessages);
  const handleUpdateStatus = useAdminStore((s) => s.updateSupportStatus);
  const deleteSupportMessages = useAdminStore((s) => s.deleteSupportMessages);
  const storeNotify = useAdminStore((s) => s.notify);
  const notify = props.notify ?? storeNotify;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read" | "resolved">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [previewMsg, setPreviewMsg] = useState<SupportMessage | null>(null);

  const {
    ref: tableRef,
    onMouseDown: handleMouseDown,
    onMouseLeave: handleMouseLeave,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
  } = useDragScroll();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`هل أنت متأكد من حذف ${ids.length} رسالة؟`)) return;
    await deleteSupportMessages(ids);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (previewMsg && ids.includes(previewMsg.id)) {
      setPreviewMsg(null);
    }
  };

  const handleBulkSubmit = () => {
    if (!bulkAction) return;
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      notify?.("يرجى تحديد رسالة واحدة على الأقل.", "error");
      return;
    }

    if (bulkAction === "delete") {
      handleDelete(ids);
    } else if (bulkAction === "read") {
      Promise.all(ids.map((id) => handleUpdateStatus(id, "read")));
    } else if (bulkAction === "resolved") {
      Promise.all(ids.map((id) => handleUpdateStatus(id, "resolved")));
    }
    setBulkAction("");
  };

  const filteredMessages = useMemo(() => {
    let result = messages;
    if (filterStatus !== "all") {
      result = result.filter((m) => m.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.sender_name?.toLowerCase().includes(q) ||
          m.sender_email?.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q) ||
          m.room_id?.toLowerCase().includes(q) ||
          m.sender_role?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [messages, filterStatus, searchQuery]);

  const counts = useMemo(() => {
    const unread = messages.filter((m) => m.status === "unread").length;
    const read = messages.filter((m) => m.status === "read").length;
    const resolved = messages.filter((m) => m.status === "resolved").length;
    return { all: messages.length, unread, read, resolved };
  }, [messages]);

  const allSelected =
    filteredMessages.length > 0 &&
    filteredMessages.every((m) => selectedIds.has(m.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#2c3338]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`cursor-pointer px-2 py-1 rounded transition ${
              filterStatus === "all"
                ? "font-bold text-[#1d2327] bg-white shadow-sm border border-slate-200"
                : "text-[#2271b1] hover:underline"
            }`}
          >
            الكل ({counts.all})
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setFilterStatus("unread")}
            className={`cursor-pointer px-2 py-1 rounded transition ${
              filterStatus === "unread"
                ? "font-bold text-[#1d2327] bg-white shadow-sm border border-slate-200"
                : "text-[#2271b1] hover:underline"
            }`}
          >
            جديدة ({counts.unread})
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setFilterStatus("read")}
            className={`cursor-pointer px-2 py-1 rounded transition ${
              filterStatus === "read"
                ? "font-bold text-[#1d2327] bg-white shadow-sm border border-slate-200"
                : "text-[#2271b1] hover:underline"
            }`}
          >
            تمت القراءة ({counts.read})
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setFilterStatus("resolved")}
            className={`cursor-pointer px-2 py-1 rounded transition ${
              filterStatus === "resolved"
                ? "font-bold text-[#1d2327] bg-white shadow-sm border border-slate-200"
                : "text-[#2271b1] hover:underline"
            }`}
          >
            محلولة ({counts.resolved})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchMessages(true)}
            disabled={busy}
            className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${busy ? "animate-spin text-cyan-600" : ""}`}
            />
            <span>تحديث</span>
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="بحث في الرسائل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg pr-7 pl-3 py-1.5 outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] transition w-44 sm:w-60"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Bulk Action Row */}
      <div className="flex items-center gap-2">
        <select
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none text-slate-700"
        >
          <option value="">إجراءات جماعية</option>
          <option value="read">تحديد كمقروءة</option>
          <option value="resolved">تحديد كمحلولة</option>
          <option value="delete">حذف</option>
        </select>
        <button
          type="button"
          onClick={handleBulkSubmit}
          disabled={!bulkAction || selectedIds.size === 0 || busy}
          className="bg-[#f6f7f7] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white text-[#2271b1] text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          تطبيق
        </button>
        {selectedIds.size > 0 && (
          <span className="text-xs text-slate-500 font-bold mr-2">
            تم تحديد {selectedIds.size}
          </span>
        )}
      </div>

      {/* Main Table */}
      <div
        ref={tableRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto cursor-grab active:cursor-grabbing select-none"
      >
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </th>
              <th className="p-3 w-28">الحالة</th>
              <th className="p-3 w-40">المرسل</th>
              <th className="p-3 min-w-[240px]">الرسالة</th>
              <th className="p-3 w-36">الغرفة / الرابط</th>
              <th className="p-3 w-32">التاريخ</th>
              <th className="p-3 w-28 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                    <span>جاري تحميل رسائل الدعم...</span>
                  </div>
                </td>
              </tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Headphones className="w-8 h-8 text-slate-300" />
                    <span>لا توجد رسائل دعم مطابقة.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedIds.has(msg.id);
                const isUnread = msg.status === "unread";
                const isResolved = msg.status === "resolved";

                return (
                  <tr
                    key={msg.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isUnread ? "bg-amber-50/30 font-semibold" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(msg.id)}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isUnread
                            ? "bg-amber-100 text-amber-800"
                            : isResolved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isUnread && <AlertCircle className="w-3 h-3" />}
                        {isResolved && <CheckCircle2 className="w-3 h-3" />}
                        {!isUnread && !isResolved && (
                          <MailOpen className="w-3 h-3" />
                        )}
                        <span>
                          {isUnread
                            ? "جديدة"
                            : isResolved
                              ? "محلولة"
                              : "تمت القراءة"}
                        </span>
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">
                          {msg.sender_name || "مجهول"}
                        </span>
                        {msg.sender_email && (
                          <a
                            href={`mailto:${msg.sender_email}`}
                            className="text-[10px] text-cyan-600 hover:underline font-mono"
                            title="إرسال بريد إلكتروني"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {msg.sender_email}
                          </a>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {msg.sender_role === "referee" ? "حكم اللعبة" : "لاعب"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div
                        onClick={() => {
                          setPreviewMsg(msg);
                          if (msg.status === "unread") {
                            handleUpdateStatus(msg.id, "read");
                          }
                        }}
                        className="cursor-pointer group/msg"
                        title="انقر لعرض الرسالة كاملة"
                      >
                        {msg.subject && (
                          <div className="font-bold text-slate-900 group-hover/msg:text-cyan-700 mb-0.5 line-clamp-1">
                            {msg.subject}
                          </div>
                        )}
                        <div className="line-clamp-2 text-slate-600 text-[11px]">
                          {msg.message}
                        </div>
                        {msg.image_url && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-md">
                              <ImageIcon className="w-3 h-3" />
                              <span>يوجد صورة مرفقة</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {msg.room_id ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (msg.room_id) {
                              navigator.clipboard.writeText(msg.room_id);
                              notify?.("تم نسخ معرف الغرفة!", "success");
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition"
                          title="نسخ معرف الغرفة"
                        >
                          <Copy className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[90px]">
                            {msg.room_id}
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleString("ar-EG", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewMsg(msg);
                            if (msg.status === "unread") {
                              handleUpdateStatus(msg.id, "read");
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-cyan-600 hover:bg-slate-100 transition cursor-pointer"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {msg.status !== "resolved" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(msg.id, "resolved")
                            }
                            className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                            title="تحديد كمحلولة"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete([msg.id])}
                          className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Message Preview Modal */}
      <AnimatePresence>
        {previewMsg && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 dir-rtl"
            onClick={() => setPreviewMsg(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    رسالة دعم من {previewMsg.sender_name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMsg(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block mb-0.5">المرسل:</span>
                    <span className="font-bold text-slate-800">
                      {previewMsg.sender_name} ({previewMsg.sender_role === "referee" ? "حكم" : "لاعب"})
                    </span>
                    {previewMsg.sender_email && (
                      <a
                        href={`mailto:${previewMsg.sender_email}`}
                        className="text-cyan-600 hover:underline block font-mono text-[11px] mt-0.5"
                      >
                        {previewMsg.sender_email}
                      </a>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">الحالة:</span>
                    <span className="font-bold text-slate-800">
                      {previewMsg.status === "unread"
                        ? "جديدة"
                        : previewMsg.status === "resolved"
                          ? "محلولة"
                          : "تمت القراءة"}
                    </span>
                  </div>
                  {previewMsg.subject && (
                    <div className="col-span-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block mb-0.5">عنوان المشكلة:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {previewMsg.subject}
                      </span>
                    </div>
                  )}
                  {previewMsg.room_id && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5">
                        معرف الغرفة:
                      </span>
                      <span className="font-mono font-bold text-slate-800 break-all select-all">
                        {previewMsg.room_id}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block mb-0.5">
                      تاريخ الإرسال:
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(previewMsg.created_at).toLocaleString("ar-EG")}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block mb-1">
                    نص الرسالة:
                  </span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {previewMsg.message}
                  </div>
                </div>

                {previewMsg.image_url && (
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">
                      الصورة المرفقة:
                    </span>
                    <a
                      href={previewMsg.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 hover:border-cyan-500 transition"
                      title="اضغط لفتح الصورة بالحجم الكامل في نافذة جديدة"
                    >
                      <img
                        src={previewMsg.image_url}
                        alt="صورة المشكلة"
                        className="max-h-64 mx-auto rounded-lg object-contain group-hover:scale-[1.01] transition"
                      />
                      <span className="block text-center text-[11px] text-cyan-600 font-bold mt-2 group-hover:underline">
                        فتح الصورة بالحجم الكامل في نافذة جديدة ↗
                      </span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  {previewMsg.status !== "resolved" && (
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(previewMsg.id, "resolved");
                        setPreviewMsg((p) => (p ? { ...p, status: "resolved" } : null));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تحديد كمحلولة</span>
                    </button>
                  )}
                  {previewMsg.status === "unread" && (
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(previewMsg.id, "read");
                        setPreviewMsg((p) => (p ? { ...p, status: "read" } : null));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      تحديد كمقروءة
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete([previewMsg.id])}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الرسالة</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
