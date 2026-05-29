"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import {
  registerService,
  verifyEmailService,
} from "@/services/auth/register.service";
import Spinner from "@/components/shared/common/modern-spinner";

/* ─── schema ─── */
const registerSchema = z
  .object({
    username: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    fullName: z.string().min(1, "Please enter your full name"),
    staffId: z.string().optional(),
    phoneNumber: z.string().optional(),
    position: z.string().optional(),
    role: z.string().min(1, "Please select a role"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterData = z.infer<typeof registerSchema>;

const ROLES = [
  { value: "DEVELOPER", label: "Developer" },
  { value: "BUSINESS", label: "Business" },
  { value: "ADMIN", label: "Admin" },
  { value: "COMPLIANCE", label: "Compliance" },
];

/* ─── countdown ─── */
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  function start() {
    setRemaining(seconds);
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setRemaining((p) => {
        if (p <= 1) { clearInterval(ref.current!); return 0; }
        return p - 1;
      });
    }, 1000);
  }
  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);
  return { remaining, start };
}


export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { remaining, start: startCountdown } = useCountdown(60);

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "", password: "", confirmPassword: "",
      fullName: "", staffId: "", phoneNumber: "", position: "", role: "",
    },
  });

  async function onRegister(values: RegisterData) {
    setIsSubmitting(true);
    try {
      await registerService({
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        staffId: values.staffId,
        phoneNumber: values.phoneNumber,
        position: values.position,
        role: values.role,
      });
      setRegisteredEmail(values.username);
      setStep("otp");
      startCountdown();
      AppToast({ type: "success", message: "Verification code sent to your email." });
    } catch (err: any) {
      AppToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Registration failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOtpChange(i: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp]; next[i] = value.slice(-1); setOtp(next);
    if (value && i < 5) otpRefs.current[i + 1]?.focus();
  }
  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }
  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }, [step]);

  async function onVerify() {
    const code = otp.join("");
    if (code.length < 6) { AppToast({ type: "warning", message: "Please enter the 6-digit code." }); return; }
    if (remaining === 0) { AppToast({ type: "error", message: "Code expired. Please resend." }); return; }
    setIsVerifying(true);
    try {
      await verifyEmailService({ username: registeredEmail, code });
      AppToast({ type: "success", message: "Email verified! You can now log in." });
      router.push(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      AppToast({ type: "error", message: err?.response?.data?.message || "Invalid or expired code." });
    } finally { setIsVerifying(false); }
  }

  async function onResend() {
    if (remaining > 0) return;
    setIsSubmitting(true);
    try {
      const v = form.getValues();
      await registerService({
        username: registeredEmail, password: v.password, fullName: v.fullName,
        staffId: v.staffId, phoneNumber: v.phoneNumber, position: v.position, role: v.role,
      });
      setOtp(Array(6).fill(""));
      startCountdown();
      AppToast({ type: "info", message: "New code sent to your email." });
    } catch (err: any) {
      AppToast({ type: "error", message: err?.response?.data?.message || "Failed to resend code." });
    } finally { setIsSubmitting(false); }
  }

  /* ─────────────── render ─────────────── */
  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Left: CP Bank hero image ── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 relative overflow-hidden">
        <Image
          src="/assets/cpbank.png"
          alt="CP Bank"
          fill
          sizes="420px"
          className="object-cover"
          priority
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* branding */}
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          {/* top logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-black text-base">A</span>
            </div>
            <span className="text-white/90 font-semibold text-sm tracking-wide">Account Online</span>
          </div>

          {/* bottom text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              Management System
            </p>
            <h2 className="text-3xl font-bold text-white leading-snug mb-3">
              Create your<br />account today
            </h2>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Secure access to manage your business operations with role-based control.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">

        {/* top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 bg-background border-b border-border">
          {/* mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">A</span>
            </div>
            <span className="font-semibold text-sm">Account Online</span>
          </div>
          <div className="hidden lg:block" />

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-8 py-8">

            {/* ── STEP 1: register form ── */}
            {step === "form" && (
              <>
                {/* page heading */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete the form below — a verification code will be sent to your email.
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onRegister)} className="space-y-5">
                    <div className="border border-border rounded-xl bg-background overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-6">

                        {/* Email — full width */}
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control} name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="Please enter your email" disabled={isSubmitting} className="h-11" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Password */}
                        <FormField
                          control={form.control} name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input {...field} type={showPassword ? "text" : "password"} placeholder="Please enter your password" disabled={isSubmitting} className="h-11 pr-10" />
                                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Confirm Password */}
                        <FormField
                          control={form.control} name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input {...field} type={showConfirm ? "text" : "password"} placeholder="Please confirm your password" disabled={isSubmitting} className="h-11 pr-10" />
                                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Full Name — full width */}
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control} name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Please enter your full name" disabled={isSubmitting} className="h-11" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Staff ID */}
                        <FormField
                          control={form.control} name="staffId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Staff ID</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Please enter your staff ID" disabled={isSubmitting} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Phone */}
                        <FormField
                          control={form.control} name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Please enter your phone number" disabled={isSubmitting} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Role */}
                        <FormField
                          control={form.control} name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Please select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ROLES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Position */}
                        <FormField
                          control={form.control} name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Please enter your position" disabled={isSubmitting} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 font-semibold" disabled={isSubmitting}>
                      {isSubmitting
                        ? <><Spinner size={4} color="text-white" /><span className="ml-2">Creating account…</span></>
                        : "Create Account & Send Verification Code"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground lg:hidden">
                      Already have an account?{" "}
                      <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-semibold hover:underline">Sign in</Link>
                    </p>
                  </form>
                </Form>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <div className="max-w-md mx-auto">
                {/* heading */}
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{registeredEmail}</p>
                </div>

                {/* OTP card */}
                <div className="border border-border rounded-xl overflow-hidden bg-background">
                  <div className="bg-muted/50 px-5 py-3 border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enter Verification Code</p>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* boxes */}
                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <Input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          disabled={isVerifying}
                          className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
                        />
                      ))}
                    </div>

                    {/* timer */}
                    <div className="text-center h-5">
                      {remaining > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Code expires in{" "}
                          <span className="font-semibold text-primary tabular-nums">
                            0:{String(remaining).padStart(2, "0")}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-destructive font-medium">Code has expired</p>
                      )}
                    </div>

                    <Button
                      className="w-full h-11 font-semibold"
                      disabled={isVerifying || otp.join("").length < 6 || remaining === 0}
                      onClick={onVerify}
                    >
                      {isVerifying
                        ? <><Spinner size={4} color="text-white" /><span className="ml-2">Verifying…</span></>
                        : "Verify Email"}
                    </Button>
                  </div>
                </div>

                {/* resend + back */}
                <div className="mt-5 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive it?{" "}
                    <button
                      onClick={onResend}
                      disabled={remaining > 0 || isSubmitting}
                      className="text-primary font-semibold hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending…" : "Resend code"}
                    </button>
                  </p>
                  <button
                    onClick={() => { setStep("form"); setOtp(Array(6).fill("")); }}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    ← Back to registration
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
