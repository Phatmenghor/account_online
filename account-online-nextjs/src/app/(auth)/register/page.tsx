"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Eye, EyeOff, Lock, Mail, User, Phone, Building2,
  Briefcase, ShieldCheck, Loader2, ArrowLeft, CheckCircle2, AtSign,
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AppToast } from "@/components/shared/toast/app-toast";
import { registerInitiateService, registerVerifyService } from "@/services/auth/register.service";
import { ROUTES } from "@/constants/AppRoutes/routes";

const step1Schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  fullName: z.string().optional(),
  position: z.string().optional(),
  staffId: z.string().optional(),
  phoneNumber: z.string().optional(),
  branch: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  otpCode: z.string().length(6, "Must be 6 digits").regex(/^\d+$/, "Digits only"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", fullName: "", position: "", staffId: "", phoneNumber: "", branch: "" },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otpCode: "" },
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
      await registerInitiateService(values);
      setPendingEmail(values.email);
      setStep(2);
      startCountdown();
      AppToast({ type: "success", message: "Verification code sent", description: `Check your email: ${values.email}` });
    } catch (err: any) {
      AppToast({ type: "error", message: err?.response?.data?.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  async function onStep2Submit(values: Step2Data) {
    setIsLoading(true);
    try {
      const data = await registerVerifyService(pendingEmail, values.otpCode);
      AppToast({ type: "success", message: "Account created!", description: "Welcome to CP Bank." });
      const role: string = data?.userRole?.userRole ?? "";
      if (role === "STAFF") router.replace("/");
      else router.replace(ROUTES.DASHBOARD.INDEX);
    } catch (err: any) {
      AppToast({ type: "error", message: err?.response?.data?.message || "Invalid verification code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await registerInitiateService(form1.getValues());
      startCountdown();
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
      <div className="hidden lg:block relative overflow-hidden flex-shrink-0" style={{ width: "30%" }}>
        <Image src="/assets/cpbank.png" alt="CP Bank" fill sizes="30vw" className="object-cover" priority />
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
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50/60">
        <div className="flex flex-1 items-start justify-center px-6 py-8">
          <div className="w-full max-w-2xl">

            {/* Card header */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">Account Online</span>
              </div>

              {/* Step pills */}
              <div className="flex items-center gap-2 mb-5">
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
                <form onSubmit={form1.handleSubmit(onStep1Submit)}>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Login credentials section */}
                    <div className="px-6 pt-6 pb-5 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Login Credentials</p>

                      {/* Username */}
                      <FormField control={form1.control} name="username" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Username <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input {...field} placeholder="e.g. john.doe" disabled={isLoading} className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Email */}
                      <FormField control={form1.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Email <span className="text-destructive">*</span>
                            <span className="ml-2 text-[11px] font-normal text-gray-400 normal-case tracking-normal">OTP will be sent here</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input {...field} type="email" placeholder="your@email.com" disabled={isLoading} className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Password row */}
                      <FieldRow>
                        <FormField control={form1.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Password <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input {...field} type={showPassword ? "text" : "password"} placeholder="Min 6 characters" disabled={isLoading} className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
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
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input {...field} type={showConfirm ? "text" : "password"} placeholder="Repeat password" disabled={isLoading} className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                                <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </FieldRow>
                    </div>

                    {/* Divider */}
                    <div className="px-6 py-1">
                      <SectionDivider label="Personal Information" />
                    </div>

                    {/* Personal info section */}
                    <div className="px-6 pt-3 pb-6 space-y-4">
                      {/* Full Name */}
                      <FormField control={form1.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input {...field} placeholder="Your full name" disabled={isLoading} className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FieldRow>
                        <FormField control={form1.control} name="position" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Position</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input {...field} placeholder="e.g. Teller" disabled={isLoading} className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form1.control} name="staffId" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Staff ID</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input {...field} placeholder="e.g. CPB-0001" disabled={isLoading} className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </FieldRow>

                      <FieldRow>
                        <FormField control={form1.control} name="phoneNumber" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input {...field} type="tel" placeholder="e.g. 012345678" disabled={isLoading} className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form1.control} name="branch" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Branch</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input {...field} placeholder="e.g. Head Office" disabled={isLoading} className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </FieldRow>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 space-y-3">
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
              <Form {...form2}>
                <form onSubmit={form2.handleSubmit(onStep2Submit)}>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    {/* Email badge */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="bg-primary/8 border border-primary/20 rounded-2xl px-6 py-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-xs text-gray-500 mb-0.5">Verification code sent to</p>
                        <p className="text-sm font-semibold text-gray-900">{pendingEmail}</p>
                      </div>
                    </div>

                    <FormField control={form2.control} name="otpCode" render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel className="text-sm font-medium text-gray-700 text-center block mb-3">
                          Enter 6-digit code <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            inputMode="numeric"
                            placeholder="• • • • • •"
                            maxLength={6}
                            disabled={isLoading}
                            className="h-16 text-3xl text-center tracking-[0.6em] font-bold bg-gray-50 border-gray-200 focus:bg-white"
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          />
                        </FormControl>
                        <FormMessage className="text-center" />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                      {isLoading
                        ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Verifying...</span></>
                        : "Verify & Create Account"}
                    </Button>
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
                </form>
              </Form>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
