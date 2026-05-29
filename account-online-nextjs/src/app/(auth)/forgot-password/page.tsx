"use client";

import Link from "next/link";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ShieldCheck, Mail } from "lucide-react";
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

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Must be a valid email"),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      // TODO: call forgot-password API
      setSent(true);
      AppToast({ type: "success", message: "Reset instructions sent to your email" });
    } catch (error: any) {
      AppToast({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Failed to send reset email",
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
          <h2 className="text-3xl font-bold leading-snug">Reset Password</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            We&apos;ll send you instructions to reset your password.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
        <Card className="w-full max-w-lg shadow-2xl border border-border/60 rounded-2xl overflow-hidden">

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
              Forgot password?
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* Card body */}
          <CardContent className="px-8 py-7">
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Check your email for instructions to reset your password.
                </p>
                <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-medium hover:underline text-sm">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="name@example.com"
                              disabled={isLoading}
                              className="pl-10 h-11"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") form.handleSubmit(onSubmit)();
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full h-11 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size={4} color="text-primary-foreground" />
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
