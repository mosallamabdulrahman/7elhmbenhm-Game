"use client";

import { motion } from "motion/react";
import { Lightbulb, Target, Trophy, ArrowLeft } from "lucide-react";
import type { ElementType } from "react";

interface StepItem {
  number: string;
  badgeColor: string;
  type: "image" | "icon";
  src?: string;
  icon?: ElementType;
  iconColor?: string;
  title: string;
  desc: string;
}

export default function HowToPlaySection() {
  const steps: StepItem[] = [
    {
      number: "1",
      badgeColor: "bg-[#70c922]",
      type: "image",
      src: "/images/gear/tank.png",
      title: "جهز جيشك",
      desc: "اشتر وحداتك\nووزعها بسرية",
    },
    {
      number: "2",
      badgeColor: "bg-[#1F9FF6]",
      type: "icon",
      icon: Lightbulb,
      iconColor: "text-[#1F9FF6]",
      title: "جاوب",
      desc: "أجب عن الأسئلة\nلتحصل على الطلقات",
    },
    {
      number: "3",
      badgeColor: "bg-[#9333ea]",
      type: "icon",
      icon: Target,
      iconColor: "text-[#9333ea]",
      title: "اهجم",
      desc: "اختر موقعاً على\nخريطة الخصم",
    },
    {
      number: "4",
      badgeColor: "bg-[#f59e0b]",
      type: "icon",
      icon: Trophy,
      iconColor: "text-[#f59e0b]",
      title: "دمر واربح",
      desc: "أعلى نقاط عند نهاية\nالمعركة تفوز",
    },
  ];

  return (
    <section id="how-to-play" className="py-6 md:py-9 scroll-mt-20">
      {/* Container */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Card Container with reduced padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#E0F2FE] border border-[#cbe4fc] rounded-rounded-2xl p-5 sm:p-7 lg:p-8 shadow-xs"
        >
          {/* Header */}
          <div className="text-center mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#20414B] mb-1.5">
              شلون تلعب؟
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold">
              4 خطوات بسيطة للانطلاق في المعركة
            </p>
          </div>

          {/* 4 Steps Cards Grid - Compact & neatly proportioned */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.number}
                  className="bg-white rounded-2xl p-3.5 sm:p-4.5 lg:p-5 flex flex-col items-center text-center shadow-xs border border-white/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Number Badge */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${item.badgeColor} text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs mb-2`}
                  >
                    {item.number}
                  </div>

                  {/* Graphic / Icon */}
                  <div className="h-10 sm:h-12 flex items-center justify-center my-1">
                    {item.type === "image" && item.src ? (
                      <img
                        src={item.src}
                        alt={item.title}
                        className="h-9 sm:h-11 w-auto object-contain drop-shadow-xs transition-transform duration-200 hover:scale-105"
                      />
                    ) : (
                      Icon && (
                        <Icon
                          className={`w-7 h-7 sm:w-9 sm:h-9 ${item.iconColor} stroke-[2] transition-transform duration-200 hover:scale-105`}
                        />
                      )
                    )}
                  </div>

                  {/* Step Title */}
                  <h3 className="font-bold text-[#20414B] text-sm sm:text-base mt-1 mb-1">
                    {item.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed whitespace-pre-line font-semibold">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Button */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <a
              href="#game-setup"
              className="inline-flex items-center justify-center gap-2 bg-[#1F9FF6] hover:bg-[#0F74C5] active:scale-95 text-white font-bold px-8 sm:px-10 py-2.5 sm:py-3 rounded-full shadow-md shadow-blue-500/20 transition-all text-sm sm:text-base cursor-pointer hover:shadow-lg"
            >
              <span>تعرف أكثر</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
