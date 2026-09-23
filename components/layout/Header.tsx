"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Gamepad2,
  HelpCircle,
  CreditCard,
  User,
  UserPlus,
  LogOut,
  History,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { getUserDisplayName } from "@/lib/auth";
import GameLogo from "@/components/common/GameLogo";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);
  const initAuth = useAuthStore((s) => s.initAuth);
  const handleLogout = useAuthStore((s) => s.signOut);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const cleanupAuth = initAuth();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cleanupAuth();
    };
  }, [initAuth]);

  const navLinks = [
    { name: "ابدأ لعبة", href: "/#game-setup", icon: Gamepad2 },
    { name: "شلون تلعب؟", href: "/#how-to-play", icon: HelpCircle },
    { name: "الباقات", href: "/packages", icon: CreditCard, isRoute: true },
  ];

  return (
    <header
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 pointer-events-none ${
        isScrolled ? "pt-1 sm:pt-2" : "pt-2 sm:pt-3"
      }`}
    >
      {/* Sky-Blue Soft Gradient above/behind the header matching Image 2 */}
      <div
        className="absolute inset-x-0 top-0 h-32 sm:h-36 bg-gradient-to-b from-[#CFEBFE] via-[#E4F3FE]/70 to-transparent pointer-events-none -z-10"
      />

      <div className="max-w-9xl mx-auto pointer-events-auto">
        {/* Floating White Pill Capsule matching brand styling */}
        <div
          className={`bg-white/95 rounded-full border border-slate-200/80 px-3 sm:px-5 py-2 flex items-center justify-between transition-all duration-300 ${
            isScrolled
              ? "backdrop-blur-md shadow-lg shadow-slate-200/50"
              : "shadow-md"
          }`}
        >
          {/* Right Side: Logo & Main Navigation */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0">
              <GameLogo className="w-14 h-14 sm:w-16 sm:h-16 group-hover:scale-105 transition-transform duration-200" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
              {/* Active Home Pill */}
              <Link
                href="/#hero"
                className="bg-[var(--color-primary-blue)] hover:bg-[var(--color-depth-blue)] text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-sm shadow-xs transition-all shrink-0"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </Link>

              {/* Navigation Items with subtle dividers matching header specifications */}
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <React.Fragment key={link.name}>
                    <span
                      className="w-px h-4 bg-slate-200 shrink-0 mx-0.5"
                      aria-hidden="true"
                    />
                    <Link
                      href={link.href}
                      className="group px-2.5 py-1.5 text-[#20414B] hover:text-[var(--color-primary-blue)] font-bold text-sm flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Icon className="w-4 h-4 text-[#60A9CE] group-hover:text-[var(--color-primary-blue)] transition-colors" />
                      <span>{link.name}</span>
                    </Link>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Left Side: Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {authLoading ? (
              <div className="h-9 w-28 bg-slate-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/my-games"
                  className="bg-[var(--color-primary-blue)] hover:bg-[var(--color-depth-blue)] text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <History className="w-4 h-4" />
                  <span>ألعابي</span>
                </Link>
                <span className="hidden sm:flex items-center gap-1.5 text-[#20414B] font-bold text-xs sm:text-sm bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                  <User className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" />
                  {getUserDisplayName(user)}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Sign Up: Blue Pill Button */}
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-depth-blue)] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full shadow-xs transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب</span>
                </Link>

                {/* Login: 3D Green Pill Button */}
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 bg-[#70c922] hover:bg-[#64b51e] border-b-4 border-[#4f9514] active:border-b-0 active:translate-y-1 text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-1.5 rounded-full shadow-sm transition-all cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>دخول</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-[var(--color-primary-blue)] hover:bg-slate-100 rounded-full transition-colors"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden mt-2 max-w-7xl mx-auto pointer-events-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/80 p-4"
          >
            <div className="space-y-2">
              <Link
                href="/#hero"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 font-bold text-[var(--color-primary-blue)] bg-blue-50 py-2.5 px-4 rounded-xl"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </Link>

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 font-bold text-[#20414B] hover:text-[var(--color-primary-blue)] hover:bg-slate-50 py-2.5 px-4 rounded-xl transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#60A9CE]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {!user && (
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-depth-blue)] text-white font-bold py-2.5 rounded-xl shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء حساب</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
