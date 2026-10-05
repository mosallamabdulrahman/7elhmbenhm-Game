"use client";

import { motion } from "motion/react";
import { Gamepad2, Sparkles, HelpCircle, Trophy } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="pt-24 sm:pt-28 md:pt-32 pb-6 sm:pb-10 scroll-mt-20"
    >
      <div className="">
        {/* Panoramic Banner Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full"
        >
          {/* Main Visual Artwork with native aspect ratio */}
          <div className="relative w-full min-h-[340px] sm:min-h-[380px] md:min-h-[430px] lg:min-h-[460px] flex items-center">
            <Image
              src="/images/hero-section.png"
              alt="حيلهم بينهم - استوديو التحدي والمسابقات"
              fill
              priority
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
