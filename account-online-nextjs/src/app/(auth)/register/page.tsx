"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

/* ─── Register form schema ─── */
const registerSchema = z
  .object({
    username: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    fullName: z.string().min(1, "Full name is required"),
    staffId: z.string().optional(),
    phoneNumber: z.string().optional(),
    position: z.string().optional(),
    role: z.string().min(1, "Role is required"),
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

/* ─── OTP countdown hook ─── */
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setRemaining(seconds);
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  return { remaining, start };
}

export default function RegisterPage() {
  const router = useRouter();

  /* step: "form" | "otp" */
  const [step, setStep] = useState<"form" | "otp">("form");
  const [registeredEmail, setRegisteredEmail] = useState("");

  /* register form */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* otp */
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { remaining, start: startCountdown } = useCountdown(60);

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      staffId: "",
      phoneNumber: "",
      position: "",
      role: "",
    },
  });

  /* ── Step 1: submit register ── */
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
      AppToast({
        type: "success",
        message: "Verification code sent! Check your email.",
      });
    } catch (err: any) {
      AppToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── OTP input handlers ── */
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
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

  /* ── Step 2: verify OTP ── */
  async function onVerify() {
    const code = otp.join("");
    if (code.length < 6) {
      AppToast({ type: "warning", message: "Please enter the 6-digit code." });
      return;
    }
    if (remaining === 0) {
      AppToast({ type: "error", message: "Code expired. Please resend." });
      return;
    }
    setIsVerifying(true);
    try {
      await verifyEmailService({ username: registeredEmail, code });
      AppToast({ type: "success", message: "Email verified! You can now log in." });
      router.push(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      AppToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Invalid or expired code. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  }

  /* ── Resend OTP ── */
  async function onResend() {
    if (remaining > 0) return;
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      await registerService({
        username: registeredEmail,
        password: values.password,
        fullName: values.fullName,
        staffId: values.staffId,
        phoneNumber: values.phoneNumber,
        position: values.position,
        role: values.role,
      });
      setOtp(Array(6).fill(""));
      startCountdown();
      AppToast({ type: "info", message: "A new code has been sent to your email." });
    } catch (err: any) {
      AppToast({
        type: "error",
        message: err?.response?.data?.message || "Failed to resend code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ─────────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">

        {/* ── Logo / Brand ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-3">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Account Online</h1>
          <p className="text-sm text-muted-foreground mt-1">Cambodia Post Bank</p>
        </div>

        {/* ─────────── STEP 1 — Register form ─────────── */}
        {step === "form" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Create account</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in your details to register
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onRegister)} className="space-y-4">

                {/* Email */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="name@example.com" disabled={isSubmitting} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" disabled={isSubmitting} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Staff ID + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="STF001" disabled={isSubmitting} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="012 345 678" disabled={isSubmitting} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Position + Role */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Manager" disabled={isSubmitting} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select role" />
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
                </div>

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Min 6 characters"
                            disabled={isSubmitting}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword((v) => !v)}
                          >
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
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat your password"
                            disabled={isSubmitting}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirm((v) => !v)}
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-11 font-semibold mt-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Spinner size={4} color="text-white" /><span className="ml-2">Creating account…</span></>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ─────────── STEP 2 — OTP verification ─────────── */}
        {step === "otp" && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8 text-center">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Verify your email</h2>
              <p className="text-sm text-muted-foreground mt-2">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">{registeredEmail}</span>.
                Enter it below.
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-3 mb-4" onPaste={handleOtpPaste}>
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
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              ))}
            </div>

            {/* Countdown */}
            <div className="mb-6">
              {remaining > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Code expires in{" "}
                  <span className="font-semibold text-primary tabular-nums">
                    0:{String(remaining).padStart(2, "0")}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-destructive font-medium">Code expired.</p>
              )}
            </div>

            <Button
              className="w-full h-11 font-semibold"
              disabled={isVerifying || otp.join("").length < 6 || remaining === 0}
              onClick={onVerify}
            >
              {isVerifying ? (
                <><Spinner size={4} color="text-white" /><span className="ml-2">Verifying…</span></>
              ) : (
                "Verify Email"
              )}
            </Button>

            <p className="text-sm text-muted-foreground mt-5">
              Didn&apos;t receive it?{" "}
              <button
                onClick={onResend}
                disabled={remaining > 0 || isSubmitting}
                className="text-primary font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending…" : "Resend code"}
              </button>
            </p>

            <button
              onClick={() => setStep("form")}
              className="mt-3 text-sm text-muted-foreground hover:underline"
            >
              ← Back to registration
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
