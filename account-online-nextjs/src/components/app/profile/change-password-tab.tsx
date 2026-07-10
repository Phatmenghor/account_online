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
import { Save, Loader2, Eye, EyeOff } from "lucide-react";
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
import { ChangePasswordReq } from "@/models/user/user.request";
import { ChangePasswordService } from "@/services/dashboard/user/user.service";

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
        className="pr-10 h-11"
        {...field}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
    <TabsContent value={value}>
      <Card className="border-enhanced">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Current password — full width */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="current-password"
                        placeholder="Enter your current password"
                        disabled={isSubmitting}
                        field={field}
                      />
                    </FormControl>
                    <FormMessage />
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
                      <FormLabel>New Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="new-password"
                          placeholder="Enter new password"
                          disabled={isSubmitting}
                          field={field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirm-new-password"
                          placeholder="Re-enter new password"
                          disabled={isSubmitting}
                          field={field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-2 border-t">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Update Password</>
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
