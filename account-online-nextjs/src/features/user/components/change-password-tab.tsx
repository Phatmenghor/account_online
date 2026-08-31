"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Save, Loader2, Eye, EyeOff, ShieldCheck, Key } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AppToast } from "@/components/shared/toast/app-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordReq } from "@/features/user/types/user.request";
import { ChangePasswordService } from "@/features/user/services/user.service";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

type FormValues = z.infer<typeof schema>;

function PasswordInput({
  id,
  placeholder,
  disabled,
  field,
}: {
  id: string;
  placeholder: string;
  disabled: boolean;
  field: any;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10 h-10 text-xs sm:text-sm rounded-xl"
        {...field}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ChangePasswordTab({ value }: { value: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const { handleSubmit, reset, formState: { isSubmitting, isDirty } } = form;

  async function onSubmit(values: FormValues) {
    try {
      const payload: ChangePasswordReq = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      };
      await ChangePasswordService(payload);
      AppToast({ type: "success", message: "Password changed successfully." });
      reset();
    } catch (error: any) {
      AppToast({
        type: "error",
        message: error?.errorMessage || error?.message || "Failed to change password.",
      });
    }
  }

  return (
    <TabsContent value={value} className="mt-4 focus-visible:outline-none">
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-2 sm:p-4">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Change Password</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Update your account password to keep your profile secure.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Current password — full width */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Current Password <span className="text-rose-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="current-password"
                        placeholder="Enter your current password"
                        disabled={isSubmitting}
                        field={field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500" />
                  </FormItem>
                )}
              />

              {/* New + Confirm — side by side on sm+, stacked on mobile */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">
                        New Password <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="new-password"
                          placeholder="Enter new password"
                          disabled={isSubmitting}
                          field={field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirm-new-password"
                          placeholder="Re-enter new password"
                          disabled={isSubmitting}
                          field={field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/80">
                <Button
                  type="submit"
                  className="h-9.5 px-5 text-xs font-semibold rounded-xl gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
