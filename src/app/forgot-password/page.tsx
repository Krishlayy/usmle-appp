"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
  authErrorClass,
  authLinkClass,
} from "@/components/ui/AuthShell";

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
    <AuthShell
      eyebrow="Account recovery"
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login" className={authLinkClass}>
            Log in
          </Link>
        </>
      }
    >
      {status === "success" ? (
        <p role="status" className="rounded-md border border-teal-300/30 bg-teal-300/10 px-4 py-3 text-sm leading-relaxed text-teal-200">
          Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {status === "error" && (
            <div role="alert" className={authErrorClass}>
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className={authLabelClass}>Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" className="h-11 w-full text-sm" disabled={status === "loading"}>
            {status === "loading" ? <Loader size="sm" className="mr-2" /> : null}
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}