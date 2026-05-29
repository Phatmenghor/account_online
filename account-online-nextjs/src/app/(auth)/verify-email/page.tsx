"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import { verifyEmailService } from "@/services/auth/register.service";
import Spinner from "@/components/shared/common/modern-spinner";

export default function VerifyEmailPage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { newCode[i] = ch; });
    setCode(newCode);
    const nextEmpty = Math.min(pasted.length, 5);
    inputRefs.current[nextEmpty]?.focus();
  }

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      AppToast({ type: "warning", message: "Please enter the 6-digit code." });
      return;
    }
    if (!email) {
      AppToast({ type: "error", message: "Email address is missing." });
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmailService({ username: email, code: fullCode });
      AppToast({ type: "success", message: "Email verified! You can now log in." });
      router.push(ROUTES.AUTH.LOGIN);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Verification failed. Please check the code and try again.";
      AppToast({ type: "error", message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left hero image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image
          src="/assets/cpbank.png"
          alt="Background"
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
          <h2 className="text-3xl font-bold leading-snug">Verify Your Email</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            One more step — enter the code we sent to confirm your email address.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
        <Card className="w-full max-w-lg shadow-2xl border border-border/60 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 border-b border-border/50 px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <MailCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Email Verification
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Check your inbox
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a 6-digit code to{" "}
              {email ? (
                <span className="font-medium text-foreground">{email}</span>
              ) : (
                "your email"
              )}
              . The code expires in 10 minutes.
            </p>
          </div>

          {/* Body */}
          <CardContent className="px-8 py-8 space-y-6">
            {/* OTP inputs */}
            <div
              className="flex items-center justify-center gap-3"
              onPaste={handlePaste}
            >
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
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ))}
            </div>

            <Button
              className="w-full h-11 font-semibold"
              disabled={isLoading || code.join("").length < 6}
              onClick={handleVerify}
            >
              {isLoading ? (
                <>
                  <Spinner size={4} color="text-white" />
                  <span className="ml-2">Verifying...</span>
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="text-primary font-medium hover:underline"
              >
                Register again
              </Link>
            </p>

            <p className="text-center text-sm text-muted-foreground">
              <Link href={ROUTES.AUTH.LOGIN} className="text-muted-foreground hover:underline">
                ← Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
