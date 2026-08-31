"use client";

import { useState } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginService } from "@/features/auth/services/login.service";
import { useForm } from "react-hook-form";
import { CustomFormField } from "@/components/shared/form-field/custom-form-field";
import { Eye, EyeOff, Lock, User, ShieldCheck, Loader2 } from "lucide-react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import ForceChangePasswordModal from "@/features/master-data/components/force-change-password-modal";

const schema = z.object({
  username: z.string().min(1, "Please enter your User Identifier"),
  password: z.string().min(1, "Please enter your password"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForceChange, setShowForceChange] = useState(false);
  const [forceChangeReason, setForceChangeReason] = useState<
    "force" | "expired"
  >("force");
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
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Invalid username or password",
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
        <Image
          src="/assets/cpbank.png"
          alt="CP Bank"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
            Cambodia Post Bank
          </p>
          <h2 className="text-3xl font-bold leading-snug">
            Account Online Opening
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
            Secure access to the Cambodia Post Bank account opening and review
            platform.
          </p>
        </div>
      </div>

      {/* Right form panel — on mobile becomes full-width with hero bg behind form */}
      <div className="relative flex flex-1 items-center justify-center p-4 pb-safe sm:p-6 lg:bg-muted/40">
        {/* Mobile-only background: fills the panel when the left hero is hidden */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/assets/cpbank.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        </div>

        <Card className="animate-fade-in-up relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl border border-border/60 shadow-xl">
          <div className="bg-primary/5 border-b border-border/50 px-6 py-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Account Online Opening
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign in to your account to continue
            </p>
          </div>

          <CardContent className="px-6 py-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3.5"
                autoComplete="off"
              >
                <CustomFormField
                  control={form.control}
                  name="username"
                  label="User Identifier"
                  placeholder="Please enter your User Identifier"
                  required
                  disabled={isLoading}
                  icon={User}
                  error={form.formState.errors.username}
                />

                <CustomFormField
                  control={form.control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Please enter your password"
                  required
                  disabled={isLoading}
                  icon={Lock}
                  error={form.formState.errors.password}
                />

                <Button
                  type="submit"
                  className="w-full h-9 font-semibold rounded-xl text-sm mt-4 shadow-sm bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="ml-2">Logging in...</span>
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

