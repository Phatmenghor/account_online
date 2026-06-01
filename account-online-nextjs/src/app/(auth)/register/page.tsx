"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AppToast } from "@/components/shared/toast/app-toast";
import { registerInitiateService, registerVerifyService } from "@/services/auth/register.service";
import { ROUTES } from "@/constants/AppRoutes/routes";

const step1Schema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  fullName: z.string().min(1, "Full name is required"),
  position: z.string().min(1, "Position is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  branch: z.string().min(1, "Branch is required"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleDigitChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setOtpError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newDigits.every(d => d !== "") && newDigits.join("").length === 6) {
      handleOtpComplete(newDigits.join(""));
    }
  }, [digits]);

  const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handleDigitPaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      setOtpError("");
      inputRefs.current[5]?.focus();
      handleOtpComplete(pasted);
    }
  }, []);

  async function handleOtpComplete(code: string) {
    setIsLoading(true);
    setOtpError("");
    try {
      const data = await registerVerifyService(pendingEmail, code);
      AppToast({ type: "success", message: "Account created!", description: "Welcome to CP Bank." });
      const role: string = data?.userRole?.userRole ?? "";
      if (role === "STAFF") router.replace("/");
      else router.replace(ROUTES.DASHBOARD.INDEX);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid verification code. Please try again.";
      setOtpError(msg);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsLoading(false);
    }
  }

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "", password: "", confirmPassword: "", fullName: "", position: "", staffId: "", phoneNumber: "", branch: "" } as Step1Data,
  });

  function startCountdown() {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  }

  async function onStep1Submit(values: Step1Data) {
    setIsLoading(true);
    try {
      await registerInitiateService({ ...values, username: values.email });
      setPendingEmail(values.email);
      setStep(2);
      setDigits(["", "", "", "", "", ""]);
      setOtpError("");
      startCountdown();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      AppToast({ type: "success", message: "Verification code sent", description: `Check your email: ${values.email}` });
    } catch (err: any) {
      AppToast({ type: "error", message: err?.response?.data?.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await registerInitiateService({ ...form1.getValues(), username: form1.getValues().email });
      startCountdown();
      setDigits(["", "", "", "", "", ""]);
      setOtpError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      AppToast({ type: "success", message: "New code sent", description: `Check your email: ${pendingEmail}` });
    } catch {
      AppToast({ type: "error", message: "Failed to resend. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* Left image — 30% */}
      <div className="hidden lg:block relative overflow-hidden flex-shrink-0" style={{ width: "35%" }}>
        <Image src="/assets/cpbank.png" alt="CP Bank" fill sizes="35vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-10 left-8 right-8 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-2">Cambodia Post Bank</p>
          <h2 className="text-2xl font-bold leading-snug">Create Your Account</h2>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            Register for access to the CP Bank account opening platform.
          </p>
        </div>
      </div>

      {/* Right form — 70% */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
        <div className="flex flex-1 items-start justify-center px-8 py-10">
          <div className="w-full max-w-2xl">

            {/* Header */}
            <div className="mb-8">
              {/* Step pills */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}>
                  {step > 1 ? <CheckCircle2 className="w-3 h-3" /> : <span>1</span>}
                  <span>Account Info</span>
                </div>
                <div className={`flex-1 h-px ${step > 1 ? "bg-primary" : "bg-gray-200"}`} />
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}>
                  <span>2</span>
                  <span>Verify Email</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                {step === 1 ? "Create your account" : "Verify your email"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 ? "Fill in your details below to get started" : `We sent a 6-digit code to ${pendingEmail}`}
              </p>
            </div>

            {/* ── Step 1 ── */}
            {step === 1 && (
              <Form {...form1}>
                <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5" autoComplete="off">

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">

                    {/* Email */}
                    <FormField control={form1.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Please enter your email" disabled={isLoading} autoComplete="off" readOnly onFocus={(e) => e.target.removeAttribute("readonly")} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Password row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form1.control} name="password" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Password <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showPassword ? "text" : "password"} placeholder="Please enter password" disabled={isLoading} autoComplete="new-password" readOnly onFocus={(e) => e.target.removeAttribute("readonly")} className="h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                              <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form1.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Confirm Password <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showConfirm ? "text" : "password"} placeholder="Please confirm password" disabled={isLoading} autoComplete="new-password" readOnly onFocus={(e) => e.target.removeAttribute("readonly")} className="h-11 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                              <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 pt-2" />

                    {/* Full Name */}
                    <FormField control={form1.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Full Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Please enter your full name" disabled={isLoading} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Position / Staff ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form1.control} name="position" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Position <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Please enter position" disabled={isLoading} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form1.control} name="staffId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Staff ID <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Please enter staff ID" disabled={isLoading} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Phone / Branch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form1.control} name="phoneNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Phone Number <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="Please enter phone number" disabled={isLoading} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form1.control} name="branch" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Branch <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Please enter branch" disabled={isLoading} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                      {isLoading
                        ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Sending code...</span></>
                        : "Continue — Send Verification Code"}
                    </Button>
                    <p className="text-center text-sm text-gray-500">
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                    </p>
                  </div>
                </form>
              </Form>
            )}

            {/* ── Step 2: Email OTP ── */}
            {step === 2 && (
              <div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Verification code sent to</p>
                    <p className="text-base font-semibold text-gray-900">{pendingEmail}</p>
                  </div>

                  {/* 6-box OTP input */}
                  <div className="flex justify-center gap-3" onPaste={handleDigitPaste}>
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={isLoading}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 bg-gray-50 outline-none transition-all
                          ${digit ? "border-primary bg-primary/5 text-primary" : "border-gray-200"}
                          ${otpError ? "border-destructive" : ""}
                          focus:border-primary focus:bg-white
                          disabled:opacity-50`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-sm text-destructive text-center">{otpError}</p>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Verifying...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 px-1 text-sm">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors font-medium">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isLoading}
                    className={`font-semibold transition-colors ${countdown > 0 || isLoading ? "text-gray-300 cursor-not-allowed" : "text-primary hover:underline"}`}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
