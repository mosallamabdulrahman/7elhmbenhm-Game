"use client";

import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

export interface BoardModalProps {
  title: string;
  subtitle?: string | null;
  onClose: () => void;
  dismissible?: boolean;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
}

export function BoardModal({
  title,
  subtitle,
  onClose,
  dismissible = true,
  actionButton = null,
  children,
}: BoardModalProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 dir-rtl overflow-y-auto"
      onClick={dismissible ? onClose : undefined}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-slate-950 text-base font-bold">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actionButton}
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer transition"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
