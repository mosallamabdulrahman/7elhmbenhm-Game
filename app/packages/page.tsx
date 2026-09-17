import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import PaymentGateSection from "@/components/home-page/PaymentGateSection";
import ScrollToTop from "@/components/common/ScrollToTop";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "باقات الشحن - حيلهم بينهم",
  description:
    "اختر باقة الشحن المناسبة لك واستمتع بالنقاط والمساعدات التكتيكية في لعبة حيلهم بينهم.",
};

export default function PackagesPage() {
  return (
    <div
      className="min-h-screen bg-[#FCFDFF] flex flex-col overflow-x-hidden"
      suppressHydrationWarning
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow pt-24 sm:pt-28 pb-12">
        <PaymentGateSection />
      </main>

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Footer */}
      <Footer />
    </div>
  );
}
