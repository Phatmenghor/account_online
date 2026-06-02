"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AppToast } from "@/components/shared/toast/app-toast";
import { forceChangePasswordService } from "@/services/dashboard/user/user.service";

const schema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

type FormData = z.infer<typeof schema>;

interface ForceChangePasswordModalProps {
  isOpen: boolean;
  reason: "force" | "expired";
  onSuccess: () => void;
}

export default function ForceChangePasswordModal({
  isOpen,
  reason,
  onSuccess,
}: ForceChangePasswordModalProps) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      await forceChangePasswordService(values.newPassword, values.confirmNewPassword);
      AppToast({ type: "success", message: "Password updated successfully." });
      reset();
      onSuccess();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: err?.message || "Failed to update password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isExpired = reason === "expired";

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md overflow-hidden p-0 gap-0 flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isExpired ? "bg-orange-100" : "bg-yellow-100"}`}>
              {isExpired
                ? <Clock className="w-6 h-6 text-orange-600" />
                : <ShieldAlert className="w-6 h-6 text-yellow-600" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {isExpired ? "Password Expired" : "Password Reset Required"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {isExpired
                  ? "Your password is over 3 months old and must be changed."
                  : "Your administrator has reset your password. Please set a new one to continue."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex-1 p-6 space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  {...register("confirmNewPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <p className="text-xs text-destructive">{errors.confirmNewPassword.message}</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating...</>
              ) : (
                <><KeyRound className="h-4 w-4 mr-2" /> Update Password</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
