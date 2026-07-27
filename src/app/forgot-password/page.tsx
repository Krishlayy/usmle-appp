"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#F8FAF9]">
      {/* LEFT PANEL - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#0D4F47] flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-[#0D4F47]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Micro Q-Bank</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Master Medicine.<br/>Ace the Boards.</h2>
          <ul className="space-y-4 text-[#A7F3D0] text-lg font-medium">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              2,000+ High-Yield Questions
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Detailed Explanations
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Track Your Progress
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB]">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#111827] mb-2">Reset Password</h2>
            <p className="text-[#6B7280]">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {status === "success" ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 font-medium">
              Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "error" && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                  {errorMessage}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0D9488] hover:bg-[#0a7d6f] text-white py-3 rounded-lg font-bold text-lg transition-colors border-0"
                disabled={status === "loading"}
              >
                {status === "loading" ? <Loader size="sm" className="mr-2" /> : null}
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center text-sm font-medium text-[#6B7280]">
            Remember your password?{" "}
            <Link href="/login" className="text-[#0D9488] hover:underline font-bold">
              Log in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
