"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginService } from "@/services/auth/login.service";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import ForceChangePasswordModal from "@/components/shared/modal/force-change-password-modal";

const schema = z.object({
  username: z.string().min(1, "Please enter your email"),
  password: z.string().min(1, "Please enter your password"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForceChange, setShowForceChange] = useState(false);
  const [forceChangeReason, setForceChangeReason] = useState<"force" | "expired">("force");
  const [pendingRole, setPendingRole] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  function navigateAfterLogin(role: string) {
    const callbackUrl = searchParams.get("callbackUrl");
    if (role === "STAFF") {
      router.replace("/");
    } else if (callbackUrl) {
      router.replace(callbackUrl);
    } else {
      router.replace(ROUTES.DASHBOARD.INDEX);
    }
  }

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      const data = await loginService({
        username: values.username,
        password: values.password,
      });

      const role: string = data?.userRole?.userRole ?? "";
      const forceChange: boolean = data?.userRole?.forcePasswordChange ?? false;
      const passwordExpired: boolean = data?.userRole?.passwordExpired ?? false;

      AppToast({ type: "success", message: "Login successful" });

      if ((forceChange || passwordExpired) && role !== "STAFF") {
        setPendingRole(role);
        setForceChangeReason(forceChange ? "force" : "expired");
        setShowForceChange(true);
        return;
      }

      navigateAfterLogin(role);
    } catch (error: any) {
      AppToast({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Invalid username or password",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleForceChangeSuccess() {
    setShowForceChange(false);
    navigateAfterLogin(pendingRole);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ForceChangePasswordModal
        isOpen={showForceChange}
        reason={forceChangeReason}
        onSuccess={handleForceChangeSuccess}
        onClose={() => setShowForceChange(false)}
      />

      {/* Left hero — desktop only */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image src="/assets/cpbank.png" alt="CP Bank" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Cambodia Post Bank</p>
          <h2 className="text-3xl font-bold leading-snug">Account Online</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Secure access to the Cambodia Post Bank account opening and review platform.
          </p>
        </div>
      </div>

      {/* Right form panel — on mobile becomes full-width with hero bg behind form */}
      <div className="relative flex flex-1 items-center justify-center p-6 lg:bg-muted/40">
        {/* Mobile-only background: fills the panel when the left hero is hidden */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/assets/cpbank.png" alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        </div>

        <Card className="relative z-10 w-full max-w-lg shadow-2xl border border-border/60 rounded-2xl overflow-hidden">
          <div className="bg-primary/5 border-b border-border/50 px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Account Online</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <CardContent className="px-8 py-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="text" placeholder="Please enter your email" disabled={isLoading} autoComplete="off" readOnly onFocus={(e) => e.target.removeAttribute("readonly")} className="pl-10 h-11" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Please enter your password"
                            disabled={isLoading}
                            autoComplete="new-password"
                            readOnly
                            onFocus={(e) => e.target.removeAttribute("readonly")}
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

                <Button type="submit" className="w-full h-11 font-semibold mt-6" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Logging in...</span></>
                  ) : "Login"}
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-3">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary font-semibold hover:underline">Register</Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

