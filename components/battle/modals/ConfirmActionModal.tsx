"use client";

import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

export interface ConfirmActionModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/70 p-4 dir-rtl overflow-y-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-950">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-bold text-slate-700 mb-5">{message}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border-2 border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              تراجع
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-rose-700 hover:bg-rose-800 py-2.5 text-sm font-bold text-white transition cursor-pointer"
            >
              {confirmLabel || "تأكيد"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
