"use client";

import { useState } from "react";
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

const schema = z.object({
  idCard: z.string().min(1, "ID Card is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  fullName: z.string().min(1, "Full name is required"),
  position: z.string().min(1, "Position is required"),
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

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      idCard: "", email: "", password: "", confirmPassword: "",
      fullName: "", position: "", department: "", phoneNumber: "", branch: "",
    },
  });

  async function handleLookup() {
    const idCard = form.getValues("idCard")?.trim();
    if (!idCard) {
      form.setError("idCard", { message: "Please enter your ID Card number first" });
      return;
    }
    setIsLookingUp(true);
    try {
      const staff = await findStaffByIdCardService(idCard);
      form.setValue("fullName", staff.name ?? "");
      form.setValue("email", staff.email ?? "");
      form.setValue("phoneNumber", staff.phoneNumber ?? "");
      form.setValue("position", staff.position ?? "");
      form.setValue("department", staff.department ?? "");
      form.setValue("branch", staff.location ?? "");
      form.clearErrors(["fullName", "email", "phoneNumber", "position"]);
      setStaffFound(true);
      AppToast({ type: "success", message: "Staff information found", description: "Review and edit your details below." });
    } catch (err: any) {
      setStaffFound(false);
      AppToast({
        type: "error",
        message: err?.response?.data?.message || "No staff record found for this ID Card.",
      });
    } finally {
      setIsLookingUp(false);
    }
  }

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

  const isBusy = isLookingUp || isSubmitting;

  return (
    <div className="flex min-h-[100dvh] w-screen overflow-y-auto bg-muted/40">
      {/* Left hero — desktop only */}
      <div className="hidden lg:flex relative overflow-hidden flex-shrink-0" style={{ width: "35%" }}>
        <Image src="/assets/cpbank.png" alt="CP Bank" fill sizes="35vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-10 left-8 right-8 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-2">Cambodia Post Bank</p>
          <h2 className="text-2xl font-bold leading-snug">Create Your Account</h2>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            Enter your ID Card to auto-fill your staff details and get started.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center px-4 pb-safe pt-6 sm:px-6 sm:pt-10">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your ID Card number to fetch your staff details, then review and edit before submitting.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
              <div className="rounded-2xl border border-border/60 bg-background shadow-sm p-5 space-y-4">

                {/* ID Card + lookup */}
                <FormField control={form.control} name="idCard" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Card <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Enter your ID Card number"
                            disabled={isBusy}
                            autoComplete="off"
                            className="h-12 pl-11"
                            onChange={(e) => { field.onChange(e); setStaffFound(false); }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-12 px-4 shrink-0"
                          disabled={isBusy}
                          onClick={handleLookup}
                        >
                          {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                          <span className="ml-2 hidden sm:inline">Find</span>
                        </Button>
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
                      <FormLabel>Position <span className="text-destructive">*</span></FormLabel>
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

              <Button type="submit" size="lg" className="w-full font-semibold shadow-md" disabled={isBusy}>
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Creating account...</span></>
                ) : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground pb-6">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold active:underline">Sign in</Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
