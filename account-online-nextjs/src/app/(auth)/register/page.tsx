"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, User, Phone, Building2, Briefcase, ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { AppToast } from "@/components/shared/toast/app-toast";
import { registerInitiateService, registerVerifyService } from "@/services/auth/register.service";
import { ROUTES } from "@/constants/AppRoutes/routes";

const step1Schema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
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
  otpCode: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

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
    defaultValues: { email: "", password: "", confirmPassword: "", fullName: "", position: "", staffId: "", phoneNumber: "", branch: "" },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otpCode: "" },
  });

  function startCountdown() {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
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
    } catch (error: any) {
      AppToast({ type: "error", message: error?.response?.data?.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  async function onStep2Submit(values: Step2Data) {
    setIsLoading(true);
    try {
      const data = await registerVerifyService(pendingEmail, values.otpCode);
      AppToast({ type: "success", message: "Account created successfully!", description: "Welcome to CP Bank." });
      const role: string = data?.userRole?.userRole ?? "";
      if (role === "STAFF") router.replace("/");
      else router.replace(ROUTES.DASHBOARD.INDEX);
    } catch (error: any) {
      AppToast({ type: "error", message: error?.response?.data?.message || "Invalid verification code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      const stored = form1.getValues();
      await registerInitiateService(stored);
      startCountdown();
      AppToast({ type: "success", message: "New code sent", description: `Check your email: ${pendingEmail}` });
    } catch (error: any) {
      AppToast({ type: "error", message: "Failed to resend. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image src="/assets/cpbank.png" alt="CP Bank" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Cambodia Post Bank</p>
          <h2 className="text-3xl font-bold leading-snug">Create Your Account</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Register for access to the CP Bank account opening and review platform.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6 overflow-y-auto">
        <Card className="w-full max-w-lg shadow-2xl border border-border/60 rounded-2xl overflow-hidden my-4">
          {/* Header */}
          <div className="bg-primary/5 border-b border-border/50 px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Account Online</span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${step >= 1 ? "bg-primary border-primary text-white" : "border-gray-300 text-gray-400"}`}>
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <div className={`flex-1 h-0.5 rounded-full transition-all ${step > 1 ? "bg-primary" : "bg-gray-200"}`} />
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${step >= 2 ? "bg-primary border-primary text-white" : "border-gray-300 text-gray-400"}`}>
                2
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              {step === 1 ? "Create account" : "Verify your email"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "Fill in your details to get started"
                : `We sent a 6-digit code to ${pendingEmail}`}
            </p>
          </div>

          <CardContent className="px-8 py-7">
            {/* ── Step 1: Registration Form ── */}
            {step === 1 && (
              <Form {...form1}>
                <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
                  {/* Email */}
                  <FormField control={form1.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="your@email.com" disabled={isLoading} className="pl-10 h-11" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Password row */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form1.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type={showPassword ? "text" : "password"} placeholder="Min 6 chars" disabled={isLoading} className="pl-10 pr-9 h-11" />
                            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form1.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type={showConfirm ? "text" : "password"} placeholder="Repeat password" disabled={isLoading} className="pl-10 pr-9 h-11" />
                            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Full Name */}
                  <FormField control={form1.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} placeholder="Your full name" disabled={isLoading} className="pl-10 h-11" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Position + Staff ID */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form1.control} name="position" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="Your position" disabled={isLoading} className="pl-10 h-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form1.control} name="staffId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="Staff ID" disabled={isLoading} className="pl-10 h-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Phone + Branch */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form1.control} name="phoneNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="tel" placeholder="Phone number" disabled={isLoading} className="pl-10 h-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form1.control} name="branch" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="Branch" disabled={isLoading} className="pl-10 h-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Button type="submit" className="w-full h-11 font-semibold mt-2" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Sending code...</span></> : "Continue"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground pt-1">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                  </p>
                </form>
              </Form>
            )}

            {/* ── Step 2: Email OTP ── */}
            {step === 2 && (
              <Form {...form2}>
                <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-5">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-center">
                    <p className="text-muted-foreground">Code sent to</p>
                    <p className="font-semibold text-foreground mt-0.5">{pendingEmail}</p>
                  </div>

                  <FormField control={form2.control} name="otpCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          disabled={isLoading}
                          className="h-14 text-2xl text-center tracking-[0.5em] font-bold"
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Verifying...</span></> : "Verify & Create Account"}
                  </Button>

                  <div className="flex items-center justify-between text-sm pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0 || isLoading}
                      className={`font-semibold transition-colors ${countdown > 0 || isLoading ? "text-gray-400 cursor-not-allowed" : "text-primary hover:underline cursor-pointer"}`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                    </button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
