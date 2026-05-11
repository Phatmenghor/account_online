"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginService } from "@/services/auth/login.service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { AppToast } from "@/components/shared/toast/app-toast";
import { useTranslations } from "next-intl";
import { UserRole } from "@/utils/authorization/authorization";
import Spinner from "@/components/shared/common/modern-spinner";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

type formData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");

  const form = useForm<formData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: formData) {
    setIsLoading(true);
    try {
      const response = await loginService({
        username: values.username,
        password: values.password,
      });

      if (response) {
        const callbackUrl = searchParams.get("callbackUrl");

        if (callbackUrl) {
          router.replace(callbackUrl);
        } else if (response?.userRole?.userRole == UserRole.DEVELOPER) {
          router.replace(ROUTES.DASHBOARD.INDEX);
        } else if (response?.userRole?.userRole == UserRole.BUSINESS) {
          router.replace(ROUTES.DASHBOARD.INDEX);
        } else {
          router.replace(ROUTES.DASHBOARD.AML.MANAGEMENT);
        }

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Your login successfully",
          });
        });
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid username or password";

      AppToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left side with full background image */}
      <div className="hidden flex-1 relative md:block">
        <Image
          src="/assets/cpbank.png"
          alt="CPBank Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        {/* <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="text-4xl font-bold mb-4">
              {t("welcomeTitle") || "Welcome to CPBank"}
            </h2>
            <p className="text-xl opacity-90">
              {t("welcomeSubtitle") || "Admin Dashboard System"}
            </p>
          </div>
        </div> */}
      </div>

      {/* Right side with login form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md border border-gray-200 p-8 shadow-lg">
          <CardHeader className="space-y-1 p-0 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {"Welcome Account Online,"}
            </h1>
            <p className="text-gray-500">
              {"Sign in to your admin account to continue"}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Form {...form}>
              <div className="space-y-5">
                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {"Username"}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            type="text"
                            placeholder={"Enter your username"}
                            disabled={isLoading}
                            className="pl-10 h-11 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            onKeyDown={handleKeyPress}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {"Password"}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={"Enter your password"}
                            disabled={isLoading}
                            className="pl-10 pr-10 h-11 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            onKeyDown={handleKeyPress}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors mt-6 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size={5} color="text-white" />
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
