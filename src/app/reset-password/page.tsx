"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { AuthShell, authInputClass, authLabelClass, authErrorClass } from "@/components/ui/AuthShell";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
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
      title={status === "success" ? "Password Reset" : "Create New Password"}
      subtitle={
        status === "success"
          ? "Your password has been successfully reset. You can now log in with your new password."
          : "Your new password must be different from previously used passwords."
      }
    >
      {status === "success" ? (
        <Button onClick={() => router.push("/login")} className="h-11 w-full text-sm">
          Log In
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {status === "error" && (
            <div role="alert" className={authErrorClass}>
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="new-password" className={authLabelClass}>New password</label>
              <input
                id="new-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authInputClass}
                placeholder="At least 8 characters"
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className={authLabelClass}>Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={authInputClass}
                placeholder="Repeat password"
                minLength={8}
              />
            </div>
          </div>

          <Button type="submit" className="h-11 w-full text-sm" disabled={status === "loading"}>
            {status === "loading" ? <Loader size="sm" className="mr-2" /> : null}
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader size="lg" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}