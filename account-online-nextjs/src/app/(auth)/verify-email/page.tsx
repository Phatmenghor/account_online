"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, KeyboardEvent } from "react";
import { ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import Spinner from "@/components/shared/common/modern-spinner";

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setCode(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function onVerify() {
    const fullCode = code.join("");
    if (fullCode.length < CODE_LENGTH) {
      AppToast({ type: "error", message: "Please enter the complete 6-digit code" });
      return;
    }
    setIsLoading(true);
    try {
      // TODO: call verify-email API with email + code
      AppToast({ type: "success", message: "Email verified successfully!" });
      router.replace(ROUTES.AUTH.LOGIN);
    } catch (error: any) {
      AppToast({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Invalid verification code",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onResend() {
    setIsResending(true);
    try {
      // TODO: call resend-verification-email API
      AppToast({ type: "success", message: "Verification code resent to your email" });
    } catch (error: any) {
      AppToast({ type: "error", message: "Failed to resend code" });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* Left — hero image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image
          src="/assets/cpbank.png"
          alt="CPBank Background"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
            Management System
          </p>
          <h2 className="text-3xl font-bold leading-snug">Verify Email</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Check your inbox for the verification code we sent you.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
        <Card className="w-full max-w-lg shadow-2xl border border-border/60 rounded-2xl overflow-hidden">

          {/* Card header */}
          <div className="bg-primary/5 border-b border-border/50 px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">{email || "your email"}</span>
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-8 py-7">
            <div className="space-y-6">
              {/* Code input boxes */}
              <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-xl font-bold border-2 focus:border-primary rounded-lg"
                  />
                ))}
              </div>

              <Button
                type="button"
                onClick={onVerify}
                className="w-full h-11 font-semibold"
                disabled={isLoading || code.join("").length < CODE_LENGTH}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size={4} color="text-primary-foreground" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  onClick={onResend}
                  disabled={isResending}
                  className="text-primary font-medium hover:underline disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-medium hover:underline">
                  Back to sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
