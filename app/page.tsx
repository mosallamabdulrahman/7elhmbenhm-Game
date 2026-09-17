import React from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home-page/HeroSection";
import HowToPlaySection from "@/components/home-page/HowToPlaySection";
import GameSetupSection from "@/components/home-page/GameSetupSection";
import ScrollToTop from "@/components/common/ScrollToTop";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#FCFDFF] flex flex-col overflow-x-hidden"
      suppressHydrationWarning
    >
      {/* Dynamic Sticky Header */}
      <Header />

      {/* Main Sections Body */}
      <main className="flex-grow">
        {/* Zero-padding Hero Section */}
        <HeroSection />

        {/* Pixel-perfect How to Play Section */}
        <HowToPlaySection />

        {/* Tactical Game Setup Panel before Footer */}
        <GameSetupSection />
      </main>

      {/* Scroll to Top floating utility */}
      <ScrollToTop />

      {/* Footer component */}
      <Footer />
    </div>
  );
}
