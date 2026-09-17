"use client";

import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  CheckCircle,
  Headphones,
  ImagePlus,
  Loader2,
  Send,
  X,
} from "lucide-react";

interface GameSupportModalProps {
  roomId: string;
  onClose: () => void;
}

export function GameSupportModal({ roomId, onClose }: GameSupportModalProps) {
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت).");
      return;
    }

    setErrorMsg("");
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const emailTrimmed = senderEmail.trim().toLowerCase();
    const subjectTrimmed = subject.trim();
    const messageTrimmed = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setErrorMsg("يرجى إدخال بريد إلكتروني صحيح للتواصل معك.");
      return;
    }

    if (!subjectTrimmed || subjectTrimmed.length < 3) {
      setErrorMsg("يرجى كتابة عنوان للمشكلة (3 أحرف على الأقل).");
      return;
    }

    if (!messageTrimmed || messageTrimmed.length < 5) {
      setErrorMsg("يرجى كتابة تفاصيل المشكلة (5 أحرف على الأقل).");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          sender_email: emailTrimmed,
          subject: subjectTrimmed,
          message: messageTrimmed,
          image_data: imagePreview || null,
          sender_role: "referee",
          page_url: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSentSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(data.error || "فشل إرسال الرسالة.");
      }
    } catch {
      setErrorMsg("تعذر الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/80 p-4 dir-rtl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-950 text-base mb-1">
                إرسال رسالة للدعم
              </h3>
              <p className="text-[11px] text-slate-400 font-bold">
                أرسل ملاحظتك أو مشكلتك للإدارة مباشرة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              تم إرسال رسالتك بنجاح!
            </h4>
            <p className="text-xs text-slate-500">
              وصلت رسالتك للإدارة وسيتم الرد عليك عبر البريد ومراجعتها فوراً.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-right">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                سنستخدم هذا البريد للتواصل معك وحل المشكلة.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                عنوان المشكلة *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثلاً: خطأ في إجابة سؤال، زر لا يستجيب..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                تفاصيل المشكلة *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اشرح ما حدث بالتفصيل هنا..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                إرفاق صورة أو لقطة شاشة (اختياري)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="معاينة الصورة"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="text-right overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                        {imageFile?.name || "صورة مرفقة"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {imageFile?.size
                          ? `${(imageFile.size / 1024).toFixed(0)} KB`
                          : "جاهزة للإرسال"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer shrink-0"
                    title="إزالة الصورة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-cyan-400 bg-slate-50/50 hover:bg-cyan-50/40 text-slate-600 hover:text-cyan-700 text-xs font-bold transition cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4 text-cyan-600" />
                  <span>اضغط لاختيار صورة توضيحية للمشكلة</span>
                </button>
              )}
            </div>

            {errorMsg && (
              <p className="text-rose-600 text-xs font-bold bg-rose-50 border border-rose-100 p-2 rounded-lg">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !senderEmail.trim() ||
                  !subject.trim() ||
                  !message.trim()
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>إرسال للدعم</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
