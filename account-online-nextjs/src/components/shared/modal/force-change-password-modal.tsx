"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";
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
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(64, "Password must not exceed 64 characters."),
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
  onClose?: () => void; // when provided, the X button closes the modal
}

const RULES = [
  "At least 6 characters long",
  "Mix of letters and numbers recommended",
  "Do not reuse your previous password",
];

export default function ForceChangePasswordModal({
  isOpen,
  reason,
  onSuccess,
  onClose,
}: ForceChangePasswordModalProps) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const newPasswordValue = watch("newPassword", "");

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      await forceChangePasswordService(values.newPassword, values.confirmNewPassword);
      AppToast({ type: "success", message: "Password updated successfully. Welcome!" });
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
  const config = isExpired
    ? {
        iconBg: "bg-orange-100 dark:bg-orange-950",
        iconColor: "text-orange-600 dark:text-orange-400",
        bannerBg: "bg-orange-50 dark:bg-orange-950/40",
        bannerBorder: "border-orange-200 dark:border-orange-800",
        bannerText: "text-orange-800 dark:text-orange-300",
        Icon: Clock,
        title: "Your Password Has Expired",
        description:
          "For your account security, passwords must be updated regularly. Please set a new password to continue accessing your account.",
        reason:
          "Your password has expired (passwords expire every 3 months) or has never been set.",
      }
    : {
        iconBg: "bg-yellow-100 dark:bg-yellow-950",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        bannerBg: "bg-yellow-50 dark:bg-yellow-950/40",
        bannerBorder: "border-yellow-200 dark:border-yellow-800",
        bannerText: "text-yellow-800 dark:text-yellow-300",
        Icon: ShieldAlert,
        title: "Password Reset Required",
        description:
          "Your administrator has reset your password. You must set a new password before you can access your account.",
        reason:
          "This is a one-time requirement. Once changed, you can log in normally.",
      };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose?.(); }}>
      <DialogContent
        className="w-full sm:max-w-[520px] mx-auto p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* ── Top accent bar ── */}
        <div
          className={`h-1.5 w-full ${isExpired ? "bg-orange-500" : "bg-yellow-500"}`}
        />

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${config.iconBg}`}
            >
              <config.Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-bold text-foreground leading-tight">
                {config.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-5">
            {/* ── Info banner ── */}
            <div
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${config.bannerBg} ${config.bannerBorder}`}
            >
              <Lock className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
              <p className={`leading-relaxed ${config.bannerText}`}>
                {config.reason}
              </p>
            </div>

            {/* ── New Password ── */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  placeholder="Enter your new password"
                  disabled={isSubmitting}
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword ? (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              ) : (
                newPasswordValue.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Strength: {newPasswordValue.length < 8 ? "Weak — add more characters" : newPasswordValue.length < 12 ? "Good" : "Strong"}
                  </p>
                )
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  {...register("confirmNewPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  disabled={isSubmitting}
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            {/* ── Password rules ── */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2">
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Password requirements
              </p>
              <ul className="space-y-1.5">
                {RULES.map((rule) => (
                  <li key={rule} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6">
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Update Password & Continue
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              This action is required. You cannot access the system until your password is updated.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
