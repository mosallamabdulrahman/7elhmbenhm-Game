"use client";

import React from "react";
import Link from "next/link";
import GameLogo from "@/components/common/GameLogo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0B2A4A] text-white select-none border-t border-[#133D6B]">
      {/* Main Navy Bar matching screenshot */}
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          {/* Right Side (RTL): Brand Logo + Game Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-105 shrink-0"
          >
            <GameLogo className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-sm" />
            <span className="font-sans font-bold text-lg sm:text-xl text-white tracking-wide">
              حيلهم بينهم
            </span>
          </Link>

          {/* Center: Clean Links with Dividers matching screenshot */}
          <nav className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs sm:text-sm font-semibold text-slate-200">
            <Link
              href="/#categories"
              className="hover:text-cyan-300 transition-colors"
            >
              الفئات
            </Link>
            <span className="text-slate-500/80 font-normal">|</span>
            <Link
              href="/packages"
              className="hover:text-cyan-300 transition-colors"
            >
              الشحن
            </Link>
            <span className="text-slate-500/80 font-normal">|</span>
            <a
              href="mailto:info@7elhmbenhm.com"
              className="hover:text-cyan-300 transition-colors"
            >
              الدعم
            </a>
            <span className="text-slate-500/80 font-normal">|</span>
            <span className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer">
              الشروط والأحكام
            </span>
            <span className="text-slate-500/80 font-normal">|</span>
            <span className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer">
              الخصوصية
            </span>
          </nav>

          {/* Left Side: Social Media Icons matching screenshot */}
          <div className="flex items-center gap-4 text-slate-300 shrink-0">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1"
              aria-label="X (Twitter)"
            >
              <XIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1"
              aria-label="YouTube"
            >
              <YouTubeIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Subtle Developer & Copyright Bottom Strip */}
      <div className="border-t border-[#103862] bg-[#071F38] py-2.5 px-4 text-center">
        <div className="max-w-[95rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p className="font-medium text-slate-300">
            تم التطوير من قبل{" "}
            <a
              href="https://mosallamabdulrahman.github.io/My-Portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 decoration-cyan-400/50 hover:decoration-cyan-300 transition-all"
            >
              عبدالرحمن
            </a>
          </p>
          <p>© ٢٠٢٦ حيلهم بينهم. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
