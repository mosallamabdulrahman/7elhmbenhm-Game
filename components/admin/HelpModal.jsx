"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import {
  HelpCircle,
  X,
  QrCode,
  Sliders,
  Layers,
  Sparkles,
  MousePointer,
  HelpCircle as QuestionIcon,
  Tag,
  Users,
  LayoutDashboard,
} from "lucide-react";

export default function HelpModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-xl max-h-[88vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-[#2271b1] flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                دليل لوحة التحكم والميزات الجديدة
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                شرح شامل لإدارة اللعبة، الوسائط، والخصائص المحدثة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 leading-relaxed text-slate-600 text-sm">
          {/* Welcome Intro */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">
                مرحباً بك في لوحة تحكم حيلهم بينهم!
              </p>
              <p className="text-[11.5px] leading-normal text-slate-600">
                تم تصميم لوحة التحكم لإدارة جميع محتويات اللعبة بسلاسة مع دعم كامل لأجهزة التابلت والجوال. إليك تفاصيل أهم الأقسام والتحسينات الحديثة:
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* New Feature 1: Wla Kelma QR Mode */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                  🎭
                </span>
                <h4 className="font-bold text-amber-950 text-xs">
                  فئة &quot;ولا كلمة&quot; (التمثيل الصامت عبر الباركود QR)
                </h4>
              </div>
              <p className="text-[11.5px] text-amber-900 leading-normal">
                فئة تفاعلية تعتمد على قيام أحد اللاعبين بتمثيل الشيء المطلوب (مهنة، رياضة، نشاط، مثل شعبي) لزملائه دون أن ينطق بكلمة!
                <br />
                <strong>كيف تعمل في شاشة اللعب؟</strong> لا يظهر نص السؤال للحكم أو على الشاشة الكبيرة تجنباً للحرق، بل يظهر رمز QR يمسحه اللاعب الممثل بهاتفه المحمول مباشرة دون الحاجة لتسجيل دخول ليرى العنصر وصورته التوضيحية ويبدأ التمثيل لفريقه!
              </p>
            </div>

            {/* New Feature 2: Smart Stepper */}
            <div className="bg-cyan-50/70 border border-cyan-200/80 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Sliders className="w-4 h-4 text-cyan-700" />
                <h4 className="font-bold text-cyan-950 text-xs">
                  الترتيب الذكي للمواضع (Smart Stepper)
                </h4>
              </div>
              <p className="text-[11.5px] text-cyan-900 leading-normal">
                في نافذة إضافة وتعديل الأسئلة والفئات، عند استخدام أسهم زيادة أو خفض &quot;ترتيب العرض&quot;، يقوم النظام تلقائياً <strong>بالقفز المباشر إلى الأرقام الشاغرة المتاحة</strong> ويتخطى المواضع المحجوزة مسبقاً، مما يمنع تعارض الأرقام ويسهّل الترتيب السريع.
              </p>
            </div>

            {/* New Feature 3: Media Rules */}
            <div className="bg-purple-50/70 border border-purple-200/80 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  🎬
                </span>
                <h4 className="font-bold text-purple-950 text-xs">
                  تحكم الوسائط المتقدم (صور، صوت، فيديو)
                </h4>
              </div>
              <ul className="text-[11.5px] text-purple-900 list-disc list-inside space-y-1">
                <li><strong>مدة عرض الصورة:</strong> تحديد عدد الثواني لظهور الصورة قبل إخفائها تلقائياً بعد انتهاء العداد.</li>
                <li><strong>مرات تشغيل الصوت والفيديو:</strong> حصر مرات الاستماع أو المشاهدة لمرة واحدة أو مرتين أو غير محدود.</li>
                <li><strong>ظهور السؤال أولاً:</strong> اختيار ظهور نص السؤال أولاً قبل الوسائط أو إخفائه حسب طبيعة التحدي.</li>
              </ul>
            </div>

            {/* New Feature 4: Tablet Responsiveness */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <MousePointer className="w-4 h-4 text-slate-700" />
                <h4 className="font-bold text-slate-900 text-xs">
                  التمرير والسحب السلس للتابلت (Tablet Drag-to-Scroll)
                </h4>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-normal">
                تم تجهيز جداول الأسئلة والفئات والتصنيفات لدعم التمرير الأفقي عبر السحب بالماوس أو اللمس بالأصبع (Drag-to-Scroll)، مما يتيح استعراض كافة الأعمدة والبيانات بأريحية تامة على أجهزة iPad والتابلت دون انضغاط.
              </p>
            </div>

            {/* Core Sections Overview */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <h4 className="font-bold text-slate-800 text-xs">
                📌 الأقسام الرئيسية للوحة التحكم:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-cyan-600" />
                    الرئيسية
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    إحصائيات إجمالية للأسئلة، الفئات، الصعوبات، ونشاط اللعبة.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    التصنيفات (المجموعات)
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    المجموعات الكبرى التي تنطوي تحتها فئات الأسئلة لتسهيل الفلترة.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    فئات الأسئلة
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    إدارة أسماء الفئات، صور الغلاف، ترتيب الظهور، وربطها بالتصنيف.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                    <QuestionIcon className="w-3.5 h-3.5 text-blue-600" />
                    الأسئلة
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    إضافة وتحرير بنك الأسئلة، تحديد الصعوبة والضربات والصور المرفقة.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    المستخدمين وبطل الموقع
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    إدارة حسابات الحكام والصلاحيات وتعديل كلمة المرور أو تخصيص بطل واجهة الموقع.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl bg-[#2271b1] hover:bg-[#135e96] text-white px-6 py-2 text-xs font-bold transition-all duration-150 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            إغلاق الدليل
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
