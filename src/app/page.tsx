"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

function BookIcon({ className = "w-4 h-4", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 1 4 17.5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5H18V4H6.5Z"
        fill={color}
      />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h12.17l-4.58 4.59L14 18l7-7-7-7-1.41 1.41L17.17 10H5v2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AnalyticsIcon({ className = "w-5 h-5", color = "#0F172A" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 19h16v2H2V3h2v16Zm3-2V9h3v8H7Zm5 0V5h3v12h-3Zm5 0v-6h3v6h-3Z"
        fill={color}
      />
    </svg>
  );
}

function ShoppingCartIcon({ className = "w-5 h-5", color = "#0F172A" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 4h10l3 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l3-4Zm1.05 2L6.5 8h11L16 6H8.05ZM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        fill={color}
      />
    </svg>
  );
}

export default function QBankHomeLayout() {
  let session = null;
  try {
    const auth = useSession();
    session = auth?.data || null;
  } catch {
    session = null;
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 font-sans flex flex-col antialiased selection:bg-yellow-200 selection:text-gray-900">
      {/* HEADER / NAVIGATION */}
      <header className="w-full bg-white border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
            <BookIcon className="w-5 h-5 text-gray-900" color="#000000" />
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Micro Q Bank
            </span>
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link
              href={session ? "/dashboard" : "/login"}
              className="hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>

            {session?.user && ["ADMIN", "SUPERADMIN"].includes(session.user.role) ? (
              <Link href="/admin" className="hover:text-gray-900 transition-colors">
                Admin
              </Link>
            ) : (
              <Link href="/admin" className="hover:text-gray-900 transition-colors">
                Admin
              </Link>
            )}

            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-gray-900 transition-colors text-gray-600 font-medium cursor-pointer"
              >
                Log Out
              </button>
            ) : (
              <Link href="/login" className="hover:text-gray-900 transition-colors">
                Log In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="w-full bg-white pt-16 md:pt-24 pb-20 px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            {/* EYEBROW PILL */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FFF455] bg-white text-xs font-bold text-gray-600 tracking-wider uppercase mb-8 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FFF455] inline-block" />
              THE NEW STANDARD IN CLINICAL EDUCATION
            </div>

            {/* MAIN HEADLINE */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-700 text-gray-900 tracking-tight leading-[1.12] mb-6">
              <span
                className="font-normal mr-2.5 inline-block text-gray-900 text-5xl sm:text-6xl md:text-7xl lg:text-[76px]"
                style={{
                  fontFamily: "'Pinyon Script', 'Alex Brush', 'Dancing Script', 'Playfair Display', serif",
                  fontStyle: "italic",
                }}
              >
                Master
              </span>
              Medical Concepts,<br className="hidden sm:inline" />
              One Topic at a Time.
            </h1>

            {/* SUPPORTING PARAGRAPH */}
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              Stop paying for bloated subscriptions. Build your own curriculum with premium, high-yield question banks tailored precisely for your clinical weak spots.
            </p>

            {/* DUAL CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href="/store"
                className="w-full sm:w-auto min-w-[210px] h-[50px] px-6 rounded-xs bg-black text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
              >
                <span>Explore Question Banks</span>
                <ArrowRightIcon className="w-4 h-4 text-white" />
              </Link>

              <Link
                href={session ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto min-w-[210px] h-[50px] px-6 rounded-xs bg-[#FFF455] text-gray-900 border border-[#E2D846] font-semibold text-sm sm:text-base flex items-center justify-center hover:bg-[#FDE047] transition-all shadow-sm"
              >
                {session ? "Go to Dashboard" : "Create Free Account"}
              </Link>
            </div>
          </motion.div>
        </section>

        {/* THREE FEATURE CARDS SECTION */}
        <section className="w-full bg-[#F8FAFC] py-20 px-6 border-t border-gray-100/80 flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* CARD 1 */}
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="bg-white rounded-2xl border border-gray-200/90 p-8 flex flex-col items-start text-left shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00504D] text-white flex items-center justify-center mb-6">
                  <BookIcon className="w-4 h-4 text-white" color="#FFFFFF" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  High-Yield Content
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-normal">
                  Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.
                </p>
              </motion.article>

              {/* CARD 2 */}
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="bg-white rounded-2xl border border-gray-200/90 p-8 flex flex-col items-start text-left shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00504D] text-white flex items-center justify-center mb-6">
                  <AnalyticsIcon className="w-4 h-4 text-white" color="#FFFFFF" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  Advanced Analytics
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-normal">
                  Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.
                </p>
              </motion.article>

              {/* CARD 3 */}
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="bg-white rounded-2xl border border-gray-200/90 p-8 flex flex-col items-start text-left shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00504D] text-white flex items-center justify-center mb-6">
                  <ShoppingCartIcon className="w-4 h-4 text-white" color="#FFFFFF" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  Pay Per Module
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-normal">
                  Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.
                </p>
              </motion.article>
            </div>
          </div>
        </section>

        {/* CTA BANNER SECTION */}
        <section className="w-full bg-[#F8FAFC] pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#111625] rounded-2xl p-8 sm:p-12 md:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-xl">
              <div className="max-w-xl text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                  Ready to elevate your clinical study?
                </h2>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-normal">
                  Join thousands of medical students who have switched to the most efficient way to master USMLE and clinical concepts.
                </p>
              </div>
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="shrink-0 px-8 py-4 rounded-xl bg-[#7DF6EC] text-gray-900 font-bold text-sm sm:text-base hover:bg-[#63e6db] transition-all shadow-md flex items-center justify-center"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#F8FAFC] border-t border-gray-200/80 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <BookIcon className="w-5 h-5 text-gray-900" color="#000000" />
            <span className="font-bold text-gray-900 text-base tracking-tight">
              Micro Q Bank
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-medium text-gray-500 mb-6">
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/support" className="hover:text-gray-900 transition-colors">
              Contact Support
            </Link>
          </nav>

          <p className="text-xs text-gray-400">
            © 2026 Micro Q-Bank. Micro Q-Bank is an independent clinical educational platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
