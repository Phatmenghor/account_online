"use client";

import Link from "next/link";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ShieldCheck, User, Phone, IdCard, Lock, Eye, EyeOff } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import Spinner from "@/components/shared/common/modern-spinner";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    username: z.string().min(1, "Username (email) is required").email("Must be a valid email"),
    staffId: z.string().min(1, "Staff ID is required"),
    phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      username: "",
      staffId: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      // TODO: call register API
      // After success, redirect to verify-email with email param
      router.push(
        `${ROUTES.AUTH.VERIFY_EMAIL}?email=${encodeURIComponent(values.username)}`
      );
    } catch (error: any) {
      AppToast({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Registration failed",
      });
    } finally {
      setIsLoading(false);
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
          <h2 className="text-3xl font-bold leading-snug">Create Account</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Register to get access to the Account Online platform.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6 overflow-y-auto">
        <Card className="w-full max-w-lg shadow-2xl border border-border/60 rounded-2xl overflow-hidden my-6">

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
              Create account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in your details to register. A verification code will be sent to your email.
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-8 py-7">
            <Form {...form}>
              <div className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Full Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} placeholder="Enter your full name" disabled={isLoading} className="pl-10 h-11" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email (used as username) */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="name@example.com" disabled={isLoading} className="pl-10 h-11" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Staff ID & Phone (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Staff ID <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="e.g. EMP001" disabled={isLoading} className="pl-10 h-11" />
                          </div>
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
                        <FormLabel className="text-sm font-medium text-foreground">
                          Phone <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="tel" placeholder="012 345 678" disabled={isLoading} className="pl-10 h-11" />
                          </div>
                        </FormControl>
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
                      <FormLabel className="text-sm font-medium text-foreground">
                        Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            disabled={isLoading}
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword((v) => !v)}
                            disabled={isLoading}
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
                      <FormLabel className="text-sm font-medium text-foreground">
                        Confirm Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showConfirm ? "text" : "password"}
                            placeholder="Re-enter your password"
                            disabled={isLoading}
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowConfirm((v) => !v)}
                            disabled={isLoading}
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  className="w-full h-11 font-semibold mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size={4} color="text-primary-foreground" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
