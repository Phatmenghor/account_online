"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Search, User, Lock, Mail, Phone, Briefcase, Building2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AppToast } from "@/components/shared/toast/app-toast";
import { findStaffByIdCardService, registerService } from "@/features/auth/services/register.service";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { CustomFormField } from "@/components/shared/form-field/custom-form-field";

const MIN_LOOKUP_LENGTH = 4;
const LOOKUP_DEBOUNCE_MS = 450;

const schema = z.object({
  idCard: z.string().min(1, "User Identifier is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  fullName: z.string().min(1, "Full name is required"),
  position: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  branch: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [staffFound, setStaffFound] = useState(false);
  const lookupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      idCard: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      position: "",
      department: "",
      phoneNumber: "",
      branch: "",
    },
  });

  useEffect(() => {
    return () => {
      if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    };
  }, []);

  function handleIdCardChange(rawVal: string) {
    const val = rawVal.trim();
    setStaffFound(false);

    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);

    if (val.length < MIN_LOOKUP_LENGTH) {
      setIsLookingUp(false);
      return;
    }

    setIsLookingUp(true);
    lookupTimerRef.current = setTimeout(async () => {
      try {
        const staff = await findStaffByIdCardService(val);
        if (staff) {
          if (staff.fullName) form.setValue("fullName", staff.fullName, { shouldValidate: true });
          if (staff.email) form.setValue("email", staff.email, { shouldValidate: true });
          if (staff.position) form.setValue("position", staff.position);
          if (staff.department) form.setValue("department", staff.department);
          if (staff.phoneNumber) form.setValue("phoneNumber", staff.phoneNumber);
          if (staff.branch) form.setValue("branch", staff.branch);
          setStaffFound(true);
          AppToast({ type: "success", message: `Staff found: ${staff.fullName}` });
        }
      } catch (err: any) {
        // Silent
      } finally {
        setIsLookingUp(false);
      }
    }, LOOKUP_DEBOUNCE_MS);
  }

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      await registerService({
        username: values.idCard,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        position: values.position || "",
        department: values.department || "",
        phoneNumber: values.phoneNumber || "",
        branch: values.branch || "",
        roleId: 2,
      });

      AppToast({ type: "success", message: "Registration successful! Please login." });
      router.push(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      AppToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isBusy = isLoading || isLookingUp;

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden">
      {/* Left hero banner — desktop only */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image
          src="/assets/cpbank.png"
          alt="CP Bank"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
            Cambodia Post Bank
          </p>
          <h2 className="text-3xl font-bold leading-snug">
            Join the Online Account Portal
          </h2>
          <p className="text-sm text-white/70 mt-2 max-w-sm leading-relaxed">
            Register your staff account to manage customer online account applications efficiently.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center lg:bg-muted/40 overflow-hidden">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/assets/cpbank.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/50" />
        </div>

        <div className="relative z-10 w-full h-full max-w-2xl flex flex-col my-auto lg:py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden" autoComplete="off">
              {/* Header */}
              <div className="flex-shrink-0 px-4 pt-6 pb-4 sm:px-10 sm:pt-10">
                <h1 className="text-2xl font-bold text-white lg:text-foreground lg:text-3xl">
                  Create account
                </h1>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-10">
                <div className="rounded-2xl border border-border bg-background shadow-md p-5 sm:p-8 space-y-6 mb-4">

                  {/* User Identifier + auto-lookup */}
                  <div className="relative">
                    <CustomFormField
                      control={form.control}
                      name="idCard"
                      label="User Identifier"
                      placeholder="Enter your User Identifier"
                      required
                      disabled={isBusy}
                      icon={User}
                      error={form.formState.errors.idCard}
                      onChange={(e) => handleIdCardChange(e.target.value)}
                    />
                    {isLookingUp && (
                      <Loader2 className="absolute right-3.5 top-9 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!isLookingUp && staffFound && (
                      <Search className="absolute right-3.5 top-9 h-4 w-4 text-emerald-600" />
                    )}
                  </div>

                  <div className="border-t border-border/60 pt-2" />

                  {/* Full Name / Email / Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <CustomFormField
                      control={form.control}
                      name="fullName"
                      label="Full Name"
                      placeholder="Your full name"
                      required
                      disabled={isBusy}
                      icon={User}
                      error={form.formState.errors.fullName}
                    />

                    <CustomFormField
                      control={form.control}
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="Your email"
                      required
                      disabled={isBusy}
                      icon={Mail}
                      error={form.formState.errors.email}
                    />

                    <CustomFormField
                      control={form.control}
                      name="phoneNumber"
                      label="Phone Number"
                      type="tel"
                      placeholder="Phone number"
                      disabled={isBusy}
                      icon={Phone}
                      error={form.formState.errors.phoneNumber}
                    />
                  </div>

                  {/* Position / Department / Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <CustomFormField
                      control={form.control}
                      name="position"
                      label="Position"
                      placeholder="Position"
                      disabled={isBusy}
                      icon={Briefcase}
                      error={form.formState.errors.position}
                    />

                    <CustomFormField
                      control={form.control}
                      name="department"
                      label="Department"
                      placeholder="Department"
                      disabled={isBusy}
                      icon={Building2}
                      error={form.formState.errors.department}
                    />

                    <CustomFormField
                      control={form.control}
                      name="branch"
                      label="Branch"
                      placeholder="Branch"
                      disabled={isBusy}
                      icon={Building2}
                      error={form.formState.errors.branch}
                    />
                  </div>

                  <div className="border-t border-border/60 pt-2" />

                  {/* Password row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomFormField
                      control={form.control}
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="Create a password"
                      required
                      disabled={isBusy}
                      icon={Lock}
                      error={form.formState.errors.password}
                    />

                    <CustomFormField
                      control={form.control}
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm your password"
                      required
                      disabled={isBusy}
                      icon={Lock}
                      error={form.formState.errors.confirmPassword}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 font-semibold rounded-xl text-sm shadow-md bg-primary hover:bg-primary/90 text-white"
                    disabled={isBusy}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      "Register Account"
                    )}
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-4 py-4 sm:px-10 text-center border-t border-border/40 bg-background/80 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href={ROUTES.AUTH.LOGIN}
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
