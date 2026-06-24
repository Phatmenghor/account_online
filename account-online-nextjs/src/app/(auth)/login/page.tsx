"use client";

import { useState } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginService } from "@/services/auth/login.service";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, IdCard, ShieldCheck, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import ForceChangePasswordModal from "@/components/shared/modal/force-change-password-modal";

const schema = z.object({
  username: z.string().min(1, "Please enter your ID Card"),
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
      router.replace(ROUTES.STAFF.OPENING);
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

      if (forceChange || passwordExpired) {
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
    <div className="flex h-[100dvh] w-screen overflow-hidden">
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
          <h2 className="text-3xl font-bold leading-snug">Portal Account Opening</h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Secure access to the Cambodia Post Bank account opening and review platform.
          </p>
        </div>
      </div>

      {/* Right form panel — on mobile becomes full-width with hero bg behind form */}
      <div className="relative flex flex-1 items-center justify-center p-4 pb-safe sm:p-6 lg:bg-muted/40">
        {/* Mobile-only background: fills the panel when the left hero is hidden */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/assets/cpbank.png" alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        </div>

        <Card className="animate-fade-in-up relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 shadow-2xl sm:rounded-2xl">
          <div className="bg-primary/5 border-b border-border/50 px-6 pt-8 pb-6 sm:px-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Portal Account Opening</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <CardContent className="px-6 py-7 sm:px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Card <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="text" placeholder="Please enter your ID Card" disabled={isLoading} autoComplete="off" readOnly onFocus={(e) => e.target.removeAttribute("readonly")} className="h-12 pl-11" />
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
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Please enter your password"
                            disabled={isLoading}
                            autoComplete="new-password"
                            readOnly
                            onFocus={(e) => e.target.removeAttribute("readonly")}
                            className="h-12 pl-11 pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-accent"
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

                <Button type="submit" size="lg" className="w-full font-semibold mt-6 shadow-md" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /><span className="ml-2">Logging in...</span></>
                  ) : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

