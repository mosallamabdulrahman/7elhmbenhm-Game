"use client";

import { motion } from "motion/react";
import { Gamepad2 } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section id="hero" className="pt-24 sm:pt-28 md:pt-26 scroll-mt-20">
      <div className="w-full">
        {/* Panoramic Banner Card Container */}
        <div className="relative w-full overflow-hidden">
          {/* Main Visual Artwork with fluid responsive height */}
          <div className="relative w-full min-h-[340px] sm:min-h-[380px] md:min-h-[430px] lg:min-h-[460px] flex items-center">
            <Image
              src="/images/hero-section.png"
              alt="حيلهم بينهم"
              fill
              priority
              className="object-cover object-center lg:object-right-center select-none pointer-events-none"
            />

            {/* Subtle soft gradient on the right for clean text legibility across all viewport widths */}
            <div className="absolute inset-y-0 right-0 w-full md:w-[65%] lg:w-[52%] bg-gradient-to-l from-white/85 via-white/50 md:via-white/35 to-transparent pointer-events-none" />

            {/* Overlaid Content: Fully responsive on mobile, tablet, and desktop */}
            <div className="relative z-10 w-full md:w-[68%] lg:w-[56%] xl:w-[50%] flex flex-col justify-center items-center xl:items-start text-center xl:text-right px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md sm:max-w-lg w-full flex flex-col pt-2 sm:pt-6 pr-3"
              >
                {/* Headline Text framed between the 4 diagonal decorative stripes */}
                <div className="flex items-center justify-center xl:justify-start gap-2 sm:gap-3.5">
                  <h2 className="text-base sm:text-xl md:text-2xl lg:text-[1.7rem] xl:text-[1.8rem] font-bold text-[#085BA0] leading-snug tracking-tight drop-shadow-xs">
                    لعبة تجمع بين المعلومات العامه،
                    <br />
                    والتخطيط والتحدي بين فريقين
                  </h2>
                </div>

                {/* Call To Action Buttons: Stacked vertically with prominent Play button */}
                <div className="mt-5 sm:mt-7 flex flex-col gap-3 sm:gap-3.5 items-center w-fit">
                  {/* Green "ابدأ اللعبة" Button — Prominently enlarged */}
                  <a
                    href="#game-setup"
                    className="inline-flex items-center justify-center gap-3 w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[360px] bg-gradient-to-b from-[#6bbd24] to-[#559e19] hover:from-[#75ce27] hover:to-[#5ea81b] text-white font-bold text-base sm:text-lg lg:text-xl py-3 sm:py-3.5 lg:py-4 px-6 sm:px-8 rounded-full shadow-lg shadow-[#559e19]/35 hover:scale-105 active:scale-95 transition-all cursor-pointer border-t border-white/40"
                  >
                    <span>ابدأ اللعبة</span>
                    <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 shrink-0" />
                  </a>

                  {/* Light "شلون تلعب؟" Button — Directly stacked underneath */}
                  <a
                    href="#how-to-play"
                    className="inline-flex items-center justify-center gap-2.5 bg-white/95 hover:bg-white text-[#085BA0] font-bold text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 px-5 sm:px-6 rounded-full shadow-xs hover:shadow-md border-2 border-[#1F9FF6]/40 hover:border-[#1F9FF6] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>شلون تلعب؟</span>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#085BA0] text-white flex items-center justify-center text-[10px] sm:text-xs shrink-0 font-bold">
                      ?
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
