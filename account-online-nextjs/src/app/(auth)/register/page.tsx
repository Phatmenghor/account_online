"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, Search, IdCard, Lock, Mail, Phone, Briefcase, Building2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AppToast } from "@/components/shared/toast/app-toast";
import { findStaffByIdCardService, registerService } from "@/services/auth/register.service";
import { ROUTES } from "@/constants/AppRoutes/routes";

const MIN_LOOKUP_LENGTH = 4;
const LOOKUP_DEBOUNCE_MS = 450;

const schema = z.object({
  idCard: z.string().min(1, "ID Card is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  fullName: z.string().min(1, "Full name is required"),
  position: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  branch: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [staffFound, setStaffFound] = useState(false);
  const router = useRouter();

  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupSeq = useRef(0);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      idCard: "", email: "", password: "", confirmPassword: "",
      fullName: "", position: "", department: "", phoneNumber: "", branch: "",
    },
  });

  async function lookupStaff(idCard: string) {
    const seq = ++lookupSeq.current;
    setIsLookingUp(true);
    try {
      const staff = await findStaffByIdCardService(idCard);
      if (seq !== lookupSeq.current) return;
      form.setValue("fullName", staff.name ?? "");
      form.setValue("email", staff.email ?? "");
      form.setValue("phoneNumber", staff.phoneNumber ?? "");
      form.setValue("position", staff.position ?? "");
      form.setValue("department", staff.department ?? "");
      form.setValue("branch", staff.location ?? "");
      form.clearErrors(["fullName", "email", "phoneNumber", "position"]);
      setStaffFound(true);
    } catch {
      if (seq !== lookupSeq.current) return;
      // Not found: stay silent, let the user fill in their own details.
      setStaffFound(false);
    } finally {
      if (seq === lookupSeq.current) setIsLookingUp(false);
    }
  }

  function handleIdCardChange(value: string) {
    setStaffFound(false);
    if (lookupTimer.current) clearTimeout(lookupTimer.current);

    const idCard = value.trim();
    if (idCard.length < MIN_LOOKUP_LENGTH) {
      lookupSeq.current++;
      setIsLookingUp(false);
      return;
    }

    lookupTimer.current = setTimeout(() => lookupStaff(idCard), LOOKUP_DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, []);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const data = await registerService(values);
      AppToast({ type: "success", message: "Account created!", description: "Welcome to CP Bank." });
      const role: string = data?.userRole?.userRole ?? "";
      if (role === "STAFF") router.replace("/");
      else router.replace(ROUTES.DASHBOARD.INDEX);
    } catch (err: any) {
      AppToast({ type: "error", message: err?.response?.data?.message || "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = isSubmitting;

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden">
      {/* Left hero — desktop only, 50% */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image src="/assets/cpbank.png" alt="CP Bank" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Cambodia Post Bank</p>
          <h2 className="text-3xl font-bold leading-snug">Create Your Account</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Enter your ID Card to auto-fill your staff details and get started.
          </p>
        </div>
      </div>

      {/* Right form panel — 50% on desktop, full width on mobile */}
      <div className="relative flex flex-1 flex-col h-full overflow-hidden lg:bg-muted/40">
        {/* Mobile-only background */}
        <div className="absolute inset-0 lg:hidden -z-10">
          <Image src="/assets/cpbank.png" alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            autoComplete="off"
            className="flex h-full w-full flex-col items-center"
          >
            <div className="flex h-full w-full max-w-lg flex-col">
              {/* Header */}
              <div className="flex-shrink-0 px-4 pt-6 pb-4 sm:px-8 sm:pt-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 lg:text-muted-foreground">
                  Account Online
                </p>
                <h1 className="text-2xl font-bold text-foreground lg:text-foreground text-white lg:text-2xl">
                  Create your account
                </h1>
                <p className="text-sm mt-1 text-white/80 lg:text-muted-foreground">
                  Enter your ID Card number to fetch your staff details, then review and edit before submitting.
                </p>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8">
                <div className="rounded-2xl border border-border/60 bg-background shadow-sm p-5 space-y-4 mb-4">

                  {/* ID Card + auto-lookup */}
                  <FormField control={form.control} name="idCard" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Card <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Enter your ID Card number"
                            disabled={isBusy}
                            autoComplete="off"
                            className="h-12 pl-11 pr-10"
                            onChange={(e) => {
                              field.onChange(e);
                              handleIdCardChange(e.target.value);
                            }}
                          />
                          {isLookingUp && (
                            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {!isLookingUp && staffFound && (
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {staffFound && (
                    <p className="text-xs font-medium text-emerald-600 -mt-1">
                      Staff record found — fields below have been auto-filled, you can still edit them.
                    </p>
                  )}

                  <div className="border-t border-border/60 pt-2" />

                  {/* Full Name */}
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your full name" disabled={isBusy} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Email */}
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="Your email" disabled={isBusy} className="h-12 pl-11" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Phone / Position */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="tel" placeholder="Phone number" disabled={isBusy} className="h-12 pl-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="position" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="Position" disabled={isBusy} className="h-12 pl-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Department / Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="Department" disabled={isBusy} className="h-12 pl-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="branch" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Branch" disabled={isBusy} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="border-t border-border/60 pt-2" />

                  {/* Password row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              disabled={isBusy}
                              autoComplete="new-password"
                              className="h-12 pl-11 pr-11"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground active:bg-accent"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showConfirm ? "text" : "password"}
                              placeholder="Confirm password"
                              disabled={isBusy}
                              autoComplete="new-password"
                              className="h-12 pl-11 pr-11"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground active:bg-accent"
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-4 pb-safe pt-3 pb-4 sm:px-8 sm:pb-6 bg-background/95 lg:bg-transparent border-t border-border/60 lg:border-t-0">
                <Button type="submit" size="lg" className="w-full font-semibold shadow-md" disabled={isBusy}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Creating account...</span></>
                  ) : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-3">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-semibold active:underline">Sign in</Link>
                </p>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
